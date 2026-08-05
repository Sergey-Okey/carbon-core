from pathlib import Path

raw = Path('/var/www/cof-board/.env').read_text(encoding='utf-8')
vals = {}
for line in raw.splitlines():
    if not line or line.startswith('#') or '=' not in line:
        continue
    key, value = line.split('=', 1)
    vals[key] = value

def pick(*keys, default=''):
    for key in keys:
        if vals.get(key):
            return vals[key]
    return default

db = pick('NUXT_DATABASE_URL', 'DATABASE_URL')
secret = pick('NUXT_AUTH_SESSION_SECRET', 'AUTH_SESSION_SECRET')
web = pick('NUXT_PUBLIC_WEB_APP_URL', default='https://cof-board.com')
smtp_from = pick('NUXT_SMTP_FROM', 'SMTP_FROM', default='"Core of Life <no-reply@cof-board.com>"')

out = '\n'.join([
    f'NUXT_DATABASE_URL={db}',
    f'DATABASE_URL={db}',
    f'NUXT_AUTH_SESSION_SECRET={secret}',
    f'AUTH_SESSION_SECRET={secret}',
    f'NUXT_PUBLIC_WEB_APP_URL={web}',
    f'NUXT_GOOGLE_CLIENT_ID={pick("NUXT_GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_ID")}',
    f'NUXT_GOOGLE_CLIENT_SECRET={pick("NUXT_GOOGLE_CLIENT_SECRET", "GOOGLE_CLIENT_SECRET")}',
    f'NUXT_YANDEX_CLIENT_ID={pick("NUXT_YANDEX_CLIENT_ID", "YANDEX_CLIENT_ID")}',
    f'NUXT_YANDEX_CLIENT_SECRET={pick("NUXT_YANDEX_CLIENT_SECRET", "YANDEX_CLIENT_SECRET")}',
    f'NUXT_SMTP_HOST={pick("NUXT_SMTP_HOST", "SMTP_HOST")}',
    f'NUXT_SMTP_PORT={pick("NUXT_SMTP_PORT", "SMTP_PORT", default="587")}',
    f'NUXT_SMTP_USER={pick("NUXT_SMTP_USER", "SMTP_USER")}',
    f'NUXT_SMTP_PASSWORD={pick("NUXT_SMTP_PASSWORD", "SMTP_PASSWORD")}',
    f'NUXT_SMTP_FROM={smtp_from}',
    '',
])

Path('/tmp/.env.production').write_text(out, encoding='utf-8')
for line in out.splitlines():
    if not line:
        continue
    key, value = line.split('=', 1)
    print(f'{key}=len={len(value)}')
print('WROTE_OK')
