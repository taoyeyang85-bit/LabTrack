import re
from typing import Optional

from app.models import Biomarker

BIOMARKER_ALIASES: dict[str, list[str]] = {
    "glucose": ["Glucose", "Blood Glucose", "Fasting Glucose"],
    "hemoglobin_a1c": ["Hemoglobin A1c", "HbA1c", "A1C", "A1c", "Hgb A1c"],
    "total_cholesterol": ["Total Cholesterol", "Cholesterol Total", "Cholesterol, Total"],
    "hdl_cholesterol": ["HDL Cholesterol", "HDL-C", "HDL", "HDL Chol"],
    "ldl_cholesterol": ["LDL Cholesterol", "LDL-C", "LDL", "LDL Chol"],
    "triglycerides": ["Triglycerides", "Triglyceride"],
    "vitamin_d": ["Vitamin D", "25-Hydroxy Vitamin D", "25(OH) Vitamin D", "Vit D"],
    "wbc": ["WBC", "White Blood Cell Count", "White Blood Cells", "Leukocytes"],
    "rbc": ["RBC", "Red Blood Cell Count", "Red Blood Cells", "Erythrocytes"],
    "hemoglobin": ["Hemoglobin", "Hgb", "HGB"],
    "hematocrit": ["Hematocrit", "Hct", "HCT"],
    "platelets": ["Platelets", "Platelet Count", "PLT"],
    "sodium": ["Sodium", "Na"],
    "potassium": ["Potassium", "K"],
    "calcium": ["Calcium", "Ca"],
    "creatinine": ["Creatinine"],
    "bun": ["BUN", "Blood Urea Nitrogen"],
    "alt": ["ALT", "Alanine Aminotransferase", "SGPT"],
    "ast": ["AST", "Aspartate Aminotransferase", "SGOT"],
    "tsh": ["TSH", "Thyroid Stimulating Hormone"],
}

DISPLAY_NAMES: dict[str, str] = {
    "glucose": "Glucose",
    "hemoglobin_a1c": "Hemoglobin A1c",
    "total_cholesterol": "Total Cholesterol",
    "hdl_cholesterol": "HDL Cholesterol",
    "ldl_cholesterol": "LDL Cholesterol",
    "triglycerides": "Triglycerides",
    "vitamin_d": "Vitamin D",
    "wbc": "WBC",
    "rbc": "RBC",
    "hemoglobin": "Hemoglobin",
    "hematocrit": "Hematocrit",
    "platelets": "Platelets",
    "sodium": "Sodium",
    "potassium": "Potassium",
    "calcium": "Calcium",
    "creatinine": "Creatinine",
    "bun": "BUN",
    "alt": "ALT",
    "ast": "AST",
    "tsh": "TSH",
}

ALIAS_TO_CANONICAL: dict[str, str] = {}
for canonical, aliases in BIOMARKER_ALIASES.items():
    for alias in aliases:
        ALIAS_TO_CANONICAL[alias.lower()] = canonical

UNIT_PATTERN = (
    r"(?:mg/dL|mmol/L|ng/mL|g/dL|%|IU/L|uIU/mL|"
    r"x10E3/uL|x10\^3/uL|x10E6/uL|x10\^6/uL|"
    r"10\^3/uL|10\^6/uL|K/uL|M/uL|fl|pg|mEq/L|"
    r"mmol/L|units/L|U/L)"
)

RANGE_PATTERNS = [
    re.compile(r"(?:reference\s*range|ref\.?\s*range|range)\s*:?\s*(.+)", re.I),
    re.compile(r"(\d+(?:\.\d+)?\s*(?:-|to)\s*\d+(?:\.\d+)?)"),
    re.compile(r"([<>]=?\s*\d+(?:\.\d+)?)"),
]


def _build_alias_pattern(alias: str) -> str:
    escaped = re.escape(alias)
    escaped = escaped.replace(r"\ ", r"\s+")
    return escaped


def _all_aliases_sorted() -> list[tuple[str, str]]:
    pairs = []
    for canonical, aliases in BIOMARKER_ALIASES.items():
        for alias in aliases:
            pairs.append((alias, canonical))
    pairs.sort(key=lambda x: len(x[0]), reverse=True)
    return pairs


def parse_reference_range(range_str: Optional[str]) -> tuple[Optional[float], Optional[float], Optional[str]]:
    if not range_str:
        return None, None, None

    cleaned = range_str.strip()
    cleaned = re.sub(r"^(reference\s*range|ref\.?\s*range|range)\s*:?\s*", "", cleaned, flags=re.I)
    cleaned = cleaned.strip()

    between = re.match(
        r"^(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)$",
        cleaned,
        re.I,
    )
    if between:
        low = float(between.group(1))
        high = float(between.group(2))
        return low, high, cleaned

    less = re.match(r"^<=?\s*(\d+(?:\.\d+)?)$", cleaned)
    if less:
        return None, float(less.group(1)), cleaned

    greater = re.match(r"^>=?\s*(\d+(?:\.\d+)?)$", cleaned)
    if greater:
        return float(greater.group(1)), None, cleaned

    return None, None, cleaned


