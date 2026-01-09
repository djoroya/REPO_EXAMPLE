from pathlib import Path

import joblib
import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

MODEL_PATH = Path(__file__).resolve().parent / "model.joblib"


def train_model(random_state: int = 7) -> MLPClassifier:
    digits = load_digits()
    x_train, x_val, y_train, y_val = train_test_split(
        digits.data,
        digits.target,
        test_size=0.2,
        random_state=random_state,
        stratify=digits.target,
    )
    model = MLPClassifier(
        hidden_layer_sizes=(64,),
        activation="relu",
        solver="adam",
        max_iter=300,
        random_state=random_state,
    )
    model.fit(x_train, y_train)
    accuracy = model.score(x_val, y_val)
    print(f"Model validation accuracy: {accuracy:.4f}")
    return model


def load_or_train_model() -> MLPClassifier:
    try:
        model = joblib.load(MODEL_PATH)
        return model
    except FileNotFoundError:
        model = train_model()
        joblib.dump(model, MODEL_PATH)
        return model


def preprocess_image(image_array: np.ndarray) -> np.ndarray:
    """Normalize a 8x8 image array to match the digits dataset (0-16)."""
    image_array = image_array.astype(np.float32)
    image_array = (image_array / 255.0) * 16.0
    return image_array.reshape(1, -1)
