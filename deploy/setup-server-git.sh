#!/usr/bin/env bash
set -euo pipefail

ROOT="/var/www/cof-board"
APP_DIR="$ROOT/app"
REPO_URL="${COF_REPO_URL:-https://github.com/Sergey-Okey/carbon-core.git}"
BRANCH="${COF_DEPLOY_BRANCH:-stable}"
ENV_BACKUP="/tmp/cof-board.env.backup"

echo "==> backup .env"
if [[ -f "$ROOT/.env" ]]; then
  cp "$ROOT/.env" "$ENV_BACKUP"
fi

echo "==> cleanup old build artifacts in $ROOT"
rm -rf "$ROOT/public" "$ROOT/server" "$ROOT/nitro.json"
rm -rf "$ROOT/.output"

echo "==> clone or update repo"
if [[ -d "$APP_DIR/.git" ]]; then
  cd "$APP_DIR"
  git fetch origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
else
  rm -rf "$APP_DIR"
  sudo -u ubuntuuser git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$APP_DIR"
fi

echo "==> restore .env"
if [[ -f "$ENV_BACKUP" ]]; then
  install -m 600 -o ubuntuuser -g ubuntuuser "$ENV_BACKUP" "$ROOT/.env"
fi

echo "==> install deploy scripts"
install -m 755 "$APP_DIR/deploy/deploy-from-git.sh" "$ROOT/deploy-from-git.sh"
touch /var/log/cof-board-deploy.log
chown ubuntuuser:ubuntuuser /var/log/cof-board-deploy.log

if [[ ! -f "$ROOT/.webhook-secret" ]]; then
  openssl rand -hex 32 | tee "$ROOT/.webhook-secret" >/dev/null
  chmod 600 "$ROOT/.webhook-secret"
  chown root:root "$ROOT/.webhook-secret"
fi

echo "==> systemd units"
install -m 644 "$APP_DIR/deploy/systemd/cof-board.service" /etc/systemd/system/cof-board.service
install -m 644 "$APP_DIR/deploy/systemd/cof-board-webhook.service" /etc/systemd/system/cof-board-webhook.service
systemctl daemon-reload
systemctl enable cof-board cof-board-webhook

echo "==> nginx webhook location"
NGINX_SITE="/etc/nginx/sites-available/cof-board.com"
if ! grep -q 'location = /git-deploy' "$NGINX_SITE"; then
  sed -i '/location \/ {/i\
    location = /git-deploy {\
        proxy_pass http://127.0.0.1:9876/git-deploy;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Hub-Signature-256 $http_x_hub_signature_256;\
        proxy_set_header X-GitHub-Event $http_x_github_event;\
        proxy_set_header X-GitHub-Delivery $http_x_github_delivery;\
    }\
' "$NGINX_SITE"
  nginx -t
  systemctl reload nginx
fi

echo "==> first deploy"
bash "$ROOT/deploy-from-git.sh"

systemctl restart cof-board-webhook
systemctl --no-pager --full status cof-board | head -12
systemctl --no-pager --full status cof-board-webhook | head -12

echo
echo "DONE"
echo "Webhook secret: $(cat "$ROOT/.webhook-secret")"
echo "GitHub webhook URL: https://cof-board.com/git-deploy"
echo "Branch: $BRANCH"
