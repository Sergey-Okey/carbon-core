#!/bin/bash
set -euo pipefail
export HOME=/home/ubuntuuser
export OPENCLAW_NO_RESPAWN=1
export NODE_COMPILE_CACHE=/var/tmp/openclaw-compile-cache
mkdir -p "$NODE_COMPILE_CACHE" "$HOME/.openclaw"
chown -R ubuntuuser:ubuntuuser "$HOME/.openclaw" /var/tmp/openclaw-compile-cache 2>/dev/null || true

TOKEN="$(openssl rand -hex 24)"
umask 077
printf '%s' "$TOKEN" > "$HOME/.openclaw/gateway-token"
chown ubuntuuser:ubuntuuser "$HOME/.openclaw/gateway-token"
chmod 600 "$HOME/.openclaw/gateway-token"

loginctl enable-linger ubuntuuser

sudo -u ubuntuuser -H env HOME=/home/ubuntuuser OPENCLAW_NO_RESPAWN=1 \
  NODE_COMPILE_CACHE=/var/tmp/openclaw-compile-cache \
  openclaw onboard --non-interactive --accept-risk --skip-health \
    --auth-choice skip \
    --skip-channels --skip-skills --skip-search --skip-ui --skip-hooks \
    --install-daemon \
    --gateway-bind loopback \
    --gateway-auth token \
    --gateway-token "$TOKEN" \
    --suppress-gateway-token-output

echo ONBOARD_DONE
openclaw --version
sudo -u ubuntuuser -H openclaw gateway status || true
