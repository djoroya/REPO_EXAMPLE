import { useEffect, useRef, useState } from "react";
import "./App.css";

const EMPTY_PROBABILITIES = Array.from({ length: 10 }, (_, digit) => ({
  digit,
  probability: 0
}));

function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [probabilities, setProbabilities] = useState(EMPTY_PROBABILITIES);
  const [status, setStatus] = useState("Draw a digit and click Predict.");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#fff";
  }, []);

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const startDrawing = (event) => {
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCanvasPoint(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getCanvasPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    setPrediction(null);
    setProbabilities(EMPTY_PROBABILITIES);
    setStatus("Canvas cleared. Draw a digit.");
  };

  const sendPrediction = async () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");
    setStatus("Sending image for prediction...");
    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Prediction failed");
      }
      const data = await response.json();
      setPrediction(data.prediction);
      setProbabilities(data.probabilities);
      setStatus("Prediction complete.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Digit Recognition Demo</h1>
        <p>Draw a digit in the left panel and get model predictions instantly.</p>
      </header>
      <main className="panels">
        <section className="panel draw-panel">
          <h2>Draw your digit</h2>
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
          />
          <div className="controls">
            <button onClick={sendPrediction}>Predict</button>
            <button className="secondary" onClick={clearCanvas}>
              Clear
            </button>
          </div>
          <p className="status">{status}</p>
        </section>
        <section className="panel results-panel">
          <h2>Prediction</h2>
          <div className="prediction-box">
            {prediction === null ? (
              <span className="placeholder">No prediction yet</span>
            ) : (
              <span className="prediction">{prediction}</span>
            )}
          </div>
          <h3>Probabilities</h3>
          <ul className="probability-list">
            {probabilities.map((item) => (
              <li key={item.digit}>
                <span>Digit {item.digit}</span>
                <div className="bar">
                  <div
                    className="fill"
                    style={{ width: `${(item.probability * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="value">
                  {(item.probability * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
