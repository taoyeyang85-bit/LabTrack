#!/usr/bin/env bash
# Set Firebase credentials on Railway from a local service-account JSON file.
# Usage: ./scripts/railway-set-firebase.sh path/to/serviceAccountKey.json

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 path/to/serviceAccountKey.json" >&2
  exit 1
fi

KEY_FILE="$1"
if [[ ! -f "$KEY_FILE" ]]; then
  echo "File not found: $KEY_FILE" >&2
  exit 1
fi

RAILWAY_CMD=(npx --yes @railway/cli)

if ! "${RAILWAY_CMD[@]}" whoami >/dev/null 2>&1; then
  echo "Log in to Railway first:"
  echo "  npx @railway/cli login"
  exit 1
fi

SERVICE_ARG="${RAILWAY_SERVICE:-}"
VAR_ARGS=()
if [[ -n "$SERVICE_ARG" ]]; then
  VAR_ARGS=(--service "$SERVICE_ARG")
fi

JSON_ONELINE="$(python3 - "$KEY_FILE" <<'PY'
import json
import sys
from pathlib import Path

print(json.dumps(json.loads(Path(sys.argv[1]).read_text()), separators=(",", ":")))
PY
)"

B64="$(printf '%s' "$JSON_ONELINE" | base64 | tr -d '\n')"
PROJECT_ID="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["project_id"])' "$KEY_FILE")"

echo "Removing broken split Firebase variables (if present)..."
for name in FIREBASE_CLIENT_EMAIL FIREBASE_PRIVATE_KEY FIREBASE_SERVICE_ACCOUNT_JSON; do
  "${RAILWAY_CMD[@]}" variables "${VAR_ARGS[@]}" delete "$name" >/dev/null 2>&1 || true
done

echo "Setting Firebase credentials for project $PROJECT_ID..."
"${RAILWAY_CMD[@]}" variables "${VAR_ARGS[@]}" set \
  "FIREBASE_SERVICE_ACCOUNT_BASE64=$B64" \
  "FIREBASE_PROJECT_ID=$PROJECT_ID" \
  "CORS_ORIGINS=https://taoyeyang85-bit.github.io,http://localhost:5173,http://127.0.0.1:5173"

echo "Done. Redeploy the Railway service, then check:"
echo "  curl https://labtrack-production-21c6.up.railway.app/health/firebase"
