#!/usr/bin/env bash
set -euo pipefail

# Run ON the production VPS. Enables HTTPS for admin + sell without
# overwriting existing certbot SSL for api/app.
#
#   bash deploy/enable-https.sh

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/enable-https.sh"
  exit 1
fi

if ! command -v certbot >/dev/null 2>&1; then
  apt-get update
  apt-get install -y certbot python3-certbot-nginx
fi

echo "==> Issuing / renewing certificates for admin + sell"
certbot --nginx --non-interactive --agree-tos --keep-until-expiring \
  --redirect \
  -d admin.motora.dirshay.com \
  -d sell.motora.dirshay.com \
  --expand || certbot --nginx --non-interactive --agree-tos \
  --redirect \
  -d admin.motora.dirshay.com

nginx -t
systemctl reload nginx

echo
echo "Open:"
echo "  https://admin.motora.dirshay.com"
echo "  https://sell.motora.dirshay.com"
echo
echo "If certbot asks for email the first time, run:"
echo "  certbot --nginx -d admin.motora.dirshay.com -d sell.motora.dirshay.com"
