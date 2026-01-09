#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

"${PROJECT_ROOT}/scripts/install.sh"

source "${PROJECT_ROOT}/.venv/bin/activate"

export FLASK_APP=backend/app.py

python "${PROJECT_ROOT}/backend/app.py" &
BACKEND_PID=$!

echo "Backend started with PID ${BACKEND_PID}."

cd "${PROJECT_ROOT}/frontend"
npm run dev -- --host