def compute_status(
    value: Optional[float],
    reference_low: Optional[float],
    reference_high: Optional[float],
) -> str:
    if value is None:
        return "unknown"
    if reference_low is None and reference_high is None:
        return "unknown"
    if reference_low is not None and value < reference_low:
        return "low"
    if reference_high is not None and value > reference_high:
        return "high"
    return "normal"


def _extract_range_from_line(line: str, after_value: str) -> tuple[Optional[float], Optional[float], Optional[str]]:
    for pattern in RANGE_PATTERNS:
        match = pattern.search(after_value)
        if match:
            raw = match.group(1).strip()
            low, high, raw_clean = parse_reference_range(raw)
            if low is not None or high is not None:
                return low, high, raw_clean or raw
    return None, None, None


def _parse_line(line: str, alias: str, canonical: str) -> Optional[Biomarker]:
    alias_pat = _build_alias_pattern(alias)
    pattern = re.compile(
        rf"(?i){alias_pat}\s*:?\s*"
        rf"(\d+(?:\.\d+)?)\s*"
        rf"(?:([A-Za-z/%\^0-9]+(?:/[A-Za-z]+)?)\s*)?"
        rf"(.*)$"
    )
    match = pattern.search(line)
    if not match:
        pattern2 = re.compile(
            rf"(?i){alias_pat}\s*:?\s*"
            rf"(\d+(?:\.\d+)?)\s*"
            rf"({UNIT_PATTERN})?\s*"
            rf"(.*)$"
        )
        match = pattern2.search(line)
    if not match:
        return None

    raw_value = match.group(1)
    try:
        value = float(raw_value)
    except ValueError:
        value = None

    unit = None
    remainder = line[match.end(1):].strip()
    unit_match = re.search(UNIT_PATTERN, remainder, re.I)
    if unit_match:
        unit = unit_match.group(0)
        remainder = remainder[unit_match.end():].strip()
    elif match.lastindex and match.lastindex >= 2:
        potential_unit = match.group(2)
        if potential_unit and re.search(r"[a-z/%]", potential_unit, re.I):
            unit = potential_unit.strip()

    ref_low, ref_high, raw_range = _extract_range_from_line(line, remainder)
    if raw_range is None:
        ref_low, ref_high, raw_range = _extract_range_from_line(line, line)

    status = compute_status(value, ref_low, ref_high)
    needs_review = (
        value is None
        or unit is None
        or (ref_low is None and ref_high is None)
    )

    snippet_start = max(0, match.start() - 10)
    snippet_end = min(len(line), match.end() + 40)
    source_snippet = line[snippet_start:snippet_end].strip()

    return Biomarker(
        canonical_name=canonical,
        display_name=DISPLAY_NAMES.get(canonical, alias),
        value=value,
        raw_value=raw_value,
        unit=unit,
        reference_low=ref_low,
        reference_high=ref_high,
        raw_reference_range=raw_range,
        status=status,
        source_snippet=source_snippet,
        needs_review=needs_review,
    )


def parse_biomarkers(text: str) -> tuple[list[Biomarker], float]:
    lines = text.replace("\r\n", "\n").split("\n")
    full_text = "\n".join(lines)
    found: dict[str, Biomarker] = {}

    for alias, canonical in _all_aliases_sorted():
        if canonical in found:
            continue

        for line in lines:
            line = line.strip()
            if not line:
                continue
            if alias.lower() not in line.lower():
                continue
            biomarker = _parse_line(line, alias, canonical)
            if biomarker:
                found[canonical] = biomarker
                break

        if canonical not in found:
            alias_pat = _build_alias_pattern(alias)
            pattern = re.compile(
                rf"(?i){alias_pat}\s*:?\s*"
                rf"(\d+(?:\.\d+)?)\s*"
                rf"({UNIT_PATTERN})?\s*"
                rf"(?:reference\s*range|ref\.?\s*range|range)?\s*:?\s*"
                rf"(.+)?",
                re.MULTILINE,
            )
            match = pattern.search(full_text)
            if match:
                synthetic_line = match.group(0)
                biomarker = _parse_line(synthetic_line, alias, canonical)
                if biomarker:
                    found[canonical] = biomarker

    biomarkers = list(found.values())
    if not biomarkers:
        confidence = 0.0
    else:
        review_count = sum(1 for b in biomarkers if b.needs_review)
        confidence = max(0.1, 1.0 - (review_count / len(biomarkers)) * 0.5)

    return biomarkers, round(confidence, 2)


def generate_trend_message(
    display_name: str,
    current_value: Optional[float],
    previous: Optional[tuple[float, str, str]],
) -> Optional[str]:
    if current_value is None:
        return None
    if previous is None:
        return f"No previous value was found for {display_name}."
    prev_value, prev_date, _ = previous
    diff = current_value - prev_value
    if abs(diff) < 0.05:
        return f"Your {display_name} stayed about the same compared with your previous report ({prev_value} to {current_value})."
    direction = "increased" if diff > 0 else "decreased"
    return (
        f"Your {display_name} {direction} from {prev_value} to {current_value} "
        f"compared with your previous report."
    )
