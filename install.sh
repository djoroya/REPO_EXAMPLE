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

if conda env list | awk '{print $1}' | grep -q "^${ENV_NAME}$"; then
  echo "El entorno ${ENV_NAME} ya existe."
else
  conda env create -f environment.yml
fi

conda activate "${ENV_NAME}"

pushd frontend >/dev/null
npm install
popd >/dev/null

echo "Instalación completada." 
