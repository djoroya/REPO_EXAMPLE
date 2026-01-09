# Handwritten Digits Neural Network Demo

This repository contains a small, beginner-friendly Jupyter Notebook that trains a simple neural network on scikit-learn's built-in digits dataset. It also includes a Flask + React demo that lets you draw digits and view live predictions from the same model family.

## How to run
1. Install dependencies (scikit-learn and matplotlib). These are often included in common Python environments. If needed, install them with:
   ```bash
   pip install scikit-learn matplotlib
   ```
2. Open the notebook:
   ```bash
   jupyter notebook digits_mlp_demo.ipynb
   ```
3. Run the cells from top to bottom to load the data, visualize sample digits, train the model, and view predictions.

## Flask + React demo
### Install dependencies
Run the installer script to set up the Python virtual environment and install the frontend dependencies:
```bash
./scripts/install.sh
```

### Initialize the project
Run the initialization script to start the backend and frontend in development mode:
```bash
./scripts/init_project.sh
```

The React app runs on `http://localhost:5173`, and the Flask API runs on `http://localhost:5000`.
