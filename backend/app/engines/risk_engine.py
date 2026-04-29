from pathlib import Path

import yaml

from backend.app.core.config import BASE_DIR


RISK_RULES_PATH = BASE_DIR / "config" / "risk_rules.yaml"


def calculate_risk(primary_constitution: str, quality_status: str) -> str:
    config = yaml.safe_load(RISK_RULES_PATH.read_text(encoding="utf-8"))
    if quality_status == "poor":
        return "medium"
    if primary_constitution in config["risk"]["high_constitutions"]:
        return "high"
    return config["risk"]["default"]
