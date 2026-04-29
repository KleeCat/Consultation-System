from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
DEMO_DIR = DATA_DIR / "demo"
CAPTURE_DIR = DEMO_DIR / "captures"


def seed_demo_data() -> dict:
    CAPTURE_DIR.mkdir(parents=True, exist_ok=True)

    demo_patients = [
        {"name": "演示患者甲", "gender": "female", "age": 28, "constitution": "qi_deficiency"},
        {"name": "演示患者乙", "gender": "male", "age": 36, "constitution": "yang_deficiency"},
        {"name": "演示患者丙", "gender": "female", "age": 42, "constitution": "qi_stagnation"},
    ]

    capture_files: list[str] = []
    for index, patient in enumerate(demo_patients, start=1):
        image = Image.new("RGB", (96, 96), color=(210 + index * 5, 180, 170))
        image_path = CAPTURE_DIR / f"demo-capture-{index}.png"
        image.save(image_path)
        capture_files.append(str(image_path.relative_to(BASE_DIR)))

    payload = {
        "patients": demo_patients,
        "capture_files": capture_files,
    }

    manifest_path = DEMO_DIR / "seed_manifest.json"
    manifest_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return payload


if __name__ == "__main__":
    result = seed_demo_data()
    print(json.dumps(result, ensure_ascii=False, indent=2))
