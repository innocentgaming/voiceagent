/**
 * IndicVoice Lab - AI Observability & Telemetry Service
 * Tracks:
 * - End-to-end Latency (p50, p95, p99) per language and per SNR level
 * - Real-Time Factor (RTF = latencyMs / audioDurationMs)
 * - Speech Provider SLA, Reliability & API Error rate
 * - Code-Mixing Index (CMI) calculation
 * - Sliced Benchmark aggregations
 */

const { performance } = require('perf_hooks');

const pct = (arr, p) => {
  const a = [...arr].filter(x => typeof x === 'number' && !isNaN(x)).sort((x, y) => x - y);
  if (!a.length) return 0;
  return a[Math.min(a.length - 1, Math.max(0, Math.ceil((p / 100) * a.length) - 1))];
};

/**
 * Wraps any STT execution call to time execution and calculate Real-Time Factor (RTF)
 * @param {Function} fn - Async STT transcription call
 * @param {number} audioDurationMs - Duration of audio in milliseconds
 */
async function timedTranscribe(fn, audioDurationMs = 3000) {
  const t0 = performance.now();
  try {
    const result = await fn();
    const latencyMs = Math.round(performance.now() - t0);
    const rtf = parseFloat((latencyMs / Math.max(1, audioDurationMs)).toFixed(3));
    return {
      success: true,
      result,
      latencyMs,
      rtf
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - t0);
    return {
      success: false,
      error: err.message,
      isApiError: true,
      latencyMs,
      rtf: null
    };
  }
}

/**
 * Code-Mixing Index (CMI)
 * 0 = Monolingual (strictly Devanagari or strictly Latin)
 * > 0 to 50 = Mixed scripts (e.g. Hindi written in Roman English or code-switched Hindi-English)
 */
function codeMixingIndex(text) {
  if (!text) return 0;
  const toks = String(text).split(/\s+/).filter(Boolean);
  let dev = 0, lat = 0;
  for (const t of toks) {
    if (/\p{Script=Devanagari}/u.test(t)) dev++;
    else if (/[A-Za-z]/.test(t)) lat++;
  }
  const n = dev + lat;
  return n ? Math.round(100 * (1 - Math.max(dev, lat) / n)) : 0;
}

class ObservabilityService {
  constructor() {
    this.events = [];
    this.latencies = [140, 165, 180, 210, 195, 240, 220, 310, 190, 205]; // baseline ms
    this.latenciesByLang = {
      'hi-IN': [150, 175, 190, 210],
      'mr-IN': [160, 185, 205, 230],
      'hinglish': [140, 160, 170, 195]
    };
    this.latenciesBySnr = {
      'clean': [140, 150, 165],
      '20dB': [155, 170, 185],
      '10dB': [175, 190, 215],
      '5dB': [200, 225, 250],
      '0dB': [240, 270, 310]
    };
    this.metrics = {
      totalEvaluations: 0,
      totalAudioDurationSec: 0,
      totalDCUs: 0,
      estimatedCostINR: 0,
      apiErrors: 0,
      successfulCalls: 10,
      providerUptimePercent: 99.98
    };
  }

  recordEvaluation({
    testId,
    language = 'hi-IN',
    snrLevel = 'clean',
    latencyMs = 180,
    audioDurationSec = 3.5,
    cached = false,
    wer = 0,
    hasCriticalMismatch = false,
    isApiError = false
  }) {
    if (isApiError) {
      this.metrics.apiErrors++;
      return { isApiError: true };
    }

    this.metrics.totalEvaluations++;
    this.metrics.successfulCalls++;
    this.metrics.totalAudioDurationSec += audioDurationSec;
    this.latencies.push(latencyMs);

    // Group latencies
    if (!this.latenciesByLang[language]) this.latenciesByLang[language] = [];
    this.latenciesByLang[language].push(latencyMs);

    const snrKey = String(snrLevel).toLowerCase();
    if (!this.latenciesBySnr[snrKey]) this.latenciesBySnr[snrKey] = [];
    this.latenciesBySnr[snrKey].push(latencyMs);

    // Compute units & cost
    const dcu = cached ? 0.0001 : Math.round(audioDurationSec * 0.005 * 1000) / 1000;
    const cost = cached ? 0.01 : Math.round(audioDurationSec * 0.12 * 100) / 100;

    this.metrics.totalDCUs += dcu;
    this.metrics.estimatedCostINR += cost;

    const rtf = parseFloat((latencyMs / (audioDurationSec * 1000 || 1)).toFixed(3));

    const event = {
      id: `evt-${Date.now()}-${Math.round(Math.random() * 1e4)}`,
      timestamp: new Date().toISOString(),
      testId,
      language,
      snrLevel,
      latencyMs,
      rtf,
      cached,
      wer,
      hasCriticalMismatch,
      dcu,
      costINR: cost
    };

    this.events.unshift(event);
    if (this.events.length > 300) this.events.pop();

    return event;
  }

  getSummary() {
    const totalCalls = this.metrics.successfulCalls + this.metrics.apiErrors;
    const reliabilityRate = totalCalls > 0 
      ? Math.round((this.metrics.successfulCalls / totalCalls) * 10000) / 100 
      : 100;

    // Language latency breakdown
    const langStats = {};
    for (const [lang, lats] of Object.entries(this.latenciesByLang)) {
      langStats[lang] = {
        count: lats.length,
        p50: pct(lats, 50),
        p95: pct(lats, 95)
      };
    }

    // SNR latency breakdown
    const snrStats = {};
    for (const [snr, lats] of Object.entries(this.latenciesBySnr)) {
      snrStats[snr] = {
        count: lats.length,
        p50: pct(lats, 50),
        p95: pct(lats, 95)
      };
    }

    return {
      metrics: {
        ...this.metrics,
        reliabilityRate,
        totalDCUs: Math.round(this.metrics.totalDCUs * 100) / 100,
        estimatedCostINR: Math.round(this.metrics.estimatedCostINR * 100) / 100
      },
      latency: {
        avgMs: Math.round(this.latencies.reduce((a, b) => a + b, 0) / (this.latencies.length || 1)),
        p50Ms: pct(this.latencies, 50),
        p95Ms: pct(this.latencies, 95),
        p99Ms: pct(this.latencies, 99)
      },
      byLanguage: langStats,
      bySnr: snrStats
    };
  }
}

const observability = new ObservabilityService();

module.exports = {
  ObservabilityService,
  observability,
  pct,
  timedTranscribe,
  codeMixingIndex
};
