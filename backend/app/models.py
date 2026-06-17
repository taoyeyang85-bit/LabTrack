from typing import Literal, Optional

from pydantic import BaseModel, Field


BiomarkerStatus = Literal["low", "normal", "high", "unknown"]
ExtractionMethod = Literal["pdf_text", "ocr", "mixed"]


class Biomarker(BaseModel):
    canonical_name: str
    display_name: str
    value: Optional[float] = None
    raw_value: str
    unit: Optional[str] = None
    reference_low: Optional[float] = None
    reference_high: Optional[float] = None
    raw_reference_range: Optional[str] = None
    status: BiomarkerStatus = "unknown"
    source_snippet: Optional[str] = None
    needs_review: bool = False


class Explanation(BaseModel):
    biomarker: str
    status: BiomarkerStatus
    message: str
    trend_message: Optional[str] = None


class Report(BaseModel):
    id: str
    uid: str
    original_filename: str
    uploaded_at: str
    report_date: Optional[str] = None
    extraction_method: ExtractionMethod
    raw_text_preview: str
    biomarkers: list[Biomarker] = Field(default_factory=list)
    explanations: list[Explanation] = Field(default_factory=list)
    doctor_questions: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    parser_confidence: float = 0.0


class TrendPoint(BaseModel):
    report_id: str
    report_date: str
    value: float
    unit: Optional[str] = None


class TrendsResponse(BaseModel):
    trends: dict[str, list[TrendPoint]]
