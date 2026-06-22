from app.firebase_credentials import (
    build_service_account_info,
    normalize_private_key,
)

SAMPLE_KEY = """-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7
-----END PRIVATE KEY-----
"""


def test_normalize_private_key_from_escaped_newlines():
    escaped = SAMPLE_KEY.replace("\n", "\\n")
    normalized = normalize_private_key(escaped)
    assert normalized.startswith("-----BEGIN PRIVATE KEY-----\n")
    assert normalized.endswith("-----END PRIVATE KEY-----\n")


def test_normalize_private_key_from_quoted_value():
    escaped = SAMPLE_KEY.replace("\n", "\\n")
    quoted = f'"{escaped}"'
    normalized = normalize_private_key(quoted)
    assert "-----BEGIN PRIVATE KEY-----" in normalized
    assert "\n" in normalized


def test_normalize_private_key_from_single_line():
    single_line = SAMPLE_KEY.replace("\n", "")
    normalized = normalize_private_key(single_line)
    assert normalized.count("\n") >= 2


def test_build_service_account_info_from_json_blob():
    escaped_key = SAMPLE_KEY.replace("\n", "\\n")
    blob = (
        '{"type":"service_account","project_id":"labtrack-f1e40",'
        '"client_email":"firebase-adminsdk@test.iam.gserviceaccount.com",'
        f'"private_key":"{escaped_key}"}}'
    )
    info = build_service_account_info(
        project_id="",
        client_email="",
        private_key="",
        service_account_json=blob,
    )
    assert info is not None
    assert info["project_id"] == "labtrack-f1e40"
    assert info["private_key"].startswith("-----BEGIN PRIVATE KEY-----\n")
