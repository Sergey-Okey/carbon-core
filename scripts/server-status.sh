#!/usr/bin/env bash
set -euo pipefail

REPOSITORY_URL="https://github.com/Sergey-Okey/carbon-core.git"
BRANCH="stable"
STATE_FILE="/var/lib/coreoflife-deploy/$BRANCH.sha"

deployed_sha="$(cat "$STATE_FILE" 2>/dev/null || true)"
remote_sha="$(git ls-remote "$REPOSITORY_URL" "refs/heads/$BRANCH" | cut -f1)"

echo "Core of Life"
echo "============"
printf "Installed commit: %s\n" "${deployed_sha:-unknown}"
printf "GitHub commit:    %s\n" "${remote_sha:-unavailable}"

if [[ -n "$deployed_sha" && "$deployed_sha" == "$remote_sha" ]]; then
  echo "Deployment:       up to date"
else
  echo "Deployment:       waiting or failed"
fi

echo
echo "Services"
for service in coreoflife nginx postgresql coreoflife-deploy.timer coreoflife-db-backup.timer; do
  printf "%-28s %s\n" "$service" "$(systemctl is-active "$service" 2>/dev/null || true)"
done

echo
echo "Backend"
curl --fail --silent http://127.0.0.1:3000/api/health || echo "unavailable"

echo
echo "Recent deployment events"
journalctl -t coreoflife-deploy -n 10 --no-pager -o cat 2>/dev/null || true
