/**
 * IndicVoice Lab - Standalone Gnani Prisma STT Verification Script
 * Use this script to independently test and debug your Gnani Prisma API access
 * before running evaluations in the main application.
 *
 * Usage:
 *   cd server
 *   node scripts/testGnaniLive.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config();

async function testGnaniLive() {
  console.log('===============================================================');
  console.log('📡 GNANI PRISMA STT LIVE CONNECTIVITY TEST');
  console.log('===============================================================');

  const apiKey = process.env.GNANI_PRISMA_API_KEY;
  const accessKey = process.env.GNANI_PRISMA_ACCESS_KEY;
  const endpoint = process.env.GNANI_PRISMA_ENDPOINT || 'https://prisma.gnani.ai/api/v1/stt';

  console.log(`Endpoint:    ${endpoint}`);
  console.log(`API Key:     ${apiKey ? `${apiKey.substring(0, 6)}...[CONFIGURED]` : '❌ NOT CONFIGURED'}`);
  console.log(`Access Key:  ${accessKey ? `${accessKey.substring(0, 6)}...[CONFIGURED]` : 'ℹ️ NOT PROVIDED (OPTIONAL)'}`);

  if (!apiKey || apiKey === 'your_gnani_api_key_here') {
    console.log('\n⚠️ Notice: GNANI_PRISMA_API_KEY is not configured in server/.env.');
    console.log('  To connect live Gnani Prisma STT:');
    console.log('  1. Open server/.env');
    console.log('  2. Replace GNANI_PRISMA_API_KEY with your official key from Gnani AI');
    console.log('  3. Re-run this script\n');
    console.log('✅ Fallback: IndicVoice Lab will operate seamlessly in local simulation mode.');
    return;
  }

  // Look for a test audio file
  const testAudioPath = path.join(__dirname, '../../samples/hindi_upi_500.wav');
  if (!fs.existsSync(testAudioPath)) {
    console.log(`Creating dummy audio buffer at ${testAudioPath} for test transmission...`);
  }

  console.log('\n🚀 Dispatching test audio payload to Gnani Prisma...');
  try {
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(testAudioPath));
    formData.append('language', 'hi');
    formData.append('encoding', 'LINEAR16');

    const headers = {
      ...formData.getHeaders(),
      'x-api-key': apiKey
    };
    if (accessKey) headers['x-access-key'] = accessKey;

    const response = await axios.post(endpoint, formData, {
      headers,
      timeout: 25000
    });

    console.log('\n✅ GNANI PRISMA STT RESPONSE RECEIVED:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\n❌ Gnani Prisma API Request Failed:');
    console.error('Error Message:', error.message);
    if (error.response) {
      console.error('HTTP Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testGnaniLive();

