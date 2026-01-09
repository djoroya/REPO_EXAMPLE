from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

from model_utils import load_or_train_model


MODEL_PATH = Path(__file__).with_name("digits_mlp.pkl")

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

model = load_or_train_model(MODEL_PATH)


def _validate_payload(payload: dict[str, Any]) -> np.ndarray:
    if "pixels" not in payload:
        raise ValueError("Missing 'pixels' in request body.")
    pixels = payload["pixels"]
    if not isinstance(pixels, list) or len(pixels) != 64:
        raise ValueError("'pixels' must be a list of 64 values.")
    array = np.array(pixels, dtype=np.float32)
    if array.shape != (64,):
        raise ValueError("'pixels' must represent an 8x8 image.")
    array = np.clip(array, 0.0, 16.0)
    return array


@app.route("/health", methods=["GET"])
def health() -> tuple[Any, int]:
    return jsonify({"status": "ok"}), 200


@app.route("/predict", methods=["POST"])
def predict() -> tuple[Any, int]:
    try:
        payload = request.get_json(force=True)
        pixels = _validate_payload(payload)
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": str(exc)}), 400

    probabilities = model.predict_proba(pixels.reshape(1, -1))[0]
    predicted = int(np.argmax(probabilities))

    response = {
        "prediction": predicted,
        "probabilities": {str(idx): float(prob) for idx, prob in enumerate(probabilities)},
    }
    return jsonify(response), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
