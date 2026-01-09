import numpy as np
from PIL import Image
import gradio as gr
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier


digits = load_digits()
X, y = digits.data, digits.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

mlp = MLPClassifier(hidden_layer_sizes=(32,), max_iter=300, random_state=42)
mlp.fit(X_train, y_train)


def preprocess_drawing(image: np.ndarray | Image.Image | None) -> np.ndarray | None:
    if image is None:
        return None

    if isinstance(image, np.ndarray):
        pil_image = Image.fromarray(image.astype("uint8"))
    else:
        pil_image = image

    pil_image = pil_image.convert("L")
    pil_image = pil_image.resize((8, 8), Image.Resampling.BILINEAR)
    pixels = np.array(pil_image)
    pixels = 255 - pixels
    pixels = (pixels / 255.0) * 16.0
    return pixels.reshape(1, -1)


def predict_digit(image: np.ndarray | Image.Image | None) -> tuple[str, dict[str, float]]:
    features = preprocess_drawing(image)
    if features is None:
        return "", {str(i): 0.0 for i in range(10)}

    probabilities = mlp.predict_proba(features)[0]
    prediction = int(np.argmax(probabilities))
    probability_map = {str(i): float(probabilities[i]) for i in range(10)}
    return str(prediction), probability_map


with gr.Blocks() as demo:
    gr.Markdown(
        """
        # Demo de clasificación de dígitos escritos a mano

        Dibuja un número del 0 al 9 en el panel izquierdo y revisa la predicción
        junto con las probabilidades de cada clase.
        """
    )

    with gr.Row():
        with gr.Column():
            sketchpad = gr.Image(
                source="canvas",
                tool="sketch",
                type="numpy",
                label="Dibuja un número",
            )
            gr.ClearButton([sketchpad], value="Limpiar dibujo")

        with gr.Column():
            prediction_output = gr.Textbox(label="Predicción final")
            probability_output = gr.Label(label="Probabilidades", num_top_classes=10)

    sketchpad.change(
        predict_digit,
        inputs=sketchpad,
        outputs=[prediction_output, probability_output],
    )


if __name__ == "__main__":
    demo.launch()
