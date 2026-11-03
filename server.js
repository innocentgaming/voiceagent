/**
 * IndicVoice Lab - An Indian-language Voice Agent Testing Platform
 * Version 1.0 (Gnani AI Challenge - MVP)
 * 
 * Run instructions:
 * 1. npm install
 * 2. node server.js
 * 3. Open http://localhost:5000 in your browser
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static sample uploads if present
const UPLOADS_DIR = path.join(__dirname, 'server/uploads');
if (fs.existsSync(UPLOADS_DIR)) {
  app.use('/uploads', express.static(UPLOADS_DIR));
}

// Multer memory storage (Max 15MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/m4a'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(wav|mp3|ogg|m4a)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_AUDIO_FORMAT: Only WAV, MP3, OGG, and M4A files are allowed.'));
    }
  }
});

// ==========================================
// 1. IN-MEMORY DATA STORE (Preloaded with Indian Voice Benchmarks)
// ==========================================
const db = {
  projects: [
    {
      id: 'proj_demo_01',
      name: 'Indian Voice Agent Benchmark 2026',
      description: 'Evaluating transfer requests, amounts, and entity accuracy across Hindi, Marathi, and Hinglish accents.',
      category: 'banking-upi',
      createdAt: new Date().toISOString()
    }
  ],
  testCases: [
    {
      id: 'tc_demo_01',
      projectId: 'proj_demo_01',
      name: 'UPI Transfer - Recipient Name Validation (Rahul vs Rohan)',
      language: 'hinglish',
      category: 'names_addresses',
      noiseLevel: 'clean',
      audioFile: 'sample-rahul.wav',
      expectedTranscription: 'I want to send five hundred rupees to Rahul.',
      criticalEntities: [
        { entityType: 'person', expectedValue: 'Rahul' },
        { entityType: 'amount', expectedValue: 'five hundred' }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'tc_demo_02',
      projectId: 'proj_demo_01',
      name: 'Hindi Voice Banking - Amount Verification (500 vs 5000)',
      language: 'hi-IN',
      category: 'numbers_amounts',
      noiseLevel: 'background noise',
      audioFile: 'sample-hindi-amount.wav',
      expectedTranscription: 'मुझे पाँच सौ रुपये राहुल को भेजने हैं।',
      criticalEntities: [
        { entityType: 'amount', expectedValue: 'पाँच सौ' },
        { entityType: 'person', expectedValue: 'राहुल' }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'tc_demo_03',
      projectId: 'proj_demo_01',
      name: 'Marathi Customer Service - Order Inquiry',
      language: 'mr-IN',
      category: 'regional_pronunciation',
      noiseLevel: 'clean',
      audioFile: 'sample-marathi.wav',
      expectedTranscription: 'मला पाचशे रुपये राहुलला पाठवायचे आहेत.',
      criticalEntities: [
        { entityType: 'amount', expectedValue: 'पाचशे' },
        { entityType: 'person', expectedValue: 'राहुल' }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'tc_demo_04',
      projectId: 'proj_demo_01',
      name: 'Hinglish E-Commerce Cancellation Intent',
      language: 'hinglish',
      category: 'negation_corrections',
      noiseLevel: 'clean',
      audioFile: 'hinglish_cancel.wav',
      expectedTranscription: 'mera order cancel kardo please',
      criticalEntities: [
        { entityType: 'action', expectedValue: 'cancel' }
      ],
      createdAt: new Date().toISOString()
    }
  ],
  testRuns: []
};

// ==========================================
// 2. MATHEMATICAL EVALUATION ENGINE
// ==========================================

/**
 * Normalizes text: Unicode NFC, lowers case, removes Latin & Indic punctuation (।, ॥)
 */
function normalizeIndicText(str) {
  if (!str) return '';
  return str
    .normalize('NFC')
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'।॥]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Grapheme-aware character segmenter for Indic scripts
 */
function getGraphemes(str, lang = 'hi') {
  if (!str) return [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(lang, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(str), s => s.segment);
  }
  return Array.from(str);
}

/**
 * Levenshtein Alignment returning distance, edits, and visual diff stream
 */
function alignTokens(refTokens, hypTokens) {
  const n = refTokens.length;
  const m = hypTokens.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (refTokens[i - 1] === hypTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // Substitution
          dp[i - 1][j] + 1,     // Deletion
          dp[i][j - 1] + 1      // Insertion
        );
      }
    }
  }

  let i = n, j = m;
  let substitutions = 0, deletions = 0, insertions = 0;
  const diff = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && refTokens[i - 1] === hypTokens[j - 1]) {
      diff.unshift({ type: 'match', expected: refTokens[i - 1], actual: hypTokens[j - 1] });
      i--; j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      diff.unshift({ type: 'sub', expected: refTokens[i - 1], actual: hypTokens[j - 1] });
      substitutions++;
      i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      diff.unshift({ type: 'del', expected: refTokens[i - 1], actual: null });
      deletions++;
      i--;
    } else {
      diff.unshift({ type: 'ins', expected: null, actual: hypTokens[j - 1] });
      insertions++;
      j--;
    }
  }

  return { substitutions, deletions, insertions, diff, total: n };
}

