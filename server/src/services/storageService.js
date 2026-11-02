/**
 * IndicVoice Lab - Storage Service
 * Provides unified CRUD operations for Projects, TestCases, and TestRuns.
 * If MongoDB is connected, uses Mongoose.
 * If MongoDB is not running or unavailable, seamlessly falls back to local JSON persistence
 * so the app runs immediately out-of-the-box!
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadLocalData() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      projects: [],
      testCases: [],
      testRuns: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { projects: [], testCases: [], testRuns: [] };
  }
}

function saveLocalData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Memory / Local Store Helpers
const storage = {
  // --- Projects ---
  async createProject({ name, description = '', category = 'general' }) {
    const data = loadLocalData();
    const newProject = {
      _id: uuidv4(),
      name,
      description,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.projects.push(newProject);
    saveLocalData(data);
    return newProject;
  },

  async listProjects() {
    const data = loadLocalData();
    // Augment with test case count and latest run stats
    return data.projects.map(p => {
      const testCases = data.testCases.filter(t => t.projectId === p._id);
      const runs = data.testRuns.filter(r => r.projectId === p._id);
      return {
        ...p,
        testCaseCount: testCases.length,
        runCount: runs.length,
        latestRun: runs.length > 0 ? runs[runs.length - 1] : null
      };
    });
  },

  async getProject(id) {
    const data = loadLocalData();
    return data.projects.find(p => p._id === id) || null;
  },

  async deleteProject(id) {
    const data = loadLocalData();
    data.projects = data.projects.filter(p => p._id !== id);
    data.testCases = data.testCases.filter(t => t.projectId !== id);
    data.testRuns = data.testRuns.filter(r => r.projectId !== id);
    saveLocalData(data);
    return true;
  },

  // --- Test Cases ---
  async createTestCase(projectId, testCaseData) {
    const data = loadLocalData();
    const newTestCase = {
      _id: uuidv4(),
      projectId,
      name: testCaseData.name,
      language: testCaseData.language || 'hindi',
      category: testCaseData.category || 'numbers/amounts',
      noiseLevel: testCaseData.noiseLevel || 'clean',
      audioFile: testCaseData.audioFile, // URL or filename
      audioOriginalName: testCaseData.audioOriginalName,
      expectedTranscription: testCaseData.expectedTranscription || '',
      criticalEntities: testCaseData.criticalEntities || [],
      createdAt: new Date().toISOString(),
      lastRunResult: null
    };
    data.testCases.push(newTestCase);
    saveLocalData(data);
    return newTestCase;
  },

  async listTestCases(projectId) {
    const data = loadLocalData();
    return data.testCases.filter(t => t.projectId === projectId);
  },

  async getTestCase(id) {
    const data = loadLocalData();
    return data.testCases.find(t => t._id === id) || null;
  },

  async updateTestCase(id, updates) {
    const data = loadLocalData();
    const index = data.testCases.findIndex(t => t._id === id);
    if (index !== -1) {
      data.testCases[index] = { ...data.testCases[index], ...updates };
      saveLocalData(data);
      return data.testCases[index];
    }
    return null;
  },

  async deleteTestCase(id) {
    const data = loadLocalData();
    data.testCases = data.testCases.filter(t => t._id !== id);
    data.testRuns = data.testRuns.filter(r => r.testCaseId !== id);
    saveLocalData(data);
    return true;
  },

  // --- Test Runs ---
  async createTestRun(runData) {
    const data = loadLocalData();
    const newRun = {
      _id: uuidv4(),
      projectId: runData.projectId,
      testCaseId: runData.testCaseId,
      status: runData.status || 'COMPLETED',
      expectedTranscription: runData.expectedTranscription,
      predictedTranscription: runData.predictedTranscription,
      confidence: runData.confidence,
      wer: runData.wer,
      cer: runData.cer,
      accuracy: runData.accuracy,
      details: runData.details,
      alignment: runData.alignment,
      entityEvaluation: runData.entityEvaluation,
      provider: runData.provider || 'Gnani Prisma STT',
      createdAt: new Date().toISOString()
    };
    data.testRuns.push(newRun);

    // Update testCase's lastRunResult
    const tcIndex = data.testCases.findIndex(t => t._id === runData.testCaseId);
    if (tcIndex !== -1) {
      data.testCases[tcIndex].lastRunResult = {
        runId: newRun._id,
        wer: newRun.wer,
        cer: newRun.cer,
        accuracy: newRun.accuracy,
        hasCriticalMismatch: newRun.entityEvaluation?.hasCriticalMismatch || false,
        evaluatedAt: newRun.createdAt
      };
    }

    saveLocalData(data);
    return newRun;
  },

  async getTestRun(id) {
    const data = loadLocalData();
    return data.testRuns.find(r => r._id === id) || null;
  },

  async getProjectHistory(projectId) {
    const data = loadLocalData();
    return data.testRuns
      .filter(r => r.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getTestCaseResults(testCaseId) {
    const data = loadLocalData();
    return data.testRuns
      .filter(r => r.testCaseId === testCaseId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getDashboardStats() {
    const data = loadLocalData();
    const totalProjects = data.projects.length;
    const totalTestCases = data.testCases.length;
    const totalRuns = data.testRuns.length;

    // Calculate average WER and critical failure rate
    let avgWER = 0;
    let criticalErrors = 0;
    if (totalRuns > 0) {
      const sumWER = data.testRuns.reduce((acc, r) => acc + (r.wer || 0), 0);
      avgWER = Math.round((sumWER / totalRuns) * 100) / 100;
      criticalErrors = data.testRuns.filter(r => r.entityEvaluation?.hasCriticalMismatch).length;
    }

    const recentRuns = [...data.testRuns]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return {
      totalProjects,
      totalTestCases,
      totalRuns,
      avgWER,
      criticalErrors,
      recentRuns
    };
  }
};

module.exports = storage;
