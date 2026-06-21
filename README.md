# LabTrack

**Understand your lab reports. Track your health trends.**

LabTrack is a patient-facing lab report explainer and health trend dashboard. Users upload blood test PDFs or screenshots. The app extracts common lab values, explains them in simple language, and tracks health trends over time.

> **Disclaimer:** LabTrack is for education and personal record organization only. It does not provide medical advice, diagnosis, or treatment. Always consult a licensed clinician about your health decisions.

> **Running for $0:** See [FREE_TIER.md](./FREE_TIER.md) for the full free stack (no OpenAI, Firebase Spark, GitHub Pages, Render/Railway free).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript, Recharts |
| Frontend hosting | GitHub Pages |
| Backend | FastAPI, Python |
| Backend hosting | Render (free) or Railway (free tier) |
| Authentication | Firebase Authentication (Spark plan) |
| Database | Firebase Firestore (Spark plan) |
| PDF parsing | PyMuPDF, pdfplumber |
| OCR | pytesseract |
| LLM explanations | Rule-based (default, free). OpenAI optional — see `requirements-llm.txt` |

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
OPENAI_API_KEY=          # leave empty for free tier (rule-based explanations)
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

## Railway Deployment (free tier)

> Railway Free is **$0/month** with ~**$1 usage credit/month**. Heavy OCR workloads may exceed that if run 24/7. See [FREE_TIER.md](./FREE_TIER.md) — **Render free** is the more reliable $0 option.

1. Create a new project on [Railway](https://railway.app/).
2. After the $5 trial, **downgrade to the Free plan** (Settings → Billing). Do not upgrade to Hobby unless you want to pay $5/mo.
3. Connect your GitHub repo and set the root directory to `backend/`.
4. Add environment variables (leave `OPENAI_API_KEY` empty for free tier):

   | Variable | Value |
   |----------|-------|
   | `FIREBASE_PROJECT_ID` | Your Firebase project ID |
   | `FIREBASE_CLIENT_EMAIL` | Service account email |
   | `FIREBASE_PRIVATE_KEY` | Private key (with `\n` for newlines) |
   | `OPENAI_API_KEY` | *(leave empty)* |
   | `LLM_MODEL` | `gpt-4o-mini` |
   | `CORS_ORIGINS` | `https://taoyeyang85-bit.github.io,http://localhost:5173` |
   | `PORT` | Railway sets this automatically |

5. Deploy. Note the public URL (e.g. `https://labtrack-api.up.railway.app`).
6. Health check: `GET /health` → `{"status":"ok"}`

## Render Deployment (free — recommended for $0)

1. Go to [Render](https://render.com/) → **New** → **Blueprint** → connect this repo.
2. Render reads `render.yaml` and creates a free web service from `backend/Dockerfile`.
3. Set the same env vars as Railway (no `OPENAI_API_KEY`).
4. Free instances **sleep after 15 min idle**; first request may take up to ~60s to wake up.
5. Copy the Render URL into the `VITE_API_BASE_URL` GitHub secret.

## GitHub Pages Deployment

> **First-time setup:** See [SETUP.md](./SETUP.md) for Firebase, GitHub Pages, and Railway configuration.

### Option A: GitHub Actions (recommended)

1. Enable GitHub Pages: repo [Settings → Pages](https://github.com/taoyeyang85-bit/LabTrack/settings/pages) → Source: **GitHub Actions**.
   - A `404 Not Found` on `deploy-pages` means this step was skipped.
2. Add repository secrets for all `VITE_*` env vars plus `VITE_API_BASE_URL` pointing to your Railway backend.
3. Push to `main`. The workflow in `.github/workflows/deploy-frontend.yml` builds and deploys automatically.
4. Live URL: `https://taoyeyang85-bit.github.io/LabTrack/`

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
