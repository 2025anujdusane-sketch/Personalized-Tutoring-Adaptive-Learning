import docx
from typing import List, Dict, Any

def extract_docx_units(file_path: str) -> List[Dict[str, Any]]:
    """
    Extracts sections and paragraphs from DOCX document.
    """
    doc = docx.Document(file_path)
    units = []
    current_heading = "Introduction"
    current_lines = []
    unit_idx = 1

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        if para.style.name.startswith("Heading"):
            if current_lines:
                units.append({
                    "number": unit_idx,
                    "label": f"Section {unit_idx}",
                    "title": current_heading,
                    "text": "\n".join(current_lines),
                    "topics": [],
                    "location": {
                        "page": unit_idx,
                        "section_heading": current_heading
                    }
                })
                unit_idx += 1
                current_lines = []
            current_heading = text
        else:
            current_lines.append(text)

    if current_lines:
        units.append({
            "number": unit_idx,
            "label": f"Section {unit_idx}",
            "title": current_heading,
            "text": "\n".join(current_lines),
            "topics": [],
            "location": {
                "page": unit_idx,
                "section_heading": current_heading
            }
        })
    return units