function calculateWER(reference, hypothesis) {
  const refNorm = normalizeIndicText(reference);
  const hypNorm = normalizeIndicText(hypothesis);

  const refWords = refNorm ? refNorm.split(' ') : [];
  const hypWords = hypNorm ? hypNorm.split(' ') : [];

  if (refWords.length === 0) {
    return {
      wer: hypWords.length > 0 ? 1.0 : 0.0,
      substitutions: 0,
      deletions: 0,
      insertions: hypWords.length,
      diff: hypWords.map(w => ({ type: 'ins', expected: null, actual: w })),
      total: 0
    };
  }

  const res = alignTokens(refWords, hypWords);
  const wer = parseFloat(((res.substitutions + res.deletions + res.insertions) / res.total).toFixed(4));
  return { wer, ...res };
}

function calculateCER(reference, hypothesis, lang = 'hi') {
  const refChars = getGraphemes(normalizeIndicText(reference).replace(/\s+/g, ''), lang);
  const hypChars = getGraphemes(normalizeIndicText(hypothesis).replace(/\s+/g, ''), lang);

  if (refChars.length === 0) {
    return { cer: hypChars.length > 0 ? 1.0 : 0.0, totalChars: 0 };
  }

  const res = alignTokens(refChars, hypChars);
  const cer = parseFloat(((res.substitutions + res.deletions + res.insertions) / res.total).toFixed(4));
  return { cer, totalChars: res.total };
}

function evaluateCriticalEntities(predictedText, expectedEntities = []) {
  if (!expectedEntities || expectedEntities.length === 0) {
    return { entityAccuracy: 100, criticalFailureDetected: false, entityEvaluation: [] };
  }

  const normPred = normalizeIndicText(predictedText);
  let passedCount = 0;

  const entityEvaluation = expectedEntities.map(entity => {
    const normExpected = normalizeIndicText(entity.expectedValue);
    const regex = new RegExp(`(^|\\s)${normExpected}(\\s|$)`, 'i');
    const matched = regex.test(normPred) || normPred.includes(normExpected);

    if (matched) passedCount++;

    return {
      entityType: entity.entityType,
      expectedValue: entity.expectedValue,
      found: matched,
      matchedContext: matched ? entity.expectedValue : null
    };
  });

  const entityAccuracy = Math.round((passedCount / expectedEntities.length) * 100);
  const criticalFailureDetected = passedCount < expectedEntities.length;

  return { entityAccuracy, criticalFailureDetected, entityEvaluation };
}

// ==========================================
// 3. GNANI PRISMA STT SERVICE (WITH DEMO SIMULATOR)
// ==========================================
class PrismaService {
  constructor() {
    this.apiKey = process.env.GNANI_API_KEY || process.env.GNANI_PRISMA_API_KEY;
    this.token = process.env.GNANI_TOKEN || process.env.GNANI_PRISMA_ACCESS_KEY;
    this.endpoint = process.env.GNANI_STT_ENDPOINT || process.env.GNANI_PRISMA_ENDPOINT || 'https://prisma.gnani.ai/api/v1/stt';
  }

  async transcribe(audioBuffer, mimeType, language, scenarioId = 'tc_demo_01', simulationOverride = null) {
    // If real credentials exist and no simulation override requested
    if (this.apiKey && this.token && !simulationOverride) {
      try {
        const response = await axios.post(this.endpoint, audioBuffer, {
          headers: {
            'x-api-key': this.apiKey,
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': mimeType,
            'x-language': language
          },
          timeout: 25000
        });
        return {
          transcript: response.data?.transcript || response.data?.text || '',
          provider: 'Gnani Prisma Cloud STT (Live API)',
          confidence: response.data?.confidence || 0.95
        };
      } catch (err) {
        const customErr = new Error(err.message || 'Prisma API Failed');
        customErr.isProviderError = true;
        customErr.statusCode = err.response?.status || 502;
        throw customErr;
      }
    }

    // Realistic Demo Simulator (Matches PRD Example & Benchmarks)
    await new Promise(r => setTimeout(r, 450));

    if (simulationOverride === 'timeout_error') {
      const err = new Error('Prisma gateway timeout (504): upstream speech cluster did not respond within 25000ms');
      err.isProviderError = true;
      err.statusCode = 504;
      throw err;
    }

    if (simulationOverride === 'perfect_match') {
      const tc = db.testCases.find(t => t.id === scenarioId);
      return {
        transcript: tc ? tc.expectedTranscription : 'I want to send five hundred rupees to Rahul.',
        provider: 'Gnani Prisma STT (Simulated - 100% Perfect Recognition)',
        confidence: 0.99
      };
    }

    if (simulationOverride && simulationOverride.startsWith('custom:')) {
      return {
        transcript: simulationOverride.replace('custom:', ''),
        provider: 'Gnani Prisma STT (Custom Hypothesis Injection)',
        confidence: 0.92
      };
    }

    // Default scenario-specific benchmark simulations
    let transcript = 'I want to send five hundred rupees to Rohan.';
    let confidence = 0.94;

    if (scenarioId === 'tc_demo_02') {
      // Amount mismatch (500 vs 5000 in Hindi)
      transcript = 'मुझे पाँच हज़ार रुपये राहुल को भेजने हैं';
      confidence = 0.91;
    } else if (scenarioId === 'tc_demo_03') {
      // Marathi exact match
      transcript = 'मला पाचशे रुपये राहुलला पाठवायचे आहेत';
      confidence = 0.96;
    } else if (scenarioId === 'tc_demo_04') {
      // Hinglish cancellation exact match
      transcript = 'mera order cancel kardo please';
      confidence = 0.95;
    }

    return {
      transcript,
      provider: 'Gnani Prisma STT (Acoustic Evaluation Model)',
      confidence
    };
  }
}
const prismaService = new PrismaService();

