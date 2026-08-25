#!/usr/bin/env python3
import json
import os
import secrets
from pathlib import Path

home = Path("/home/ubuntuuser")
cfg_path = home / ".openclaw" / "openclaw.json"
token_path = home / ".openclaw" / "gateway-token"
env_path = Path("/var/www/cof-board/.env")

token = secrets.token_hex(24)
data = json.loads(cfg_path.read_text(encoding="utf-8"))
data.setdefault("gateway", {})
data["gateway"]["bind"] = "loopback"
data["gateway"]["port"] = 18789
data["gateway"].setdefault("auth", {})
data["gateway"]["auth"]["mode"] = "token"
data["gateway"]["auth"]["token"] = token
data["gateway"].setdefault("http", {}).setdefault("endpoints", {}).setdefault(
    "chatCompletions", {}
)
data["gateway"]["http"]["endpoints"]["chatCompletions"]["enabled"] = True
data.setdefault("tools", {})
data["tools"]["profile"] = "minimal"
data["tools"]["deny"] = [
    "group:runtime",
    "group:fs",
    "group:web",
    "browser",
    "exec",
    "write",
    "edit",
]
data.setdefault("agents", {}).setdefault("defaults", {})
data["agents"]["defaults"]["workspace"] = str(home / ".openclaw" / "workspace")
cfg_path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
os.chmod(cfg_path, 0o600)
token_path.write_text(token, encoding="utf-8")
os.chmod(token_path, 0o600)

env = env_path.read_text(encoding="utf-8")
lines = env.splitlines()
keys = {}
for line in lines:
    if "=" in line and not line.strip().startswith("#"):
        k, v = line.split("=", 1)
        keys[k] = v

or_key = keys.get("OPENROUTER_API_KEY") or ""
openai_key = keys.get("OPENAI_API_KEY") or keys.get("NUXT_OPENAI_API_KEY") or ""
if openai_key.startswith("sk-or-v1") and not or_key:
    keys["OPENROUTER_API_KEY"] = openai_key

keys["AI_ENGINE"] = "openai"
keys["NUXT_AI_ENGINE"] = "openai"
keys["OPENAI_BASE_URL"] = "http://127.0.0.1:18789/v1"
keys["NUXT_OPENAI_BASE_URL"] = "http://127.0.0.1:18789/v1"
keys["OPENAI_MODEL"] = "openclaw/default"
keys["NUXT_OPENAI_MODEL"] = "openclaw/default"
keys["OPENAI_API_KEY"] = token
keys["NUXT_OPENAI_API_KEY"] = token

seen = set()
out = []
for line in lines:
    if "=" in line and not line.strip().startswith("#"):
        k = line.split("=", 1)[0]
        if k in keys:
            out.append(f"{k}={keys[k]}")
            seen.add(k)
            continue
    out.append(line)
for k, v in keys.items():
    if k not in seen:
        out.append(f"{k}={v}")
env_path.write_text("\n".join(out) + "\n", encoding="utf-8")
os.chmod(env_path, 0o600)
print("config-updated")
print("token-len", len(token))
print("base", keys["OPENAI_BASE_URL"])
print("model", keys["OPENAI_MODEL"])
