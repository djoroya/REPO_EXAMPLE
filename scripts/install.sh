#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

python3 -m venv "${PROJECT_ROOT}/.venv"
source "${PROJECT_ROOT}/.venv/bin/activate"

pip install --upgrade pip
pip install -r "${PROJECT_ROOT}/backend/requirements.txt"

if [ -f "${PROJECT_ROOT}/frontend/package.json" ]; then
  cd "${PROJECT_ROOT}/frontend"
  npm install
fi

echo "Installation complete."
