#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${COF_APP_DIR:-/var/www/cof-board/app}"
ENV_FILE="${COF_ENV_FILE:-/var/www/cof-board/.env}"
BRANCH="${COF_DEPLOY_BRANCH:-stable}"
LOG_FILE="${COF_DEPLOY_LOG:-/var/log/cof-board-deploy.log}"
LOCK_FILE="/tmp/cof-board-deploy.lock"
APP_USER="${COF_APP_USER:-ubuntuuser}"

exec >>"$LOG_FILE" 2>&1
echo "=== deploy $(date -Is) branch=$BRANCH ==="

if ! flock -n 9; then
  echo "Deploy already running, skip"
  exit 0
fi 9>"$LOCK_FILE"

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "Missing git repo at $APP_DIR"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file at $ENV_FILE"
  exit 1
fi

sudo -u "$APP_USER" git -C "$APP_DIR" fetch origin "$BRANCH"
sudo -u "$APP_USER" git -C "$APP_DIR" reset --hard "origin/$BRANCH"

sudo -u "$APP_USER" bash -lc "
  set -euo pipefail
  cd '$APP_DIR'
  set -a
  source '$ENV_FILE'
  set +a
  export NODE_ENV=production
  export NUXT_PUBLIC_WEB_APP_URL=\"\${NUXT_PUBLIC_WEB_APP_URL:-https://cof-board.com}\"
  npm ci
  npm run build
  cd .output/server
  npm install --omit=dev --no-audit --no-fund
"

systemctl restart cof-board
sleep 2

if curl -sf http://127.0.0.1:3000/api/health >/dev/null; then
  echo "Deploy OK $(date -Is)"
else
  echo "Deploy finished but health check failed $(date -Is)"
  exit 1
fi
