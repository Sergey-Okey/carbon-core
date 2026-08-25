# Deploy cof-board.com

VPS: `ubuntu@195.209.213.16` (app user: `ubuntuuser`)  
App path: `/var/www/cof-board/app`  
Service: `cof-board.service`  
Webhook: `cof-board-webhook.service`

## Git deploy (основной способ)

После каждого `git push` в ветку `stable` сайт обновляется автоматически через GitHub webhook.

### Первичная настройка сервера

```bash
ssh -i privatekey-1103714.pem ubuntu@195.209.213.16
sudo bash /var/www/cof-board/app/deploy/setup-server-git.sh
```

### Ручной деплой с сервера

```bash
sudo bash /var/www/cof-board/app/deploy/deploy-from-git.sh
```

Лог: `/var/log/cof-board-deploy.log`

### GitHub webhook

1. Repo → Settings → Webhooks → Add webhook
2. Payload URL: `https://cof-board.com/git-deploy`
3. Content type: `application/json`
4. Secret: значение из `/var/www/cof-board/.webhook-secret` на сервере
5. Events: **Just the push event**
6. Active: yes

Пуш в ветку `stable` запускает `git pull → npm ci → npm run build → restart`.

## DNS (SpaceWeb)

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `@` | `195.209.213.16` |
| A | `www` | `195.209.213.16` |

## SSL

```bash
sudo bash /var/www/cof-board/app/deploy/remote-ssl.sh
```

## SMTP (smtp.bz)

В `/var/www/cof-board/.env`:

```
NUXT_SMTP_HOST=connect.smtp.bz
NUXT_SMTP_PORT=2525
NUXT_SMTP_USER=...
NUXT_SMTP_PASSWORD=...
NUXT_SMTP_FROM="Core of Life <no-reply@cof-board.com>"
# Prefer API when outbound SMTP to smtp.bz is blocked/refused on the VPS:
NUXT_SMTP_API_KEY=...
NUXT_SMTP_API_URL=https://api.smtp.bz/v1/smtp/send
```

API-ключ — в кабинете smtp.bz → «Мой профиль». Если задан `NUXT_SMTP_API_KEY`, письма идут по HTTPS.

После изменения `.env`: `sudo systemctl restart cof-board`

## Агент на VPS: Cloudflare Workers AI

С IP SpaceWeb `openrouter.ai` отвечает `403 Access denied by security policy`.
Прокси через свой Worker тоже не спасает: OpenRouter видит тот же запрещённый клиент.

Рабочий путь — **Workers AI** (OpenAI-совместимый чат). Cloudflare не хостит Gemini Pro
(тот прайс $0.75 / $3.75 за 1M — платный Google). На Workers AI Google — это **Gemma 4**,
с дневным бесплатным пулом 10 000 neurons.

1. User API Token Cloudflare с правом Workers AI.
2. В `/var/www/cof-board/.env`:

```
AI_ENGINE=openai
NUXT_AI_ENGINE=openai
OPENAI_MODEL=@cf/google/gemma-4-26b-a4b-it
NUXT_OPENAI_MODEL=@cf/google/gemma-4-26b-a4b-it
OPENAI_API_KEY=<Cloudflare User API Token>
NUXT_OPENAI_API_KEY=<тот же токен>
OPENAI_BASE_URL=https://api.cloudflare.com/client/v4/accounts/<account_id>/ai/v1
NUXT_OPENAI_BASE_URL=https://api.cloudflare.com/client/v4/accounts/<account_id>/ai/v1
OPENROUTER_PROXY_URL=
```

3. `sudo systemctl restart cof-board`

`OPENAI_BASE_URL` важнее `OPENROUTER_PROXY_URL`. Не оставляйте прокси-URL, если база — Workers AI.

## OpenRouter (запасной hop)

OpenRouter — внешний API, не локальная модель. С VPS SpaceWeb прямой `openrouter.ai`
отвечает `403 Access denied by security policy` (Cloudflare режет IP хостинга, не ключ).
Бесплатные `:free` модели иногда доступны через Cloudflare Worker, но с этого VPS
исходящий fetch Worker → OpenRouter тоже может получить 403.

1. Ключ: https://openrouter.ai/keys
2. Бесплатный аккаунт Cloudflare: https://dash.cloudflare.com/sign-up
3. С машины, где есть браузер:

```bash
npx wrangler login
npx wrangler deploy -c deploy/wrangler.openrouter-proxy.toml
npx wrangler secret put PROXY_SECRET -c deploy/wrangler.openrouter-proxy.toml
```

`wrangler deploy` печатает URL вида `https://cof-openrouter-proxy.<subdomain>.workers.dev`.
Секрет — длинная случайная строка, та же в Worker и на VPS.

4. В `/var/www/cof-board/.env`:

```
AI_ENGINE=openai
NUXT_AI_ENGINE=openai
OPENAI_MODEL=minimax/minimax-m2.7:free
NUXT_OPENAI_MODEL=minimax/minimax-m2.7:free
OPENAI_API_KEY=sk-or-v1-...
NUXT_OPENAI_API_KEY=sk-or-v1-...
OPENROUTER_PROXY_URL=https://cof-openrouter-proxy.<subdomain>.workers.dev/api/v1
OPENROUTER_PROXY_SECRET=<тот же секрет, что PROXY_SECRET>
```

`OPENAI_BASE_URL` не ставить на `openrouter.ai` — иначе запрос снова упрётся в WAF.

5. `sudo systemctl restart cof-board`

Без ключа агент отвечает «OpenRouter is not configured». Если Worker недоступен, код пробует Pollinations как запасной путь.
