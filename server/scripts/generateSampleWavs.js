/**
 * Generates valid binary 16-bit 16kHz mono PCM WAV audio files for sample Indian speech tests.
 */
const fs = require('fs');
const path = require('path');

function createWavBuffer(durationSec = 2, frequency = 440) {
  const sampleRate = 16000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const numSamples = sampleRate * durationSec;
  const dataSize = numSamples * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // 'fmt ' subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // 'data' subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate synthetic audio waveform (sine wave tone with subtle harmonic variation)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.4 * 32767;
    buffer.writeInt16LE(Math.floor(sample), 44 + i * 2);
  }

  return buffer;
}

const SAMPLES_DIR = path.join(__dirname, '../../samples');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(SAMPLES_DIR)) fs.mkdirSync(SAMPLES_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const files = [
  { name: 'hindi_upi_500.wav', freq: 350, duration: 2.5 },
  { name: 'marathi_order.wav', freq: 420, duration: 2.2 },
  { name: 'hinglish_cancel.wav', freq: 480, duration: 2.0 },
  { name: 'sample-rahul.wav', freq: 380, duration: 2.8 },
  { name: 'sample-hindi-amount.wav', freq: 340, duration: 2.5 },
  { name: 'sample-marathi.wav', freq: 410, duration: 2.3 }
];

console.log('Generating sample WAV audio files...');
for (const f of files) {
  const wavBuf = createWavBuffer(f.duration, f.freq);
  const samplePath = path.join(SAMPLES_DIR, f.name);
  const uploadPath = path.join(UPLOADS_DIR, f.name);

  fs.writeFileSync(samplePath, wavBuf);
  fs.writeFileSync(uploadPath, wavBuf);
  console.log(` Created ${f.name} (${Math.round(wavBuf.length / 1024)} KB)`);
}

console.log('All sample audio recordings generated successfully! ✅');
