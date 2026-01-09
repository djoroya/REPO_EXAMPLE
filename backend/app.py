import base64
import io
from typing import Dict, List

import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, ImageOps

from model import load_or_train_model, preprocess_image

app = Flask(__name__)
CORS(app)

model = load_or_train_model()


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})


def _decode_canvas_image(data_url: str) -> Image.Image:
    header, encoded = data_url.split(",", 1)
    if "base64" not in header:
        raise ValueError("Invalid image encoding")
    image_data = base64.b64decode(encoded)
    image = Image.open(io.BytesIO(image_data))
    return image


def _prepare_image(image: Image.Image) -> np.ndarray:
    grayscale = ImageOps.grayscale(image)
    inverted = ImageOps.invert(grayscale)
    resized = inverted.resize((8, 8), Image.BILINEAR)
    return np.array(resized)


@app.route("/predict", methods=["POST"])
def predict():
    payload = request.get_json(force=True)
    data_url = payload.get("image")
    if not data_url:
        return jsonify({"error": "Image payload is required."}), 400

    try:
        image = _decode_canvas_image(data_url)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    image_array = _prepare_image(image)
    features = preprocess_image(image_array)
    probabilities = model.predict_proba(features)[0]
    prediction = int(np.argmax(probabilities))

    response: Dict[str, List[Dict[str, float]]] = {
        "prediction": prediction,
        "probabilities": [
            {"digit": int(idx), "probability": float(prob)}
            for idx, prob in enumerate(probabilities)
        ],
    }
    return jsonify(response)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
