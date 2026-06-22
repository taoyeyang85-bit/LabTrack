from __future__ import annotations

import base64
import json
import os
from typing import Any


def normalize_private_key(raw: str) -> str:
    """Normalize PEM private keys from .env / Railway / Render env vars."""
    if not raw:
        return ""

    key = raw.strip()

    if (key.startswith('"') and key.endswith('"')) or (key.startswith("'") and key.endswith("'")):
        key = key[1:-1].strip()

    # Railway and Render often store escaped newlines as the two-char sequence \n.
    if "\\n" in key:
        key = key.replace("\\n", "\n")

    # Some dashboards paste the key as a single line.
    if "-----BEGIN" in key and "\n" not in key:
        key = key.replace(
            "-----BEGIN PRIVATE KEY-----",
            "-----BEGIN PRIVATE KEY-----\n",
        ).replace(
            "-----END PRIVATE KEY-----",
            "\n-----END PRIVATE KEY-----",
        )

    key = key.strip()
    if key and not key.endswith("\n"):
        key += "\n"

    return key


def _service_account_from_base64(blob: str) -> dict[str, Any] | None:
    text = blob.strip()
    if not text:
        return None

    try:
        decoded = base64.b64decode(text).decode("utf-8")
    except (ValueError, UnicodeDecodeError):
        return None

    return _service_account_from_json_blob(decoded)


def _service_account_from_json_blob(blob: str) -> dict[str, Any] | None:
    text = blob.strip()
    if not text:
        return None

    if (text.startswith('"') and text.endswith('"')) or (text.startswith("'") and text.endswith("'")):
        text = text[1:-1].strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return None

    if data.get("type") != "service_account":
        return None

    private_key = normalize_private_key(data.get("private_key", ""))
    if not private_key:
        return None

    return {
        "type": "service_account",
        "project_id": data["project_id"],
        "private_key_id": data.get("private_key_id", "labtrack-key"),
        "private_key": private_key,
        "client_email": data["client_email"],
        "client_id": data.get("client_id", "labtrack-client"),
        "auth_uri": data.get("auth_uri", "https://accounts.google.com/o/oauth2/auth"),
        "token_uri": data.get("token_uri", "https://oauth2.googleapis.com/token"),
    }


def build_service_account_info(
    *,
    project_id: str,
    client_email: str,
    private_key: str,
    service_account_json: str = "",
    service_account_base64: str = "",
) -> dict[str, Any] | None:
    from_base64 = _service_account_from_base64(service_account_base64)
    if from_base64 is not None:
        return from_base64

    from_json = _service_account_from_json_blob(service_account_json)
    if from_json is not None:
        return from_json

    normalized_key = normalize_private_key(private_key)
    if not project_id or not client_email or not normalized_key:
        return None

    if "BEGIN PRIVATE KEY" not in normalized_key:
        return None

    return {
        "type": "service_account",
        "project_id": project_id,
        "private_key_id": "labtrack-key",
        "private_key": normalized_key,
        "client_email": client_email,
        "client_id": "labtrack-client",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
    }


def load_service_account_info() -> dict[str, Any] | None:
    project_id = os.getenv("FIREBASE_PROJECT_ID", "").strip()
    client_email = os.getenv("FIREBASE_CLIENT_EMAIL", "").strip()
    private_key = os.getenv("FIREBASE_PRIVATE_KEY", "")
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")
    service_account_base64 = os.getenv("FIREBASE_SERVICE_ACCOUNT_BASE64", "")

    return build_service_account_info(
        project_id=project_id,
        client_email=client_email,
        private_key=private_key,
        service_account_json=service_account_json,
        service_account_base64=service_account_base64,
    )


def get_credential_status() -> dict[str, Any]:
    project_id = os.getenv("FIREBASE_PROJECT_ID", "").strip()
    client_email = os.getenv("FIREBASE_CLIENT_EMAIL", "").strip()
    private_key = os.getenv("FIREBASE_PRIVATE_KEY", "").strip()
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
    service_account_base64 = os.getenv("FIREBASE_SERVICE_ACCOUNT_BASE64", "").strip()
    loaded = load_service_account_info()

    return {
        "configured": loaded is not None,
        "project_id": loaded.get("project_id") if loaded else project_id or None,
        "client_email": loaded.get("client_email") if loaded else client_email or None,
        "sources": {
            "service_account_base64": bool(service_account_base64),
            "service_account_json": bool(service_account_json),
            "private_key": bool(private_key),
            "client_email": bool(client_email),
            "project_id": bool(project_id),
        },
    }
