#!/usr/bin/env bash
set -euo pipefail

echo "Deployment events"
echo "================="
journalctl -t coreoflife-deploy -n 40 --no-pager -o short-iso

echo
echo "Application events"
echo "=================="
journalctl -u coreoflife.service -n 40 --no-pager -o short-iso
