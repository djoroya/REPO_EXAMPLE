import { useEffect, useRef, useState } from "react";

const CANVAS_SIZE = 280;
const GRID_SIZE = 8;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [probabilities, setProbabilities] = useState({});
  const [status, setStatus] = useState("Listo para predecir.");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }, []);

  const startDrawing = (event) => {
    setIsDrawing(true);
    draw(event);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 18;
    ctx.lineCap = "round";

    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    setPrediction(null);
    setProbabilities({});
    setStatus("Lienzo limpio.");
  };

  const getPixels = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const data = imageData.data;
    const pixels = [];

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        let total = 0;
        for (let row = 0; row < CELL_SIZE; row += 1) {
          for (let col = 0; col < CELL_SIZE; col += 1) {
            const px = (y * CELL_SIZE + row) * CANVAS_SIZE + (x * CELL_SIZE + col);
            const idx = px * 4;
            total += data[idx];
          }
        }
        const avg = total / (CELL_SIZE * CELL_SIZE);
        const scaled = (avg / 255) * 16;
        pixels.push(Number(scaled.toFixed(2)));
      }
    }

    return pixels;
  };

  const handlePredict = async () => {
    setStatus("Enviando imagen...");
    const pixels = getPixels();

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ pixels })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al predecir.");
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setProbabilities(data.probabilities);
      setStatus("Predicción recibida.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const sortedProbs = Object.entries(probabilities).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return (
    <div className="app">
      <header>
        <h1>Reconocimiento de Dígitos</h1>
        <p>Escribe un número con el ratón y observa la predicción del modelo.</p>
      </header>
      <main className="panels">
        <section className="panel">
          <h2>Dibuja aquí</h2>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onMouseMove={draw}
          />
          <div className="actions">
            <button onClick={handlePredict}>Predecir</button>
            <button onClick={clearCanvas} className="secondary">
              Limpiar
            </button>
          </div>
          <p className="status">{status}</p>
        </section>
        <section className="panel">
          <h2>Resultado</h2>
          <div className="prediction">
            <span className="label">Predicción:</span>
            <span className="value">{prediction ?? "-"}</span>
          </div>
          <div className="probabilities">
            <h3>Probabilidades</h3>
            {sortedProbs.length === 0 && <p>Sin datos todavía.</p>}
            {sortedProbs.map(([digit, prob]) => (
              <div className="prob-row" key={digit}>
                <span className="digit">{digit}</span>
                <div className="bar">
                  <div
                    className="fill"
                    style={{ width: `${(prob * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="percent">{(prob * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
