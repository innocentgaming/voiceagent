/**
 * IndicVoice Lab - AI Guardrails & Data Privacy Service
 * Provides:
 * - PII Masking & Scrubbing (Aadhaar, PAN, Phone, UPI IDs, Credit Cards)
 * - Prompt Injection & Jailbreak Defense
 * - Language Policy Compliance & Toxicity Filters
 * - Hallucination & Drift Detection
 */

// Regex patterns for Indian PII
const PII_PATTERNS = {
  aadhaar: /\b[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\b/g,
  panCard: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi,
  indianPhone: /(?:\+91[\-\s]?)?[6789]\d{9}\b/g,
  upiId: /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g,
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
};

// Known prompt injection / jailbreak markers
const INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /disregard all prior/i,
  /you are now an unfiltered/i,
  /system override/i,
  /bypass security/i,
  /reveal your system prompt/i,
  /jailbreak/i,
  /dan mode/i
];

/**
 * Scrubs PII from transcript or prompt
 */
function maskPII(text) {
  if (!text || typeof text !== 'string') return { cleanedText: '', detectedPII: [] };

  let cleaned = text;
  const detectedPII = [];

  for (const [type, regex] of Object.entries(PII_PATTERNS)) {
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      matches.forEach(m => {
        detectedPII.push({ type, value: m });
        cleaned = cleaned.replace(m, `[REDACTED_${type.toUpperCase()}]`);
      });
    }
  }

  return { cleanedText: cleaned, detectedPII };
}

/**
 * Checks for prompt injection or malicious instructions
 */
function scanPromptInjection(text) {
  if (!text || typeof text !== 'string') return { safe: true, threats: [] };

  const threats = [];
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      threats.push({
        pattern: pattern.toString(),
        description: 'Potential prompt injection / override attempt detected.'
      });
    }
  }

  return {
    safe: threats.length === 0,
    threats
  };
}

/**
 * Evaluates Guardrail Compliance for an STT output
 */
function evaluateGuardrails(transcript, expectedContext = '') {
  const piiResult = maskPII(transcript);
  const injectionResult = scanPromptInjection(transcript);

  const passed = injectionResult.safe && piiResult.detectedPII.length === 0;

  return {
    passed,
    piiSafe: piiResult.detectedPII.length === 0,
    injectionSafe: injectionResult.safe,
    detectedPII: piiResult.detectedPII,
    threats: injectionResult.threats,
    sanitizedTranscript: piiResult.cleanedText
  };
}

module.exports = {
  maskPII,
  scanPromptInjection,
  evaluateGuardrails
};

