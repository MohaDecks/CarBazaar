#!/usr/bin/env bash
set -euo pipefail

# Run ON the production VPS after apps/pwa source is on the server:
#   bash deploy/pwa.sh
#
# If the PWA is not on GitHub yet, copy it from your laptop first:
#   rsync -avz --exclude node_modules --exclude dist \
#     /Volumes/O/CarBazaar/apps/pwa/ \
#     root@2.58.82.168:/var/www/html/CarBazaar/apps/pwa/

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ROOT/apps/pwa/package.json" ]]; then
  echo "ERROR: apps/pwa ma jirto. Copy / git pull ka hor."
  exit 1
fi

echo "==> Building Motora PWA"
npm install
npm run build -w @car-marketplace/types
npm run build -w @car-marketplace/utils
npm run build -w @car-marketplace/pwa

if [[ ! -f "$ROOT/apps/pwa/dist/index.html" ]]; then
  echo "ERROR: apps/pwa/dist/index.html ma dhismin."
  exit 1
fi

NGINX_SITE="/etc/nginx/sites-available/motora"
if [[ -f "$NGINX_SITE" ]]; then
  echo "==> Pointing nginx app.motora.dirshay.com at PWA dist"
  if grep -q "apps/mobile/dist" "$NGINX_SITE"; then
    sudo sed -i "s|apps/mobile/dist|apps/pwa/dist|g" "$NGINX_SITE"
  fi
  if ! grep -q "apps/pwa/dist" "$NGINX_SITE"; then
    echo "WARNING: nginx still has no apps/pwa/dist root. Check $NGINX_SITE"
  fi
  sudo nginx -t
  sudo systemctl reload nginx
fi

ENV_FILE="$ROOT/apps/api/.env.production"
if [[ -f "$ENV_FILE" ]]; then
  if ! grep -q "https://app.motora.dirshay.com" "$ENV_FILE"; then
    echo "==> Adding https://app.motora.dirshay.com to API CORS_ORIGIN"
    python3 - "$ENV_FILE" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
text = p.read_text()
needle = "https://app.motora.dirshay.com"
lines = []
for line in text.splitlines(True):
    if line.startswith("CORS_ORIGIN=") and needle not in line:
        line = line.rstrip("\n")
        if line.endswith(","):
            line = line + needle + "\n"
        else:
            line = line + "," + needle + "\n"
    lines.append(line)
p.write_text("".join(lines))
PY
    pm2 restart motora-api
  fi
fi

echo
echo "PWA is live at https://app.motora.dirshay.com"
echo "Google Console: add https://app.motora.dirshay.com to Authorized JavaScript origins"
