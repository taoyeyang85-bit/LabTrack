# LabTrack

**Understand your lab reports. Track your health trends.**

LabTrack is a patient-facing lab report explainer and health trend dashboard. Users upload blood test PDFs or screenshots. The app extracts common lab values, explains them in simple language, and tracks health trends over time.

> **Disclaimer:** LabTrack is for education and personal record organization only. It does not provide medical advice, diagnosis, or treatment. Always consult a licensed clinician about your health decisions.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript, Recharts |
| Frontend hosting | GitHub Pages |
| Backend | FastAPI, Python |
| Backend hosting | Railway |
| Authentication | Firebase Authentication |
| Database | Firebase Firestore |
| PDF parsing | PyMuPDF, pdfplumber |
| OCR | pytesseract |
| LLM explanations | OpenAI (backend-only, with rule-based fallback) |

## Architecture

```txt
User
  ↓
React + Vite frontend on GitHub Pages
  ↓ Firebase Auth token
FastAPI backend on Railway
  ↓
PDF parsing / OCR
  ↓
Biomarker parser
  ↓
LLM explanation generator
  ↓
Firestore
  ↓
Dashboard + trend charts
```

## Folder Structure

```txt
labtrack/
  frontend/          React + Vite SPA
  backend/           FastAPI API server
  firestore.rules    Firestore security rules
  README.md
```

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.12+
- Tesseract OCR (`brew install tesseract` on macOS)
- Firebase project with Auth + Firestore enabled

### 1. Clone and install

```bash
cd labtrack

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Email/Password** authentication under Authentication → Sign-in method.
3. Create a **Firestore** database in production mode.
4. Deploy security rules:

   ```bash
   firebase deploy --only firestore:rules
   ```

   Or paste `firestore.rules` into the Firebase Console → Firestore → Rules.

5. Register a **Web app** and copy the Firebase config for frontend env vars.
6. Generate a **Service account** key (Project settings → Service accounts → Generate new private key). Use the values for backend env vars — **do not commit the JSON file**.

### 3. Environment variables

**Backend** (`backend/.env`):

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
OPENAI_API_KEY=sk-...          # optional; fallback mode works without it
LLM_MODEL=gpt-4o-mini
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
PORT=8000
```

**Frontend** (`frontend/.env`):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Run locally

**Backend:**

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm run dev
```

Open http://localhost:5173

### 5. Run parser tests

```bash
cd backend
pytest tests/ -v
```

## Railway Deployment

1. Create a new project on [Railway](https://railway.app/).
2. Connect your GitHub repo and set the root directory to `backend/`.
3. Railway will detect the `Dockerfile`.
4. Add environment variables:

   | Variable | Value |
   |----------|-------|
   | `FIREBASE_PROJECT_ID` | Your Firebase project ID |
   | `FIREBASE_CLIENT_EMAIL` | Service account email |
   | `FIREBASE_PRIVATE_KEY` | Private key (with `\n` for newlines) |
   | `OPENAI_API_KEY` | Optional OpenAI key |
   | `LLM_MODEL` | `gpt-4o-mini` |
   | `CORS_ORIGINS` | `https://yourusername.github.io,http://localhost:5173` |
   | `PORT` | Railway sets this automatically |

5. Deploy. Note the public URL (e.g. `https://labtrack-api.up.railway.app`).
6. Health check: `GET /health` → `{"status":"ok"}`

## GitHub Pages Deployment

### Option A: GitHub Actions (recommended)

1. Enable GitHub Pages: repo Settings → Pages → Source: **GitHub Actions**.
2. Add repository secrets for all `VITE_*` env vars plus `VITE_API_BASE_URL` pointing to your Railway backend.
3. Push to `main`. The workflow in `.github/workflows/deploy-frontend.yml` builds and deploys automatically.

### Option B: Manual deploy

```bash
cd frontend
VITE_BASE_PATH=/your-repo-name/ npm run build
npm run deploy
```

Set `VITE_BASE_PATH` to `/your-repo-name/` for project pages, or `/` for user/org pages.

Update `VITE_API_BASE_URL` to your Railway backend URL before building.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/reports/upload` | Yes | Upload and parse lab report |
| GET | `/api/reports` | Yes | List user's reports |
| GET | `/api/reports/{id}` | Yes | Get one report |
| GET | `/api/trends` | Yes | Biomarker time series |

## Known Limitations

- OCR can make mistakes.
- Lab report formats vary widely.
- Reference ranges differ across labs.
- Patient context matters.
- The app does not provide medical advice.
- Users should verify extracted values manually.

## Future Improvements

- Manual correction UI
- Raw file storage with explicit user consent
- More robust lab vendor-specific parsers
- Support for more biomarkers
- Export to CSV
- Doctor-shareable summary PDF
- Better confidence scoring
- Longitudinal insights

## License

MIT
