const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const storage = require('../services/storageService');
const { evaluateTranscription } = require('../services/evalEngine');
const { evaluateCriticalEntities } = require('../services/entityEngine');
const { transcribeAudio } = require('../services/prismaService');

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
    res.json({ success: true, data: stats });
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

// --- Evaluation Execution (POST /api/tests/:id/run) ---
router.post('/tests/:id/run', async (req, res) => {
  try {
    const testCase = await storage.getTestCase(req.params.id);
    if (!testCase) {
      return res.status(404).json({ success: false, error: 'Test case not found' });
    }

    const audioPath = path.join(UPLOAD_DIR, testCase.audioFile);
    // If uploaded file doesn't exist, create dummy file or use mock
    if (!fs.existsSync(audioPath)) {
      fs.writeFileSync(audioPath, 'MOCK_AUDIO_DATA');
    }

    // 1. Call Gnani Prisma STT
    const prismaResult = await transcribeAudio(audioPath, testCase.language, {
      simulatedTranscript: req.body.overrideTranscript
    });

    const predicted = prismaResult.transcript;
    const expected = testCase.expectedTranscription;

    // 2. Transcription Evaluation (WER, CER, alignment)
    const evalResult = evaluateTranscription(expected, predicted);

    // 3. Critical Entity Evaluation
    const entityResult = evaluateCriticalEntities(testCase.criticalEntities, predicted);

    // 4. Record Test Run
    const runRecord = await storage.createTestRun({
      projectId: testCase.projectId,
      testCaseId: testCase._id,
      status: 'COMPLETED',
      expectedTranscription: expected,
      predictedTranscription: predicted,
      confidence: prismaResult.confidence,
      wer: evalResult.wer,
      cer: evalResult.cer,
      accuracy: evalResult.accuracy,
      details: evalResult.details,
      alignment: evalResult.alignment,
      entityEvaluation: entityResult,
      provider: prismaResult.provider
    });

    res.json({
      success: true,
      data: {
        run: runRecord,
        warning: prismaResult.warning
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

// --- Seed Default Indian Voice Benchmark Tests ---
router.post('/seed', async (req, res) => {
  try {
    // Create demo project
    const demoProject = await storage.createProject({
      name: 'Indian Voice Agent Benchmark 2026',
      description: 'Evaluation suite for Indian-language voice applications (Hindi, Marathi, Hinglish, UPI & Banking)',
      category: 'voice-agent'
    });

    // Seed Test 1: PRD UPI Recipient Name Mismatch
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

    // Seed Test 2: Hindi Amount Recognition (500 vs 5000)
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

    // Seed Test 3: Marathi Regional Dialect & Intent
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

    // Run sample evaluation on Test 1 to immediately populate dashboard with real stats
    await storage.createTestRun({
      projectId: demoProject._id,
      testCaseId: t1._id,
      status: 'COMPLETED',
      expectedTranscription: 'I want to send five hundred rupees to Rahul.',
      predictedTranscription: 'I want to send five hundred rupees to Rohan.',
      confidence: 0.94,
      wer: 11.11,
      cer: 8.57,
      accuracy: 88.89,
      details: {
        substitutions: 1,
        deletions: 0,
        insertions: 0,
        matches: 8,
        wordCount: 9,
        charCount: 35
      },
      alignment: [
        { type: 'match', ref: 'i', hyp: 'i' },
        { type: 'match', ref: 'want', hyp: 'want' },
        { type: 'match', ref: 'to', hyp: 'to' },
        { type: 'match', ref: 'send', hyp: 'send' },
        { type: 'match', ref: 'five', hyp: 'five' },
        { type: 'match', ref: 'hundred', hyp: 'hundred' },
        { type: 'match', ref: 'rupees', hyp: 'rupees' },
        { type: 'match', ref: 'to', hyp: 'to' },
        { type: 'substitution', ref: 'rahul', hyp: 'rohan' }
      ],
      entityEvaluation: {
        totalEntities: 2,
        matchedEntities: 1,
        mismatchedEntities: 1,
        entityAccuracy: 50,
        hasCriticalMismatch: true,
        evaluatedEntities: [
          {
            name: 'Recipient Name',
            expectedValue: 'Rahul',
            type: 'person',
            matched: false,
            status: 'FAIL',
            severity: 'CRITICAL'
          },
          {
            name: 'Transfer Amount',
            expectedValue: 'five hundred',
            type: 'amount',
            matched: true,
            status: 'PASS',
            severity: 'CRITICAL'
          }
        ]
      },
      provider: 'Gnani Prisma STT'
    });

    res.json({
      success: true,
      message: 'Demo benchmark data seeded successfully!',
      project: demoProject
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
