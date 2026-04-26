import numpy as np


def _normalize_score(value: float, max_value: float) -> float:
    return max(0.0, min(1.0, value / max_value))


def evaluate_image_quality(image: np.ndarray) -> dict[str, float | str]:
    gray = image.mean(axis=2)
    brightness_score = float(gray.mean() / 255.0)
    blur_score = _normalize_score(float(gray.std()), 64.0)
    position_score = 1.0

    quality_status = "usable"
    if brightness_score < 0.4 or blur_score < 0.05:
        quality_status = "poor"

    return {
        "quality_status": quality_status,
        "brightness_score": round(brightness_score, 4),
        "blur_score": round(blur_score, 4),
        "position_score": position_score,
    }
