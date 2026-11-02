const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  name: { type: String, required: true, trim: true },
  language: { type: String, enum: ['hi-IN', 'mr-IN', 'hinglish'], required: true },
  category: { 
    type: String, 
    enum: ['general', 'regional_pronunciation', 'background_noise', 'numbers_amounts', 'names_addresses', 'negation_corrections'],
    default: 'general',
    index: true
  },
  audioFile: {
    originalName: String,
    mimeType: String,
    sizeBytes: Number,
    storagePath: String
  },
  expectedTranscription: { type: String, required: true },
  criticalEntities: [{
    entityType: { type: String, enum: ['person', 'amount', 'date', 'location', 'other'], required: true },
    expectedValue: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

testCaseSchema.index({ projectId: 1, category: 1 });

module.exports = mongoose.models.TestCase || mongoose.model('TestCase', testCaseSchema);

