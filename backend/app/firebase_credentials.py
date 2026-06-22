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


def _json_load_error(blob: str) -> str | None:
    text = blob.strip()
    if not text:
        return "empty"
    if (text.startswith('"') and text.endswith('"')) or (text.startswith("'") and text.endswith("'")):
        text = text[1:-1].strip()
    try:
        json.loads(text)
        return None
    except json.JSONDecodeError as exc:
        return str(exc)


def diagnose_credential_issues() -> list[str]:
    issues: list[str] = []
    project_id = os.getenv("FIREBASE_PROJECT_ID", "").strip()
    client_email = os.getenv("FIREBASE_CLIENT_EMAIL", "").strip()
    private_key = os.getenv("FIREBASE_PRIVATE_KEY", "").strip()
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
    service_account_base64 = os.getenv("FIREBASE_SERVICE_ACCOUNT_BASE64", "").strip()

    if service_account_base64:
        if _service_account_from_base64(service_account_base64) is None:
            issues.append("FIREBASE_SERVICE_ACCOUNT_BASE64 is set but invalid.")
    elif service_account_json:
        json_error = _json_load_error(service_account_json)
        if json_error:
            issues.append(f"FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON ({json_error}).")
        elif _service_account_from_json_blob(service_account_json) is None:
            issues.append("FIREBASE_SERVICE_ACCOUNT_JSON is missing service_account fields or private key.")
    else:
        if not project_id:
            issues.append("FIREBASE_PROJECT_ID is missing.")
        if not client_email:
            issues.append("FIREBASE_CLIENT_EMAIL is missing.")
        elif not client_email.endswith(".iam.gserviceaccount.com"):
            issues.append(
                "FIREBASE_CLIENT_EMAIL must be the Firebase service-account email "
                "(ends with .iam.gserviceaccount.com), not a personal Gmail address."
            )
        if not private_key:
            issues.append("FIREBASE_PRIVATE_KEY is missing.")
        elif "BEGIN PRIVATE KEY" not in normalize_private_key(private_key):
            issues.append("FIREBASE_PRIVATE_KEY is not a valid PEM private key.")

    if (
        service_account_json
        and service_account_base64
        and _service_account_from_base64(service_account_base64) is None
        and _service_account_from_json_blob(service_account_json) is None
    ):
        issues.append("Remove broken FIREBASE_SERVICE_ACCOUNT_JSON / FIREBASE_PRIVATE_KEY and use only FIREBASE_SERVICE_ACCOUNT_BASE64.")

    return issues


def get_credential_status() -> dict[str, Any]:
    project_id = os.getenv("FIREBASE_PROJECT_ID", "").strip()
    client_email = os.getenv("FIREBASE_CLIENT_EMAIL", "").strip()
    private_key = os.getenv("FIREBASE_PRIVATE_KEY", "").strip()
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
    service_account_base64 = os.getenv("FIREBASE_SERVICE_ACCOUNT_BASE64", "").strip()
    loaded = load_service_account_info()
    issues = diagnose_credential_issues()

    return {
        "configured": loaded is not None,
        "project_id": loaded.get("project_id") if loaded else project_id or None,
        "client_email": loaded.get("client_email") if loaded else client_email or None,
        "issues": issues,
        "sources": {
            "service_account_base64": bool(service_account_base64),
            "service_account_json": bool(service_account_json),
            "private_key": bool(private_key),
            "client_email": bool(client_email),
            "project_id": bool(project_id),
        },
    }
