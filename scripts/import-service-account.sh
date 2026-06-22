#!/usr/bin/env bash
# Import a Firebase service account JSON key into backend/.env
# Usage: ./scripts/import-service-account.sh path/to/serviceAccountKey.json

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 path/to/serviceAccountKey.json" >&2
  exit 1
fi

KEY_FILE="$1"
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/backend/.env"

if [[ ! -f "$KEY_FILE" ]]; then
  echo "File not found: $KEY_FILE" >&2
  exit 1
fi

python3 - "$KEY_FILE" "$ENV_FILE" <<'PY'
import json
import re
import sys
from pathlib import Path

key_path = Path(sys.argv[1])
env_path = Path(sys.argv[2])
data = json.loads(key_path.read_text())

project_id = data["project_id"]
client_email = data["client_email"]
private_key = data["private_key"].replace("\n", "\\n")

if env_path.exists():
    content = env_path.read_text()
else:
    content = Path(env_path.parent / ".env.example").read_text()

def upsert(name: str, value: str, text: str) -> str:
    pattern = rf"^{re.escape(name)}=.*$"
    line = f'{name}={value}'
    if re.search(pattern, text, flags=re.MULTILINE):
        return re.sub(pattern, line, text, flags=re.MULTILINE)
    return text.rstrip() + "\n" + line + "\n"

content = upsert("FIREBASE_PROJECT_ID", project_id, content)
content = upsert("FIREBASE_CLIENT_EMAIL", client_email, content)
content = upsert("FIREBASE_PRIVATE_KEY", f'"{private_key}"', content)

env_path.write_text(content)
print(f"Updated {env_path}")
print("Delete the downloaded JSON file after import — do not commit it.")
print()
print("For Railway, you can instead set one variable:")
print("  FIREBASE_SERVICE_ACCOUNT_JSON=<paste the full JSON on one line>")
PY
