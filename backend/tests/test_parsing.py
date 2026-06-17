import pytest

from app.parsing import parse_biomarkers, parse_reference_range, compute_status


def _find(biomarkers, canonical_name):
    for b in biomarkers:
        if b.canonical_name == canonical_name:
            return b
    raise AssertionError(f"Biomarker {canonical_name} not found")


def test_normal_range():
    text = "Glucose 91 mg/dL Reference Range 70-99"
    biomarkers, _ = parse_biomarkers(text)
    glucose = _find(biomarkers, "glucose")
    assert glucose.status == "normal"
    assert glucose.reference_low == 70
    assert glucose.reference_high == 99


def test_less_than_range():
    text = "LDL Cholesterol 132 mg/dL Reference Range <100"
    biomarkers, _ = parse_biomarkers(text)
    ldl = _find(biomarkers, "ldl_cholesterol")
    assert ldl.status == "high"
    assert ldl.reference_high == 100
    assert ldl.reference_low is None


def test_greater_than_range():
    text = "HDL Cholesterol 52 mg/dL Reference Range >40"
    biomarkers, _ = parse_biomarkers(text)
    hdl = _find(biomarkers, "hdl_cholesterol")
    assert hdl.status == "normal"
    assert hdl.reference_low == 40
    assert hdl.reference_high is None


def test_missing_range():
    text = "Vitamin D 24 ng/mL"
    biomarkers, _ = parse_biomarkers(text)
    vit_d = _find(biomarkers, "vitamin_d")
    assert vit_d.status == "unknown"
    assert vit_d.needs_review is True


def test_alias_mapping():
    text = "HbA1c 5.4 % Reference Range 4.8-5.6"
    biomarkers, _ = parse_biomarkers(text)
    a1c = _find(biomarkers, "hemoglobin_a1c")
    assert a1c.canonical_name == "hemoglobin_a1c"
    assert a1c.status == "normal"


def test_cbc_values():
    text = (
        "WBC 6.1 x10E3/uL Reference Range 3.4-10.8\n"
        "RBC 5.0 x10E6/uL Reference Range 4.14-5.80"
    )
    biomarkers, _ = parse_biomarkers(text)
    wbc = _find(biomarkers, "wbc")
    rbc = _find(biomarkers, "rbc")
    assert wbc.value == 6.1
    assert rbc.value == 5.0


def test_parse_reference_range_between():
    low, high, _ = parse_reference_range("70-99")
    assert low == 70
    assert high == 99


def test_compute_status_high():
    assert compute_status(132, None, 100) == "high"


def test_sample_fixture():
    with open("fixtures/sample_lab_report.txt") as f:
        text = f.read()
    biomarkers, confidence = parse_biomarkers(text)
    assert len(biomarkers) >= 10
    assert confidence > 0
