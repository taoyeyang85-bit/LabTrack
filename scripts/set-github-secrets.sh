#!/usr/bin/env bash
# Push frontend build secrets to GitHub Actions from frontend/.env
# Requires: gh CLI authenticated (brew install gh && gh auth login)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/frontend/.env"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI first: brew install gh && gh auth login" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy frontend/.env.example and fill in values." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${VITE_API_BASE_URL:-}" || "$VITE_API_BASE_URL" == "http://localhost:8000" ]]; then
  read -r -p "Railway backend URL (e.g. https://labtrack-api.up.railway.app): " VITE_API_BASE_URL
fi

secrets=(
  VITE_FIREBASE_API_KEY
  VITE_FIREBASE_AUTH_DOMAIN
  VITE_FIREBASE_PROJECT_ID
  VITE_FIREBASE_STORAGE_BUCKET
  VITE_FIREBASE_MESSAGING_SENDER_ID
  VITE_FIREBASE_APP_ID
  VITE_API_BASE_URL
)

for name in "${secrets[@]}"; do
  value="${!name:-}"
  if [[ -z "$value" ]]; then
    echo "Missing $name in $ENV_FILE" >&2
    exit 1
  fi
  echo "Setting $name..."
  gh secret set "$name" --body "$value" --repo "$(gh repo view --json nameWithOwner -q .nameWithOwner)"
done

echo "Done. Re-run the Deploy Frontend workflow on GitHub."
