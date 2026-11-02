const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const storage = require('../services/storageService');
const { evaluateTranscription } = require('../services/evalEngine');
const { evaluateCriticalEntities } = require('../services/entityEngine');
const { transcribeAudio } = require('../services/prismaService');

// Enterprise AI Modules
const { evaluateGuardrails } = require('../services/guardrailsService');
const { vectorDb } = require('../services/ragVectorService');
const { semanticCache, routeModel } = require('../services/semanticCacheService');
const { personaEngine } = require('../services/personaEngine');
const { integrationsService } = require('../services/integrationsService');
const { authService, ROLES } = require('../services/authService');
const { observability } = require('../services/observabilityService');
const { MCP_TOOLS, handleMcpToolCall } = require('../services/mcpServer');

// Multer storage for uploaded audio
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.wav';
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: audioStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files (.wav, .mp3, .m4a, .flac) are supported'));
    }
  }
});

// --- Dashboard ---
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await storage.getDashboardStats();
    const cacheStats = semanticCache.getStats();
    const obsStats = observability.getSummary();
    const activePersona = personaEngine.getActivePersona();
    const currentUser = authService.getCurrentUser();

    res.json({
      success: true,
      data: {
        ...stats,
        cacheStats,
        observability: obsStats,
        activePersona,
        currentUser
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Projects ---
router.post('/projects', async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }
    const project = await storage.createProject({ name: name.trim(), description, category });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const projects = await storage.listProjects();
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const project = await storage.getProject(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    await storage.deleteProject(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Test Cases ---
router.post('/projects/:id/tests', upload.single('audio'), async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await storage.getProject(projectId);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    let criticalEntities = [];
    if (req.body.criticalEntities) {
      try {
        criticalEntities = typeof req.body.criticalEntities === 'string'
          ? JSON.parse(req.body.criticalEntities)
          : req.body.criticalEntities;
      } catch (e) {
        criticalEntities = [];
      }
    }

    const testCaseData = {
      name: req.body.name || 'Untitled Voice Test',
      language: req.body.language || 'hindi',
      category: req.body.category || 'numbers/amounts',
      noiseLevel: req.body.noiseLevel || 'clean',
      audioFile: req.file ? req.file.filename : req.body.audioUrl || 'sample-upi.wav',
      audioOriginalName: req.file ? req.file.originalname : 'sample-audio.wav',
      expectedTranscription: req.body.expectedTranscription || '',
      criticalEntities
    };

    const created = await storage.createTestCase(projectId, testCaseData);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/projects/:id/tests', async (req, res) => {
  try {
    const tests = await storage.listTestCases(req.params.id);
    res.json({ success: true, data: tests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/tests/:id', async (req, res) => {
  try {
    await storage.deleteTestCase(req.params.id);
    res.json({ success: true, message: 'Test case deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Enterprise Evaluation Execution (POST /api/tests/:id/run) ---
router.post('/tests/:id/run', async (req, res) => {
  const startTime = Date.now();
  try {
    const testCase = await storage.getTestCase(req.params.id);
    if (!testCase) {
      return res.status(404).json({ success: false, error: 'Test case not found' });
    }

    const audioPath = path.join(UPLOAD_DIR, testCase.audioFile);
    if (!fs.existsSync(audioPath)) {
      fs.writeFileSync(audioPath, 'MOCK_AUDIO_DATA');
    }

    // 1. Model Routing
    const routing = routeModel({
      language: testCase.language,
      noiseLevel: testCase.noiseLevel
    });

    // 2. Semantic Cache Check
    const cacheKey = `${testCase.language}:${testCase.expectedTranscription}:${testCase.noiseLevel}`;
    const cachedEntry = semanticCache.get(cacheKey);

    let predicted = '';
    let confidence = 0.94;
    let provider = routing.selectedModel;
    let isCached = false;

    if (cachedEntry) {
      predicted = cachedEntry.result.transcript;
      confidence = cachedEntry.result.confidence;
      isCached = true;
    } else {
      // Call Gnani Prisma STT
      const prismaResult = await transcribeAudio(audioPath, testCase.language, {
        simulatedTranscript: req.body.overrideTranscript
      });
      predicted = prismaResult.transcript;
      confidence = prismaResult.confidence;
      provider = prismaResult.provider;

      // Populate semantic cache
      semanticCache.set(cacheKey, { transcript: predicted, confidence });
    }

    // 3. AI Guardrails Evaluation (PII Sanitization & Prompt Injection defense)
    const guardrails = evaluateGuardrails(predicted, testCase.expectedTranscription);

    // 4. RAG Domain Context Retrieval
    const ragContext = vectorDb.getEvaluationContext(testCase.expectedTranscription, testCase.language);

    // 5. Transcription Evaluation (WER, CER, alignment)
    const evalResult = evaluateTranscription(testCase.expectedTranscription, predicted);

    // 6. Critical Entity Evaluation
    const entityResult = evaluateCriticalEntities(testCase.criticalEntities, predicted);

    // 7. Active Testing Persona
    const activePersona = personaEngine.getActivePersona();

    const latencyMs = Date.now() - startTime;

    // 8. Record Test Run
    const runRecord = await storage.createTestRun({
      projectId: testCase.projectId,
      testCaseId: testCase._id,
      status: 'COMPLETED',
      expectedTranscription: testCase.expectedTranscription,
      predictedTranscription: predicted,
      confidence,
      wer: evalResult.wer,
      cer: evalResult.cer,
      accuracy: evalResult.accuracy,
      details: evalResult.details,
      alignment: evalResult.alignment,
      entityEvaluation: entityResult,
      provider: `${provider} (${routing.routingReason})`,
      // Enterprise metadata
      guardrails,
      routing,
      ragContext,
      persona: activePersona.name,
      latencyMs,
      isCached
    });

    // 9. Automated Bug Filing (Jira & Slack) on Critical Failure
    let jiraIssue = null;
    let slackAlert = null;
    if (entityResult.hasCriticalMismatch) {
      jiraIssue = await integrationsService.fileJiraBug(runRecord, testCase);
      slackAlert = await integrationsService.sendSlackAlert(runRecord, testCase);
    }

    // 10. AI Observability telemetry logging
    observability.recordEvaluation({
      testId: testCase._id,
      language: testCase.language,
      latencyMs,
      cached: isCached,
      wer: evalResult.wer,
      hasCriticalMismatch: entityResult.hasCriticalMismatch
    });

    res.json({
      success: true,
      data: {
        run: runRecord,
        jiraIssue,
        slackAlert,
        guardrails,
        routing,
        isCached
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/tests/:id/results', async (req, res) => {
  try {
    const results = await storage.getTestCaseResults(req.params.id);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/runs/:id', async (req, res) => {
  try {
    const run = await storage.getTestRun(req.params.id);
    if (!run) return res.status(404).json({ success: false, error: 'Run not found' });
    res.json({ success: true, data: run });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/projects/:id/history', async (req, res) => {
  try {
    const history = await storage.getProjectHistory(req.params.id);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Enterprise AI API Routes ---

// 1. Personas
router.get('/enterprise/personas', (req, res) => {
  res.json({
    success: true,
    data: {
      personas: personaEngine.listPersonas(),
      activePersona: personaEngine.getActivePersona()
    }
  });
});

router.post('/enterprise/personas/active', (req, res) => {
  const updated = personaEngine.setActivePersona(req.body.id);
  if (!updated) return res.status(404).json({ success: false, error: 'Persona not found' });
  res.json({ success: true, data: updated });
});

// 2. RAG & Vector Knowledge Base
router.get('/enterprise/rag/documents', (req, res) => {
  res.json({ success: true, data: vectorDb.listDocuments() });
});

router.post('/enterprise/rag/search', (req, res) => {
  const { query, topK } = req.body;
  const results = vectorDb.search(query, topK || 3);
  res.json({ success: true, data: results });
});

// 3. Semantic Caching & Routing
router.get('/enterprise/cache/stats', (req, res) => {
  res.json({ success: true, data: semanticCache.getStats() });
});

router.post('/enterprise/cache/clear', (req, res) => {
  semanticCache.clear();
  res.json({ success: true, message: 'Semantic cache cleared' });
});

// 4. Integrations (Jira, Slack, HRMS)
router.get('/enterprise/integrations', (req, res) => {
  res.json({
    success: true,
    data: {
      jiraIssues: integrationsService.listJiraIssues(),
      slackAlerts: integrationsService.listSlackAlerts(),
      hrmsDirectory: integrationsService.getHRMSEmployees()
    }
  });
});

// 5. AI Observability
router.get('/enterprise/observability', (req, res) => {
  res.json({ success: true, data: observability.getSummary() });
});

// 6. RBAC & User Context
router.get('/enterprise/auth/user', (req, res) => {
  res.json({
    success: true,
    data: {
      user: authService.getCurrentUser(),
      availableRoles: Object.values(ROLES)
    }
  });
});

router.post('/enterprise/auth/role', (req, res) => {
  try {
    const updated = authService.setRole(req.body.role);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 7. MCP JSON-RPC Server Endpoint
router.post('/mcp', async (req, res) => {
  const { method, params, id } = req.body;
  try {
    if (method === 'tools/list') {
      return res.json({
        jsonrpc: '2.0',
        id,
        result: { tools: MCP_TOOLS }
      });
    }

    if (method === 'tools/call') {
      const toolResult = await handleMcpToolCall(params.name, params.arguments);
      return res.json({
        jsonrpc: '2.0',
        id,
        result: toolResult
      });
    }

    res.status(400).json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: 'Method not found' }
    });
  } catch (err) {
    res.status(500).json({
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: err.message }
    });
  }
});

// --- Seed Default Indian Voice Benchmark Tests ---
router.post('/seed', async (req, res) => {
  try {
    const demoProject = await storage.createProject({
      name: 'Indian Voice Agent Benchmark 2026',
      description: 'Enterprise evaluation suite for Indian-language voice applications with AI Guardrails & Jira/Slack integration',
      category: 'banking-upi'
    });

    const t1 = await storage.createTestCase(demoProject._id, {
      name: 'UPI Transfer - Recipient Name Validation (Rahul vs Rohan)',
      language: 'hinglish',
      category: 'names/addresses',
      noiseLevel: 'clean',
      audioFile: 'sample-rahul.wav',
      audioOriginalName: 'upi_transfer_rahul.wav',
      expectedTranscription: 'I want to send five hundred rupees to Rahul.',
      criticalEntities: [
        { name: 'Recipient Name', type: 'person', value: 'Rahul', severity: 'CRITICAL' },
        { name: 'Transfer Amount', type: 'amount', value: 'five hundred', severity: 'CRITICAL' }
      ]
    });

    const t2 = await storage.createTestCase(demoProject._id, {
      name: 'Hindi Voice Banking - Amount Verification',
      language: 'hindi',
      category: 'numbers/amounts',
      noiseLevel: 'background noise',
      audioFile: 'sample-hindi-amount.wav',
      audioOriginalName: 'hindi_banking_amount.wav',
      expectedTranscription: 'मुझे पाँच सौ रुपये राहुल को भेजने हैं।',
      criticalEntities: [
        { name: 'राशि (Amount)', type: 'amount', value: 'पाँच सौ', severity: 'CRITICAL' },
        { name: 'प्राप्तकर्ता (Recipient)', type: 'person', value: 'राहुल', severity: 'CRITICAL' }
      ]
    });

    const t3 = await storage.createTestCase(demoProject._id, {
      name: 'Marathi Customer Service - Order Inquiry',
      language: 'marathi',
      category: 'regional pronunciation',
      noiseLevel: 'clean',
      audioFile: 'sample-marathi.wav',
      audioOriginalName: 'marathi_order_inquiry.wav',
      expectedTranscription: 'मला पाचशे रुपये राहुलला पाठवायचे आहेत.',
      criticalEntities: [
        { name: 'रक्कम (Amount)', type: 'amount', value: 'पाचशे', severity: 'CRITICAL' },
        { name: 'नाव (Name)', type: 'person', value: 'राहुल', severity: 'CRITICAL' }
      ]
    });

    // Populate initial Jira issue and Slack alert
    await integrationsService.fileJiraBug({
      expectedTranscription: 'I want to send five hundred rupees to Rahul.',
      predictedTranscription: 'I want to send five hundred rupees to Rohan.',
      wer: 11.11,
      cer: 8.57,
      entityEvaluation: {
        evaluatedEntities: [
          { name: 'Recipient Name', type: 'person', expectedValue: 'Rahul', matched: false }
        ]
      }
    }, t1);

    await integrationsService.sendSlackAlert({
      expectedTranscription: 'I want to send five hundred rupees to Rahul.',
      predictedTranscription: 'I want to send five hundred rupees to Rohan.',
      wer: 11.11,
      cer: 8.57
    }, t1);

    res.json({
      success: true,
      message: 'Demo benchmark and enterprise integrations seeded successfully!',
      project: demoProject
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
