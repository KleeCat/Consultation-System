from pathlib import Path

import yaml

from backend.app.core.config import BASE_DIR


ADVICE_TEMPLATES_PATH = BASE_DIR / "config" / "advice_templates.yaml"


def build_advice(primary_constitution: str) -> dict[str, str]:
    config = yaml.safe_load(ADVICE_TEMPLATES_PATH.read_text(encoding="utf-8"))
    template = config["advice"].get(primary_constitution, config["advice"]["default"])
    return {
        "diet_advice": template["diet_advice"],
        "routine_advice": template["routine_advice"],
        "emotion_advice": template["emotion_advice"],
    }
