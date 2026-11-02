/**
 * IndicVoice Lab - Mathematical & Analytical Evaluation Engine
 * Pure mathematical functions for Indic Speech-to-Text evaluation:
 * - Unicode NFC normalization with Devanagari danda punctuation stripping
 * - Levenshtein DP sequence alignment with backpointers
 * - Word Error Rate (WER)
 * - Character Error Rate (CER) with Intl.Segmenter grapheme clustering
 * - Critical Entity Verification
 */

/**
 * Unicode NFC Normalization, stripping Latin & Indic punctuation, whitespace collapsing
 */
function normalizeIndicText(str) {
  if (!str) return '';
  return str
    .normalize('NFC')
    .toLowerCase()
    // Remove Latin punctuation and Indic punctuation (Devanagari danda \u0964, double danda \u0965)
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'।॥]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Grapheme-aware Character Array Generator using Intl.Segmenter
 * Ensures vowel matras and conjuncts are preserved as unitary visual graphemes.
 */
function getGraphemeClusters(str, lang = 'hi') {
  if (!str) return [];
  const segmenter = new Intl.Segmenter(lang, { granularity: 'grapheme' });
  return Array.from(segmenter.segment(str), s => s.segment);
}

/**
 * Levenshtein Alignment returning Distance, S, D, I, and Visual Diff Array
 */
function alignSequences(refTokens, hypTokens) {
  const n = refTokens.length;
  const m = hypTokens.length;

  // Matrix setup: dp[i][j] holds edit distance
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

  // Backtrace alignment to extract exact token diffs
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

  return {
    distance: dp[n][m],
    substitutions,
    deletions,
    insertions,
    totalReferenceTokens: n,
    diff
  };
}

/**
 * Word Error Rate (WER)
 */
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
      totalWords: 0,
      diff: hypWords.map(w => ({ type: 'ins', expected: null, actual: w }))
    };
  }

  const alignment = alignSequences(refWords, hypWords);
  const wer = parseFloat(((alignment.substitutions + alignment.deletions + alignment.insertions) / alignment.totalReferenceTokens).toFixed(4));

  return {
    wer,
    substitutions: alignment.substitutions,
    deletions: alignment.deletions,
    insertions: alignment.insertions,
    totalWords: alignment.totalReferenceTokens,
    diff: alignment.diff
  };
}

/**
 * Character Error Rate (CER) with Grapheme-Clustering
 */
function calculateCER(reference, hypothesis, lang = 'hi') {
  const refNorm = normalizeIndicText(reference).replace(/\s+/g, '');
  const hypNorm = normalizeIndicText(hypothesis).replace(/\s+/g, '');

  const refChars = getGraphemeClusters(refNorm, lang);
  const hypChars = getGraphemeClusters(hypNorm, lang);

  if (refChars.length === 0) {
    return { cer: hypChars.length > 0 ? 1.0 : 0.0, totalChars: 0 };
  }

  const alignment = alignSequences(refChars, hypChars);
  const cer = parseFloat(((alignment.substitutions + alignment.deletions + alignment.insertions) / alignment.totalReferenceTokens).toFixed(4));

  return { cer, totalChars: alignment.totalReferenceTokens };
}

/**
 * Critical Entity Verification Engine
 */
function evaluateCriticalEntities(predictedText, expectedEntities = []) {
  if (!expectedEntities || expectedEntities.length === 0) {
    return {
      entityAccuracy: 100,
      criticalFailureDetected: false,
      entityEvaluation: []
    };
  }

  const normPred = normalizeIndicText(predictedText);
  let passedCount = 0;

  const entityEvaluation = expectedEntities.map(entity => {
    const rawVal = entity.expectedValue || entity.value || '';
    const normExpected = normalizeIndicText(rawVal);

    // Boundary-aware or whole substring inclusion match
    const regex = new RegExp(`(^|\\s)${escapeRegExp(normExpected)}(\\s|$)`, 'i');
    const matched = regex.test(normPred) || normPred.includes(normExpected);

    if (matched) passedCount++;

    return {
      entityType: entity.entityType || entity.type || 'general',
      expectedValue: rawVal,
      found: matched,
      matchedContext: matched ? normExpected : null
    };
  });

  const entityAccuracy = Math.round((passedCount / expectedEntities.length) * 100);
  const criticalFailureDetected = passedCount < expectedEntities.length;

  return {
    entityAccuracy,
    criticalFailureDetected,
    entityEvaluation
  };
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  normalizeIndicText,
  getGraphemeClusters,
  alignSequences,
  calculateWER,
  calculateCER,
  evaluateCriticalEntities
};
