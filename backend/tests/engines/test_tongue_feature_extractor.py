import numpy as np

from backend.app.engines.tongue_feature_extractor import extract_tongue_features


def make_demo_tongue_image() -> np.ndarray:
    image = np.zeros((64, 64, 3), dtype=np.uint8)
    image[:, :] = [210, 180, 170]
    image[16:48, 16:48] = [230, 225, 215]
    return image


def test_feature_extractor_outputs_displayable_fields():
    image = make_demo_tongue_image()
    result = extract_tongue_features(image)
    assert result["tongue_color"] == "pale_red"
    assert result["coating_color"] == "white"
