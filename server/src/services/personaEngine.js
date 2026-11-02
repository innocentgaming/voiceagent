/**
 * IndicVoice Lab - Custom System Prompts & AI Persona Engine
 * Allows defining specialized evaluative personas:
 * - Strict Banking Auditor (high penalty for names/amounts)
 * - Regional Dialect Expert (Marathi & Hinglish phonetics)
 * - Logistics & E-Commerce QA (PIN codes & addresses)
 * - Healthcare Voicebot QA (Dosages & symptoms)
 */

const DEFAULT_PERSONAS = [
  {
    id: 'banking-auditor',
    name: 'Strict Banking Auditor',
    role: 'Financial Compliance & Transaction Verifier',
    systemPrompt: `You are a high-security Banking Speech Auditor for Indian digital payments (UPI, IMPS, RTGS).
Your mandate:
1. Under no circumstance may a recipient name (e.g., Rahul vs Rohan) or amount (e.g., ₹500 vs ₹5,000) pass if mismatched.
2. Flag any deviation in financial terms as SEVERE CRITICAL RISK.
3. Validate Hindi number words (लाख, करोड़, हज़ार, सौ) against digit amounts.`,
    temperature: 0.1,
    strictness: 'EXTREME'
  },
  {
    id: 'regional-dialect-expert',
    name: 'Regional Dialect & Hinglish Specialist',
    role: 'Acoustic & Code-Mixing Analyst',
    systemPrompt: `You are an Indic linguistic researcher specializing in Hindi, Marathi, and Hinglish code-switching.
Your mandate:
1. Distinguish between natural code-mixing ('order cancel kardo') and phonetic speech recognition errors.
2. Account for regional Marathi case markers (ला, चे, स) and Hindi postpositions.
3. Provide phonemic distance diagnostics for near-homophone misrecognitions.`,
    temperature: 0.3,
    strictness: 'BALANCED'
  },
  {
    id: 'ecommerce-qa',
    name: 'Logistics & Address Verifier',
    role: 'Indian E-Commerce QA Engine',
    systemPrompt: `You are an Indian E-Commerce Voice Agent QA Tester.
Your mandate:
1. Verify 6-digit Indian PIN codes, landmark references, and street names.
2. Distinguish confirmation vs negation intent ('nahi chahiye' vs 'bhej do').`,
    temperature: 0.2,
    strictness: 'HIGH'
  }
];

class PersonaEngine {
  constructor() {
    this.personas = [...DEFAULT_PERSONAS];
    this.activePersonaId = 'banking-auditor';
  }

  listPersonas() {
    return this.personas;
  }

  getActivePersona() {
    return this.personas.find(p => p.id === this.activePersonaId) || this.personas[0];
  }

  setActivePersona(id) {
    const exists = this.personas.find(p => p.id === id);
    if (exists) {
      this.activePersonaId = id;
      return exists;
    }
    return null;
  }

  createPersona({ name, role, systemPrompt, strictness = 'HIGH' }) {
    const newPersona = {
      id: `persona-${Date.now()}`,
      name,
      role,
      systemPrompt,
      temperature: strictness === 'EXTREME' ? 0.1 : 0.3,
      strictness
    };
    this.personas.push(newPersona);
    return newPersona;
  }
}

const personaEngine = new PersonaEngine();

module.exports = {
  personaEngine,
  DEFAULT_PERSONAS
};
