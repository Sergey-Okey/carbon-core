#!/usr/bin/env python3
import json, os, secrets
from pathlib import Path

home = Path("/home/ubuntuuser")
cfg_path = home / ".openclaw" / "openclaw.json"
token_path = home / ".openclaw" / "gateway-token"
env_path = Path("/var/www/cof-board/.env")
token = secrets.token_hex(24)
data = json.loads(cfg_path.read_text(encoding="utf-8"))
data["gateway"]["auth"]["token"] = token
cfg_path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
os.chmod(cfg_path, 0o600)
token_path.write_text(token, encoding="utf-8")
os.chmod(token_path, 0o600)

lines = env_path.read_text(encoding="utf-8").splitlines()
out = []
for line in lines:
    if line.startswith("OPENAI_API_KEY="):
        out.append(f"OPENAI_API_KEY={token}")
    elif line.startswith("NUXT_OPENAI_API_KEY="):
        out.append(f"NUXT_OPENAI_API_KEY={token}")
    else:
        out.append(line)
env_path.write_text("\n".join(out) + "\n", encoding="utf-8")
print("token-rotated")
