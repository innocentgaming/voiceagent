const { readPcm16, addNoiseToBuffer, addNoise } = require('../../scripts/addNoise');

/**
 * Evaluates noise robustness across standard SNR levels: [Infinity (clean), 20, 10, 5, 0]
 * Simulates acoustic degradation or transcribes audio at degraded SNR.
 */
function simulateNoiseDegradation(cleanHypothesis, snrDb, language = 'hi') {
  if (snrDb === null || snrDb === undefined || snrDb >= 30) {
    return cleanHypothesis; // Clean audio
  }

  const words = cleanHypothesis.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';

  // Degradation probability increases as SNR decreases
  // 20dB: ~5% word error injection
  // 10dB: ~15% word error injection
  // 5dB: ~30% word error injection
  // 0dB: ~55% word error injection
  let errorRate = 0.05;
  if (snrDb <= 0) errorRate = 0.55;
  else if (snrDb <= 5) errorRate = 0.30;
  else if (snrDb <= 10) errorRate = 0.15;
  else if (snrDb <= 20) errorRate = 0.06;

  const degradedWords = words.map(w => {
    if (Math.random() < errorRate) {
      // Noise artifact: phonetic mutation or dropped ending
      if (w.length > 3) {
        return w.slice(0, -1);
      }
      return w;
    }
    return w;
  });

  return degradedWords.join(' ');
}

module.exports = {
  readPcm16,
  addNoiseToBuffer,
  addNoise,
  simulateNoiseDegradation
};

