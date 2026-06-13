#!/usr/bin/env bash
set -euo pipefail

REPOSITORY_URL="https://github.com/Sergey-Okey/carbon-core.git"
BRANCH="stable"
SOURCE_DIR="/var/www/coreoflife-source"
RUNTIME_DIR="/var/www/coreoflife-runtime"
STAGING_DIR="/var/www/coreoflife-staging"
PREVIOUS_DIR="/var/www/coreoflife-previous"
STATE_DIR="/var/lib/coreoflife-deploy"
STATE_FILE="$STATE_DIR/$BRANCH.sha"
LOCK_FILE="/run/lock/coreoflife-deploy.lock"

log_event() {
  local level="$1"
  local event="$2"
  shift 2
  logger -t coreoflife-deploy "level=$level event=$event $*"
  printf '%s level=%s event=%s %s\n' "$(date -u +%FT%TZ)" "$level" "$event" "$*"
}

deploy_failed() {
  local exit_code=$?
  log_event error deploy_failed "sha=${remote_sha:-unknown} exit_code=$exit_code"
  exit "$exit_code"
}

trap deploy_failed ERR

exec 9>"$LOCK_FILE"
flock -n 9 || exit 0

remote_sha="$(git ls-remote "$REPOSITORY_URL" "refs/heads/$BRANCH" | cut -f1)"
deployed_sha="$(cat "$STATE_FILE" 2>/dev/null || true)"

if [[ -n "$remote_sha" && "$remote_sha" == "$deployed_sha" ]]; then
  exit 0
fi

log_event info deploy_started "from=${deployed_sha:-none} to=$remote_sha"

if [[ ! -d "$SOURCE_DIR/.git" ]]; then
  git clone --branch "$BRANCH" --single-branch "$REPOSITORY_URL" "$SOURCE_DIR"
else
  git -C "$SOURCE_DIR" fetch --prune origin "$BRANCH"
  git -C "$SOURCE_DIR" reset --hard "origin/$BRANCH"
  git -C "$SOURCE_DIR" clean -fd
fi

install -m 750 -o root -g root "$SOURCE_DIR/scripts/deploy-server.sh" /usr/local/sbin/coreoflife-deploy
install -m 755 -o root -g root "$SOURCE_DIR/scripts/server-status.sh" /usr/local/bin/cof-status
install -m 755 -o root -g root "$SOURCE_DIR/scripts/server-logs.sh" /usr/local/bin/cof-logs
install -m 755 -o root -g root "$SOURCE_DIR/scripts/db-console.sh" /usr/local/bin/cof-db

cd "$SOURCE_DIR"
npm ci
npm test
node node_modules/nuxt/bin/nuxt.mjs prepare
npm run typecheck
npm run build

rm -rf "$STAGING_DIR"
install -d -m 755 "$STAGING_DIR"
rsync -a --delete .output/ "$STAGING_DIR/"
install -m 600 "$RUNTIME_DIR/.env" "$STAGING_DIR/.env"
install -m 755 "$RUNTIME_DIR/start.sh" "$STAGING_DIR/start.sh"

rm -rf "$PREVIOUS_DIR"
install -d -m 755 "$PREVIOUS_DIR"
rsync -a --delete "$RUNTIME_DIR/" "$PREVIOUS_DIR/"

systemctl stop coreoflife
rsync -a --delete "$STAGING_DIR/" "$RUNTIME_DIR/"
chown -R ubuntu:ubuntu "$RUNTIME_DIR"
chmod 755 "$RUNTIME_DIR"
chmod 600 "$RUNTIME_DIR/.env"
chmod 755 "$RUNTIME_DIR/start.sh"
systemctl start coreoflife

healthy=false
for _ in {1..20}; do
  if curl --fail --silent http://127.0.0.1:3000/api/health | grep -q '"status":"ok"'; then
    healthy=true
    break
  fi
  sleep 2
done

if [[ "$healthy" != true ]]; then
  log_event error health_check_failed "sha=$remote_sha action=rollback"
  systemctl stop coreoflife
  rsync -a --delete "$PREVIOUS_DIR/" "$RUNTIME_DIR/"
  chown -R ubuntu:ubuntu "$RUNTIME_DIR"
  chmod 755 "$RUNTIME_DIR"
  chmod 600 "$RUNTIME_DIR/.env"
  chmod 755 "$RUNTIME_DIR/start.sh"
  systemctl start coreoflife
  log_event warning rollback_completed "restored=${deployed_sha:-unknown}"
  exit 1
fi

install -d -m 755 "$STATE_DIR"
printf '%s\n' "$remote_sha" > "$STATE_FILE"
log_event info deploy_succeeded "sha=$remote_sha"
