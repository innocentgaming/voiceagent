/**
 * IndicVoice Lab - Audio Fingerprint Cache & Model Routing Engine
 * Benchmarking Rule: Caching is DISABLED BY DEFAULT so every evaluation represents
 * true live/provider inference. Audio hash keying (SHA256) is used instead of expected text
 * so two distinct audio clips never collide.
 */

const crypto = require('crypto');
const fs = require('fs');
const { generateEmbedding, cosineSimilarity } = require('./ragVectorService');

/**
 * Creates SHA256 audio hash cache key
 * Prevents identical transcriptions from colliding across different audio files.
 */
function createAudioCacheKey(audioPathOrBuffer, language = 'hi', provider = 'gnani') {
  let buf;
  if (Buffer.isBuffer(audioPathOrBuffer)) {
    buf = audioPathOrBuffer;
  } else if (typeof audioPathOrBuffer === 'string' && fs.existsSync(audioPathOrBuffer)) {
    try {
      buf = fs.readFileSync(audioPathOrBuffer);
    } catch (e) {
      return null;
    }
  } else {
    return null;
  }

  const audioHash = crypto.createHash('sha256').update(buf).digest('hex');
  return [
    audioHash,
    language,
    provider,
    process.env.STT_MODEL_VERSION || 'v1.0'
  ].join(':');
}

class SemanticCache {
  constructor(similarityThreshold = 0.98) {
    this.threshold = similarityThreshold;
    this.audioCache = new Map(); // audioKey -> { result, timestamp, hits }
    this.stats = {
      hits: 0,
      misses: 0,
      totalQueries: 0,
      bypassed: 0
    };
  }

  /**
   * Lookup cache by audio file or buffer
   * Returns null if useCache is false (default for benchmarking).
   */
  get(audioPathOrBuffer, language = 'hi', provider = 'gnani', useCache = false) {
    if (!useCache) {
      this.stats.bypassed++;
      return null;
    }

    const key = createAudioCacheKey(audioPathOrBuffer, language, provider);
    if (!key) return null;

    this.stats.totalQueries++;
    if (this.audioCache.has(key)) {
      this.stats.hits++;
      const item = this.audioCache.get(key);
      item.hits++;
      return {
        ...item.result,
        isCached: true,
        cachedAt: item.timestamp
      };
    }

    this.stats.misses++;
    return null;
  }

  set(audioPathOrBuffer, language, provider, result) {
    const key = createAudioCacheKey(audioPathOrBuffer, language, provider);
    if (!key || !result) return;

    this.audioCache.set(key, {
      result,
      timestamp: new Date().toISOString(),
      hits: 0
    });

    // Bound cache size
    if (this.audioCache.size > 500) {
      const oldestKey = this.audioCache.keys().next().value;
      this.audioCache.delete(oldestKey);
    }
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? Math.round((this.stats.hits / total) * 100) : 0;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      bypassed: this.stats.bypassed,
      hitRate: `${hitRate}%`,
      cacheSize: this.audioCache.size
    };
  }
}

/**
 * Routes audio to optimal acoustic models based on SNR and language
 */
function routeModel(language, noiseLevel = 'clean') {
  if (noiseLevel === 'severe_noise' || noiseLevel === '0dB') {
    return {
      selectedModel: 'Gnani-Prisma-Acoustic-Robust-v2',
      reason: 'Heavy ambient noise profile requires robust beamforming front-end'
    };
  }
  if (language === 'mr-IN' || language === 'marathi') {
    return {
      selectedModel: 'Gnani-Prisma-Marathi-Specialist',
      reason: 'Devanagari conjunct and case-marker phonetic acoustic routing'
    };
  }
  if (language === 'hinglish') {
    return {
      selectedModel: 'Gnani-Prisma-CodeMixed-Hinglish',
      reason: 'Sub-word acoustic tokens optimized for Hindi-Latin code alternation'
    };
  }
  return {
    selectedModel: 'Gnani-Prisma-Standard-Hindi',
    reason: 'Standard baseline model for conversational Hindi'
  };
}

const semanticCache = new SemanticCache();

module.exports = {
  createAudioCacheKey,
  SemanticCache,
  semanticCache,
  routeModel
};
