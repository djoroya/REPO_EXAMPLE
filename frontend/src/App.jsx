import { useEffect, useMemo, useRef, useState } from "react";

const CANVAS_SIZE = 280;
const GRID_SIZE = 8;
const DEFAULT_API = "http://localhost:5000";

function getApiUrl() {
  return import.meta.env.VITE_API_URL || DEFAULT_API;
}

function downsampleCanvas(canvas) {
  const offscreen = document.createElement("canvas");
  offscreen.width = GRID_SIZE;
  offscreen.height = GRID_SIZE;
  const ctx = offscreen.getContext("2d");
  ctx.drawImage(canvas, 0, 0, GRID_SIZE, GRID_SIZE);
  const { data } = ctx.getImageData(0, 0, GRID_SIZE, GRID_SIZE);
  const pixels = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    const row = [];
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const index = (y * GRID_SIZE + x) * 4;
      const value = data[index];
      row.push(value);
    }
    pixels.push(row);
  }
  return pixels;
}

export default function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [probabilities, setProbabilities] = useState(Array(10).fill(0));
  const [status, setStatus] = useState("Dibuja un número y presiona predecir.");

  const apiUrl = useMemo(() => getApiUrl(), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0f1115";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.lineWidth = 18;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ffffff";
  }, []);

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { offsetX, offsetY } = event.nativeEvent;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { offsetX, offsetY } = event.nativeEvent;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0f1115";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    setPrediction(null);
    setProbabilities(Array(10).fill(0));
    setStatus("Lienzo limpio. Dibuja un número.");
  };

  const handlePredict = async () => {
    const canvas = canvasRef.current;
    const pixels = downsampleCanvas(canvas);
    setStatus("Obteniendo predicción...");

    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixels }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error de servidor");
      }
      const data = await response.json();
      setPrediction(data.prediction);
      setProbabilities(data.probabilities);
      setStatus("Predicción actualizada.");
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>Reconocimiento de Dígitos</h1>
        <p>Modelo MLP entrenado con el dataset de dígitos de scikit-learn.</p>
      </header>
      <div className="app__content">
        <section className="panel panel--draw">
          <h2>Dibuja aquí</h2>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="draw-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <div className="button-row">
            <button type="button" onClick={clearCanvas}>
              Limpiar
            </button>
            <button type="button" className="primary" onClick={handlePredict}>
              Predecir
            </button>
          </div>
          <p className="status">{status}</p>
        </section>
        <section className="panel panel--results">
          <h2>Predicción</h2>
          <div className="prediction">
            <span className="prediction__label">Dígito:</span>
            <span className="prediction__value">
              {prediction === null ? "--" : prediction}
            </span>
          </div>
          <div className="probabilities">
            {probabilities.map((value, index) => (
              <div className="probability" key={index}>
                <span className="probability__digit">{index}</span>
                <div className="probability__bar">
                  <div
                    className="probability__fill"
                    style={{ width: `${(value * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="probability__value">
                  {(value * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <footer className="app__footer">
        <p>API activa en: {apiUrl}</p>
      </footer>
    </div>
  );
}
