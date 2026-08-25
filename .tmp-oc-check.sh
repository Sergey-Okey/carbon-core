#!/bin/bash
set -euo pipefail
sleep 6
sudo -u ubuntuuser -H openclaw gateway status | grep -E 'Listening|Runtime|Connectivity|Probe' || true
TOKEN=$(sudo cat /home/ubuntuuser/.openclaw/gateway-token)
code=$(curl -sS --max-time 15 -o /tmp/oc.models -w "%{http_code}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  http://127.0.0.1:18789/v1/models || true)
echo "models_http:${code}"
python3 - <<'PY'
from pathlib import Path
p = Path("/tmp/oc.models")
text = p.read_text(encoding="utf-8", errors="replace") if p.exists() else ""
print(text[:300].replace("\n", " "))
PY
sudo grep -E '^(OPENAI_BASE_URL|OPENAI_MODEL|AI_ENGINE)=' /var/www/cof-board/.env
ss -ltn | grep 18789 || true
rm -f /tmp/oc.models
