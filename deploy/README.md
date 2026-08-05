# Deploy cof-board.com

VPS: `ubuntuuser@195.209.213.16`  
App path: `/var/www/cof-board`  
Service: `cof-board.service` (Node on `127.0.0.1:3000`)  
Nginx: `/etc/nginx/sites-available/cof-board.com`

## 1. DNS (SpaceWeb) — обязательно

Домен сейчас указывает на `77.222.62.219`. Нужно:

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `@` | `195.209.213.16` |
| A | `www` | `195.209.213.16` |

Панель: https://sweb.ru / https://cp.spaceweb.ru  
TTL можно поставить 300–600.

Проверка:

```bash
dig +short A cof-board.com
# ожидаем: 195.209.213.16
```

## 2. SSL после смены DNS

```bash
sudo bash /var/www/cof-board/deploy/remote-ssl.sh
```

Скрипт выпускает Let's Encrypt, включает HTTPS, редиректы `www` → apex и HTTP → HTTPS.

## 3. Redeploy с локальной машины

```powershell
$env:NUXT_PUBLIC_WEB_APP_URL = "https://cof-board.com"
npm run build
tar -czf deploy/release.tgz -C . .output
scp -i privatekey-1103714.pem deploy/release.tgz deploy/.env.production ubuntuuser@195.209.213.16:/tmp/
ssh -i privatekey-1103714.pem ubuntuuser@195.209.213.16 "sudo bash /tmp/remote-install.sh"
```

## 4. SEO checklist

- `https://cof-board.com/robots.txt`
- `https://cof-board.com/sitemap.xml`
- Canonical / Open Graph в `nuxt.config.ts`
- После SSL: добавить сайт в Google Search Console и Яндекс.Вебмастер
