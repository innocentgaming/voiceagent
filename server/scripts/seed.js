const storage = require('../src/services/storageService');

async function seed() {
  console.log('Seeding initial benchmark projects and test cases...');
  
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

  console.log('Seeding completed! Project ID:', demoProject._id);
}

seed().catch(console.error);

