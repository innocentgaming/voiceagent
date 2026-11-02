/**
 * IndicVoice Lab - Model Context Protocol (MCP) Server
 * Exposes MCP JSON-RPC 2.0 standard tool declarations & handlers
 * allowing AI assistants and coding agents to invoke voice evaluation tools.
 */

const storage = require('./storageService');
const { evaluateTranscription } = require('./evalEngine');
const { evaluateCriticalEntities } = require('./entityEngine');
const { vectorDb } = require('./ragVectorService');

const MCP_TOOLS = [
  {
    name: 'evaluate_voice_transcription',
    description: 'Calculates Word Error Rate (WER), Character Error Rate (CER), and checks critical entities (names, amounts, dates) in Indian languages (Hindi, Marathi, Hinglish).',
    inputSchema: {
      type: 'object',
      properties: {
        expectedText: { type: 'string', description: 'Expected reference ground-truth transcript' },
        predictedText: { type: 'string', description: 'Actual STT hypothesis transcript produced by Gnani Prisma' },
        criticalEntities: {
          type: 'array',
          description: 'Optional list of entities to verify e.g. [{ name: "Recipient", type: "person", value: "Rahul" }]',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string' },
              value: { type: 'string' }
            }
          }
        }
      },
      required: ['expectedText', 'predictedText']
    }
  },
  {
    name: 'get_project_health_audit',
    description: 'Retrieves current evaluation KPIs including total tests, average WER, and critical entity failure rates.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'search_indic_domain_knowledge',
    description: 'Queries vector database for Indian speech nuances, dialect inflections, and UPI entity rules.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Query text e.g. "UPI recipient rules"' },
        topK: { type: 'number', default: 2 }
      },
      required: ['query']
    }
  }
];

async function handleMcpToolCall(name, args = {}) {
  switch (name) {
    case 'evaluate_voice_transcription': {
      const { expectedText, predictedText, criticalEntities = [] } = args;
      const evalRes = evaluateTranscription(expectedText, predictedText);
      const entityRes = evaluateCriticalEntities(criticalEntities, predictedText);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              wer: evalRes.wer,
              cer: evalRes.cer,
              accuracy: evalRes.accuracy,
              hasCriticalMismatch: entityRes.hasCriticalMismatch,
              entityAccuracy: entityRes.entityAccuracy,
              alignmentSummary: evalRes.details,
              evaluatedEntities: entityRes.evaluatedEntities
            }, null, 2)
          }
        ]
      };
    }

    case 'get_project_health_audit': {
      const stats = await storage.getDashboardStats();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(stats, null, 2)
          }
        ]
      };
    }

    case 'search_indic_domain_knowledge': {
      const results = vectorDb.search(args.query, args.topK || 2);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2)
          }
        ]
      };
    }

    default:
      throw new Error(`Unknown MCP Tool: ${name}`);
  }
}

module.exports = {
  MCP_TOOLS,
  handleMcpToolCall
};

