/**
 * IndicVoice Lab - Audio Noise Injection (Target SNR in dB)
 * Injects Additive White Gaussian Noise (AWGN) to PCM16 WAV buffers/files
 * at specific Signal-to-Noise Ratio (SNR) levels: Clean, 20dB, 10dB, 5dB, 0dB.
 */

const fs = require('fs');

function readPcm16(buf) {
  let p = 12; // skip RIFF header, find 'data' chunk
  while (p < buf.length - 8) {
    const id = buf.toString('ascii', p, p + 4);
    const size = buf.readUInt32LE(p + 4);
    if (id === 'data') {
      return { 
        header: buf.subarray(0, p + 8), 
        pcm: buf.subarray(p + 8, Math.min(buf.length, p + 8 + size)) 
      };
    }
    p += 8 + size;
  }
  // Fallback if non-standard or small header: treat first 44 bytes as WAV header
  if (buf.length > 44) {
    return {
      header: buf.subarray(0, 44),
      pcm: buf.subarray(44)
    };
  }
  throw new Error('No valid PCM audio data chunk found in WAV buffer');
}

/**
 * Adds Gaussian noise to a PCM16 buffer at target snrDb
 * @param {Buffer} inBuf - Original WAV buffer
 * @param {number} snrDb - Target SNR in decibels (e.g. 20, 10, 5, 0)
 * @returns {Buffer} New noisy WAV buffer
 */
function addNoiseToBuffer(inBuf, snrDb) {
  const { header, pcm } = readPcm16(inBuf);
  const n = Math.floor(pcm.length / 2);
  const s = new Int16Array(n);
  
  for (let i = 0; i < n; i++) {
    s[i] = pcm.readInt16LE(i * 2);
  }

  // Calculate Root Mean Square (RMS) of clean signal
  const sumSq = s.reduce((a, v) => a + v * v, 0);
  const rms = Math.sqrt((sumSq / (n || 1)) || 1);
  const noiseRms = rms / Math.pow(10, snrDb / 20);
  const out = Buffer.alloc(pcm.length);

  // Box-Muller transform for Gaussian noise
  for (let i = 0; i < n; i++) {
    const u1 = Math.random() || 1e-9;
    const u2 = Math.random();
    const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const sample = Math.round(s[i] + g * noiseRms);
    const clamped = Math.max(-32768, Math.min(32767, sample));
    out.writeInt16LE(clamped, i * 2);
  }

  return Buffer.concat([header, out]);
}

/**
 * Adds noise to an audio file on disk and writes to outFile
 */
function addNoise(inFile, outFile, snrDb) {
  const inBuf = fs.readFileSync(inFile);
  const outBuf = addNoiseToBuffer(inBuf, snrDb);
  fs.writeFileSync(outFile, outBuf);
  return outFile;
}

// CLI execution
if (require.main === module) {
  const [, , input] = process.argv;
  if (!input) {
    console.log('Usage: node addNoise.js <path/to/audio.wav>');
    process.exit(1);
  }
  if (!fs.existsSync(input)) {
    console.error(`File not found: ${input}`);
    process.exit(1);
  }
  console.log(`Generating noise sweeps for ${input}...`);
  for (const snr of [20, 10, 5, 0]) {
    const out = input.replace('.wav', `_snr${snr}.wav`);
    addNoise(input, out, snr);
    console.log(`  ✓ Generated ${out} (${snr} dB SNR)`);
  }
  console.log('Done!');
}

module.exports = {
  readPcm16,
  addNoiseToBuffer,
  addNoise
};
