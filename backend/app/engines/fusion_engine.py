from pathlib import Path

import yaml

from backend.app.core.config import BASE_DIR


TONGUE_RULES_PATH = BASE_DIR / "config" / "tongue_rules.yaml"


def fuse_scores(
    questionnaire_scores: dict[str, float],
    tongue_features: dict[str, str | bool | float],
) -> dict[str, float]:
    config = yaml.safe_load(TONGUE_RULES_PATH.read_text(encoding="utf-8"))
    fused = {key: float(value) for key, value in questionnaire_scores.items()}

    for rule_key in ("tongue_color", "coating_color"):
        feature_value = tongue_features.get(rule_key)
        if feature_value in config[rule_key]:
            for constitution, score in config[rule_key][feature_value].items():
                fused[constitution] = fused.get(constitution, 0.0) + float(score)

    return fused
