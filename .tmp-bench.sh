#!/usr/bin/env bash
ENV_FILE=/var/www/cof-board/.env
K=$(sudo -n grep -m1 '^OPENAI_API_KEY=' "$ENV_FILE" | cut -d= -f2-)
B=$(sudo -n grep -m1 '^OPENAI_BASE_URL=' "$ENV_FILE" | cut -d= -f2-)

MODELS="
@cf/meta/llama-3.3-70b-instruct-fp8-fast
@cf/mistralai/mistral-small-3.1-24b-instruct
@cf/meta/llama-4-scout-17b-16e-instruct
@cf/deepseek-ai/deepseek-v4-flash-0731
@cf/zai-org/glm-4.7-flash
@cf/openai/gpt-oss-20b
@cf/qwen/qwen3-30b-a3b-fp8
@cf/google/gemma-4-26b-a4b-it
"

for M in $MODELS; do
  for CASE in 1 2; do
    python3 - "$M" "$CASE" <<'PY' > /tmp/bench-body.json
import json, sys
model, case = sys.argv[1], sys.argv[2]
sys_prompt = open('/tmp/sys.txt', encoding='utf-8').read()
ctx = {
  "today": "2026-08-25",
  "slots": {"TASK_DAY": {"active": 2, "remaining": 1}, "TASK_WEEK": {"active": 0, "remaining": 3},
            "TASK_MONTH": {"active": 0, "remaining": 3}, "TASK_YEAR": {"active": 0, "remaining": 3},
            "HABIT": {"active": 1, "remaining": None}},
  "tasks": [{"id": "t1", "title": "Созвон по API", "type": "TASK_DAY", "done": False},
            {"id": "t2", "title": "Спланировать спринт", "type": "TASK_DAY", "done": False}],
  "branches": [
    {"id": "b1", "displayName": "Тело", "icon": "heart", "markerColor": "#3b82f6",
     "milestones": [{"id": "m1", "name": "Сон", "status": "active"},
                    {"id": "m2", "name": "Зал", "status": "pending"}]},
    {"id": "b2", "displayName": "Продукт", "icon": "rocket", "milestones": []}],
  "edges": [{"id": "e1", "source": "b1", "target": "m1"}, {"id": "e2", "source": "m1", "target": "m2"}],
  "tags": [], "rewards": [], "deletedTasks": [],
  "settings": {"themeMode": "dark"}, "memory": [],
}
requests = {
  "1": "Покрась ветку «Тело» в красный, удали задачу «Созвон по API» и убери связь ветки «Тело» с этапом «Сон»",
  "2": "Добавь привычку «Читать 20 минут» в этап «Зал», переименуй ветку «Продукт» в «Продукт 2.0» и включи светлую тему",
}
print(json.dumps({
  "model": model,
  "temperature": 0.2,
  "response_format": {"type": "json_object"},
  "messages": [
    {"role": "system", "content": sys_prompt},
    {"role": "user", "content": json.dumps({"request": requests[case], "context": ctx}, ensure_ascii=False)},
  ],
}, ensure_ascii=False))
PY

    T=$(curl -sS -o /tmp/bench-out.json -w '%{time_total} %{http_code}' --max-time 75 \
      "$B/chat/completions" -H "authorization: Bearer $K" \
      -H 'content-type: application/json' --data-binary @/tmp/bench-body.json)
    echo "=== $M case=$CASE time_http=$T"
    python3 -c "
import json,sys
try:
    d=json.load(open('/tmp/bench-out.json'))
    c=d['choices'][0]['message'].get('content','')
    print((c or '<empty>')[:700].replace(chr(10),' '))
except Exception as e:
    print('parse-fail', e, open('/tmp/bench-out.json', encoding='utf-8', errors='replace').read()[:250])
"
  done
done
