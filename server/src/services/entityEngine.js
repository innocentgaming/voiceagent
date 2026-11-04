/**
 * IndicVoice Lab - Three-State Critical Entity Evaluation Engine
 * Evaluates developer-defined entities (Amount, Date, Person, Location, etc.)
 * Classifies outcomes into three distinct enterprise severity states:
 * - PASS (1.0): Exact or normalized number match (e.g. "पाँच सौ" == "500")
 * - NEAR_MISS (0.65 - 0.99): Grapheme phonetic/spelling variance (e.g. Rahul vs Rahool)
 * - CRITICAL_MISMATCH (< 0.65 or any amount/date error): Factual error (e.g. Rahul vs Rohan, 500 vs 5000)
 */

const { normalizeNumbers } = require('./numberNormalizer');

const norm = s => normalizeNumbers(String(s || ''))
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s]/gu, '')
  .trim();

/**
 * Grapheme-aware Levenshtein similarity using Intl.Segmenter
 */
function similarity(a, b, lang = 'hi') {
  const A = [...new Intl.Segmenter(lang, { granularity: 'grapheme' }).segment(a)].map(x => x.segment);
  const B = [...new Intl.Segmenter(lang, { granularity: 'grapheme' }).segment(b)].map(x => x.segment);
  const dp = Array.from({ length: A.length + 1 }, (_, i) => [i, ...Array(B.length).fill(0)]);
  for (let j = 1; j <= B.length; j++) dp[0][j] = j;
  for (let i = 1; i <= A.length; i++) {
    for (let j = 1; j <= B.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1)
      );
    }
  }
  return 1 - dp[A.length][B.length] / Math.max(A.length, B.length, 1);
}

function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Verifies a single entity against hypothesis transcript
 * @returns { status: 'PASS' | 'NEAR_MISS' | 'CRITICAL_MISMATCH', score: number }
 */
function verifyEntity(entity, hypothesis, lang = 'hi') {
  const h = norm(hypothesis);
  const rawVal = entity.value || entity.expectedValue || entity.name || '';
  const e = norm(rawVal);
  const type = (entity.type || entity.entityType || 'general').toLowerCase();

  if (!e) return { status: 'CRITICAL_MISMATCH', score: 0.0 };

  // Amounts, numbers, and dates NEVER get fuzzy credit
  // Must match as standalone number boundary (e.g. 500 must not match 5000 or 50)
  if (type === 'amount' || type === 'number' || type === 'date') {
    const numRegex = new RegExp(`(^|[^0-9a-zA-Z])${escapeRegExp(e)}([^0-9a-zA-Z]|$)`);
    if (numRegex.test(h)) {
      return { status: 'PASS', score: 1.0 };
    }
    return { status: 'CRITICAL_MISMATCH', score: 0.0 };
  }

  // Exact or normalized substring match for text entities (names, locations, etc.)
  if (h.includes(e) && e.length > 0) {
    return { status: 'PASS', score: 1.0 };
  }

  // Names, locations, and phrases: find best-matching window of same word count
  const hw = h.split(/\s+/).filter(Boolean);
  const n = e.split(/\s+/).filter(Boolean).length;
  let best = 0;

  for (let i = 0; i + n <= hw.length; i++) {
    const windowStr = hw.slice(i, i + n).join(' ');
    best = Math.max(best, similarity(e, windowStr, lang));
  }

  // Single word fallback if window didn't capture
  if (best === 0 && hw.length > 0 && n === 1) {
    for (const w of hw) {
      best = Math.max(best, similarity(e, w, lang));
    }
  }

  best = Math.round(best * 1000) / 1000;

  if (best >= 0.65) {
    return { status: 'NEAR_MISS', score: best }; // Spelling / accent variant, flagged for review
  }

  return { status: 'CRITICAL_MISMATCH', score: best };
}

/**
 * Evaluates an array of critical entities against predicted text.
 */
function evaluateCriticalEntities(expectedEntities = [], predictedText = '', lang = 'hi') {
  // Support both (expectedEntities, predictedText) and (predictedText, expectedEntities)
  let entitiesList = expectedEntities;
  let hypText = predictedText;
  if (typeof expectedEntities === 'string' && Array.isArray(predictedText)) {
    hypText = expectedEntities;
    entitiesList = predictedText;
  }

  if (!Array.isArray(entitiesList) || entitiesList.length === 0) {
    return {
      totalEntities: 0,
      matchedEntities: 0,
      nearMissEntities: 0,
      mismatchedEntities: 0,
      entityAccuracy: 100,
      hasCriticalMismatch: false,
      criticalFailureDetected: false,
      evaluatedEntities: [],
      entityEvaluation: []
    };
  }

  let passCount = 0;
  let nearMissCount = 0;
  let criticalCount = 0;
  const evaluatedEntities = [];

  for (const entity of entitiesList) {
    const val = entity.value || entity.expectedValue || entity.name || '';
    const type = (entity.type || entity.entityType || 'general').toLowerCase();
    const result = verifyEntity(entity, hypText, lang);

    if (result.status === 'PASS') {
      passCount++;
    } else if (result.status === 'NEAR_MISS') {
      nearMissCount++;
    } else {
      criticalCount++;
    }

    const item = {
      name: entity.name || entity.label || type,
      expectedValue: val,
      type,
      entityType: type,
      status: result.status,
      score: result.score,
      found: result.status === 'PASS',
      nearMiss: result.status === 'NEAR_MISS',
      criticalMismatch: result.status === 'CRITICAL_MISMATCH',
      severity: result.status === 'CRITICAL_MISMATCH' ? 'CRITICAL' : (result.status === 'NEAR_MISS' ? 'WARNING' : 'INFO')
    };

    evaluatedEntities.push(item);
  }

  const total = entitiesList.length;
  // PASS counts full 100%, NEAR_MISS gives 50% partial credit towards soft score
  const accuracy = total > 0 ? Math.round(((passCount + nearMissCount * 0.5) / total) * 100) : 100;
  const hasCriticalMismatch = criticalCount > 0;

  return {
    totalEntities: total,
    matchedEntities: passCount,
    nearMissEntities: nearMissCount,
    mismatchedEntities: criticalCount,
    entityAccuracy: Math.round((passCount / total) * 100), // strict pass accuracy
    effectiveAccuracy: accuracy,
    hasCriticalMismatch,
    criticalFailureDetected: hasCriticalMismatch,
    evaluatedEntities,
    entityEvaluation: evaluatedEntities // dual-field alias for API consistency
  };
}

module.exports = {
  norm,
  similarity,
  verifyEntity,
  evaluateCriticalEntities
};
