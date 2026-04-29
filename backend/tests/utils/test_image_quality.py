import numpy as np

from backend.app.utils.image_quality import evaluate_image_quality


def make_solid_image(value: int) -> np.ndarray:
    return np.full((48, 48, 3), value, dtype=np.uint8)


def test_brightness_score_marks_dark_image_as_poor():
    image = make_solid_image(value=20)
    quality = evaluate_image_quality(image)
    assert quality["quality_status"] == "poor"
    assert quality["brightness_score"] < 0.4
