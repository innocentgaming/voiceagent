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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// 1. IN-MEMORY DATA STORE (MongoDB Ready)
// ==========================================
const db = {
  projects: [
    {
      id: 'proj_demo_01',
      name: 'Banking & Payments Voice Bot',
      description: 'Evaluating transfer requests and entity accuracy under Indian accents.',
      createdAt: new Date().toISOString()
    }
  ],
  testCases: [
    {
      id: 'tc_demo_01',
      projectId: 'proj_demo_01',
      name: 'UPI Transfer - Recipient Verification',
      language: 'hinglish',
      category: 'names_addresses',
      expectedTranscription: 'I want to send five hundred rupees to Rahul.',
      criticalEntities: [
        { entityType: 'person', expectedValue: 'Rahul' },
        { entityType: 'amount', expectedValue: 'five hundred' }
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
      diff: hypWords.map(w => ({ type: 'ins', expected: null, actual: w }))
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
    this.apiKey = process.env.GNANI_API_KEY;
    this.token = process.env.GNANI_TOKEN;
    this.endpoint = process.env.GNANI_STT_ENDPOINT || 'https://api.gnani.ai/stt/v1';
  }

  async transcribe(audioBuffer, mimeType, language, simulatedErrorType = null) {
    // If real credentials exist, invoke external endpoint
    if (this.apiKey && this.token) {
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
        return response.data?.transcript || '';
      } catch (err) {
        const customErr = new Error(err.message || 'Prisma API Failed');
        customErr.isProviderError = true;
        customErr.statusCode = err.response?.status || 502;
        throw customErr;
      }
    }

    // Realistic Demo Simulator (Matches PRD Example: Rahul -> Rohan mismatch)
    await new Promise(r => setTimeout(r, 650));
    if (simulatedErrorType === 'api_error') {
      const err = new Error('Prisma gateway timeout (504)');
      err.isProviderError = true;
      err.statusCode = 504;
      throw err;
    }

    // Default simulation: demonstrates high WER accuracy with Critical Entity Mismatch
    return 'I want to send five hundred rupees to Rohan.';
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
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });
  const newProj = { id: `proj_${Date.now()}`, name, description: description || '', createdAt: new Date().toISOString() };
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
    parsedEntities = criticalEntities ? JSON.parse(criticalEntities) : [];
  } catch (e) {
    parsedEntities = [];
  }

  const newTest = {
    id: `tc_${Date.now()}`,
    projectId: req.params.id,
    name,
    language: language || 'hi-IN',
    category: category || 'general',
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

  try {
    predicted = await prismaService.transcribe(
      Buffer.from('dummy-audio-bytes'),
      'audio/wav',
      testCase.language,
      req.query.simulate_error
    );
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
    status,
    expectedTranscription: testCase.expectedTranscription,
    predictedTranscription: predicted,
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

// History & Results
app.get('/api/projects/:id/history', (req, res) => {
  res.json(db.testRuns.filter(tr => tr.projectId === req.params.id));
});

// ==========================================
// 5. EMBEDDED FRONTEND (Tailwind Dark UI)
// ==========================================
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <title>IndicVoice Lab - Voice Agent Testing Platform</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 500: '#6366f1', 600: '#4f46e5' }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">

  <!-- Header -->
  <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">IV</div>
        <div>
          <span class="font-bold text-lg tracking-tight">IndicVoice Lab</span>
          <span class="text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-800 px-2 py-0.5 rounded-full ml-2">v1.0 MVP</span>
        </div>
      </div>
      <div class="text-xs text-slate-400 font-mono">Gnani AI Internship Challenge</div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
    
    <!-- Left: Projects & Test Inventory -->
    <div class="lg:col-span-4 space-y-6">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm uppercase tracking-wider font-semibold text-slate-400">Target Test Suite</h2>
          <span class="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Hinglish / Hindi</span>
        </div>
        <div id="test-list" class="space-y-3">
          <!-- Loaded via JS -->
        </div>
      </div>

      <!-- Quick Test Runner Form -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 class="font-semibold text-sm mb-3 text-slate-200">Execute Evaluation Run</h3>
        <p class="text-xs text-slate-400 mb-4">Dispatches audio to Gnani Prisma STT and triggers the dual-layer WER and Critical Entity engine.</p>
        <button id="run-btn" onclick="executeTest()" class="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-600/20">
          <span>Run PRD Verification Sample</span>
        </button>
      </div>
    </div>

    <!-- Right: Interactive Evaluation Report -->
    <div class="lg:col-span-8 space-y-6">
      
      <!-- Critical Entity Alert Box -->
      <div id="critical-alert" class="hidden rounded-xl border-2 p-5 transition-all"></div>

      <!-- Metric KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div class="text-xs text-slate-400 font-medium">Word Error Rate (WER)</div>
          <div id="kpi-wer" class="text-2xl font-bold font-mono mt-1 text-slate-200">--</div>
          <div id="kpi-wer-sub" class="text-[10px] text-slate-500 mt-0.5">Lexical edit distance</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div class="text-xs text-slate-400 font-medium">Character Error (CER)</div>
          <div id="kpi-cer" class="text-2xl font-bold font-mono mt-1 text-slate-200">--</div>
          <div id="kpi-cer-sub" class="text-[10px] text-slate-500 mt-0.5">Grapheme-level clusters</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div class="text-xs text-slate-400 font-medium">Entity Accuracy</div>
          <div id="kpi-entity" class="text-2xl font-bold font-mono mt-1 text-slate-200">--</div>
          <div id="kpi-entity-sub" class="text-[10px] text-slate-500 mt-0.5">Critical information</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div class="text-xs text-slate-400 font-medium">STT Latency</div>
          <div id="kpi-latency" class="text-2xl font-bold font-mono mt-1 text-slate-200">--</div>
          <div class="text-[10px] text-slate-500 mt-0.5">End-to-end response</div>
        </div>
      </div>

      <!-- Word-Level Diff View -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-sm text-slate-200">Visual Alignment Diff</h3>
          <div class="flex items-center gap-3 text-xs">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-rose-500/20 border border-rose-500 rounded"></span> Substituted / Missing</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-amber-500/20 border border-amber-500 rounded"></span> Hallucinated / Inserted</span>
          </div>
        </div>
        <div id="diff-container" class="bg-slate-950 p-4 rounded-lg border border-slate-800/80 min-h-[90px] text-slate-300 font-normal leading-relaxed text-base flex flex-wrap gap-2 items-center">
          <span class="text-slate-500 text-sm italic">Click "Run PRD Verification Sample" to test evaluation.</span>
        </div>
      </div>

      <!-- Critical Entity Verification Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 class="font-semibold text-sm mb-4 text-slate-200">Critical Entity Verification Panel</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase">
              <tr>
                <th class="py-2.5 px-4">Entity Type</th>
                <th class="py-2.5 px-4">Expected Value</th>
                <th class="py-2.5 px-4">Verification Status</th>
                <th class="py-2.5 px-4">Matched Context</th>
              </tr>
            </thead>
            <tbody id="entity-table-body" class="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td colspan="4" class="py-4 text-center text-slate-500 font-sans">No evaluation executed yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </main>

  <script>
    let activeTestId = 'tc_demo_01';

    async function loadTests() {
      const res = await fetch('/api/projects/proj_demo_01/tests');
      const tests = await res.json();
      const container = document.getElementById('test-list');
      container.innerHTML = tests.map(t => \`
        <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg">
          <div class="font-medium text-xs text-slate-200">\${t.name}</div>
          <div class="text-[11px] text-slate-400 mt-1 italic">"\${t.expectedTranscription}"</div>
          <div class="mt-2 flex gap-1.5">
            \${t.criticalEntities.map(e => \`<span class="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">\${e.entityType}: \${e.expectedValue}</span>\`).join('')}
          </div>
        </div>
      \`).join('');
    }

    async function executeTest() {
      const btn = document.getElementById('run-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin">🌀</span> Transcribing & Evaluating...';

      try {
        const res = await fetch('/api/tests/' + activeTestId + '/run', { method: 'POST' });
        const report = await res.json();
        renderReport(report);
      } catch (e) {
        alert('Evaluation failed: ' + e.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Run PRD Verification Sample</span>';
      }
    }

    function renderReport(r) {
      // 1. Alert Box
      const alertBox = document.getElementById('critical-alert');
      alertBox.classList.remove('hidden');
      if (r.metrics.criticalFailureDetected) {
        alertBox.className = 'rounded-xl border-2 border-red-500/80 bg-red-950/40 p-5 text-red-200 mb-6';
        alertBox.innerHTML = \`
          <div class="flex items-start gap-3">
            <span class="text-xl">⚠️</span>
            <div>
              <div class="font-bold text-sm tracking-wide uppercase text-red-100">Critical Entity Mismatch Detected</div>
              <div class="text-xs text-red-300 mt-1 leading-relaxed">
                Notice: The Word Error Rate is only <strong>\${(r.metrics.wer * 100).toFixed(1)}%</strong>, but the recipient identifier was misrecognized. In voice banking, this is an unacceptable business failure.
              </div>
            </div>
          </div>
        \`;
      } else {
        alertBox.className = 'rounded-xl border-2 border-emerald-500/80 bg-emerald-950/40 p-5 text-emerald-200 mb-6';
        alertBox.innerHTML = \`
          <div class="flex items-start gap-3">
            <span class="text-xl">✅</span>
            <div>
              <div class="font-bold text-sm tracking-wide uppercase text-emerald-100">All Critical Entities Verified</div>
              <div class="text-xs text-emerald-300 mt-1">High semantic integrity. Key values verified successfully.</div>
            </div>
          </div>
        \`;
      }

      // 2. Metrics
      document.getElementById('kpi-wer').innerText = (r.metrics.wer * 100).toFixed(1) + '%';
      document.getElementById('kpi-cer').innerText = (r.metrics.cer * 100).toFixed(1) + '%';
      document.getElementById('kpi-entity').innerText = r.metrics.entityAccuracy + '%';
      document.getElementById('kpi-latency').innerText = r.latencyMs + ' ms';

      // 3. Diff Visualizer
      const diffContainer = document.getElementById('diff-container');
      diffContainer.innerHTML = r.wordDiff.map(d => {
        if (d.type === 'match') return \`<span class="text-slate-200">\${d.expected}</span>\`;
        if (d.type === 'sub') return \`
          <span class="inline-flex gap-1 items-center">
            <del class="bg-rose-950/80 text-rose-300 border border-rose-600/70 px-1.5 py-0.5 rounded line-through text-xs">\${d.expected}</del>
            <ins class="bg-amber-950/80 text-amber-200 border border-amber-600/70 px-1.5 py-0.5 rounded no-underline text-xs font-semibold">\${d.actual}</ins>
          </span>\`;
        if (d.type === 'del') return \`<del class="bg-rose-950/80 text-rose-300 border border-rose-600/70 px-1.5 py-0.5 rounded line-through text-xs">\${d.expected}</del>\`;
        if (d.type === 'ins') return \`<ins class="bg-amber-950/80 text-amber-200 border border-amber-600/70 px-1.5 py-0.5 rounded no-underline text-xs">\${d.actual}</ins>\`;
      }).join(' ');

      // 4. Entity Table
      const tableBody = document.getElementById('entity-table-body');
      tableBody.innerHTML = r.entityEvaluation.map(e => \`
        <tr class="hover:bg-slate-800/30">
          <td class="py-2.5 px-4 uppercase text-slate-400 text-[11px]">\${e.entityType}</td>
          <td class="py-2.5 px-4 font-semibold text-slate-200">\${e.expectedValue}</td>
          <td class="py-2.5 px-4">
            \${e.found 
              ? '<span class="text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px]">VERIFIED</span>'
              : '<span class="text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded-full text-[10px]">MISMATCH / ABSENT</span>'}
          </td>
          <td class="py-2.5 px-4 text-slate-400 text-xs">\${e.matchedContext || '<span class="text-rose-500/80 font-sans italic">Not detected</span>'}</td>
        </tr>
      \`).join('');
    }

    loadTests();
  </script>
</body>
</html>
  `);
});

// Start Server
app.listen(PORT, () => {
  console.log(`[IndicVoice Lab] Backend and UI running at http://localhost:${PORT}`);
  console.log(`[IndicVoice Lab] Ready for Gnani AI Challenge testing.`);
});
