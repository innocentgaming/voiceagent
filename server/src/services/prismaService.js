/**
 * IndicVoice Lab - Gnani Prisma STT / Vachana AI Service Module
 * Handles authentication, audio dispatch, and response parsing for Gnani Prisma STT (Vachana AI).
 * 
 * Config:
 * - GNANI_API_KEY_ID (Header: X-API-Key-ID)
 * - GNANI_API_BASE_URL (Default: https://api.vachana.ai)
 * - GNANI_PRISMA_ENDPOINT (Default: https://api.vachana.ai/stt/v3)
 * - Model: prisma-v3.0
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
require('dotenv').config();

// Supported official Vachana AI language codes:
// as-IN, bn-IN, en-IN, gu-IN, hi-IN, indic-auto, kn-IN, ml-IN, mr-IN, pa-IN, ta-IN, te-IN
const VACHANA_LANGUAGE_CODES = {
  hindi: 'hi-IN',
  'hi-in': 'hi-IN',
  hi: 'hi-IN',
  marathi: 'mr-IN',
  'mr-in': 'mr-IN',
  mr: 'mr-IN',
  hinglish: 'indic-auto',
  'hi-en': 'indic-auto',
  english: 'en-IN',
  'en-in': 'en-IN',
  bengali: 'bn-IN',
  'bn-in': 'bn-IN',
  tamil: 'ta-IN',
  'ta-in': 'ta-IN',
  telugu: 'te-IN',
  'te-in': 'te-IN',
  gujarati: 'gu-IN',
  'gu-in': 'gu-IN',
  kannada: 'kn-IN',
  'kn-in': 'kn-IN',
  malayalam: 'ml-IN',
  'ml-in': 'ml-IN',
  punjabi: 'pa-IN',
  'pa-in': 'pa-IN',
  auto: 'indic-auto',
  indic: 'indic-auto'
};

function getApiKey() {
  return process.env.GNANI_API_KEY_ID || process.env.GNANI_PRISMA_API_KEY;
}

function getEndpoint() {
  if (process.env.GNANI_PRISMA_ENDPOINT) return process.env.GNANI_PRISMA_ENDPOINT;
  const base = process.env.GNANI_API_BASE_URL || 'https://api.vachana.ai';
  return `${base.replace(/\/+$/, '')}/stt/v3`;
}

/**
 * Transcribes audio via Gnani Prisma STT (Vachana AI)
 * @param {string|Buffer} audioInput - Audio file path or raw Buffer
 * @param {string} language - Target language (e.g. 'hi-IN', 'mr-IN', 'hinglish')
 * @param {Object} options - { simulatedTranscript, forceMock, timeoutMs }
 */
async function transcribeAudio(audioInput, language = 'hi-IN', options = {}) {
  const apiKey = getApiKey();
  const endpoint = getEndpoint();
  const langKey = String(language).toLowerCase().replace(/_/g, '-');
  const langCode = VACHANA_LANGUAGE_CODES[langKey] || 'indic-auto';
  const model = process.env.GNANI_PRISMA_MODEL || 'prisma-v3.0';

  // 1. Explicit mock mode or missing API key
  if (process.env.USE_MOCK_PRISMA === 'true' || !apiKey || options.forceMock) {
    return runMockTranscription(audioInput, language, options);
  }

  // 2. Prepare Form Data
  const formData = new FormData();

  if (Buffer.isBuffer(audioInput)) {
    if (audioInput.length < 100) {
      throw new Error('Audio buffer is too small (< 100 bytes)');
    }
    formData.append('audio_file', audioInput, {
      filename: 'voice.wav',
      contentType: 'audio/wav'
    });
  } else if (typeof audioInput === 'string' && fs.existsSync(audioInput)) {
    const stat = fs.statSync(audioInput);
    if (stat.size < 100) {
      throw new Error('Audio file is empty or corrupted (< 100 bytes)');
    }
    formData.append('audio_file', fs.createReadStream(audioInput));
  } else if (options.simulatedTranscript) {
    return runMockTranscription(audioInput, language, options);
  } else {
    throw new Error(`Audio input not found or unreadable: ${audioInput}`);
  }

  formData.append('model', model);
  formData.append('language_code', langCode);

  // 3. Dispatch Live Vachana AI Request
  try {
    const headers = {
      ...formData.getHeaders(),
      'X-API-Key-ID': apiKey
    };

    const response = await axios.post(endpoint, formData, {
      headers,
      timeout: options.timeoutMs || 30000 // 30s timeout
    });

    const data = response.data;
    const rawTranscript = data.transcript || data.text || (data.results && data.results[0]?.transcript) || '';
    const transcript = rawTranscript.trim();
    const confidence = data.confidence || 0.95;

    return {
      transcript,
      confidence,
      provider: 'Gnani Prisma STT (Live Vachana v3)',
      isSimulated: false,
      processingTime: data.processing_time || data.end_to_end_latency,
      rawMetadata: data
    };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    console.error('Gnani Prisma Live API Failure:', errorMsg);

    // If API rejected or network timed out, NEVER pretend mock succeeded
    const err = new Error(`Gnani Prisma API Error (${error.response?.status || 502}): ${errorMsg}`);
    err.isApiError = true;
    err.statusCode = error.response?.status || 502;
    err.responseData = error.response?.data;
    throw err;
  }
}

/**
 * Mock transcription generator for testing & demo purposes
 */
function runMockTranscription(audioInput, language, options = {}) {
  const filename = typeof audioInput === 'string' ? path.basename(audioInput).toLowerCase() : '';

  let transcript = '';
  let confidence = 0.92;

  if (options.simulatedTranscript) {
    transcript = options.simulatedTranscript;
  } else if (filename.includes('rahul') || filename.includes('upi')) {
    transcript = 'I want to send five hundred rupees to Rohan.';
    confidence = 0.94;
  } else if (filename.includes('hindi') || language === 'hindi' || language === 'hi-IN') {
    transcript = 'मुझे पाँच सौ रुपये राहुल को भेजने हैं';
    confidence = 0.91;
  } else if (filename.includes('marathi') || language === 'marathi' || language === 'mr-IN') {
    transcript = 'मला पाचशे रुपये राहुलला पाठवायचे आहेत';
    confidence = 0.89;
  } else if (filename.includes('hinglish') || language === 'hinglish') {
    transcript = 'mera order cancel kardo please';
    confidence = 0.93;
  } else {
    transcript = 'I want to send five hundred rupees to Rohan.';
    confidence = 0.90;
  }

  return {
    transcript,
    confidence,
    provider: 'Gnani Prisma STT (Simulated / Local Mode)',
    isSimulated: true,
    warning: 'Running in simulated benchmark mode'
  };
}

module.exports = {
  transcribeAudio,
  runMockTranscription,
  getApiKey,
  getEndpoint,
  VACHANA_LANGUAGE_CODES
};
