# IndicVoice Lab 🎙️
> **An Indian-Language Voice Agent Testing & Enterprise AI Evaluation Platform**  
> *Engineered for the Gnani AI — Great Indian AI Internship Challenge (November 2026)*

[![Gnani Prisma STT](https://img.shields.io/badge/AI%20Engine-Gnani%20Prisma%20STT-6366f1.svg)](https://prisma.gnani.ai/)
[![Languages](https://img.shields.io/badge/Languages-Hindi%20%7C%20Marathi%20%7C%20Hinglish-emerald.svg)]()
[![Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20Vite%20%7C%20Node.js%20%7C%20Tailwind-purple.svg)]()
[![Dual-Layer Evaluation](https://img.shields.io/badge/Evaluation-WER%20%7C%20CER%20%7C%20Critical%20Entities-blue.svg)]()
[![Enterprise Ready](https://img.shields.io/badge/Governance-RAG%20%7C%20MCP%20%7C%20Guardrails%20%7C%20Jira-amber.svg)]()
[![License](https://img.shields.io/badge/License-MIT-slate.svg)]()

---

## 🎯 The Core Problem & Product Promise

> ### *"Don't just test whether your voice AI transcribes speech. Test whether it understands the information that actually matters."*

In Indian voice applications (Voice Banking, UPI Payments, E-Commerce, Logistics), standard Speech-to-Text evaluation metrics like **Word Error Rate (WER)** and **Character Error Rate (CER)** create a dangerous false sense of security:

* **Example:** A speech model transcribes:  
  *Expected:* `"I want to send five hundred rupees to Rahul"` (9 words)  
  *Transcribed:* `"I want to send five hundred rupees to Rohan"`  
  *Standard WER:* **11.11% (88.89% Word Accuracy)** — marked as high accuracy!  
  *Production Reality:* **Catastrophic Failure.** The customer's money is transferred to the wrong human being.

**IndicVoice Lab** introduces a **Two-Tier Dual-Layer Evaluation Architecture** that evaluates surface phonetic/lexical alignment alongside **Semantic Business Integrity**, guaranteeing that critical entities (Person Names, Payment Amounts, Dates, Pincodes) are never compromised.

---

## 🌟 Key Product Features & Capabilities

### 1. 🔬 Dual-Layer Evaluation Pipeline
* **Layer 1: Surface Phonetic Accuracy (WER & CER)**:
  * Full Levenshtein distance dynamic programming matrix with backpointer traceback.
  * Explicit classification of token mutations into **Substitutions ($S$)**, **Deletions ($D$)**, and **Insertions ($I$)**.
* **Layer 2: Semantic Integrity (Critical Entity Verification)**:
  * Strict developer-defined expected value audit across critical entity types: `person`, `amount`, `date`, `location`.
  * Flags `CRITICAL_ENTITY_MISMATCH` with high-visibility audit alerts regardless of how low the surface WER is.
* **Separation of Infrastructure Failures**:
  * Downstream timeouts (504 Gateway Timeout, connection drops) are decoupled as `API_ERROR` and excluded from acoustic model accuracy averages.

### 2. 🇮🇳 Indic-First Linguistic Engineering
* **Unicode Normalization**: Strict Unicode NFC normalization stripping Devanagari danda (`।`, `॥`) alongside standard Latin punctuation.
* **Grapheme-Clustered Character Error Rate (CER)**:
  * Standard JavaScript `.split('')` breaks Indic complex conjuncts (संयुक्ताक्षर) and halant/virama signs (`्`).
  * IndicVoice Lab uses `Intl.Segmenter(lang, { granularity: 'grapheme' })` to preserve syllabic units for Hindi (`hi-IN`) and Marathi (`mr-IN`).

### 3. ☀️🌙 Adaptive Day & Night Design System
* **One-Click Theme Switcher**: Toggle effortlessly between Day (Light) Mode and Night (Dark) Mode with animated Sun ☀️ / Moon 🌙 controls.
* **Day (Light) Mode**: Crisp porcelain backdrop (`#f8fafc`), pure white cards, high-contrast typography, and accessible rose/emerald diff highlights.
* **Night (Dark) Mode**: Deep Obsidian canvas (`#070a12`), glowing indigo accents, and dark-room optimized HUD.
* **Persistent Preferences**: Remembers user selection via `localStorage` with smooth 150ms transitions.

### 4. 🔤 Premium Multi-Script Typography
* **Plus Jakarta Sans**: Ultra-clean geometric sans-serif for dashboard headers, navigational controls, and micro-copy.
* **Noto Sans Devanagari**: Industry standard for crisp Devanagari rendering, preventing clipped matras or broken conjunct glyphs.
* **JetBrains Mono**: Fixed-pitch monospace with tabular numbers (`tnum`) for aligned error metrics, timestamps, and word tokens.

### 5. 🛡️ 10 Enterprise AI Governance Pillars
IndicVoice Lab includes a dedicated **Enterprise AI Governance Suite**:

| # | Enterprise Capability | Production Implementation in IndicVoice Lab |
| :--- | :--- | :--- |
| 1 | **Custom System Prompts & Personas** | Pre-configured evaluation personas (`Banking Auditor`, `Hinglish Specialist`, `Logistics QA`) with temperature boundaries. |
| 2 | **Retrieval-Augmented Generation (RAG)** | Ground-truth retrieval engine dynamically pulling Indian domain rules (UPI payment limits, Marathi case markers, Pincodes). |
| 3 | **Vector Database & Embeddings** | In-memory high-dimensional vector space computing Cosine Similarity for semantic entity verification beyond literal matching. |
| 4 | **Model Context Protocol (MCP)** | Full JSON-RPC 2.0 MCP server (`POST /api/mcp`) exposing tools to Claude, Cursor, and autonomous agent swarms. |
| 5 | **Jira, Slack & HRMS Automation** | Auto-files Highest-severity Jira tickets and posts Slack alerts whenever critical entities fail in benchmark runs. |
| 6 | **RBAC & OAuth Authentication** | 4-tier Role-Based Access Control matrix: `Admin`, `QA_Engineer`, `Developer`, and `Viewer`. |
| 7 | **Prompt Injection Protection** | Real-time defense scanner detecting jailbreaks, system instruction overrides, and adversarial acoustic prompts. |
| 8 | **AI Guardrails & Indian PII Masking** | Automated regex masking for **Aadhaar cards**, **PAN cards**, **Indian phone numbers (+91)**, and **UPI IDs**. |
| 9 | **Semantic Caching & Model Routing** | Vector cosine cache ($\ge 0.96$) reducing inference latency to ~2ms; routes audio to optimal models based on noise profile. |
| 10 | **AI Observability & FinOps Telemetry** | Tracks p50/p95/p99 latency, Datacenter Compute Units (DCU), Gnani Prisma SLA uptime, and estimated billing in INR. |

---

## 🧮 Mathematical Evaluation Foundation

### 1. Word Error Rate (WER)
$$\text{WER} = \frac{S + D + I}{N}$$
Where:
* $S$ = Number of word substitutions
* $D$ = Number of word deletions
* $I$ = Number of word insertions
* $N$ = Total word count in expected ground-truth reference

### 2. Character Error Rate (CER) via Indic Graphemes
$$\text{CER} = \frac{S_g + D_g + I_g}{N_g}$$
Computed over true Unicode grapheme clusters rather than raw UTF-16 code units.

### 3. Critical Entity Accuracy
$$\text{Entity Accuracy} = \left( \frac{\text{Verified Critical Entities}}{\text{Total Expected Critical Entities}} \right) \times 100\%$$
$$\text{If } \text{Entity Accuracy} < 100\% \implies \text{Status} = \mathbf{CRITICAL\_ENTITY\_MISMATCH}$$

---

## 🎙️ Included Benchmark Test Cases

IndicVoice Lab comes pre-loaded with four representative Indian voice AI scenarios:

| ID | Test Scenario | Language | Challenge Category | Expected Ground Truth | Simulated Prisma Output | WER | Entity Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| `tc_demo_01` | **UPI Recipient Verification** | Hinglish | Names / UPI | *"I want to send five hundred rupees to Rahul"* | *"I want to send five hundred rupees to Rohan"* | `11.1%` | 🚨 **MISMATCH** (`Rahul`) |
| `tc_demo_02` | **Hindi Amount Verification** | Hindi (`hi-IN`) | Numbers / Amounts | *"मुझे पाँच सौ रुपये भेजने हैं"* | *"मुझे पाँच हज़ार रुपये भेजने हैं"* | `16.7%` | 🚨 **MISMATCH** (`पाँच सौ`) |
| `tc_demo_03` | **Marathi Order Confirmation** | Marathi (`mr-IN`) | Regional Dialect | *"माझी ऑर्डर उद्या सकाळी दहा वाजता पोहोचवा"* | *"माझी ऑर्डर उद्या सकाळी दहा वाजता पोहोचवा"* | `0.0%` | ✅ **VERIFIED** |
| `tc_demo_04` | **Hinglish Order Cancellation** | Hinglish | Negation / Corrections | *"Please cancel my ride immediately no wait"* | *"Please cancel my ride immediately no wait"* | `0.0%` | ✅ **VERIFIED** |

---

## 📁 Repository Structure

```
d:\gnani
├── server.js                   # Unified Single-File Runner (Port 5000, zero-config)
├── server/
│   ├── public/
│   │   └── index.html          # High-performance developer UI with Day/Night mode
│   ├── src/
│   │   ├── routes/api.js       # Complete REST API routes & Multer audio pipeline
│   │   ├── models/             # Project, TestCase, and TestRun schemas
│   │   └── services/
│   │       ├── evalEngine.js           # WER, CER & grapheme segmentation math
│   │       ├── entityEngine.js         # Critical entity verification engine
│   │       ├── prismaService.js        # Gnani Prisma STT adapter & simulation
│   │       ├── storageService.js       # Dual MongoDB / Local JSON adapter
│   │       ├── guardrailsService.js    # PII scrubbing & injection protection
│   │       ├── ragVectorService.js     # Vector knowledge base & cosine search
│   │       ├── semanticCacheService.js # Inference cache & acoustic router
│   │       ├── personaEngine.js        # Persona system prompts
│   │       ├── integrationsService.js  # Jira bug filer & Slack webhook alerts
│   │       ├── authService.js          # Role-Based Access Control (RBAC)
│   │       ├── mcpServer.js            # Model Context Protocol (MCP) server
│   │       └── observabilityService.js # Telemetry, DCU compute & INR cost
│   ├── scripts/
│   │   ├── generateSampleWavs.js   # Generates 16kHz PCM WAV benchmark audio
│   │   ├── testGnaniLive.js        # Standalone Gnani Prisma live connectivity test
│   │   └── seed.js                 # Populates database with benchmark suites
│   ├── uploads/                    # Binary sample WAV audio files
│   └── tests/
│       └── evaluationEngine.test.js # Jest verification suite (5/5 passing)
│
├── client/                     # Full-Stack React Client (Port 3000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation + Day/Night mode toggle
│   │   │   ├── Dashboard.jsx           # Analytics, Recharts, KPI overview
│   │   │   ├── ProjectWorkspace.jsx    # Audio player, test runner & filter HUD
│   │   │   ├── EvaluationModal.jsx     # Side-by-side diff & entity breakdown
│   │   │   ├── EnterpriseStudio.jsx    # Interactive 10-pillar governance studio
│   │   │   └── TestHistory.jsx         # Historical audit log & regression charts
│   │   ├── App.jsx                     # State machine & theme controller
│   │   └── index.css                   # Tailwind v4 styles & theme tokens
│   └── index.html                      # HTML entry with Google Fonts integration
│
└── package.json                # Monorepo task runner scripts
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

---

### Option A: Standalone Single-File Runner (Fastest)
Runs the in-memory benchmark engine, STT simulator, audio playback, and developer UI directly in a single process:

```bash
# 1. Install root dependencies (Express, Cors, Multer, Axios)
npm install

# 2. Start the standalone server
node server.js
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

---

### Option B: Decoupled Full-Stack Suite (Enterprise)
Runs the dedicated Node/Express REST backend on port 5000 and the Vite + React client on port 3000:

```bash
# Terminal 1: Start Backend API
cd server
npm install
npm start

# Terminal 2: Start React Frontend
cd client
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Verification & Automated Testing

### Run Evaluation Math Unit Tests
```bash
npm test
```
**Expected Test Results:**
```
===============================================================
🧪 RUNNING MANDATORY EVALUATION ENGINE VERIFICATION SUITE
===============================================================

▶ TC-01: Exact Match with Devanagari Danda (।)
  WER: 0, CER: 0
  ✅ TC-01 Passed

▶ TC-02: PRD Core Example (Rahul vs Rohan)
  WER: 0.1111 (expected ~0.1111)
  CER: 0.0857
  Critical Failure Detected: true
  Entity Accuracy: 0%
  ✅ TC-02 Passed

▶ TC-03: Hinglish Code-Mixing & Number Verification
  WER: 0.1667 (expected ~0.1667)
  Critical Failure Detected: true
  ✅ TC-03 Passed

▶ TC-04: Marathi Grapheme Segmentation
  WER: 0.2 (expected 0.2)
  CER: 0.1667
  ✅ TC-04 Passed

▶ TC-05: Empty Hypothesis (Silence / Cutout)
  WER: 1, CER: 1
  ✅ TC-05 Passed

===============================================================
🎉 ALL 5 EVALUATION VERIFICATION TESTS PASSED WITH 100% PRECISION!
===============================================================
```

### Test Live Gnani Prisma STT Connectivity
```bash
node server/scripts/testGnaniLive.js
```

### Generate Clean 16kHz PCM Audio Benchmarks
```bash
npm run gen:audio
```

---

## 🌐 Live API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Serves the interactive developer UI with Day/Night mode |
| `GET` | `/api/dashboard` | Overall KPI summary, average WER/CER, failure rates |
| `GET` | `/api/projects` | List all evaluation projects |
| `POST` | `/api/projects` | Create a new project suite |
| `GET` | `/api/projects/:id/tests` | Fetch test cases for a specific project |
| `POST` | `/api/projects/:id/tests` | Create a new test case with audio and critical entities |
| `POST` | `/api/tests/:id/run` | Execute STT evaluation on a single test case |
| `POST` | `/api/projects/:id/run-all` | Run batch evaluation across all test cases |
| `POST` | `/api/mcp` | Model Context Protocol (MCP) JSON-RPC 2.0 tool execution |
| `POST` | `/api/enterprise/guardrails/mask-pii` | Live Indian PII detection and redaction |
| `POST` | `/api/enterprise/rag/search` | Search domain rules via vector cosine similarity |

---

## 👥 Contributors & Event Info

* **Project:** IndicVoice Lab
* **Challenge:** Gnani AI — Great Indian AI Internship Challenge
* **Version:** 1.0 (MVP)
* **Date:** November 2026

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
