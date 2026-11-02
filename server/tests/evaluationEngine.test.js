const assert = require('assert');
const {
  normalizeIndicText,
  getGraphemeClusters,
  calculateWER,
  calculateCER,
  evaluateCriticalEntities
} = require('../src/services/evaluationEngine');

console.log('===============================================================');
console.log('🧪 RUNNING MANDATORY EVALUATION ENGINE VERIFICATION SUITE');
console.log('===============================================================');

// TC-01: Exact Match with Punctuation Variance
console.log('\n▶ TC-01: Exact Match with Devanagari Danda (।)');
const tc1Ref = "मेरा नाम राहुल है।";
const tc1Hyp = "मेरा नाम राहुल है";
const tc1Wer = calculateWER(tc1Ref, tc1Hyp);
const tc1Cer = calculateCER(tc1Ref, tc1Hyp);
console.log(`  WER: ${tc1Wer.wer}, CER: ${tc1Cer.cer}`);
assert.strictEqual(tc1Wer.wer, 0.0, 'TC-01 WER should be 0.0');
assert.strictEqual(tc1Cer.cer, 0.0, 'TC-01 CER should be 0.0');
console.log('  ✅ TC-01 Passed');

// TC-02: PRD Core Example (Critical Entity Error)
console.log('\n▶ TC-02: PRD Core Example (Rahul vs Rohan)');
const tc2Ref = "I want to send five hundred rupees to Rahul.";
const tc2Hyp = "I want to send five hundred rupees to Rohan.";
const tc2Entities = [{ entityType: 'person', expectedValue: 'Rahul' }];

const tc2Wer = calculateWER(tc2Ref, tc2Hyp);
const tc2Cer = calculateCER(tc2Ref, tc2Hyp);
const tc2EntityRes = evaluateCriticalEntities(tc2Hyp, tc2Entities);

console.log(`  WER: ${tc2Wer.wer} (expected ~0.1111)`);
console.log(`  CER: ${tc2Cer.cer}`);
console.log(`  Critical Failure Detected: ${tc2EntityRes.criticalFailureDetected}`);
console.log(`  Entity Accuracy: ${tc2EntityRes.entityAccuracy}%`);

assert.strictEqual(tc2Wer.wer, 0.1111, 'TC-02 WER must be 1/9 = 0.1111');
assert.strictEqual(tc2EntityRes.criticalFailureDetected, true, 'TC-02 must trigger critical failure');
assert.strictEqual(tc2EntityRes.entityAccuracy, 0, 'TC-02 entity accuracy must be 0%');
console.log('  ✅ TC-02 Passed');

// TC-03: Hinglish Code-Mixing & Number Format
console.log('\n▶ TC-03: Hinglish Code-Mixing & Number Verification');
const tc3Ref = "Mera order 450 rupees ka hai";
const tc3Hyp = "Mera order 415 rupees ka hai";
const tc3Entities = [{ entityType: 'amount', expectedValue: '450' }];

const tc3Wer = calculateWER(tc3Ref, tc3Hyp);
const tc3EntityRes = evaluateCriticalEntities(tc3Hyp, tc3Entities);

console.log(`  WER: ${tc3Wer.wer} (expected ~0.1667)`);
console.log(`  Critical Failure Detected: ${tc3EntityRes.criticalFailureDetected}`);
assert.strictEqual(tc3Wer.wer, 0.1667, 'TC-03 WER must be 1/6 = 0.1667');
assert.strictEqual(tc3EntityRes.criticalFailureDetected, true, 'TC-03 450 vs 415 must trigger critical failure');
console.log('  ✅ TC-03 Passed');

// TC-04: Marathi Grapheme Segmentation
console.log('\n▶ TC-04: Marathi Grapheme Segmentation');
const tc4Ref = "तुम्हाला काय मदत हवी आहे?";
const tc4Hyp = "तुम्हाला काय मदत हवी";

const tc4Wer = calculateWER(tc4Ref, tc4Hyp);
const tc4Cer = calculateCER(tc4Ref, tc4Hyp, 'mr');

console.log(`  WER: ${tc4Wer.wer} (expected 0.2)`);
console.log(`  CER: ${tc4Cer.cer}`);
assert.strictEqual(tc4Wer.wer, 0.2, 'TC-04 WER must be 1/5 = 0.20');
assert(tc4Cer.cer > 0 && tc4Cer.cer < 1.0, 'TC-04 CER must be valid grapheme ratio');
console.log('  ✅ TC-04 Passed');

// TC-05: Empty Hypothesis (Silence / Cutout)
console.log('\n▶ TC-05: Empty Hypothesis (Silence / Cutout)');
const tc5Ref = "मुझे कल मुंबई जाना है";
const tc5Hyp = "";

const tc5Wer = calculateWER(tc5Ref, tc5Hyp);
const tc5Cer = calculateCER(tc5Ref, tc5Hyp);

console.log(`  WER: ${tc5Wer.wer}, CER: ${tc5Cer.cer}`);
assert.strictEqual(tc5Wer.wer, 1.0, 'TC-05 WER must be 1.0 (100% error)');
assert.strictEqual(tc5Cer.cer, 1.0, 'TC-05 CER must be 1.0 (100% error)');
console.log('  ✅ TC-05 Passed');

console.log('\n===============================================================');
console.log('🎉 ALL 5 EVALUATION VERIFICATION TESTS PASSED WITH 100% PRECISION!');
console.log('===============================================================\n');
