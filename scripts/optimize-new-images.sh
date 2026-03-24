#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/4] Descargando imágenes remotas nuevas..."
node scripts/download-ref-images.mjs

if ! python3 - <<'PY' >/dev/null 2>&1
from PIL import Image
print('ok')
PY
then
  echo "Pillow no está instalado. Instálalo con: python3 -m pip install --user Pillow"
  exit 1
fi

echo "[2/4] Convirtiendo a WebP y preservando srcOriginal..."
python3 scripts/migrate-images-to-webp.py

echo "[3/4] Generando AVIF + srcset responsive..."
python3 scripts/build-responsive-image-formats.py

echo "[4/4] Validando ref2d.js..."
node --check ref2d.js

echo "Listo. Cambios de imágenes optimizadas aplicados en ref2d.js"
