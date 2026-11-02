# IndicVoice Lab 🎙️
> **An Indian-language Voice Agent Testing Platform**  
> *Built for the Gnani AI — Great Indian AI Internship Challenge*

[![Gnani Prisma STT](https://img.shields.io/badge/AI%20Engine-Gnani%20Prisma%20STT-6366f1.svg)](https://prisma.gnani.ai/)
[![Languages](https://img.shields.io/badge/Languages-Hindi%20%7C%20Marathi%20%7C%20Hinglish-emerald.svg)]()
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Tailwind%20%7C%20MongoDB-purple.svg)]()

---

## 🎯 The Core Problem & Product Promise

> **"Don't just test whether your voice AI transcribes speech. Test whether it understands the information that actually matters."**

Voice applications deployed across India face unique acoustic and semantic challenges:
- **Regional accents & inflections** across Hindi, Marathi, and Hinglish.
- **Code-mixing**: Seamless switching between Hindi/Marathi grammar and English nouns/verbs.
- **Noisy real-world environments**: Market noise, traffic, and low-volume phone calls.
- **High-stakes entity failures**: Standard STT metrics (WER/CER) can report an impressive **88.9% accuracy**, yet cause a catastrophic failure if a recipient name (*"Rahul"* → *"Rohan"*) or payment amount (*"five hundred"* → *"five thousand"*) is misrecognized.

**IndicVoice Lab** provides voice AI developers with a developer-first testing environment to systematically benchmark, diagnose, and reproduce Indian-language speech recognition errors using **Gnani Prisma STT**.

---

## ✨ Key Features

- **Gnani Prisma STT Integration**: Backend integration service (`prismaService.js`) with secure authentication, language parameter passing (`hi`, `mr`, `hi-en`), and fallback simulation mode for offline local development.
- **Semantic Critical Entity Validator**: Beyond word accuracy, developers define expected transactional entities (`person`, `amount`, `date`, `location`, `number`). If any critical entity is distorted or missing, the test run is flagged as a **CRITICAL ENTITY FAILURE**.
- **Indian Script & Unicode Normalization**: Unicode NFKC normalization, punctuation stripping (including Devanagari danda `।` and double danda `॥`), whitespace consolidation, and casing normalization.
- **High-Precision Metric Alignment Engine**:
  - **Word Error Rate (WER)**: Dynamic programming Levenshtein alignment calculating Substitutions ($S$), Deletions ($D$), and Insertions ($I$).
  - **Character Error Rate (CER)**: Character-level edit distance.
  - **Visual Token Diff**: Side-by-side token breakdown color-coded with Green (Matches), Red (Substitutions), Amber (Deletions), and Sky (Insertions).
- **Zero-Config Persistence**: Built-in dual-mode storage adapter that runs instantly out-of-the-box using embedded local JSON persistence, with native support for MongoDB Atlas via `MONGODB_URI`.
- **Developer-Tool Dark UI**: Minimalist, high-density React + Tailwind CSS dashboard with instant benchmark seeding, audio upload, scenario filtering, and regression history.

---

## 🏗️ Technical Architecture

```
d:\gnani
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation & benchmark seed button
│   │   │   ├── Dashboard.jsx           # KPI metrics, WER breakdown, recent runs
│   │   │   ├── ProjectWorkspace.jsx    # Test case management & scenario filters
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
│   │   │   └── storageService.js       # Dual-mode MongoDB / local JSON adapter
│   │   └── index.js                    # Express app entry point
│   ├── scripts/seed.js                 # Seed script with PRD Indian voice tests
│   └── tests/evalEngine.test.js        # Automated unit tests for WER & entities
│
├── samples/                    # Test scenario specifications & documentation
└── package.json                # Root scripts to run backend and frontend
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18+ or v24+)
- **npm** (v9+)

### 2. Run the Evaluation Unit Tests
Verify the mathematical accuracy of the evaluation engine:
```bash
npm test
```
*Outputs: 100% verified WER (11.11%), CER, Devanagari normalization, and Critical Entity Mismatch detection.*

### 3. Start the Backend API
```bash
npm run server
```
*The server starts on `http://localhost:5000` with health check at `/health`.*

### 4. Start the Frontend Dashboard
In a separate terminal:
```bash
npm run client
```
*Open `http://localhost:3000` in your browser.*

### 5. Instant Demo Seeding
Click **"Load Benchmarks"** in the top navigation bar (or run `npm run seed`) to instantly populate the dashboard with real Indian voice scenarios:
1. **UPI Recipient Name Mismatch** (*"Rahul"* vs *"Rohan"* - 88.9% accuracy but 100% critical failure).
2. **Hindi Voice Banking Amount** (*"पाँच सौ रुपये राहुल को भेजने हैं"*).
3. **Marathi Customer Service** (*"मला पाचशे रुपये राहुलला पाठवायचे आहेत"*).

---

## 🔑 Configuring Gnani Prisma STT Credentials

When ready to test live audio against Gnani's production speech models:
1. Create a `.env` file in `server/`:
```env
PORT=5000
GNANI_PRISMA_API_KEY=your_gnani_api_key_here
GNANI_PRISMA_ACCESS_KEY=your_gnani_access_key_here
GNANI_PRISMA_ENDPOINT=https://prisma.gnani.ai/api/v1/stt

# Optional: MongoDB Atlas connection string (defaults to local storage if omitted)
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/indicvoice?retryWrites=true&w=majority
```
2. Restart the server. IndicVoice Lab will automatically dispatch audio recordings to Gnani Prisma.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Returns aggregate statistics (total projects, WER, critical failure rate) |
| `POST` | `/api/projects` | Creates a new test project |
| `GET` | `/api/projects` | Lists all test projects |
| `POST` | `/api/projects/:id/tests` | Creates a new test case with audio file (`multipart/form-data`) |
| `GET` | `/api/projects/:id/tests` | Lists test cases within a project |
| `POST` | `/api/tests/:id/run` | Dispatches audio to Gnani Prisma & executes evaluation |
| `GET` | `/api/runs/:id` | Fetches detailed evaluation report for a run |
| `GET` | `/api/projects/:id/history` | Fetches historical runs for regression analysis |
| `POST` | `/api/seed` | Seeds benchmark datasets |

---

## 👥 Gnani AI Internship Challenge Deliverable

- **Target MVP Deadline**: November 10, 2026
- **Primary Deliverable**: Working end-to-end evaluation platform integrating Gnani Prisma STT, WER/CER calculation, critical entity mismatch detection, and dark-theme developer UI.