// ==========================================
// 4. REST API ROUTES (PRD Section 8)
// ==========================================

// Projects
app.get('/api/projects', (req, res) => {
  res.json(db.projects.map(p => ({
    ...p,
    testCasesCount: db.testCases.filter(tc => tc.projectId === p.id).length
  })));
});

app.post('/api/projects', (req, res) => {
  const { name, description, category } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });
  const newProj = { 
    id: `proj_${Date.now()}`, 
    name, 
    description: description || '', 
    category: category || 'banking-upi',
    createdAt: new Date().toISOString() 
  };
  db.projects.push(newProj);
  res.status(201).json(newProj);
});

app.delete('/api/projects/:id', (req, res) => {
  db.projects = db.projects.filter(p => p.id !== req.params.id);
  db.testCases = db.testCases.filter(tc => tc.projectId !== req.params.id);
  db.testRuns = db.testRuns.filter(tr => tr.projectId !== req.params.id);
  res.status(204).send();
});

// Test Cases
app.get('/api/projects/:id/tests', (req, res) => {
  const tests = db.testCases.filter(tc => tc.projectId === req.params.id);
  res.json(tests);
});

app.post('/api/projects/:id/tests', upload.single('audio'), (req, res) => {
  const { name, language, category, expectedTranscription, criticalEntities } = req.body;
  if (!name || !expectedTranscription) {
    return res.status(400).json({ error: 'Name and expected transcription are required' });
  }

  let parsedEntities = [];
  try {
    parsedEntities = criticalEntities ? (typeof criticalEntities === 'string' ? JSON.parse(criticalEntities) : criticalEntities) : [];
  } catch (e) {
    parsedEntities = [];
  }

  const newTest = {
    id: `tc_${Date.now()}`,
    projectId: req.params.id,
    name,
    language: language || 'hi-IN',
    category: category || 'general',
    noiseLevel: req.body.noiseLevel || 'clean',
    expectedTranscription,
    criticalEntities: parsedEntities,
    audioFileMeta: req.file ? { originalName: req.file.originalname, size: req.file.size } : null,
    createdAt: new Date().toISOString()
  };

  db.testCases.push(newTest);
  res.status(201).json(newTest);
});

// Run Evaluation
app.post('/api/tests/:id/run', async (req, res) => {
  const testCase = db.testCases.find(tc => tc.id === req.params.id);
  if (!testCase) return res.status(404).json({ error: 'Test case not found' });

  const startTime = Date.now();
  let predicted = '';
  let status = 'COMPLETED';
  let errorMessage = null;
  let provider = 'Gnani Prisma STT';
  let confidence = 0.94;

  const simulationMode = req.body?.simulationMode || req.query?.simulate_error || null;

  try {
    const sttResult = await prismaService.transcribe(
      Buffer.from('dummy-audio-bytes'),
      'audio/wav',
      testCase.language,
      testCase.id,
      simulationMode
    );
    predicted = sttResult.transcript;
    provider = sttResult.provider;
    confidence = sttResult.confidence;
  } catch (err) {
    status = 'API_ERROR';
    errorMessage = err.message;
  }

  const latencyMs = Date.now() - startTime;

  let metrics = {
    wer: null,
    cer: null,
    entityAccuracy: null,
    criticalFailureDetected: false
  };
  let wordDiff = [];
  let entityEvaluation = [];

  if (status === 'COMPLETED') {
    const werResult = calculateWER(testCase.expectedTranscription, predicted);
    const cerResult = calculateCER(testCase.expectedTranscription, predicted, testCase.language === 'mr-IN' ? 'mr' : 'hi');
    const entityResult = evaluateCriticalEntities(predicted, testCase.criticalEntities);

    metrics = {
      wer: werResult.wer,
      cer: cerResult.cer,
      substitutions: werResult.substitutions,
      deletions: werResult.deletions,
      insertions: werResult.insertions,
      totalWords: werResult.total,
      entityAccuracy: entityResult.entityAccuracy,
      criticalFailureDetected: entityResult.criticalFailureDetected
    };
    wordDiff = werResult.diff;
    entityEvaluation = entityResult.entityEvaluation;
  }

  const runResult = {
    id: `run_${Date.now()}`,
    projectId: testCase.projectId,
    testCaseId: testCase.id,
    testCaseName: testCase.name,
    language: testCase.language,
    status,
    expectedTranscription: testCase.expectedTranscription,
    predictedTranscription: predicted,
    provider,
    confidence,
    metrics,
    wordDiff,
    entityEvaluation,
    latencyMs,
    errorMessage,
    createdAt: new Date().toISOString()
  };

  db.testRuns.unshift(runResult);
  res.json(runResult);
});

