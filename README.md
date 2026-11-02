# IndicVoice Lab 🎙️
> **An Indian-language Voice Agent Testing & Enterprise AI Governance Platform**  
> *Built for the Gnani AI — Great Indian AI Internship Challenge*

[![Gnani Prisma STT](https://img.shields.io/badge/AI%20Engine-Gnani%20Prisma%20STT-6366f1.svg)](https://prisma.gnani.ai/)
[![Languages](https://img.shields.io/badge/Languages-Hindi%20%7C%20Marathi%20%7C%20Hinglish-emerald.svg)]()
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Tailwind%20%7C%20MongoDB-purple.svg)]()
[![Enterprise Ready](https://img.shields.io/badge/Enterprise-RAG%20%7C%20MCP%20%7C%20Guardrails%20%7C%20Jira-amber.svg)]()

---

## 🎯 The Core Problem & Product Promise

> **"Don't just test whether your voice AI transcribes speech. Test whether it understands the information that actually matters."**

Standard speech metrics (WER/CER) can report an impressive **88.9% accuracy**, yet cause a catastrophic failure if a recipient name (*"Rahul"* → *"Rohan"*) or payment amount (*"₹500"* → *"₹5,000"*) is misrecognized. 

**IndicVoice Lab** combines phonetic speech recognition evaluation with **10 Enterprise AI Governance Pillars** designed specifically for real-world Indian voice agent production deployments.

---

## ⚡ The 10 Enterprise AI Upgrades

| # | Enterprise Capability | Implementation in IndicVoice Lab |
| :--- | :--- | :--- |
| 1 | **Custom System Prompts & AI Personas** | Configurable evaluation personas (`Strict Banking Auditor`, `Regional Dialect & Hinglish Specialist`, `Logistics QA`) with custom temperature and instruction boundaries. |
| 2 | **RAG (Retrieval-Augmented Generation)** | Ground-truth retrieval engine dynamically pulling Indian domain rules (UPI payment limits, Marathi case markers, Indian pincodes) into the evaluation pipeline. |
| 3 | **Vector Database & Embeddings** | In-memory high-dimensional vector space computing Cosine Similarity for semantic entity verification beyond literal string matching. |
| 4 | **MCP Server & Tool Calling** | Full **Model Context Protocol (MCP)** JSON-RPC 2.0 server (`POST /api/mcp`) exposing tools (`evaluate_voice_transcription`, `get_project_health_audit`, `search_indic_domain_knowledge`) to Claude, Cursor, and agent swarms. |
| 5 | **Jira, Slack & HRMS Integrations** | **Auto-Incident Automation**: Automatically files a Highest-priority Jira ticket and sends a Slack card alert whenever a critical entity check fails. Includes mock HRMS directory lookup for voicebots. |
| 6 | **RBAC & OAuth Authentication** | Role-Based Access Control matrix supporting 4 tiers: `Admin`, `QA_Engineer`, `Developer`, and `Viewer` with permission enforcement. |
| 7 | **Prompt Injection Protection** | Real-time defense scanner detecting jailbreaks, system instruction overrides, and adversarial voice prompts. |
| 8 | **AI Guardrails & Data Privacy** | Automated Indian PII masking and scrubbing for **Aadhaar cards**, **PAN cards**, **Indian phone numbers (+91)**, **UPI IDs**, and **Credit Cards**. |
| 9 | **Semantic Caching & Model Routing** | Vector cosine cache (threshold $\ge 0.96$) reducing latency to ~2ms and cutting Gnani API costs. Smart model routing selects optimal acoustic models based on Hindi, Marathi, Hinglish, and background noise profiles. |
| 10 | **AI Observability & Evaluation** | Complete telemetry tracking: p50/p95/p99 latency breakdown, Datacenter Compute Units (DCU) utilized, estimated billing in INR, and Gnani Prisma uptime SLA monitoring. |

---

## 🏗️ Technical Architecture

```
d:\gnani
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation with Enterprise Suite tab
│   │   │   ├── Dashboard.jsx           # KPI metrics, WER breakdown, recent runs
│   │   │   ├── ProjectWorkspace.jsx    # Test case management & scenario filters
│   │   │   ├── EnterpriseStudio.jsx    # 10 Enterprise capabilities interactive workbench
│   │   │   ├── EvaluationModal.jsx     # Side-by-side diff & critical entity audit
│   │   │   ├── TestHistory.jsx         # Historical runs & regression logs
│   │   │   ├── CreateProjectModal.jsx  # Project configuration dialog
│   │   │   └── CreateTestCaseModal.jsx # Audio upload & critical entity builder
│   │   ├── App.jsx                     # State controller & API client
│   │   └── index.css                   # Tailwind v4 styles & dark theme
│   └── vite.config.js                  # Vite server & API proxy config
│
├── server/                     # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/api.js               # REST API endpoints & Multer upload
│   │   ├── services/
│   │   │   ├── evalEngine.js           # WER, CER & text normalization engine
│   │   │   ├── entityEngine.js         # Critical entity verification engine
│   │   │   ├── prismaService.js        # Gnani Prisma STT API integration client
│   │   │   ├── storageService.js       # Dual-mode MongoDB / local JSON adapter
│   │   │   ├── guardrailsService.js    # PII scrubbing & prompt injection defense
│   │   │   ├── ragVectorService.js     # Vector database & cosine similarity RAG
│   │   │   ├── semanticCacheService.js # Cosine cache & model router
│   │   │   ├── personaEngine.js        # AI testing personas & system prompts
│   │   │   ├── integrationsService.js  # Jira bug filer, Slack alerts & HRMS lookup
│   │   │   ├── authService.js          # RBAC matrix & enterprise user context
│   │   │   ├── mcpServer.js            # MCP JSON-RPC 2.0 tool execution server
│   │   │   └── observabilityService.js # p50/p95 latency, DCU compute & INR cost
│   │   └── index.js                    # Express app entry point
│   ├── scripts/seed.js                 # Seed script with PRD Indian voice tests
│   └── tests/evalEngine.test.js        # Automated unit tests for WER & entities
│
├── samples/                    # Test scenario specifications & documentation
└── package.json                # Root scripts to run backend and frontend
```

---

## 🚀 Quickstart Guide

### 1. Run the Evaluation Unit Tests
```bash
npm test
```
*Outputs: 100% verified WER (11.11%), CER, Devanagari normalization, and Critical Entity Mismatch detection.*

### 2. Start the Backend API (Port 5000)
```bash
npm run server
```

### 3. Start the Frontend Dashboard (Port 3000)
```bash
npm run client
```
*Open `http://localhost:3000` in your browser.*

### 4. Explore the Enterprise AI Suite
Click on the **"Enterprise Suite"** tab in the navigation bar to interact with:
- System Prompts & Personas
- Vector Knowledge Base Search
- Live Indian PII Masking (Aadhaar, PAN, UPI, Phone)
- Semantic Cache Hit Rate & Model Router
- Auto-Filed Jira Tickets & Slack Alerts
- Live MCP Tool Calling
- Observability (Latency, DCU, Billing)
