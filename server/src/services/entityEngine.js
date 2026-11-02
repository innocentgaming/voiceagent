/**
 * IndicVoice Lab - Critical Entity Evaluation Engine
 * Handles user-defined critical entities (Person, Amount, Date, Location, Number, etc.)
 * Evaluates whether expected entities are present in predicted transcript,
 * flags critical mismatches, and calculates Critical Entity Accuracy.
 */

const { normalizeText } = require('./evalEngine');

/**
 * Common number mappings in Indian contexts (English, Hindi, Hinglish words to digits)
 */
const NUMBER_WORD_MAP = {
  // English
  'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
  'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
  'hundred': '100', 'thousand': '1000', 'lakh': '100000', 'crore': '10000000',
  // Hindi transliteration & Devanagari
  'ek': '1', 'do': '2', 'teen': '3', 'chaar': '4', 'paanch': '5',
  'chhe': '6', 'saat': '7', 'aath': '8', 'nau': '9', 'das': '10',
  'sau': '100', 'hazaar': '1000',
  'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4', 'पाँच': '5', 'पांच': '5',
  'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9', 'दस': '10',
  'सौ': '100', 'हजार': '1000', 'लाख': '100000', 'करोड़': '10000000',
  'पाचशे': '500', 'एक हजार': '1000'
};

/**
 * Normalizes an entity value for comparison
 */
function normalizeEntityValue(val, type = '') {
  if (val === undefined || val === null) return '';
  let str = String(val).trim();
  str = normalizeText(str);

  // If entity is amount or number, also clean currency symbols like ₹, rs, rupees, etc.
  if (type === 'amount' || type === 'number') {
    str = str.replace(/(rs|inr|rupees|rupee|₹)/gi, '').trim();
  }
  return str;
}

/**
 * Checks if candidate entity value is found in predicted text.
 * Uses strict word boundary matching or normalized inclusion.
 */
function isEntityInText(entityValue, entityType, predictedText) {
  const normVal = normalizeEntityValue(entityValue, entityType);
  const normText = normalizeText(predictedText);

  if (!normVal) return false;

  // 1. Direct substring check
  if (normText.includes(normVal)) {
    return true;
  }

  // 2. Numeric / Word equivalence check (e.g. '500' vs 'five hundred' or 'five hundred' vs '500')
  if (entityType === 'amount' || entityType === 'number') {
    // If expected is 500, check if 'five hundred' is in text
    if (normVal === '500' && (normText.includes('five hundred') || normText.includes('paanch sau') || normText.includes('पाँच सौ') || normText.includes('पाचशे'))) {
      return true;
    }
    // If expected is 'five hundred' and '500' is in text
    if (normVal.includes('five hundred') && normText.includes('500')) {
      return true;
    }
  }

  // 3. Word token boundary check (e.g. 'Rahul' vs 'Rohan')
  const valWords = normVal.split(/\s+/);
  const allFound = valWords.every(w => {
    const regex = new RegExp(`\\b${escapeRegExp(w)}\\b`, 'i');
    return regex.test(normText);
  });

  return allFound;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Evaluates all critical entities defined for a test case.
 * @param {Array} expectedEntities - Array of { name, type, value, required }
 * @param {string} predictedText - Actual STT transcription from Gnani Prisma
 * @returns {Object} { passedCount, totalCount, score, hasCriticalMismatch, entities: [...] }
 */
function evaluateCriticalEntities(expectedEntities = [], predictedText = '') {
  if (!Array.isArray(expectedEntities) || expectedEntities.length === 0) {
    return {
      totalEntities: 0,
      matchedEntities: 0,
      mismatchedEntities: 0,
      entityAccuracy: 100,
      hasCriticalMismatch: false,
      evaluatedEntities: []
    };
  }

  let matched = 0;
  let mismatched = 0;
  const evaluatedEntities = [];

  for (const entity of expectedEntities) {
    const val = entity.value || entity.name || '';
    const type = (entity.type || 'general').toLowerCase();
    const isMatched = isEntityInText(val, type, predictedText);

    if (isMatched) {
      matched++;
    } else {
      mismatched++;
    }

    evaluatedEntities.push({
      name: entity.name || entity.label || type,
      expectedValue: val,
      type,
      matched: isMatched,
      status: isMatched ? 'PASS' : 'FAIL',
      severity: entity.severity || 'CRITICAL'
    });
  }

  const total = expectedEntities.length;
  const accuracy = total > 0 ? Math.round((matched / total) * 10000) / 100 : 100;
  const hasCriticalMismatch = mismatched > 0;

  return {
    totalEntities: total,
    matchedEntities: matched,
    mismatchedEntities: mismatched,
    entityAccuracy: accuracy,
    hasCriticalMismatch,
    evaluatedEntities
  };
}

module.exports = {
  normalizeEntityValue,
  isEntityInText,
  evaluateCriticalEntities
};
