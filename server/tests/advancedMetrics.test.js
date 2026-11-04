const assert = require('assert');
const { pct, timedTranscribe, codeMixingIndex } = require('../src/services/observabilityService');
const { auditSemanticEquivalence, generateMarkdownReport } = require('../src/services/benchmarkReportGenerator');
const { simulateNoiseDegradation } = require('../src/services/noiseService');

console.log('===============================================================');
console.log('🧪 RUNNING ADVANCED METRICS & LATENCY TEST SUITE');
console.log('===============================================================');

// 1. Percentile calculations (p50, p95)
console.log('\n▶ Test 1: Percentile calculations (p50, p95)');
const latencies = [100, 120, 130, 140, 150, 160, 170, 180, 190, 200];
const p50 = pct(latencies, 50);
const p95 = pct(latencies, 95);
console.log(`  p50: ${p50}ms, p95: ${p95}ms`);
assert.strictEqual(p50, 150, 'p50 should be 150');
assert.strictEqual(p95, 200, 'p95 should be 200');
console.log('  ✅ Test 1 Passed');

// 2. Code-Mixing Index (CMI)
console.log('\n▶ Test 2: Code-Mixing Index (CMI)');
const monolingual = "मेरा नाम राहुल है और मैं दिल्ली में रहता हूँ";
const codeMixed = "Mera order cancel kardo please, delivery late hai";
const mixedScript = "मेरा account balance check करो please";

const cmiMono = codeMixingIndex(monolingual);
const cmiMixed = codeMixingIndex(codeMixed);
const cmiScript = codeMixingIndex(mixedScript);

console.log(`  Monolingual CMI: ${cmiMono}%`);
console.log(`  Code-Mixed Script CMI: ${cmiScript}%`);
assert.strictEqual(cmiMono, 0, 'Pure Devanagari should have CMI 0');
assert(cmiScript > 0, 'Mixed Devanagari + Latin should have CMI > 0');
console.log('  ✅ Test 2 Passed');

// 3. Timed Transcribe & RTF
console.log('\n▶ Test 3: Timed Transcribe wrapper & RTF calculation');
(async () => {
  const timed = await timedTranscribe(async () => {
    return 'Transcribed audio text';
  }, 2000); // 2000ms audio

  console.log(`  Latency: ${timed.latencyMs}ms, RTF: ${timed.rtf}`);
  assert.strictEqual(timed.success, true);
  assert(timed.latencyMs >= 0);
  assert(timed.rtf !== null);
  console.log('  ✅ Test 3 Passed');

  // 4. Semantic Equivalence LLM-as-Judge
  console.log('\n▶ Test 4: Semantic Equivalence Audit (UPI Amount preservation)');
  const resPass = auditSemanticEquivalence({
    reference: "Please send 500 rupees to Rahul",
    hypothesis: "Please send पाँच सौ rupees to Rahul"
  });
  console.log(`  Equivalence (500 vs पाँच सौ): same_action=${resPass.same_action}`);
  assert.strictEqual(resPass.same_action, true, '500 and पाँच सौ should produce same downstream action');

  const resFail = auditSemanticEquivalence({
    reference: "Please send 500 rupees to Rahul",
    hypothesis: "Please send 5000 rupees to Rahul"
  });
  console.log(`  Equivalence (500 vs 5000): same_action=${resFail.same_action}`);
  assert.strictEqual(resFail.same_action, false, '500 vs 5000 must NOT produce same action');
  assert.strictEqual(resFail.differences[0].severity, 'critical');
  console.log('  ✅ Test 4 Passed');

  // 5. Markdown Report generation
  console.log('\n▶ Test 5: Benchmark Report Generator');
  const report = generateMarkdownReport({ runs: [] });
  assert(report.includes('Executive Performance Benchmark'), 'Report must have Executive table');
  assert(report.includes('Three Critical Findings'), 'Report must include 3 Critical Findings');
  console.log('  ✅ Test 5 Passed');

  console.log('\n===============================================================');
  console.log('🎉 ALL ADVANCED METRICS TESTS PASSED SUCCESSFULLY!');
  console.log('===============================================================\n');
})();
