from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

from app.auth import get_current_uid
from app.config import get_settings
from app.explanation import build_trend_messages, generate_explanations
from app.extraction import extract_text_from_bytes, validate_file
from app.firestore import get_report, list_reports, save_report
from app.models import Report, TrendPoint, TrendsResponse
from app.parsing import parse_biomarkers

app = FastAPI(title="LabTrack API", version="1.0.0")
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/reports/upload", response_model=Report)
async def upload_report(
    file: UploadFile = File(...),
    uid: str = Depends(get_current_uid),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file was provided.")

    file_bytes = await file.read()
    try:
        validate_file(
            file.filename,
            file.content_type,
            len(file_bytes),
            settings.max_upload_bytes,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    try:
        extracted_text, extraction_method, extraction_warnings = extract_text_from_bytes(
            file_bytes, file.filename
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if not extracted_text.strip():
        raise HTTPException(
            status_code=422,
            detail="We could not read text from this file. Try a clearer scan or photo, or enter values manually in a future version.",
        )

    biomarkers, parser_confidence = parse_biomarkers(extracted_text)
    if not biomarkers:
        extraction_warnings.append(
            "No common biomarkers were detected. The report format may not be supported yet."
        )

    report_id = str(uuid4())
    trend_messages = build_trend_messages(uid, biomarkers, report_id)
    explanations, doctor_questions, warnings = generate_explanations(
        biomarkers, trend_messages, extraction_warnings
    )
    warnings = list(dict.fromkeys(warnings + extraction_warnings))

    report_date = _guess_report_date(extracted_text)
    preview = extracted_text[: settings.raw_text_preview_length]

    report_data = {
        "id": report_id,
        "uid": uid,
        "original_filename": file.filename,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "report_date": report_date,
        "extraction_method": extraction_method,
        "raw_text_preview": preview,
        "biomarkers": [b.model_dump() for b in biomarkers],
        "explanations": [e.model_dump() for e in explanations],
        "doctor_questions": doctor_questions,
        "warnings": warnings,
        "parser_confidence": parser_confidence,
    }

    return save_report(uid, report_data)


@app.get("/api/reports", response_model=list[Report])
def get_reports(uid: str = Depends(get_current_uid)):
    return list_reports(uid)


@app.get("/api/reports/{report_id}", response_model=Report)
def get_one_report(report_id: str, uid: str = Depends(get_current_uid)):
    report = get_report(uid, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found.")
    return report


@app.get("/api/trends", response_model=TrendsResponse)
def get_trends(uid: str = Depends(get_current_uid)):
    reports = list_reports(uid)
    trends: dict[str, list[TrendPoint]] = {}

    for report in reversed(reports):
        date = report.report_date or report.uploaded_at[:10]
        for biomarker in report.biomarkers:
            if biomarker.value is None:
                continue
            point = TrendPoint(
                report_id=report.id,
                report_date=date,
                value=biomarker.value,
                unit=biomarker.unit,
            )
            trends.setdefault(biomarker.canonical_name, []).append(point)

    for key in trends:
        trends[key].sort(key=lambda p: p.report_date)

    return TrendsResponse(trends=trends)


def _guess_report_date(text: str) -> Optional[str]:
    patterns = [
        r"(?:collection|collected|report|test)\s*date\s*:?\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})",
        r"(?:collection|collected|report|test)\s*date\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{4})",
        r"(\d{4}-\d{2}-\d{2})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            raw = match.group(1)
            for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%m-%d-%Y", "%Y/%m/%d"):
                try:
                    return datetime.strptime(raw.replace("/", "-").replace(".", "-"), fmt.replace("/", "-")).strftime("%Y-%m-%d")
                except ValueError:
                    continue
    return None
