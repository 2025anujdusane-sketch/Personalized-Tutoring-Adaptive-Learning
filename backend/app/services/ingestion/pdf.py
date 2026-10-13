import pymupdf as fitz
from typing import List, Dict, Any

def extract_pdf_units(file_path: str) -> List[Dict[str, Any]]:
    """
    Extracts pages and textual content from a PDF document with exact page coordinates.
    """
    units = []
    doc = fitz.open(file_path)
    for page_idx in range(len(doc)):
        page_num = page_idx + 1
        page = doc[page_idx]
        text = page.get_text("text").strip()

        # If page has very little text, try OCR or note diagram presence
        image_list = page.get_images(full=True)
        has_diagram = len(image_list) > 0
        diagram_title = f"Page {page_num} Diagram" if has_diagram else None
        diagram_desc = f"Visual elements detected on page {page_num} with {len(image_list)} embedded figures." if has_diagram else None

        if not text and has_diagram:
            text = f"[Visual Page {page_num} containing {len(image_list)} architectural/concept diagrams]"

        if text:
            units.append({
                "number": page_num,
                "label": f"Page {page_num}",
                "title": f"Page {page_num} Content",
                "text": text,
                "topics": [],
                "diagramTitle": diagram_title,
                "diagramDescription": diagram_desc,
                "location": {
                    "page": page_num,
                    "section_heading": f"Page {page_num}"
                }
            })
    doc.close()
    return units
