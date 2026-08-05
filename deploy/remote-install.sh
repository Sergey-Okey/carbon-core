#!/usr/bin/env bash
set -euo pipefail

rm -rf /var/www/cof-board/.output
tar -xzf /tmp/release.tgz -C /var/www/cof-board
install -m 600 -o ubuntuuser -g ubuntuuser /tmp/.env.production /var/www/cof-board/.env
chown -R ubuntuuser:ubuntuuser /var/www/cof-board
test -f /var/www/cof-board/.output/server/index.mjs

cd /var/www/cof-board/.output/server
npm install --omit=dev --no-audit --no-fund

systemctl daemon-reload
systemctl enable cof-board
systemctl restart cof-board
sleep 2
systemctl --no-pager --full status cof-board || true

echo '--- health ---'
curl -s http://127.0.0.1:3000/api/health || true
echo
echo '--- providers ---'
curl -s http://127.0.0.1:3000/api/auth/providers || true
echo
echo DONE
