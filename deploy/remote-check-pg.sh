#!/usr/bin/env bash
set -euo pipefail
systemctl is-active postgresql || true
command -v psql || true
sudo -u postgres psql -c 'SELECT version();' || true
ls -la /home/ubuntuuser/cof-db-credentials /root/cof-db-credentials 2>&1 || true
