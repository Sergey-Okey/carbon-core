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

## OpenRouter (агент)

OpenRouter — внешний API, не локальная модель. На VPS хранится только ключ.

1. Ключ: https://openrouter.ai/keys
2. В `/var/www/cof-board/.env`:

```
AI_ENGINE=openai
NUXT_AI_ENGINE=openai
OPENAI_BASE_URL=https://openrouter.ai/api/v1
NUXT_OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=minimax/minimax-m2.7:free
NUXT_OPENAI_MODEL=minimax/minimax-m2.7:free
OPENAI_API_KEY=sk-or-v1-...
NUXT_OPENAI_API_KEY=sk-or-v1-...
```

3. `sudo systemctl restart cof-board`

Без ключа агент отвечает ошибкой «OpenRouter is not configured». Локальный планировщик не используется.
