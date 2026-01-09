#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

if [[ ! -d ".venv" ]]; then
  echo "No se encontró .venv. Ejecuta primero ./scripts/install.sh"
  exit 1
fi

source .venv/bin/activate

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

python -m flask --app backend.app run --host 0.0.0.0 --port 5000 &
BACKEND_PID=$!

cd "$ROOT_DIR/frontend"
npm run dev -- --host 0.0.0.0
