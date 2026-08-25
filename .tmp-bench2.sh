#!/usr/bin/env bash
ENV_FILE=/var/www/cof-board/.env
K=$(sudo -n grep -m1 '^OPENAI_API_KEY=' "$ENV_FILE" | cut -d= -f2-)
B=$(sudo -n grep -m1 '^OPENAI_BASE_URL=' "$ENV_FILE" | cut -d= -f2-)

MODELS="
@cf/meta/llama-3.3-70b-instruct-fp8-fast
@cf/qwen/qwen3-30b-a3b-fp8
@cf/mistralai/mistral-small-3.1-24b-instruct
@cf/meta/llama-4-scout-17b-16e-instruct
"

for M in $MODELS; do
  for CASE in 3 4 5; do
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
  "deletedTasks": [{"id": "d1", "title": "Отчёт за июль"}],
  "branches": [
    {"id": "b1", "displayName": "Тело", "icon": "heart", "markerColor": "#3b82f6",
     "milestones": [{"id": "m1", "name": "Сон", "status": "active"},
                    {"id": "m2", "name": "Зал", "status": "pending"}]},
    {"id": "b2", "displayName": "Продукт", "icon": "rocket", "milestones": []}],
  "edges": [{"id": "e1", "source": "b1", "target": "m1"}, {"id": "e2", "source": "m1", "target": "m2"}],
  "tags": [{"id": "g1", "name": "здоровье"}], "rewards": [{"id": "r1", "title": "Новая книга"}],
  "settings": {"themeMode": "dark"}, "memory": [],
}
requests = {
  "3": "Разложи цель «Запустить YouTube-канал» на ветку с этапами и задачами",
  "4": "Что мне сделать сегодня?",
  "5": "Удали ветку «Продукт», восстанови задачу «Отчёт за июль» и поставь тег «здоровье» задаче «Созвон по API»",
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
import json
try:
    d=json.load(open('/tmp/bench-out.json'))
    c=d['choices'][0]['message'].get('content','')
    print((c or '<empty>')[:1100].replace(chr(10),' '))
except Exception as e:
    print('parse-fail', e, open('/tmp/bench-out.json', encoding='utf-8', errors='replace').read()[:200])
"
  done
done
