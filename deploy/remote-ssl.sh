#!/usr/bin/env bash
set -euo pipefail

DOMAIN=cof-board.com
EMAIL="${CERTBOT_EMAIL:-admin@cof-board.com}"
SERVER_IP="$(curl -4 -s --max-time 10 ifconfig.me || curl -4 -s --max-time 10 icanhazip.com)"

echo "Server IP: ${SERVER_IP}"
for host in cof-board.com www.cof-board.com; do
  resolved="$(dig +short A "${host}" @8.8.8.8 | head -n1 || true)"
  echo "DNS ${host} @8.8.8.8 => ${resolved:-none}"
  if [[ "${resolved}" != "${SERVER_IP}" ]]; then
    echo "DNS for ${host} is not pointing to this server yet."
    exit 2
  fi
done

mkdir -p /var/www/certbot /var/www/cof-board/deploy/nginx
if [[ -f /var/www/cof-board/deploy/nginx/cof-board.com.conf ]]; then
  cp /var/www/cof-board/deploy/nginx/cof-board.com.conf /etc/nginx/sites-available/cof-board.com
fi
nginx -t
systemctl reload nginx

certbot certonly --webroot -w /var/www/certbot \
  -d cof-board.com -d www.cof-board.com \
  --email "${EMAIL}" --agree-tos --no-eff-email --non-interactive

cp /var/www/cof-board/deploy/nginx/cof-board.com.ssl.conf /etc/nginx/sites-available/cof-board.com
nginx -t
systemctl reload nginx
systemctl enable --now certbot.timer || true

echo SSL_OK
curl -sI https://cof-board.com | head -20 || true
