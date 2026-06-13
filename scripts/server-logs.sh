#!/usr/bin/env bash
set -euo pipefail

echo "Deployment events"
echo "================="
journalctl -t cof-deploy-event -n 40 --no-pager -o short-iso

echo
echo "Application events"
echo "=================="
journalctl -u coreoflife.service -n 40 --no-pager -o short-iso

echo
echo "Database backup events"
echo "======================"
journalctl -u coreoflife-db-backup.service -n 20 --no-pager -o short-iso

echo
echo "Nginx errors"
echo "============"
tail -n 20 /var/log/nginx/error.log 2>/dev/null || true
