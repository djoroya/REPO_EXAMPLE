from __future__ import annotations

from pathlib import Path

import joblib
from sklearn.datasets import load_digits
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler


def train_model() -> MLPClassifier:
    digits = load_digits()
    pipeline = make_pipeline(
        StandardScaler(),
        MLPClassifier(
            hidden_layer_sizes=(64, 32),
            max_iter=500,
            random_state=42,
        ),
    )
    pipeline.fit(digits.data, digits.target)
    return pipeline


def load_or_train_model(model_path: Path):
    if model_path.exists():
        return joblib.load(model_path)

    model = train_model()
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    return model
