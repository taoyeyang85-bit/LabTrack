import json
import re
from typing import Optional

from app.config import get_settings
from app.models import Biomarker, Explanation
from app.parsing import generate_trend_message

DEFAULT_DOCTOR_QUESTIONS = [
    "Should I repeat any of these tests?",
    "Are any of these values concerning given my age, medical history, or medications?",
    "Which values should I monitor over time?",
    "Could any recent diet, exercise, illness, or medication changes affect these results?",
    "When should I schedule my next lab test?",
]


def _status_phrase(status: str) -> str:
    return {
        "high": "above the reference range shown on your report",
        "low": "below the reference range shown on your report",
        "normal": "within the reference range shown on your report",
        "unknown": "listed on your report, but the reference range was not clear enough to compare automatically",
    }.get(status, "listed on your report")


def _fallback_explanation(biomarker: Biomarker, trend_message: Optional[str] = None) -> Explanation:
    name = biomarker.display_name
    phrase = _status_phrase(biomarker.status)

    if biomarker.status == "unknown":
        message = (
            f"Your {name} is {phrase}. "
            f"Reference ranges vary by lab, age, sex, and medical history. "
            f"Please verify this value manually and discuss it with a licensed clinician if you have questions."
        )
    else:
        message = (
            f"Your {name} is {phrase}. "
            f"This does not diagnose a condition, but it may be worth discussing with a licensed clinician."
        )

    return Explanation(
        biomarker=name,
        status=biomarker.status,
        message=message,
        trend_message=trend_message,
    )


def _fallback_explanations(
    biomarkers: list[Biomarker],
    trend_messages: dict[str, Optional[str]],
    extraction_warnings: list[str],
) -> tuple[list[Explanation], list[str], list[str]]:
    explanations = [
        _fallback_explanation(b, trend_messages.get(b.canonical_name))
        for b in biomarkers
    ]
    warnings = list(extraction_warnings)
    review_count = sum(1 for b in biomarkers if b.needs_review)
    if review_count:
        warnings.append(
            f"{review_count} value(s) were extracted with low confidence and should be reviewed manually."
        )
    warnings.append(
        "Reference ranges vary by lab, age, sex, and medical history. Always consult a licensed clinician about your health decisions."
    )
    return explanations, DEFAULT_DOCTOR_QUESTIONS.copy(), warnings


def generate_explanations(
    biomarkers: list[Biomarker],
    trend_messages: dict[str, Optional[str]],
    extraction_warnings: list[str],
) -> tuple[list[Explanation], list[str], list[str]]:
    settings = get_settings()
    if not settings.openai_api_key:
        return _fallback_explanations(biomarkers, trend_messages, extraction_warnings)

    try:
        return _llm_explanations(biomarkers, trend_messages, extraction_warnings, settings)
    except ImportError:
        result = _fallback_explanations(biomarkers, trend_messages, extraction_warnings)
        explanations, questions, warnings = result
        warnings.insert(0, "OpenAI package not installed; rule-based explanations were used instead.")
        return explanations, questions, warnings
    except Exception:
        result = _fallback_explanations(biomarkers, trend_messages, extraction_warnings)
        explanations, questions, warnings = result
        warnings.insert(0, "LLM explanation was unavailable; rule-based explanations were used instead.")
        return explanations, questions, warnings


def _llm_explanations(
    biomarkers: list[Biomarker],
    trend_messages: dict[str, Optional[str]],
    extraction_warnings: list[str],
    settings,
) -> tuple[list[Explanation], list[str], list[str]]:
    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)

    biomarker_payload = [
        {
            "display_name": b.display_name,
            "canonical_name": b.canonical_name,
            "value": b.value,
            "unit": b.unit,
            "reference_low": b.reference_low,
            "reference_high": b.reference_high,
            "raw_reference_range": b.raw_reference_range,
            "status": b.status,
            "needs_review": b.needs_review,
            "trend_message": trend_messages.get(b.canonical_name),
        }
        for b in biomarkers
    ]

    system_prompt = """You are helping explain lab report values for patient education only.

You must not diagnose disease.
You must not recommend medication, dosage, treatment, or supplements.
You must not claim a result is safe or dangerous.
You must explain values based on the reference range shown on the report.
You must use simple language.
You must remind the user to discuss results with a licensed clinician.
You must output valid JSON only.

Output JSON in this exact shape:
{
  "explanations": [
    {
      "biomarker": "LDL cholesterol",
      "status": "high",
      "message": "Your LDL cholesterol is above the reference range shown on your report. LDL is often discussed with a clinician because it can relate to cardiovascular risk, but this result alone does not diagnose a condition."
    }
  ],
  "doctor_questions": ["question 1", "question 2", "question 3", "question 4", "question 5"],
  "warnings": ["warning 1"]
}

Include trend information in the message when trend_message is provided for a biomarker.
Generate exactly 5 doctor_questions.
Keep each explanation to 1-3 sentences."""

    user_prompt = json.dumps(
        {
            "biomarkers": biomarker_payload,
            "extraction_warnings": extraction_warnings,
        },
        indent=2,
    )

    response = client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content or "{}"
    parsed = json.loads(content)

    explanations = []
    for item in parsed.get("explanations", []):
        canonical = None
        for b in biomarkers:
            if b.display_name.lower() == item.get("biomarker", "").lower():
                canonical = b.canonical_name
                break
        trend = trend_messages.get(canonical) if canonical else None
        explanations.append(
            Explanation(
                biomarker=item.get("biomarker", "Unknown"),
                status=item.get("status", "unknown"),
                message=item.get("message", ""),
                trend_message=trend,
            )
        )

    if not explanations:
        return _fallback_explanations(biomarkers, trend_messages, extraction_warnings)

    doctor_questions = parsed.get("doctor_questions", DEFAULT_DOCTOR_QUESTIONS)
    if len(doctor_questions) < 5:
        doctor_questions = doctor_questions + DEFAULT_DOCTOR_QUESTIONS[len(doctor_questions):5]

    warnings = parsed.get("warnings", [])
    warnings.append(
        "Reference ranges vary by lab, age, sex, and medical history. Always consult a licensed clinician about your health decisions."
    )
    for w in extraction_warnings:
        if w not in warnings:
            warnings.append(w)

    return explanations[: len(biomarkers) + 5], doctor_questions[:5], warnings


def build_trend_messages(
    uid: str,
    biomarkers: list[Biomarker],
    exclude_report_id: str,
) -> dict[str, Optional[str]]:
    from app.firestore import get_previous_biomarker_value

    messages: dict[str, Optional[str]] = {}
    for b in biomarkers:
        previous = get_previous_biomarker_value(uid, b.canonical_name, exclude_report_id)
        messages[b.canonical_name] = generate_trend_message(b.display_name, b.value, previous)
    return messages
