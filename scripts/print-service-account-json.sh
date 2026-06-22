#!/usr/bin/env bash
# Print a one-line Firebase service-account JSON for Railway / Render env vars.
# Usage: ./scripts/print-service-account-json.sh path/to/serviceAccountKey.json

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 path/to/serviceAccountKey.json" >&2
  exit 1
fi

python3 - "$1" <<'PY'
import base64
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
data = json.loads(path.read_text())
compact = json.dumps(data, separators=(",", ":"))
print(compact)
print()
print("Base64 for Railway variable FIREBASE_SERVICE_ACCOUNT_BASE64:")
print(base64.b64encode(compact.encode()).decode())
PY