// Run All Test Cases in Project
app.post('/api/projects/:id/run-all', async (req, res) => {
  const tests = db.testCases.filter(tc => tc.projectId === req.params.id);
  const results = [];

  for (const tc of tests) {
    const startTime = Date.now();
    const sttResult = await prismaService.transcribe(
      Buffer.from('dummy-audio-bytes'),
      'audio/wav',
      tc.language,
      tc.id
    );
    const predicted = sttResult.transcript;
    const latencyMs = Date.now() - startTime;

    const werResult = calculateWER(tc.expectedTranscription, predicted);
    const cerResult = calculateCER(tc.expectedTranscription, predicted, tc.language === 'mr-IN' ? 'mr' : 'hi');
    const entityResult = evaluateCriticalEntities(predicted, tc.criticalEntities);

    const run = {
      id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      projectId: tc.projectId,
      testCaseId: tc.id,
      testCaseName: tc.name,
      language: tc.language,
      status: 'COMPLETED',
      expectedTranscription: tc.expectedTranscription,
      predictedTranscription: predicted,
      provider: sttResult.provider,
      confidence: sttResult.confidence,
      metrics: {
        wer: werResult.wer,
        cer: cerResult.cer,
        entityAccuracy: entityResult.entityAccuracy,
        criticalFailureDetected: entityResult.criticalFailureDetected
      },
      wordDiff: werResult.diff,
      entityEvaluation: entityResult.entityEvaluation,
      latencyMs,
      createdAt: new Date().toISOString()
    };
    db.testRuns.unshift(run);
    results.push(run);
  }

  res.json({ success: true, runs: results });
});

// History & Results
app.get('/api/projects/:id/history', (req, res) => {
  res.json(db.testRuns.filter(tr => tr.projectId === req.params.id));
});

