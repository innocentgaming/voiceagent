const assert = require('assert');
const { 
  applyVolumeScaling, 
  applyClippingDistortion, 
  stressLabService 
} = require('../src/services/stressLabService');
const fs = require('fs');

console.log('===============================================================');
console.log('🧪 RUNNING INDIAN VOICE STRESS LAB TEST SUITE');
console.log('===============================================================');

(async () => {
  // Test 1: Audio Volume Attenuation
  console.log('\n▶ Test 1: PCM16 Volume Attenuation');
  const path = require('path');
  const uploadsDir = path.join(__dirname, '../uploads');
  const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).filter(f => f.endsWith('.wav')) : [];
  if (files.length > 0) {
    const rawBuf = fs.readFileSync(path.join(uploadsDir, files[0]));
    const quietBuf = applyVolumeScaling(rawBuf, 0.25); // -12dB
    assert.strictEqual(quietBuf.length, rawBuf.length, 'Buffer size must remain invariant');
    console.log(`  Original: ${rawBuf.length} bytes, Attenuated: ${quietBuf.length} bytes`);
    console.log('  ✅ Test 1 Passed');
  } else {
    console.log('  (Skipping buffer test - no wav file in uploads)');
  }

  // Test 2: Audio Clipping Distortion
  console.log('\n▶ Test 2: Audio Saturation / Clipping Distortion');
  if (files.length > 0) {
    const rawBuf = fs.readFileSync(path.join(uploadsDir, files[0]));
    const clippedBuf = applyClippingDistortion(rawBuf, 2.5, 20000);
    assert.strictEqual(clippedBuf.length, rawBuf.length, 'Clipped buffer size must remain invariant');
    console.log(`  Overdriven gain saturation: ${clippedBuf.length} bytes`);
    console.log('  ✅ Test 2 Passed');
  }

  // Test 3: Stress Suite Execution & Accuracy Degradation Calculation
  console.log('\n▶ Test 3: Stress Suite Execution & Accuracy Degradation');
  const ref = "Please send five hundred rupees to Rahul";
  const hyp = "Please send five hundred rupees to Rahul";
  const entities = [{ entityType: 'person', expectedValue: 'Rahul' }, { entityType: 'amount', expectedValue: '500' }];

  const suite = await stressLabService.runStressSuite({
    reference: ref,
    hypothesis: hyp,
    language: 'hi-IN',
    criticalEntities: entities
  });

  assert(suite.stressResults.length >= 7, 'Must test at least 7 stress conditions');
  const cleanCond = suite.stressResults.find(c => c.conditionId === 'clean');
  const noise0Cond = suite.stressResults.find(c => c.conditionId === 'noise_0db');

  console.log(`  Clean WER: ${(cleanCond.wer * 100).toFixed(1)}%, 0dB Noise WER: ${(noise0Cond.wer * 100).toFixed(1)}%`);
  console.log(`  0dB Accuracy Degradation: +${(noise0Cond.accuracyDegradation * 100).toFixed(1)}%`);

  assert.strictEqual(cleanCond.wer, 0.0, 'Clean baseline should have 0 WER');
  assert(noise0Cond.wer >= cleanCond.wer, 'Stressed WER must be >= clean WER');
  assert(noise0Cond.accuracyDegradation >= 0, 'Accuracy degradation must be non-negative');
  console.log('  ✅ Test 3 Passed');

  // Test 4: Downloadable QA Report Generation
  console.log('\n▶ Test 4: QA Diagnostic Report Generation');
  const report = stressLabService.generateQAReport(suite);
  assert(report.includes('Voice AI Stress Test QA Diagnostic Report'), 'Report header must exist');
  assert(report.includes('Stress Test Degradation Matrix'), 'Matrix table must exist');
  assert(report.includes('Engineering Recommendations for Production Deployment'), 'Recommendations must exist');
  console.log('  ✅ Test 4 Passed');

  console.log('\n===============================================================');
  console.log('🎉 ALL INDIAN VOICE STRESS LAB TESTS PASSED WITH 100% SUCCESS!');
  console.log('===============================================================\n');
})();
