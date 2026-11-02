/**
 * IndicVoice Lab - Semantic Caching & Model Routing Engine
 * Provides:
 * - Semantic Cache with Cosine Similarity threshold matching
 * - Cache telemetry (hits, misses, latency saved)
 * - Intelligent Model Routing based on audio noise condition & target dialect
 */

const { generateEmbedding, cosineSimilarity } = require('./ragVectorService');

class SemanticCache {
  constructor(similarityThreshold = 0.96) {
    this.threshold = similarityThreshold;
    this.cache = []; // { key, embedding, result, timestamp, hits }
    this.stats = {
      hits: 0,
      misses: 0,
      totalQueries: 0
    };
  }

  get(text) {
    this.stats.totalQueries++;
    if (!text) return null;
    const queryVec = generateEmbedding(text);

    let bestMatch = null;
    let highestScore = 0;

    for (const item of this.cache) {
      const score = cosineSimilarity(queryVec, item.embedding);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && highestScore >= this.threshold) {
      this.stats.hits++;
      bestMatch.hits++;
      return {
        result: bestMatch.result,
        score: highestScore,
        cachedAt: bestMatch.timestamp,
        isCached: true
      };
    }

    this.stats.misses++;
    return null;
  }

  set(text, result) {
    if (!text) return;
    const embedding = generateEmbedding(text);
    this.cache.push({
      key: text,
      embedding,
      result,
      timestamp: new Date().toISOString(),
      hits: 0
    });

    // Keep cache size bounded
    if (this.cache.length > 500) {
      this.cache.shift();
    }
  }

  getStats() {
    const hitRate = this.stats.totalQueries > 0
      ? Math.round((this.stats.hits / this.stats.totalQueries) * 100)
      : 0;
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      cacheSize: this.cache.length
    };
  }

  clear() {
    this.cache = [];
    this.stats = { hits: 0, misses: 0, totalQueries: 0 };
  }
}

/**
 * Model Routing Engine
 * Recommends or selects model variant based on language and noise parameters
 */
function routeModel({ language = 'hindi', noiseLevel = 'clean', audioDurationSec = 5 }) {
  const lang = language.toLowerCase();
  const noise = noiseLevel.toLowerCase();

  let selectedModel = 'gnani-prisma-hindi-v2';
  let routingReason = 'Standard Hindi acoustic model';
  let latencyEstimateMs = 280;

  if (lang === 'marathi') {
    selectedModel = 'gnani-prisma-marathi-v1';
    routingReason = 'Optimized for Marathi phonetics and morphosyntax';
    latencyEstimateMs = 320;
  } else if (lang === 'hinglish') {
    selectedModel = 'gnani-prisma-hinglish-neural';
    routingReason = 'Code-mixed Hindi-English bilingual neural decoder';
    latencyEstimateMs = 290;
  }

  if (noise.includes('traffic') || noise.includes('noise') || noise.includes('conversation')) {
    selectedModel = `${selectedModel}-noise-robust`;
    routingReason += ' + Noise-Suppression Pre-filter & Spectral Subtraction';
    latencyEstimateMs += 60;
  }

  return {
    selectedModel,
    routingReason,
    latencyEstimateMs,
    provider: 'Gnani Prisma Cloud Engine'
  };
}

const semanticCache = new SemanticCache();

module.exports = {
  semanticCache,
  routeModel
};

