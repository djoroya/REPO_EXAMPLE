from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List

import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score


@dataclass
class ModelBundle:
    classifier: MLPClassifier
    accuracy: float


def train_model(random_state: int = 42) -> ModelBundle:
    digits = load_digits()
    x, y = digits.data, digits.target

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=random_state, stratify=y
    )
    classifier = MLPClassifier(hidden_layer_sizes=(32,), max_iter=300, random_state=random_state)
    classifier.fit(x_train, y_train)

    y_pred = classifier.predict(x_test)
    accuracy = accuracy_score(y_test, y_pred)
    return ModelBundle(classifier=classifier, accuracy=accuracy)


def scale_pixels(pixels: np.ndarray) -> np.ndarray:
    max_value = pixels.max() if pixels.size else 0
    if max_value <= 1.0:
        scaled = pixels * 16.0
    else:
        scaled = pixels / 255.0 * 16.0
    return np.clip(scaled, 0.0, 16.0)


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    model_bundle = train_model()

    @app.get("/health")
    def health() -> Dict[str, Any]:
        return {"status": "ok", "accuracy": model_bundle.accuracy}

    @app.post("/predict")
    def predict() -> Any:
        payload = request.get_json(silent=True) or {}
        pixels = payload.get("pixels")
        if not isinstance(pixels, list) or len(pixels) != 8:
            return jsonify({"error": "pixels must be an 8x8 array"}), 400

        try:
            array = np.array(pixels, dtype=float)
        except ValueError:
            return jsonify({"error": "pixels must be numeric"}), 400

        if array.shape != (8, 8):
            return jsonify({"error": "pixels must be an 8x8 array"}), 400

        scaled = scale_pixels(array)
        flat = scaled.reshape(1, -1)
        probabilities = model_bundle.classifier.predict_proba(flat)[0]
        prediction = int(np.argmax(probabilities))

        return jsonify(
            {
                "prediction": prediction,
                "probabilities": probabilities.tolist(),
            }
        )

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
