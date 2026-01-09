#!/usr/bin/env bash
set -euo pipefail

ENV_NAME="digits-gui"

if ! command -v conda >/dev/null 2>&1; then
  echo "Conda no está instalado. Instala Miniconda/Anaconda primero." >&2
  exit 1
fi

CONDA_BASE="$(conda info --base)"
# shellcheck disable=SC1091
source "${CONDA_BASE}/etc/profile.d/conda.sh"
conda activate "${ENV_NAME}"

python backend/app.py &
BACKEND_PID=$!

pushd frontend >/dev/null
npm run dev &
FRONTEND_PID=$!
popd >/dev/null

trap 'kill ${BACKEND_PID} ${FRONTEND_PID}' EXIT

wait
