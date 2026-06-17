from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from app.auth import _init_firebase
from app.models import Biomarker, Explanation, Report


def _get_db():
    _init_firebase()
    from firebase_admin import firestore

    return firestore.client()


def _report_ref(uid: str, report_id: str):
    return _get_db().collection("users").document(uid).collection("reports").document(report_id)


def _report_from_doc(doc_id: str, data: dict) -> Report:
    return Report(
        id=doc_id,
        uid=data.get("uid", ""),
        original_filename=data.get("original_filename", ""),
        uploaded_at=data.get("uploaded_at", ""),
        report_date=data.get("report_date"),
        extraction_method=data.get("extraction_method", "pdf_text"),
        raw_text_preview=data.get("raw_text_preview", ""),
        biomarkers=[Biomarker(**b) for b in data.get("biomarkers", [])],
        explanations=[Explanation(**e) for e in data.get("explanations", [])],
        doctor_questions=data.get("doctor_questions", []),
        warnings=data.get("warnings", []),
        parser_confidence=float(data.get("parser_confidence", 0.0)),
    )


def save_report(uid: str, report_data: dict) -> Report:
    report_id = report_data.get("id") or str(uuid4())
    report_data["id"] = report_id
    report_data["uid"] = uid
    if "uploaded_at" not in report_data:
        report_data["uploaded_at"] = datetime.now(timezone.utc).isoformat()

    _report_ref(uid, report_id).set(report_data)
    return _report_from_doc(report_id, report_data)


def get_report(uid: str, report_id: str) -> Optional[Report]:
    doc = _report_ref(uid, report_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    if data.get("uid") != uid:
        return None
    return _report_from_doc(doc.id, data)


def list_reports(uid: str) -> list[Report]:
    docs = (
        _get_db()
        .collection("users")
        .document(uid)
        .collection("reports")
        .order_by("uploaded_at", direction="DESCENDING")
        .stream()
    )
    reports = []
    for doc in docs:
        data = doc.to_dict()
        if data.get("uid") == uid:
            reports.append(_report_from_doc(doc.id, data))
    return reports


def get_previous_biomarker_value(
    uid: str, canonical_name: str, exclude_report_id: str
) -> Optional[tuple[float, str, str]]:
    reports = list_reports(uid)
    for report in reports:
        if report.id == exclude_report_id:
            continue
        for biomarker in report.biomarkers:
            if biomarker.canonical_name == canonical_name and biomarker.value is not None:
                date = report.report_date or report.uploaded_at[:10]
                return biomarker.value, date, report.id
    return None
