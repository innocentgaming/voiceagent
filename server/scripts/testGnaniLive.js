/**
 * IndicVoice Lab - Live Gnani Prisma STT / Vachana AI Verification Script
 * Validates live API connectivity, authentication, and speech-to-text response
 * using the official Vachana API (api.vachana.ai).
 * 
 * Usage:
 *   node server/scripts/testGnaniLive.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

async function testGnaniLive() {
  console.log('===============================================================');
  console.log('📡 GNANI PRISMA STT (VACHANA AI) LIVE CONNECTIVITY TEST');
  console.log('===============================================================');

  const apiKey = process.env.GNANI_API_KEY_ID || process.env.GNANI_PRISMA_API_KEY;
  const baseUrl = process.env.GNANI_API_BASE_URL || 'https://api.vachana.ai';
  const endpoint = process.env.GNANI_PRISMA_ENDPOINT || `${baseUrl}/stt/v3`;
  const model = process.env.GNANI_PRISMA_MODEL || 'prisma-v3.0';

  console.log(`Base URL:     ${baseUrl}`);
  console.log(`Endpoint:     ${endpoint}`);
  console.log(`Model:        ${model}`);
  console.log(`API Key ID:   ${apiKey ? `${apiKey.substring(0, 12)}...${apiKey.substring(apiKey.length - 8)} [CONFIGURED ✅]` : '❌ NOT CONFIGURED'}`);

  if (!apiKey) {
    console.log('\n⚠️ Notice: GNANI_API_KEY_ID is missing.');
    console.log('  Configure GNANI_API_KEY_ID in server/.env and re-run.');
    return;
  }

  // Find a test audio file
  const testFiles = [
    path.join(__dirname, '../uploads/hindi_upi_500.wav'),
    path.join(__dirname, '../uploads/sample-rahul.wav'),
    path.join(__dirname, '../../samples/hindi_upi_500.wav')
  ];

  let testAudioPath = testFiles.find(f => fs.existsSync(f));

  if (!testAudioPath) {
    console.log('No existing audio file found. Creating a short 16kHz test WAV...');
    const { createWavBuffer } = require('./generateSampleWavs');
    testAudioPath = path.join(__dirname, '../uploads/live_test.wav');
    fs.writeFileSync(testAudioPath, createWavBuffer(2, 440));
  }

  console.log(`Using Audio:  ${testAudioPath} (${fs.statSync(testAudioPath).size} bytes)`);
  console.log('\n🚀 Dispatching live payload to Vachana STT v3...');

  const t0 = Date.now();
  try {
    const formData = new FormData();
    formData.append('audio_file', fs.createReadStream(testAudioPath));
    formData.append('model', model);
    formData.append('language_code', 'hi-IN');

    const headers = {
      ...formData.getHeaders(),
      'X-API-Key-ID': apiKey
    };

    const response = await axios.post(endpoint, formData, {
      headers,
      timeout: 30000
    });

    const elapsedMs = Date.now() - t0;
    console.log('\n===============================================================');
    console.log('🎉 GNANI PRISMA STT LIVE CONNECTION SUCCESSFUL!');
    console.log('===============================================================');
    console.log(`HTTP Status:       ${response.status} OK`);
    console.log(`Roundtrip Latency: ${elapsedMs} ms`);
    console.log(`Request ID:        ${response.data.request_id || 'N/A'}`);
    console.log(`Model Deployed:    ${response.data.model || model}`);
    console.log(`Server Proc Time:  ${response.data.processing_time || response.data.end_to_end_latency || 'N/A'} s`);
    console.log(`Raw Transcript:    "${response.data.transcript || ''}"`);
    console.log('===============================================================\n');
  } catch (error) {
    console.error('\n❌ Gnani Prisma Live API Request Failed:');
    console.error('Error Message:', error.message);
    if (error.response) {
      console.error('HTTP Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testGnaniLive();
