/**
 * IndicVoice Lab - RAG & Vector Database Service
 * Provides:
 * - In-Memory Vector Store with Cosine Similarity Embeddings
 * - Domain Knowledge Base for Indian Voice Contexts (Banking, Names, Locations, Numbers)
 * - Semantic Entity Retrieval for RAG-augmented Evaluation
 */

// Domain Knowledge Base documents for Indian Voice Testing
const INITIAL_KNOWLEDGE_DOCS = [
  {
    id: 'doc-1',
    category: 'banking-upi',
    title: 'UPI Transaction Recipient & Amount Rules',
    content: 'UPI payment commands in India typically specify a recipient name (e.g. Rahul, Rohan, Priya, Amit, Sunita) and monetary denomination in INR (e.g. 500, five hundred, पाँच सौ, पाचशे, 1000, 2000). A confusion between phonetically similar names like Rahul and Rohan is a critical financial liability.'
  },
  {
    id: 'doc-2',
    category: 'banking-upi',
    title: 'Indian Number System & Currencies',
    content: 'Numbers in Indian English, Hindi, and Marathi use lakh (1,00,000) and crore (1,00,00,000). 500 is written as five hundred, पाँच सौ in Hindi, and पाचशे in Marathi. 1000 is one thousand, एक हजार, and एक हजार.'
  },
  {
    id: 'doc-3',
    category: 'logistics-ecommerce',
    title: 'Indian E-Commerce Delivery & Pincodes',
    content: 'Indian delivery voicebots collect 6-digit postal PIN codes, state names, and landmarks. Common cancel intents include "mera order cancel kardo", "order radd करा", "order cancellation".'
  },
  {
    id: 'doc-4',
    category: 'regional-marathi',
    title: 'Marathi Verbal Inflections & Postpositions',
    content: 'Marathi nouns append case markers: Rahul becomes Rahul-la (राहुलला) for accusative/dative. Verbs take gender and politeness markers: पाठवायचे आहेत (want to send).'
  }
];

/**
 * Basic character n-gram / term frequency embedding generator
 * Computes high-dimensional normalized vector for cosine distance.
 */
function generateEmbedding(text) {
  if (!text) return new Map();
  const normalized = text.toLowerCase().normalize('NFKC').replace(/[^\w\s\u0900-\u097F]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);

  const freqMap = new Map();
  for (const w of words) {
    freqMap.set(w, (freqMap.get(w) || 0) + 1);
  }

  // Also extract char trigrams for phonetic & subword similarity
  for (let i = 0; i < normalized.length - 2; i++) {
    const gram = normalized.slice(i, i + 3);
    freqMap.set(gram, (freqMap.get(gram) || 0) + 0.5);
  }

  // Normalize vector magnitude
  let magnitude = 0;
  for (const count of freqMap.values()) {
    magnitude += count * count;
  }
  magnitude = Math.sqrt(magnitude);

  if (magnitude > 0) {
    for (const [key, val] of freqMap.entries()) {
      freqMap.set(key, val / magnitude);
    }
  }

  return freqMap;
}

/**
 * Calculates Cosine Similarity between two embedding vectors [0.0 to 1.0]
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB) return 0;
  let dotProduct = 0;

  for (const [key, valA] of vecA.entries()) {
    if (vecB.has(key)) {
      dotProduct += valA * vecB.get(key);
    }
  }

  return Math.max(0, Math.min(1, Math.round(dotProduct * 10000) / 10000));
}

class VectorDatabase {
  constructor() {
    this.documents = [];
    this.initialize();
  }

  initialize() {
    for (const doc of INITIAL_KNOWLEDGE_DOCS) {
      this.addDocument(doc.title, doc.content, doc.category, doc.id);
    }
  }

  addDocument(title, content, category = 'general', id = null) {
    const docId = id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const embedding = generateEmbedding(`${title} ${content}`);
    const record = {
      id: docId,
      title,
      content,
      category,
      embedding,
      createdAt: new Date().toISOString()
    };
    this.documents.push(record);
    return record;
  }

  /**
   * Semantic Vector Search
   * @param {string} query
   * @param {number} topK
   * @returns {Array<{doc: Object, score: number}>}
   */
  search(query, topK = 3) {
    const queryVec = generateEmbedding(query);
    const scored = this.documents.map(doc => {
      const score = cosineSimilarity(queryVec, doc.embedding);
      return {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        category: doc.category,
        score
      };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * RAG Context Generator for test evaluation
   */
  getEvaluationContext(expectedText, language) {
    const relevantDocs = this.search(`${language} ${expectedText}`, 2);
    return relevantDocs.map(d => `[${d.title}]: ${d.content}`).join('\n\n');
  }

  listDocuments() {
    return this.documents.map(d => ({
      id: d.id,
      title: d.title,
      content: d.content,
      category: d.category,
      createdAt: d.createdAt
    }));
  }
}

const vectorDb = new VectorDatabase();

module.exports = {
  vectorDb,
  generateEmbedding,
  cosineSimilarity
};

