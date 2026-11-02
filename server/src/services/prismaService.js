/**
 * IndicVoice Lab - Gnani Prisma STT Service Module
 * Handles authentication, audio dispatch, and response parsing for Gnani Prisma STT.
 * Keeps all provider logic isolated from controllers and never exposes keys to frontend.
 * Provides a mock/fallback simulation mode for local testing without active API credits.
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
  english: 'en-IN'
};

/**
 * Transcribe audio using Gnani Prisma STT
 * @param {string} audioFilePath - Absolute path to uploaded audio file
 * @param {string} language - Target language (hindi, marathi, hinglish)
 * @param {Object} options - Additional options e.g. mock override
 * @returns {Promise<{transcript: string, confidence: number, rawMetadata: Object}>}
 */
async function transcribeAudio(audioFilePath, language = 'hindi', options = {}) {
  const apiKey = process.env.GNANI_PRISMA_API_KEY;
  const accessKey = process.env.GNANI_PRISMA_ACCESS_KEY;
  const endpoint = process.env.GNANI_PRISMA_ENDPOINT || 'https://prisma.gnani.ai/api/v1/stt';
  const langCode = LANGUAGE_CODES[language.toLowerCase()] || 'hi';

  // If mock mode is explicitly forced or credentials are not yet configured
  if (process.env.USE_MOCK_PRISMA === 'true' || !apiKey || options.forceMock) {
    return runMockTranscription(audioFilePath, language, options);
  }

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
      timeout: 30000 // 30 second timeout
    });

    const data = response.data;

    // Gnani response structure handling
    const transcript = data.transcript || data.text || (data.results && data.results[0]?.transcript) || '';
    const confidence = data.confidence || 0.95;

    return {
      transcript: transcript.trim(),
      confidence,
      provider: 'Gnani Prisma STT',
      rawMetadata: data
    };
  } catch (error) {
    console.error('Gnani Prisma STT API call failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    // If API call fails because of missing/invalid credentials, graceful fallback with warning
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Falling back to mock transcription due to API error.');
      return runMockTranscription(audioFilePath, language, {
        ...options,
        apiError: error.message
      });
    }
    throw new Error(`Gnani Prisma API Error: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Mock transcription generator for testing & demo purposes
 */
function runMockTranscription(audioFilePath, language, options = {}) {
  const filename = path.basename(audioFilePath).toLowerCase();
  
  // Provide realistic simulated responses based on demo samples
  let transcript = '';
  let confidence = 0.92;

  if (options.simulatedTranscript) {
    transcript = options.simulatedTranscript;
  } else if (filename.includes('rahul') || filename.includes('upi')) {
    // PRD benchmark example
    transcript = 'I want to send five hundred rupees to Rohan.';
    confidence = 0.94;
  } else if (filename.includes('hindi') || language === 'hindi') {
    transcript = 'मुझे पाँच सौ रुपये राहुल को भेजने हैं';
    confidence = 0.91;
  } else if (filename.includes('marathi') || language === 'marathi') {
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
    warning: options.apiError ? `API call failed (${options.apiError}), showing simulated result` : 'Running in local development simulation mode'
  };
}

module.exports = {
  transcribeAudio,
  LANGUAGE_CODES
};

