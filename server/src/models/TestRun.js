const mongoose = require('mongoose');

const testRunSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  testCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase', required: true, index: true },
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'API_ERROR'], default: 'PENDING', index: true },
  predictedTranscription: { type: String, default: '' },
  metrics: {
    wer: { type: Number, default: null }, // 0.00 to 1.00+
    cer: { type: Number, default: null }, // 0.00 to 1.00+
    substitutions: { type: Number, default: 0 },
    deletions: { type: Number, default: 0 },
    insertions: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
    entityAccuracy: { type: Number, default: null }, // 0 to 100%
    criticalFailureDetected: { type: Boolean, default: false }
  },
  entityEvaluation: [{
    entityType: String,
    expectedValue: String,
    found: Boolean,
    matchedContext: String
  }],
  wordDiff: [{
    type: { type: String, enum: ['match', 'sub', 'del', 'ins'] },
    expected: String,
    actual: String
  }],
  latencyMs: { type: Number, default: 0 },
  errorMessage: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

testRunSchema.index({ testCaseId: 1, createdAt: -1 });
testRunSchema.index({ projectId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.models.TestRun || mongoose.model('TestRun', testRunSchema);
