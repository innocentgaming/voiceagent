/**
 * IndicVoice Lab - Transcription Evaluation Engine
 * Calculates Word Error Rate (WER), Character Error Rate (CER),
 * provides detailed alignment (Substitutions, Deletions, Insertions),
 * and handles Indian language text normalization (Hindi, Marathi, Hinglish).
 */

/**
 * Normalizes text for evaluation:
 * - Trims whitespace
 * - Replaces multiple spaces with single space
 * - Removes common English and Devanagari punctuation (including danda । and double danda ॥)
 * - Unicode NFKC normalization
 * - Lowercases Latin characters (for Hinglish/English)
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFKC')
    .toLowerCase()
    // Remove punctuation: common ASCII punctuation, Hindi/Marathi dandas (। ॥), curly quotes, etc.
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’‘“”॥।、，¿¡[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes Levenshtein matrix and backtracking alignment for arrays of tokens.
 * Works for both word tokens (WER) and character tokens (CER).
 */
function computeLevenshteinAlignment(refTokens, hypTokens) {
  const n = refTokens.length;
  const m = hypTokens.length;

  // dp[i][j] holds distance
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (refTokens[i - 1] === hypTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        const substitution = dp[i - 1][j - 1] + 1;
        const deletion = dp[i - 1][j] + 1;
        const insertion = dp[i][j - 1] + 1;
        dp[i][j] = Math.min(substitution, deletion, insertion);
      }
    }
  }

  // Backtrack to get detailed alignment and classification
  let i = n;
  let j = m;
  const alignment = [];
  let substitutions = 0;
  let deletions = 0;
  let insertions = 0;
  let matches = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && refTokens[i - 1] === hypTokens[j - 1]) {
      alignment.unshift({
        type: 'match',
        ref: refTokens[i - 1],
        hyp: hypTokens[j - 1]
      });
      matches++;
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      alignment.unshift({
        type: 'substitution',
        ref: refTokens[i - 1],
        hyp: hypTokens[j - 1]
      });
      substitutions++;
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      alignment.unshift({
        type: 'deletion',
        ref: refTokens[i - 1],
        hyp: null
      });
      deletions++;
      i--;
    } else {
      alignment.unshift({
        type: 'insertion',
        ref: null,
        hyp: hypTokens[j - 1]
      });
      insertions++;
      j--;
    }
  }

  const totalErrors = substitutions + deletions + insertions;
  const refCount = refTokens.length;
  // If reference is empty, error rate is 0 if hyp is also empty, else 1.0 (100%)
  const errorRate = refCount === 0 ? (m === 0 ? 0 : 1.0) : totalErrors / refCount;

  return {
    errorRate: Math.round(errorRate * 10000) / 100, // percentage e.g. 12.5%
    substitutions,
    deletions,
    insertions,
    matches,
    refLength: refCount,
    hypLength: m,
    alignment
  };
}

/**
 * Calculates Word Error Rate (WER)
 */
function calculateWER(expectedText, predictedText) {
  const normExpected = normalizeText(expectedText);
  const normPredicted = normalizeText(predictedText);

  const refWords = normExpected ? normExpected.split(/\s+/) : [];
  const hypWords = normPredicted ? normPredicted.split(/\s+/) : [];

  const result = computeLevenshteinAlignment(refWords, hypWords);
  return {
    wer: result.errorRate,
    substitutions: result.substitutions,
    deletions: result.deletions,
    insertions: result.insertions,
    matches: result.matches,
    wordCount: result.refLength,
    alignment: result.alignment,
    normalizedExpected: normExpected,
    normalizedPredicted: normPredicted
  };
}

/**
 * Grapheme-aware Character Tokenizer using Intl.Segmenter
 * Ensures Indic conjuncts (संयुक्ताक्षर) and vowel matras stay as single visual graphemes.
 */
function getGraphemes(text, locale = "hi-IN") {
  const normalized = normalizeText(text).replace(/\s+/g, "");
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === "function") {
    const lang = locale.toLowerCase().startsWith('mr') ? 'mr' : 'hi';
    const segmenter = new Intl.Segmenter(lang, { granularity: "grapheme" });
    return Array.from(segmenter.segment(normalized), item => item.segment);
  }
  // Fallback: Unicode code points (explicitly noted in metadata)
  return Array.from(normalized);
}

/**
 * Calculates Character Error Rate (CER) with Indic Grapheme Clustering
 */
function calculateCER(expectedText, predictedText, locale = "hi-IN") {
  const refChars = getGraphemes(expectedText, locale);
  const hypChars = getGraphemes(predictedText, locale);

  const result = computeLevenshteinAlignment(refChars, hypChars);
  return {
    cer: result.errorRate,
    charSubstitutions: result.substitutions,
    charDeletions: result.deletions,
    charInsertions: result.insertions,
    charCount: result.refLength,
    isGraphemeClustered: typeof Intl !== 'undefined' && typeof Intl.Segmenter === "function"
  };
}

/**
 * Comprehensive transcription evaluation
 */
function evaluateTranscription(expectedText, predictedText) {
  const werDetails = calculateWER(expectedText, predictedText);
  const cerDetails = calculateCER(expectedText, predictedText);

  // Overall accuracy percentage: max(0, 100 - WER)
  const accuracy = Math.max(0, Math.round((100 - werDetails.wer) * 100) / 100);

  return {
    accuracy,
    wer: werDetails.wer,
    cer: cerDetails.cer,
    details: {
      substitutions: werDetails.substitutions,
      deletions: werDetails.deletions,
      insertions: werDetails.insertions,
      matches: werDetails.matches,
      wordCount: werDetails.wordCount,
      charCount: cerDetails.charCount
    },
    alignment: werDetails.alignment,
    normalizedExpected: werDetails.normalizedExpected,
    normalizedPredicted: werDetails.normalizedPredicted
  };
}

module.exports = {
  normalizeText,
  getGraphemes,
  calculateWER,
  calculateCER,
  evaluateTranscription
};

