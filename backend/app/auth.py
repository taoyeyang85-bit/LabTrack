from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.firebase_credentials import load_service_account_info

security = HTTPBearer(auto_error=False)

_firebase_app = None
_firebase_init_error: str | None = None


def _init_firebase():
    global _firebase_app, _firebase_init_error
    if _firebase_app is not None:
        return _firebase_app
    if _firebase_init_error is not None:
        return None

    service_account = load_service_account_info()
    if service_account is None:
        _firebase_init_error = "Firebase service account is not configured."
        return None

    import firebase_admin
    from firebase_admin import credentials

    if firebase_admin._apps:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app

    try:
        cred = credentials.Certificate(service_account)
        _firebase_app = firebase_admin.initialize_app(cred)
        return _firebase_app
    except Exception as exc:
        _firebase_init_error = (
            "Firebase credentials are invalid. On Railway, set FIREBASE_SERVICE_ACCOUNT_JSON "
            "to the full service-account JSON on one line, or paste FIREBASE_PRIVATE_KEY with "
            "\\n escaped newlines."
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=_firebase_init_error,
        ) from exc


async def get_current_uid(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> str:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token.",
        )

    app = _init_firebase()
    if app is None:
        detail = _firebase_init_error or "Authentication service is not configured."
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=detail,
        )

    from firebase_admin import auth

    try:
        decoded = auth.verify_id_token(credentials.credentials)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )

    uid = decoded.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )
    return uid
