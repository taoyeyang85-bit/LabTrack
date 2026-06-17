from __future__ import annotations

import io
from typing import Literal, Optional

from app.models import ExtractionMethod

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_TYPES = {"application/pdf", "image/png", "image/jpeg"}


def validate_file(filename: str, content_type: Optional[str], size: int, max_size: int) -> None:
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file type. Please upload a PDF, PNG, JPG, or JPEG file.")
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        raise ValueError("Unsupported file type. Please upload a PDF, PNG, JPG, or JPEG file.")
    if size > max_size:
        raise ValueError("File is too large. Maximum size is 10 MB.")


def extract_text_from_bytes(
    file_bytes: bytes, filename: str
) -> tuple[str, ExtractionMethod, list[str]]:
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    warnings: list[str] = []

    if ext == ".pdf":
        return _extract_from_pdf(file_bytes, warnings)
    if ext in {".png", ".jpg", ".jpeg"}:
        text = _ocr_image(file_bytes)
        if not text.strip():
            warnings.append("OCR could not extract readable text from this image.")
        return text, "ocr", warnings

    raise ValueError("Unsupported file type.")


def _extract_from_pdf(
    file_bytes: bytes, warnings: list[str]
) -> tuple[str, ExtractionMethod, list[str]]:
    text_parts: list[str] = []

    try:
        import fitz

        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text_parts.append(page_text)
        doc.close()
    except Exception:
        warnings.append("PyMuPDF extraction encountered an issue; trying pdfplumber.")

    if not "".join(text_parts).strip():
        try:
            import pdfplumber

            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
        except Exception:
            warnings.append("pdfplumber extraction failed.")

    combined = "\n".join(text_parts).strip()

    if len(combined) >= 100:
        return combined, "pdf_text", warnings

    ocr_parts: list[str] = []
    try:
        import fitz
        from PIL import Image

        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            pix = page.get_pixmap(dpi=200)
            img_bytes = pix.tobytes("png")
            ocr_text = _ocr_image(img_bytes)
            if ocr_text:
                ocr_parts.append(ocr_text)
        doc.close()
    except Exception:
        warnings.append("OCR fallback on PDF pages failed.")

    ocr_combined = "\n".join(ocr_parts).strip()
    if ocr_combined:
        method: Literal["ocr", "mixed"] = "mixed" if combined else "ocr"
        merged = (combined + "\n" + ocr_combined).strip() if combined else ocr_combined
        if not combined:
            warnings.append("PDF had little extractable text; OCR was used.")
        else:
            warnings.append("PDF text was limited; OCR supplemented extraction.")
        return merged, method, warnings

    warnings.append("Could not extract meaningful text from this PDF.")
    return combined or "", "pdf_text", warnings


def _ocr_image(image_bytes: bytes) -> str:
    try:
        import pytesseract
        from PIL import Image

        image = Image.open(io.BytesIO(image_bytes))
        return pytesseract.image_to_string(image)
    except Exception:
        return ""