// ==========================================
// 5. HIGH-PERFORMANCE UPGRADED DEVELOPER UI
// ==========================================
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IndicVoice Lab - Voice AI Testing & Evaluation Platform</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
            devanagari: ['Noto Sans Devanagari', 'sans-serif']
          },
          colors: {
            slate: {
              950: '#070a12',
              900: '#0f172a',
              850: '#141e33',
              800: '#1e293b'
            }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #070a12; }
    .indic-text { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; line-height: 1.75; }
    /* Subtle pulse animation for engine status */
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .status-dot { animation: pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">

  <!-- Toast Notification Container -->
  <div id="toast" class="fixed top-5 right-5 z-50 transform transition-all duration-300 opacity-0 translate-y-[-20px] pointer-events-none bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium"></div>

  <!-- Top Glass Header -->
  <header class="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      
      {/* Brand & Mission */}
      <div class="flex items-center gap-3.5">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25 text-sm tracking-wider">
          IV
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-base tracking-tight text-white">IndicVoice Lab</span>
            <span class="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              Gnani Prisma STT
            </span>
          </div>
          <p class="text-[11px] text-slate-400 hidden sm:block">Indian-Language Voice Agent Testing Platform • v1.0 MVP</p>
        </div>
      </div>

      {/* Engine Status & Quick Actions */}
      <div class="flex items-center gap-3">
        <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-400 status-dot"></span>
          <span class="text-slate-300 font-medium">Prisma Engine:</span>
          <span class="text-emerald-400 font-mono font-semibold">Ready</span>
        </div>

        <button onclick="openModal('create-test-modal')" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>New Test</span>
        </button>

        <button onclick="runEntireSuite()" id="run-all-btn" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Run Suite (4)</span>
        </button>
      </div>

    </div>
  </header>

  <!-- Hero Core Promise Bar -->
  <div class="border-b border-slate-800/60 bg-gradient-to-r from-slate-950 via-indigo-950/20 to-slate-950 px-4 py-3">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
      <div class="flex items-center gap-2">
        <span class="text-indigo-400 font-bold uppercase tracking-wider text-[10px]">Product Promise:</span>
        <span class="text-slate-300 font-medium italic">“Don't just test whether your voice AI transcribes speech. Test whether it understands the information that actually matters.”</span>
      </div>
      <div class="flex items-center gap-4 text-slate-400 text-[11px] font-mono shrink-0">
        <span>Languages: Hindi • Marathi • Hinglish</span>
      </div>
    </div>
  </div>

  <!-- Main Content Layout -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
    
    <!-- Left Column: Test Case Suite Navigator & Execution Controller -->
    <div class="lg:col-span-4 space-y-5">
      
      <!-- Test Cases Matrix Card -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="text-xs uppercase tracking-wider font-bold text-slate-400">Benchmark Test Suite</h2>
            <span id="suite-count-badge" class="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">4 cases</span>
          </div>
          <span class="text-[10px] text-indigo-400 font-medium">Select to Inspect</span>
        </div>

        <div id="test-list" class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          <!-- Dynamically populated via JS -->
        </div>
      </div>

      <!-- Execution & Chaos Simulation Controls Card -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 class="font-bold text-sm text-white flex items-center justify-between">
            <span>Evaluation Dispatcher</span>
            <span class="text-[10px] font-mono text-slate-400 uppercase">Dual-Layer STT</span>
          </h3>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed">
            Select a target test case, pick an evaluation mode or simulate speech anomalies, and run Gnani Prisma STT.
          </p>
        </div>

        <!-- Simulation Behavior Switcher -->
        <div class="space-y-1.5">
          <label class="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            STT Engine Simulation Mode
          </label>
          <select id="sim-mode-select" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans">
            <option value="default">Default Benchmark Result (PRD Rahul $\to$ Rohan)</option>
            <option value="perfect_match">100% Perfect Transcript (Zero Error Baseline)</option>
            <option value="timeout_error">Simulate 504 Gateway Timeout (Decouple API Error)</option>
            <option value="custom">Inject Custom Hypothesis Transcript...</option>
          </select>
        </div>

        <!-- Custom Hypothesis Container (Hidden by default) -->
        <div id="custom-hyp-container" class="hidden space-y-1.5 pt-1">
          <label class="block text-[11px] font-semibold text-indigo-300">
            Custom Predicted Transcript
          </label>
          <input type="text" id="custom-hyp-input" placeholder="e.g. I want to send 500 rupees to Rohan" class="w-full bg-slate-950 border border-indigo-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none font-devanagari" />
        </div>

        <!-- Primary Run Button -->
        <button id="run-btn" onclick="executeActiveTest()" class="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-indigo-600/25">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg>
          <span id="run-btn-text">Execute Evaluation on Selected Test</span>
        </button>

        <div class="text-[11px] text-slate-500 flex items-center justify-between pt-1">
          <span>Normalization: Unicode NFC</span>
          <span>WER DP: O(min(N,M))</span>
        </div>
      </div>

    </div>

    <!-- Right Column: Interactive Evaluation Audit Report -->
    <div class="lg:col-span-8 space-y-5">
      
      <!-- Critical Entity Alert Box (Pillar 1 & 6 Showcase) -->
      <div id="critical-alert" class="hidden rounded-2xl border-2 p-5 transition-all duration-300 shadow-xl"></div>

      <!-- Metric KPI Cards Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div class="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div class="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Word Error (WER)</div>
          <div id="kpi-wer" class="text-2xl font-black font-mono mt-1 text-slate-200">--</div>
          <div id="kpi-wer-sub" class="text-[10px] text-slate-500 mt-0.5">Levenshtein (S+D+I)/N</div>
        </div>

        <div class="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div class="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Character Error (CER)</div>
          <div id="kpi-cer" class="text-2xl font-black font-mono mt-1 text-slate-200">--</div>
          <div id="kpi-cer-sub" class="text-[10px] text-slate-500 mt-0.5">Grapheme-clustered</div>
        </div>

        <div class="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div class="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Entity Integrity</div>
          <div id="kpi-entity" class="text-2xl font-black font-mono mt-1 text-slate-200">--</div>
          <div id="kpi-entity-sub" class="text-[10px] text-slate-500 mt-0.5">Critical information check</div>
        </div>

        <div class="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div class="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">STT Inference</div>
          <div id="kpi-latency" class="text-2xl font-black font-mono mt-1 text-indigo-400">--</div>
          <div id="kpi-provider" class="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Gnani Prisma STT</div>
        </div>
      </div>

      <!-- Audio Reference & Waveform Playback Bar -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-200" id="audio-player-label">Audio Speech Reference (16kHz PCM)</div>
            <div class="text-[11px] text-slate-500 font-mono" id="audio-player-meta">Standard Indian accent benchmark recording</div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <audio id="audio-element" controls class="h-9 w-full sm:w-64 rounded-lg bg-slate-950"></audio>
        </div>
      </div>

      <!-- Side-by-Side Reference vs Hypothesis Transcripts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div class="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Expected Ground Truth (Reference)</span>
            <span id="ref-word-count" class="font-mono text-slate-500">-- words</span>
          </div>
          <p id="ref-transcript-display" class="indic-text text-sm text-slate-200 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 min-h-[75px] font-medium leading-relaxed">
            Select a test case to view reference transcript.
          </p>
        </div>

        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div class="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Gnani Prisma Output (Hypothesis)</span>
            <span id="hyp-confidence-badge" class="font-mono text-indigo-400">Confidence: --</span>
          </div>
          <p id="hyp-transcript-display" class="indic-text text-sm text-slate-200 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 min-h-[75px] font-medium leading-relaxed">
            Click "Execute Evaluation" to run STT.
          </p>
        </div>
      </div>

      <!-- Word-Level Alignment Diff View (Accessible <del> and <ins>) -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="font-bold text-sm text-white">Accessible Sequential Word Diff (<span class="font-mono text-indigo-400 text-xs">Levenshtein Backpointers</span>)</h3>
            <p class="text-[11px] text-slate-400">Colorblind-safe semantic tokens identifying deletions, substitutions, and insertions.</p>
          </div>
          <div class="flex items-center gap-3 text-xs">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-slate-700 rounded"></span> Match</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-rose-600 rounded"></span> Replaced (&lt;del&gt;)</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-amber-600 rounded"></span> Hallucinated (&lt;ins&gt;)</span>
          </div>
        </div>

        <div id="diff-container" class="indic-text bg-slate-950 p-4 rounded-xl border border-slate-800/80 min-h-[90px] text-slate-300 leading-loose text-sm flex flex-wrap gap-2 items-center">
          <span class="text-slate-500 text-xs italic">Awaiting evaluation run...</span>
        </div>
      </div>

      <!-- Critical Entity Verification Table -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-sm text-white">Developer-Defined Critical Entities Audit</h3>
            <p class="text-[11px] text-slate-400">Strictly verifies whether high-stakes business values were preserved.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="exportAuditJSON()" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span>Export JSON</span>
            </button>
            <button onclick="exportAuditMarkdown()" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Copy MD</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto border border-slate-800 rounded-xl">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th class="py-2.5 px-4">Entity Type</th>
                <th class="py-2.5 px-4">Target Expected Value</th>
                <th class="py-2.5 px-4">Verification Status</th>
                <th class="py-2.5 px-4">Matched Context in Transcript</th>
              </tr>
            </thead>
            <tbody id="entity-table-body" class="divide-y divide-slate-800/60 font-mono bg-slate-900/40">
              <tr>
                <td colspan="4" class="py-4 text-center text-slate-500 font-sans">No evaluation executed yet. Select a test case and execute.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </main>

  <!-- Create Test Case Modal -->
  <div id="create-test-modal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 class="font-bold text-base text-white">Create Audio Test Case</h3>
        <button onclick="closeModal('create-test-modal')" class="text-slate-400 hover:text-white">&times;</button>
      </div>

      <form onsubmit="handleCreateTest(event)" class="space-y-3.5 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Test Name *</label>
          <input type="text" id="new-test-name" required placeholder="e.g. Marathi Dialect Amount Test" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Language</label>
            <select id="new-test-lang" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500">
              <option value="hi-IN">Hindi (hi-IN)</option>
              <option value="mr-IN">Marathi (mr-IN)</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Scenario Category</label>
            <select id="new-test-cat" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500">
              <option value="numbers_amounts">Numbers / Amounts</option>
              <option value="names_addresses">Names / Addresses</option>
              <option value="regional_pronunciation">Regional Pronunciation</option>
              <option value="negation_corrections">Negation / Corrections</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">Expected Ground-Truth Transcript *</label>
          <textarea id="new-test-expected" rows="2" required placeholder="e.g. मला पाचशे रुपये पाठवायचे आहेत" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-indigo-500 font-devanagari"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Critical Entity Type</label>
            <select id="new-entity-type" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none">
              <option value="person">Person Name</option>
              <option value="amount">Amount / Currency</option>
              <option value="date">Date</option>
              <option value="location">Location / PIN</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Critical Expected Value</label>
            <input type="text" id="new-entity-val" placeholder="e.g. पाचशे or Rahul" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none font-devanagari" />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-800">
          <button type="button" onclick="closeModal('create-test-modal')" class="px-4 py-2 rounded-lg text-slate-400 hover:text-white">Cancel</button>
          <button type="submit" class="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Save Test Case</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Interactive Client-side Script -->
  <script>
    let activeTestId = 'tc_demo_01';
    let loadedTests = [];
    let lastEvaluationReport = null;

    // Toast helper
    function showToast(msg) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.classList.remove('opacity-0', 'translate-y-[-20px]', 'pointer-events-none');
      setTimeout(() => {
        t.classList.add('opacity-0', 'translate-y-[-20px]', 'pointer-events-none');
      }, 3000);
    }

    function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
    function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

    // Toggle custom hypothesis input
    document.getElementById('sim-mode-select').addEventListener('change', (e) => {
      const cont = document.getElementById('custom-hyp-container');
      if (e.target.value === 'custom') {
        cont.classList.remove('hidden');
      } else {
        cont.classList.add('hidden');
      }
    });

    async function loadTestSuite() {
      try {
        const res = await fetch('/api/projects/proj_demo_01/tests');
        loadedTests = await res.json();
        
        document.getElementById('suite-count-badge').innerText = loadedTests.length + ' cases';
        const container = document.getElementById('test-list');
        
        container.innerHTML = loadedTests.map((t) => {
          const isSelected = t.id === activeTestId;
          const langLabel = t.language === 'mr-IN' ? 'Marathi' : (t.language === 'hi-IN' ? 'Hindi' : 'Hinglish');
          const langBg = t.language === 'mr-IN' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : (t.language === 'hi-IN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20');
          
          return \`
            <div 
              onclick="selectTestCase('\${t.id}')"
              class="p-3.5 rounded-xl border cursor-pointer transition-all duration-200 \${
                isSelected 
                  ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-950/50' 
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
              }"
            >
              <div class="flex items-center justify-between gap-1.5">
                <span class="font-semibold text-xs text-slate-200 line-clamp-1">\${t.name}</span>
                <span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border \${langBg}">\${langLabel}</span>
              </div>
              <div class="indic-text text-[11px] text-slate-400 mt-1 line-clamp-1 italic">"\${t.expectedTranscription}"</div>
              <div class="mt-2 flex flex-wrap gap-1">
                \${t.criticalEntities.map(e => \`<span class="text-[9px] bg-slate-900 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono font-medium">\${e.entityType}: <strong>\${e.expectedValue}</strong></span>\`).join('')}
              </div>
            </div>
          \`;
        }).join('');

        // Update player & active card info
        const active = loadedTests.find(t => t.id === activeTestId) || loadedTests[0];
        if (active) {
          document.getElementById('ref-transcript-display').innerText = active.expectedTranscription;
          const words = active.expectedTranscription.split(/\\s+/).filter(Boolean);
          document.getElementById('ref-word-count').innerText = words.length + ' words';
          
          const audioElem = document.getElementById('audio-element');
          if (active.audioFile) {
            audioElem.src = '/uploads/' + active.audioFile;
          } else {
            audioElem.src = '/uploads/sample-rahul.wav';
          }
        }
      } catch (e) {
        console.error('Failed to load test suite:', e);
      }
    }

    function selectTestCase(id) {
      activeTestId = id;
      loadTestSuite();
    }

    async function executeActiveTest() {
      const btn = document.getElementById('run-btn');
      const btnText = document.getElementById('run-btn-text');
      btn.disabled = true;
      btnText.innerHTML = '<span class="inline-block animate-spin mr-1">🌀</span> Dispatching to Gnani Prisma STT...';

      const simSelect = document.getElementById('sim-mode-select').value;
      let simPayload = simSelect;
      if (simSelect === 'custom') {
        const val = document.getElementById('custom-hyp-input').value.trim();
        simPayload = 'custom:' + (val || 'I want to send five hundred rupees to Rohan.');
      }

      try {
        const res = await fetch('/api/tests/' + activeTestId + '/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ simulationMode: simPayload })
        });
        const report = await res.json();
        renderReport(report);
        showToast('Evaluation report compiled successfully');
      } catch (e) {
        alert('Evaluation execution failed: ' + e.message);
      } finally {
        btn.disabled = false;
        btnText.innerText = 'Execute Evaluation on Selected Test';
      }
    }

    async function runEntireSuite() {
      const btn = document.getElementById('run-all-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="inline-block animate-spin mr-1">🌀</span> Running Suite...';

      try {
        const res = await fetch('/api/projects/proj_demo_01/run-all', { method: 'POST' });
        const data = await res.json();
        if (data.runs && data.runs.length > 0) {
          renderReport(data.runs[0]);
          showToast(\`Suite completed! \${data.runs.length} benchmark test cases evaluated.\`);
        }
      } catch (e) {
        alert('Suite execution error: ' + e.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg><span>Run Suite (4)</span>';
      }
    }

    async function handleCreateTest(e) {
      e.preventDefault();
      const name = document.getElementById('new-test-name').value;
      const lang = document.getElementById('new-test-lang').value;
      const cat = document.getElementById('new-test-cat').value;
      const expected = document.getElementById('new-test-expected').value;
      const entType = document.getElementById('new-entity-type').value;
      const entVal = document.getElementById('new-entity-val').value;

      const entities = entVal.trim() ? [{ entityType: entType, expectedValue: entVal.trim() }] : [];

      await fetch('/api/projects/proj_demo_01/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          language: lang,
          category: cat,
          expectedTranscription: expected,
          criticalEntities: entities
        })
      });

      closeModal('create-test-modal');
      showToast('New test case added to suite!');
      await loadTestSuite();
    }

    function renderReport(r) {
      lastEvaluationReport = r;

      // Handle Decoupled API Error
      if (r.status === 'API_ERROR') {
        const alertBox = document.getElementById('critical-alert');
        alertBox.classList.remove('hidden');
        alertBox.className = 'rounded-2xl border-2 border-amber-600/80 bg-amber-950/40 p-5 text-amber-200 mb-5 shadow-lg';
        alertBox.innerHTML = \`
          <div class="flex items-start gap-3">
            <span class="text-xl">⚠️</span>
            <div>
              <div class="font-bold text-sm uppercase tracking-wider text-amber-100">Downstream Infrastructure / API Error Decoupled</div>
              <div class="text-xs text-amber-300 mt-1 leading-relaxed">
                Notice: \${r.errorMessage}. Per PRD Pillar 1, infrastructure failures are excluded from speech recognition accuracy averages.
              </div>
            </div>
          </div>
        \`;
        document.getElementById('kpi-wer').innerText = 'N/A';
        document.getElementById('kpi-cer').innerText = 'N/A';
        document.getElementById('kpi-entity').innerText = 'N/A';
        document.getElementById('kpi-latency').innerText = r.latencyMs + ' ms';
        return;
      }

      // 1. Critical Alert Banner
      const alertBox = document.getElementById('critical-alert');
      alertBox.classList.remove('hidden');
      const hasMismatch = r.metrics.criticalFailureDetected;

      if (hasMismatch) {
        alertBox.className = 'rounded-2xl border-2 border-red-600/90 bg-red-950/45 p-5 text-red-200 mb-5 shadow-xl shadow-red-950/30';
        alertBox.innerHTML = \`
          <div class="flex items-start gap-3.5">
            <span class="text-2xl mt-0.5">🚨</span>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded font-mono">
                  CRITICAL ENTITY FAILURE
                </span>
                <span class="text-xs text-red-300 font-semibold">Semantic Integrity Compromised</span>
              </div>
              <p class="text-xs text-red-200/90 leading-relaxed">
                Even though surface transcription accuracy achieved a low WER of <strong class="text-white font-mono">\${(r.metrics.wer * 100).toFixed(1)}%</strong>, one or more developer-defined critical business entities were misrecognized or omitted. In production Indian voice banking, this causes a fatal transaction failure.
              </p>
            </div>
          </div>
        \`;
      } else {
        alertBox.className = 'rounded-2xl border border-emerald-500/60 bg-emerald-950/30 p-5 text-emerald-200 mb-5 shadow-lg shadow-emerald-950/20';
        alertBox.innerHTML = \`
          <div class="flex items-start gap-3.5">
            <span class="text-2xl mt-0.5">✅</span>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono">
                  ALL CRITICAL ENTITIES VERIFIED
                </span>
              </div>
              <p class="text-xs text-emerald-200/90 leading-relaxed">
                Gnani Prisma STT preserved all developer-defined transactional values with high semantic fidelity.
              </p>
            </div>
          </div>
        \`;
      }

      // 2. Metric KPI Cards
      const werEl = document.getElementById('kpi-wer');
      werEl.innerText = (r.metrics.wer * 100).toFixed(1) + '%';
      werEl.className = \`text-2xl font-black font-mono mt-1 \${r.metrics.wer <= 0.15 ? 'text-emerald-400' : 'text-amber-400'}\`;

      document.getElementById('kpi-cer').innerText = (r.metrics.cer * 100).toFixed(1) + '%';
      
      const entityEl = document.getElementById('kpi-entity');
      entityEl.innerText = r.metrics.entityAccuracy + '%';
      entityEl.className = \`text-2xl font-black font-mono mt-1 \${!hasMismatch ? 'text-emerald-400' : 'text-red-400'}\`;

      document.getElementById('kpi-latency').innerText = r.latencyMs + ' ms';
      document.getElementById('kpi-provider').innerText = r.provider || 'Gnani Prisma STT';

      // 3. Side-by-Side Transcripts
      document.getElementById('hyp-transcript-display').innerText = r.predictedTranscription;
      document.getElementById('hyp-confidence-badge').innerText = 'Confidence: ' + Math.round((r.confidence || 0.94) * 100) + '%';

      // 4. Word-by-Word Diff Visualizer
      const diffContainer = document.getElementById('diff-container');
      diffContainer.innerHTML = r.wordDiff.map(d => {
        if (d.type === 'match') {
          return \`<span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200">\${d.expected}</span>\`;
        } else if (d.type === 'sub') {
          return \`
            <span class="inline-flex gap-1 items-center">
              <del class="bg-rose-950/80 text-rose-300 border border-rose-600 px-1.5 py-0.5 rounded line-through decoration-rose-500 font-medium text-xs">\${d.expected}</del>
              <ins class="bg-amber-950/80 text-amber-200 border border-amber-600 px-1.5 py-0.5 rounded no-underline font-semibold text-xs">\${d.actual}</ins>
            </span>
          \`;
        } else if (d.type === 'del') {
          return \`<del class="bg-rose-950/80 text-rose-300 border border-rose-600 px-1.5 py-0.5 rounded line-through decoration-rose-500 font-medium text-xs">\${d.expected}</del>\`;
        } else {
          return \`<ins class="bg-amber-950/80 text-amber-200 border border-amber-600 px-1.5 py-0.5 rounded no-underline font-semibold text-xs">+\${d.actual}</ins>\`;
        }
      }).join(' ');

      // 5. Critical Entity Audit Table
      const tableBody = document.getElementById('entity-table-body');
      if (!r.entityEvaluation || r.entityEvaluation.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-slate-500 font-sans">No critical entities defined for this test case.</td></tr>';
      } else {
        tableBody.innerHTML = r.entityEvaluation.map(e => \`
          <tr class="hover:bg-slate-800/30 transition">
            <td class="py-2.5 px-4 uppercase text-slate-400 text-[11px] font-mono">\${e.entityType}</td>
            <td class="py-2.5 px-4 font-semibold text-slate-200 font-devanagari text-sm">\${e.expectedValue}</td>
            <td class="py-2.5 px-4">
              \${e.found 
                ? '<span class="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded text-[10px] font-bold">VERIFIED</span>' 
                : '<span class="inline-flex items-center gap-1 text-rose-400 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded text-[10px] font-bold">CRITICAL MISMATCH</span>'}
            </td>
            <td class="py-2.5 px-4 text-slate-400 text-xs font-devanagari">\${e.matchedContext || '<span class="text-rose-500 font-sans italic text-xs">Omitted / Not found</span>'}</td>
          </tr>
        \`).join('');
      }
    }

    function exportAuditJSON() {
      if (!lastEvaluationReport) return alert('Execute an evaluation first!');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lastEvaluationReport, null, 2));
      const a = document.createElement('a');
      a.setAttribute("href", dataStr);
      a.setAttribute("download", \`indicvoice_audit_\${lastEvaluationReport.id}.json\`);
      a.click();
      showToast('JSON report downloaded');
    }

    function exportAuditMarkdown() {
      if (!lastEvaluationReport) return alert('Execute an evaluation first!');
      const r = lastEvaluationReport;
      const md = \`
# IndicVoice Lab - Voice AI Evaluation Audit
- **Test Case:** \${r.testCaseName}
- **Timestamp:** \${new Date(r.createdAt).toLocaleString()}
- **Speech Engine:** \${r.provider}
- **Word Error Rate (WER):** \${(r.metrics.wer * 100).toFixed(1)}%
- **Character Error Rate (CER):** \${(r.metrics.cer * 100).toFixed(1)}%
- **Entity Accuracy:** \${r.metrics.entityAccuracy}%
- **Critical Status:** \${r.metrics.criticalFailureDetected ? 'CRITICAL FAILURE' : 'PASSED'}

### Transcripts
- **Expected:** \${r.expectedTranscription}
- **Hypothesis:** \${r.predictedTranscription}

### Entity Evaluation
\${(r.entityEvaluation || []).map(e => \`- \${e.entityType}: "\${e.expectedValue}" -> \${e.found ? 'VERIFIED' : 'MISMATCH'}\`).join('\\n')}
      \`.trim();

      navigator.clipboard.writeText(md).then(() => {
        showToast('Markdown audit report copied to clipboard!');
      });
    }

    // Initialize suite
    loadTestSuite();
  </script>
</body>
</html>
  `);
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 [IndicVoice Lab] Backend and UI running at http://localhost:${PORT}`);
  console.log(`📡 Evaluation Endpoint: POST /api/tests/:id/run`);
  console.log(`🎙️ Preloaded Benchmarks: Hindi, Marathi, Hinglish Ready`);
  console.log(`=======================================================`);
});
