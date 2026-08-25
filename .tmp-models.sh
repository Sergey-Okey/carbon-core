#!/usr/bin/env bash
ENV_FILE=/var/www/cof-board/.env
K=$(sudo -n grep -m1 '^OPENAI_API_KEY=' "$ENV_FILE" | cut -d= -f2-)
ACC=ddc839249c2e67337081e7167a241400

curl -sS --max-time 30 \
  "https://api.cloudflare.com/client/v4/accounts/$ACC/ai/models/search?per_page=200" \
  -H "authorization: Bearer $K" -o /tmp/models.json -w 'http:%{http_code}\n'

python3 - <<'PY'
import json
d = json.load(open('/tmp/models.json'))
res = d.get('result') or []
rows = []
for m in res:
    task = ((m.get('task') or {}).get('name') or '')
    if 'Text Generation' not in task:
        continue
    props = {p.get('property_id'): p.get('value') for p in (m.get('properties') or [])}
    rows.append((m.get('name'), props.get('context_window'), props.get('terms'), m.get('description','')[:60]))
print('total text-generation:', len(rows))
for name, ctx, terms, desc in sorted(rows):
    print(f'{name}  ctx={ctx}')
PY
