const assert = require('assert');
const { evaluateTranscription, normalizeText } = require('../src/services/evalEngine');
const { evaluateCriticalEntities } = require('../src/services/entityEngine');

console.log('--- RUNNING INDICVOICE LAB EVALUATION TESTS ---');

// 1. Test PRD Example
const expected = "I want to send five hundred rupees to Rahul.";
const predicted = "I want to send five hundred rupees to Rohan.";

const evalResult = evaluateTranscription(expected, predicted);
console.log('Transcription Eval:', {
  wer: evalResult.wer,
  cer: evalResult.cer,
  accuracy: evalResult.accuracy,
  substitutions: evalResult.details.substitutions,
  wordCount: evalResult.details.wordCount
});

// There are 9 words: "I", "want", "to", "send", "five", "hundred", "rupees", "to", "Rahul"
// 1 substitution: "Rahul" -> "Rohan"
// WER should be 1 / 9 = 11.11%
assert.strictEqual(evalResult.details.substitutions, 1);
assert.strictEqual(evalResult.wer, 11.11);

// Critical Entity Check
const entities = [
  { name: 'Recipient', type: 'person', value: 'Rahul' },
  { name: 'Transfer Amount', type: 'amount', value: 'five hundred' }
];

const entityResult = evaluateCriticalEntities(entities, predicted);
console.log('Entity Eval:', entityResult);

assert.strictEqual(entityResult.totalEntities, 2);
assert.strictEqual(entityResult.matchedEntities, 1); // "five hundred" matched
assert.strictEqual(entityResult.mismatchedEntities, 1); // "Rahul" failed (got "Rohan")
assert.strictEqual(entityResult.hasCriticalMismatch, true);
assert.strictEqual(entityResult.entityAccuracy, 50);

// 2. Hindi & Devanagari test
const hindiExpected = "मुझे पाँच सौ रुपये राहुल को भेजने हैं।";
const hindiPredicted = "मुझे 500 रुपये राहुल को भेजने हैं";
const hindiEval = evaluateTranscription(hindiExpected, hindiPredicted);
console.log('Hindi Eval (with danda normalization):', hindiEval.details);
assert.strictEqual(hindiEval.details.substitutions, 1); // 'पाँच' vs '500' or similar before number expansion

console.log('ALL EVALUATION TESTS PASSED SUCCESSFULLY! ✅');
