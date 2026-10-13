from typing import List, Dict, Any

def extract_txt_units(file_path: str) -> List[Dict[str, Any]]:
    """
    Extracts text / markdown files with section divisions.
    """
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    lines = content.splitlines()
    units = []
    current_title = "Overview"
    current_lines = []
    unit_idx = 1

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("# ") or stripped.startswith("## "):
            if current_lines:
                units.append({
                    "number": unit_idx,
                    "label": f"Section {unit_idx}",
                    "title": current_title,
                    "text": "\n".join(current_lines),
                    "topics": [],
                    "location": {
                        "page": unit_idx,
                        "section_heading": current_title
                    }
                })
                unit_idx += 1
                current_lines = []
            current_title = stripped.lstrip("#").strip()
        else:
            if stripped:
                current_lines.append(stripped)

    if current_lines:
        units.append({
            "number": unit_idx,
            "label": f"Section {unit_idx}",
            "title": current_title,
            "text": "\n".join(current_lines),
            "topics": [],
            "location": {
                "page": unit_idx,
                "section_heading": current_title
            }
        })
    return units
