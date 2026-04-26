import numpy as np


def extract_tongue_features(image: np.ndarray) -> dict[str, str | bool | float]:
    mean_rgb = image.mean(axis=(0, 1))
    center = image[image.shape[0] // 4 : image.shape[0] * 3 // 4, image.shape[1] // 4 : image.shape[1] * 3 // 4]
    center_mean = center.mean(axis=(0, 1))

    tongue_color = "pale_red"
    if mean_rgb[0] > 220 and mean_rgb[1] > 190:
        tongue_color = "red"
    elif mean_rgb[0] < 180:
        tongue_color = "pale"

    coating_color = "white" if float(center_mean.mean()) >= 210 else "yellow"
    coating_thickness = "thin" if float(center.std()) < 25 else "thick"
    moisture_level = "moist" if float(center_mean.mean()) >= 205 else "dry"

    return {
        "tongue_color": tongue_color,
        "coating_color": coating_color,
        "coating_thickness": coating_thickness,
        "tooth_marks": False,
        "cracks": False,
        "moisture_level": moisture_level,
        "feature_confidence": 0.72,
    }
