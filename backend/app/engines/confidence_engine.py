from pathlib import Path

import yaml

from backend.app.core.config import BASE_DIR


CONFIDENCE_RULES_PATH = BASE_DIR / "config" / "confidence_rules.yaml"


def calculate_confidence(score_breakdown: dict[str, float], quality_status: str) -> str:
    config = yaml.safe_load(CONFIDENCE_RULES_PATH.read_text(encoding="utf-8"))
    scores = sorted(score_breakdown.values(), reverse=True)
    gap = (scores[0] - scores[1]) if len(scores) > 1 else scores[0]

    if quality_status == "poor":
        return "low"
    if gap >= config["confidence"]["high_gap"]:
        return "high"
    if gap >= config["confidence"]["medium_gap"]:
        return "medium"
    return "low"
