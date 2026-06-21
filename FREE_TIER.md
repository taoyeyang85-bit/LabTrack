# Running LabTrack for $0

LabTrack can run with **no paid subscriptions** if you stay on free tiers and skip optional paid APIs.

## Cost map

| Component | Service | Cost | Notes |
|-----------|---------|------|-------|
| Frontend | GitHub Pages | **$0** | Public repo |
| Auth + database | Firebase **Spark** plan | **$0** | Do not upgrade to Blaze |
| PDF parsing + OCR | PyMuPDF, pdfplumber, Tesseract | **$0** | Runs on your backend server |
| Explanations | Rule-based fallback | **$0** | Default when `OPENAI_API_KEY` is unset |
| Backend hosting | See below | **$0** | With trade-offs |

### What you should NOT enable

- **OpenAI API** — paid per request. Leave `OPENAI_API_KEY` empty.
- **Firebase Blaze** — only needed for Cloud Functions / heavy egress. Spark is enough.
- **Railway Hobby ($5/mo)** — not required if you use the free options below.

## Recommended $0 backend: Render (free instance)

Render’s free web tier is the most reliable **$0** option for this Docker backend:

- **$0/month**, 512 MB RAM
- Spins down after ~15 minutes of no traffic
- First request after idle may take **30–90 seconds** (cold start)
- 750 instance-hours/month per workspace (enough for one always-idle service)

Deploy with the included `render.yaml` (see [SETUP.md](./SETUP.md#render-free-backend-recommended)).

## Railway free tier (limited)

Railway’s **Free** plan is **$0/month** but includes only **~$1 of usage credit per month** (not rollover).

This backend uses OCR and PDF libraries and typically needs **256–512 MB RAM**. Running 24/7 at that size usually costs **more than $1/month** in usage, so the service may **pause when credits run out** until the next month.

Railway Free can still work if you:

- Use it for **personal / demo** traffic only
- Stay on the **Free** plan (downgrade after the $5 trial — do not upgrade to Hobby)
- Accept occasional downtime when monthly credits are exhausted

For a personal health tracker with a few uploads per week, intermittent use may stay within $1.

## Firebase Spark limits (plenty for personal use)

| Resource | Free quota |
|----------|------------|
| Auth users | 50,000 MAU |
| Firestore reads | 50,000 / day |
| Firestore writes | 20,000 / day |
| Storage | 1 GB |

LabTrack stores parsed text previews and biomarkers — not original PDF files — so usage stays small.

## Free stack summary

```txt
GitHub Pages (frontend, $0)
    ↓ Firebase Auth token
Render free OR Railway free (backend API, $0 with limits)
    ↓
Firebase Firestore Spark (database, $0)
    ↓
Rule-based explanations (no OpenAI, $0)
```

## Environment checklist (no paid keys)

**Backend** — leave OpenAI blank:

```env
FIREBASE_PROJECT_ID=labtrack-f1e40
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="..."
OPENAI_API_KEY=
CORS_ORIGINS=https://taoyeyang85-bit.github.io,http://localhost:5173
```

**Frontend** — GitHub Actions secrets only need `VITE_*` Firebase vars and `VITE_API_BASE_URL` pointing to Render/Railway.

## Optional paid upgrade (only if you want)

Set `OPENAI_API_KEY` and install LLM extras:

```bash
pip install -r requirements-llm.txt
```

Explanations will use GPT; otherwise the built-in rule-based text is used automatically.
