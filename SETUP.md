# LabTrack setup guide

Follow these steps in order. Your Firebase web app is already configured locally in `frontend/.env`.

## 1. Firebase Console (`labtrack-f1e40`)

Open [Firebase Console](https://console.firebase.google.com/project/labtrack-f1e40).

### Authentication

1. **Build → Authentication → Sign-in method**
2. Enable **Email/Password**
3. **Settings → Authorized domains** — confirm these domains exist:
   - `localhost`
   - `taoyeyang85-bit.github.io`

### Firestore

1. **Build → Firestore Database** — create a database if you have not already (production mode is fine).
2. Deploy security rules from this repo:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules
   ```

   Or paste `firestore.rules` into **Firestore → Rules** in the console.

### Backend service account

1. **Project settings (gear) → Service accounts → Generate new private key**
2. Import it into `backend/.env`:

   ```bash
   chmod +x scripts/import-service-account.sh
   ./scripts/import-service-account.sh ~/Downloads/labtrack-f1e40-firebase-adminsdk-xxxxx.json
   ```

3. Delete the downloaded JSON file afterward.

## 2. Local environment

**Frontend** (`frontend/.env`) — already filled:

```env
VITE_FIREBASE_API_KEY=AIzaSyBCfcyoC259WCDa0FPbG9wOsmk57OjGIgQ
VITE_FIREBASE_AUTH_DOMAIN=labtrack-f1e40.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=labtrack-f1e40
VITE_FIREBASE_STORAGE_BUCKET=labtrack-f1e40.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1072863240985
VITE_FIREBASE_APP_ID=1:1072863240985:web:d5487e993c331395579b88
VITE_API_BASE_URL=http://localhost:8000
```

**Backend** (`backend/.env`) — add your service account (step 1) and optional OpenAI key:

```env
FIREBASE_PROJECT_ID=labtrack-f1e40
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@labtrack-f1e40.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
OPENAI_API_KEY=
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://taoyeyang85-bit.github.io
```

Run locally:

```bash
# Terminal 1
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

## 3. Fix GitHub Pages deploy (404 error)

The workflow build succeeded; deploy failed because **GitHub Pages is not enabled yet**.

1. Open [Pages settings](https://github.com/taoyeyang85-bit/LabTrack/settings/pages)
2. Under **Build and deployment → Source**, choose **GitHub Actions** (not “Deploy from a branch”)
3. Save — you do not need to pick a branch

> If the repo is private, you need GitHub Pro/Team/Enterprise for Pages, or make the repo public.

### Add GitHub Actions secrets

Go to [Actions secrets](https://github.com/taoyeyang85-bit/LabTrack/settings/secrets/actions) and add:

| Secret | Value |
|--------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyBCfcyoC259WCDa0FPbG9wOsmk57OjGIgQ` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `labtrack-f1e40.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `labtrack-f1e40` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `labtrack-f1e40.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `1072863240985` |
| `VITE_FIREBASE_APP_ID` | `1:1072863240985:web:d5487e993c331395579b88` |
| `VITE_API_BASE_URL` | Your Railway URL (see step 4) |

Or run (with [GitHub CLI](https://cli.github.com/) installed):

```bash
chmod +x scripts/set-github-secrets.sh
./scripts/set-github-secrets.sh
```

### Re-run deploy

1. **Actions → Deploy Frontend to GitHub Pages → Run workflow**
2. When it succeeds, the site is at: **https://taoyeyang85-bit.github.io/LabTrack/**

## 4. Backend (production API) — pick one

### Render free backend (recommended for $0)

1. [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint** → connect this repo
2. Set env vars when prompted: `FIREBASE_*`, `CORS_ORIGINS` (no OpenAI key)
3. Free tier sleeps after 15 min idle; cold starts ~30–60s
4. Copy the Render URL → set as `VITE_API_BASE_URL` GitHub secret

### Railway free backend (alternative)

1. Create a project at [Railway](https://railway.app/) → root directory `backend/`
2. After trial, **stay on Free plan** ($0/mo, ~$1 usage credit/month)
3. Add variables (recommended: use the single JSON variable):

   | Variable | Value |
   |----------|-------|
   | `FIREBASE_SERVICE_ACCOUNT_JSON` | Full service-account JSON on **one line** (easiest on Railway) |
   | `CORS_ORIGINS` | `https://taoyeyang85-bit.github.io,http://localhost:5173` |
   | `OPENAI_API_KEY` | *(leave empty)* |

   Or set these separately instead of `FIREBASE_SERVICE_ACCOUNT_JSON`:

   | Variable | Value |
   |----------|-------|
   | `FIREBASE_PROJECT_ID` | `labtrack-f1e40` |
   | `FIREBASE_CLIENT_EMAIL` | (from service account) |
   | `FIREBASE_PRIVATE_KEY` | Private key with `\\n` escaped newlines, not real line breaks |

   Generate the one-line JSON from a downloaded key:

   ```bash
   ./scripts/print-service-account-json.sh ~/Downloads/labtrack-f1e40-firebase-adminsdk-xxxxx.json
   ```

   Or push credentials directly to Railway (after `npx @railway/cli login`):

   ```bash
   ./scripts/railway-set-firebase.sh ~/Downloads/labtrack-f1e40-firebase-adminsdk-xxxxx.json
   ```

   Then verify:

   ```bash
   curl https://labtrack-production-21c6.up.railway.app/health/firebase
   ```

4. Copy the public Railway URL (for example `https://labtrack-production-21c6.up.railway.app`)
5. Update the `VITE_API_BASE_URL` GitHub secret to that URL
6. Re-run the GitHub Pages workflow

See [FREE_TIER.md](./FREE_TIER.md) for cost limits and trade-offs.

## Checklist

- [ ] Firebase Email/Password auth enabled
- [ ] `taoyeyang85-bit.github.io` in Firebase authorized domains
- [ ] Firestore rules deployed
- [ ] Service account imported into `backend/.env`
- [ ] GitHub Pages source set to **GitHub Actions**
- [ ] All `VITE_*` secrets added on GitHub
- [ ] Railway backend deployed with Firebase + CORS vars
- [ ] `VITE_API_BASE_URL` secret points to Railway URL
- [ ] Deploy workflow re-run successfully
