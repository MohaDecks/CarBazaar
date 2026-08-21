#!/usr/bin/env bash
set -euo pipefail

# Run this ONCE on the production VPS from the project root:
#   bash deploy/setup-server.sh

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE_AVAILABLE="/etc/nginx/sites-available/motora"
SITE_ENABLED="/etc/nginx/sites-enabled/motora"

echo "==> Project: $ROOT"

if [[ ! -f "$ROOT/apps/api/.env.production" ]]; then
  echo "ERROR: apps/api/.env.production ma jirto."
  echo "Samee ka hor intaadan dhaqaaqin (ama copy .env.production.example)."
  exit 1
fi

echo "==> Installing Node deps + building"
cd "$ROOT"
npm install
NODE_ENV=production npm run build

echo "==> Installing PM2 if needed"
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

echo "==> Starting apps with PM2"
pm2 delete motora-api motora-web motora-admin >/dev/null 2>&1 || true
pm2 start "$ROOT/ecosystem.config.cjs"
pm2 save

echo "==> Installing nginx site"
if [[ "$(id -u)" -ne 0 ]]; then
  echo "Nginx copy needs sudo:"
  sudo cp "$ROOT/deploy/nginx/motora.conf" "$SITE_AVAILABLE"
  sudo ln -sfn "$SITE_AVAILABLE" "$SITE_ENABLED"
  sudo nginx -t
  sudo systemctl reload nginx
else
  cp "$ROOT/deploy/nginx/motora.conf" "$SITE_AVAILABLE"
  ln -sfn "$SITE_AVAILABLE" "$SITE_ENABLED"
  nginx -t
  systemctl reload nginx
fi

echo
echo "Apps are running. Point DNS A records to this server:"
echo "  sell.motora.dirshay.com"
echo "  admin.motora.dirshay.com"
echo "  api.motora.dirshay.com"
echo
echo "Then enable HTTPS:"
echo "  sudo certbot --nginx -d sell.motora.dirshay.com -d admin.motora.dirshay.com -d api.motora.dirshay.com"
echo
echo "Check:"
echo "  pm2 status"
echo "  curl -s http://127.0.0.1:4000/api/health"
