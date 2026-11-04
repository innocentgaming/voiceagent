/**
 * IndicVoice Lab - Gnani Prisma STT Service Module
 * Handles authentication, audio dispatch, and response parsing for Gnani Prisma STT.
 * Keeps all provider logic isolated from controllers and never exposes keys to frontend.
 * Provides explicit LIVE vs SIMULATED separation. Never silently converts a failed live request
 * into a fake success.
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Language code mapper to Gnani Prisma standard codes
const LANGUAGE_CODES = {
  hindi: 'hi',
  marathi: 'mr',
  hinglish: 'hi-en',
  english: 'en-IN',
  'hi-in': 'hi',
  'mr-in': 'mr',
  'en-in': 'en-IN'
};

/**
 * Transcribe audio using Gnani Prisma STT
 * @param {string} audioFilePath - Absolute path to uploaded audio file
 * @param {string} language - Target language (hindi, marathi, hinglish)
 * @param {Object} options - Additional options e.g. mock override
 * @returns {Promise<{transcript: string, confidence: number, provider: string, isSimulated: boolean, rawMetadata: Object}>}
 */
async function transcribeAudio(audioFilePath, language = 'hindi', options = {}) {
  const apiKey = process.env.GNANI_PRISMA_API_KEY;
  const accessKey = process.env.GNANI_PRISMA_ACCESS_KEY;
  const endpoint = process.env.GNANI_PRISMA_ENDPOINT || 'https://prisma.gnani.ai/api/v1/stt';
  const langKey = String(language).toLowerCase().replace(/_/g, '-');
  const langCode = LANGUAGE_CODES[langKey] || 'hi';

  // 1. If explicit mock mode requested or no API credentials supplied
  if (process.env.USE_MOCK_PRISMA === 'true' || !apiKey || options.forceMock) {
    return runMockTranscription(audioFilePath, language, options);
  }

  // 2. Validate audio file exists before attempting network request
  if (!fs.existsSync(audioFilePath)) {
    throw new Error(`Audio file not found at path: ${audioFilePath}`);
  }

  const stat = fs.statSync(audioFilePath);
  if (stat.size < 100) {
    throw new Error('Audio file is empty or corrupted (size < 100 bytes)');
  }

  // 3. Live API Request
  try {
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioFilePath));
    formData.append('language', langCode);
    formData.append('encoding', options.encoding || 'LINEAR16');

    const headers = {
      ...formData.getHeaders(),
      'x-api-key': apiKey
    };

    if (accessKey) {
      headers['x-access-key'] = accessKey;
    }

    const response = await axios.post(endpoint, formData, {
      headers,
      timeout: options.timeoutMs || 25000 // 25s timeout
    });

    const data = response.data;
    const transcript = data.transcript || data.text || (data.results && data.results[0]?.transcript) || '';
    const confidence = data.confidence || 0.95;

    return {
      transcript: transcript.trim(),
      confidence,
      provider: 'Gnani Prisma STT (Live API)',
      isSimulated: false,
      rawMetadata: data
    };
  } catch (error) {
    // NEVER silently convert live failure to mock result!
    const errorMsg = error.response?.data?.message || error.message;
    console.error('Gnani Prisma Live API Failure:', errorMsg);
    const err = new Error(`Gnani Prisma API Error (${error.response?.status || 500}): ${errorMsg}`);
    err.isApiError = true;
    err.statusCode = error.response?.status || 502;
    throw err;
  }
}

/**
 * Mock transcription generator for testing & demo purposes
 * Clearly stamped with isSimulated: true
 */
function runMockTranscription(audioFilePath, language, options = {}) {
  const filename = audioFilePath ? path.basename(audioFilePath).toLowerCase() : '';
  
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
    warning: 'Running in simulated benchmark mode (No GNANI_PRISMA_API_KEY configured)'
  };
}

module.exports = {
  transcribeAudio,
  runMockTranscription,
  LANGUAGE_CODES
};
