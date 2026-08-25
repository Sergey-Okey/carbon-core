import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => readFile(join(root, relativePath), 'utf8')

test('runtime secrets stay private and are never exposed publicly', async () => {
  const config = await read('nuxt.config.ts')
  const publicBlock = config.match(/public:\s*\{[\s\S]*?\n\s*\},/)?.[0] || ''

  for (const secret of [
    'authSessionSecret',
    'googleClientSecret',
    'yandexClientSecret',
    'robokassaPassword2',
    'smtpPassword',
    'databaseUrl',
  ]) {
    assert.match(config, new RegExp(secret))
    assert.doesNotMatch(publicBlock, new RegExp(secret))
  }

  assert.match(publicBlock, /webAppUrl/)
  assert.doesNotMatch(publicBlock, /ClientSecret|Password|databaseUrl|authSession/)
})

test('API responses disable caching and sniffing', async () => {
  const config = await read('nuxt.config.ts')
  assert.match(config, /'\/api\/\*\*'/)
  assert.match(config, /'cache-control': 'no-store'/)
  assert.match(config, /'x-content-type-options': 'nosniff'/)
})

test('CORS allowlist is limited to local origins', async () => {
  const cors = await read('server/middleware/cors.ts')
  assert.match(cors, /http:\/\/localhost/)
  assert.doesNotMatch(cors, /capacitor:\/\//)
  assert.match(cors, /access-control-allow-credentials',\s*'true'/)
  assert.match(cors, /access-control-allow-methods',\s*'GET,POST,OPTIONS'/)
  assert.match(cors, /event\.method === 'OPTIONS'/)
  assert.match(cors, /setResponseStatus\(event, 204\)/)
  assert.doesNotMatch(cors, /\*/)
})

test('oauth session cookies are httpOnly with lax sameSite and signed HMAC', async () => {
  const oauth = await read('server/utils/oauth.ts')
  assert.match(oauth, /httpOnly:\s*true/)
  assert.match(oauth, /sameSite:\s*'lax'/)
  assert.match(oauth, /secure/)
  assert.match(oauth, /timingSafeEqual/)
  assert.match(oauth, /authSessionSecret\.trim\(\)\.length < 32/)
  assert.match(oauth, /createHmac\('sha256'/)
  assert.match(oauth, /cof_auth_session|sessionCookie/)
})

test('cloud sync requires a session and ignores client-spoofed userId', async () => {
  const syncGet = await read('server/api/sync.get.ts')
  const syncPost = await read('server/api/sync.post.ts')

  assert.match(syncGet, /isAuthDatabaseConfigured\(\) && !session/)
  assert.match(syncGet, /statusCode: 401/)
  assert.match(syncGet, /readOAuthSession/)
  assert.match(syncPost, /isAuthDatabaseConfigured\(\) && !session/)
  assert.match(syncPost, /statusCode: 401/)
  assert.match(syncPost, /payload\.userId = session\.id/)
})

test('auth and payment endpoints enforce rate limits', async () => {
  const files = {
    register: await read('server/api/auth/register.post.ts'),
    login: await read('server/api/auth/login.post.ts'),
    verify: await read('server/api/auth/email-verification/verify.post.ts'),
    resend: await read('server/api/auth/email-verification/resend.post.ts'),
    resetRequest: await read('server/api/auth/password-reset/request.post.ts'),
    resetConfirm: await read('server/api/auth/password-reset/confirm.post.ts'),
    subscription: await read('server/api/subscription/status.get.ts'),
    robokassa: await read('server/api/payments/robokassa/result.ts'),
  }

  for (const [name, source] of Object.entries(files)) {
    assert.match(source, /enforceRateLimit/, `${name} missing rate limit`)
  }

  assert.match(files.register, /enforceRateLimit\(event, 'register', 5,/)
  assert.match(files.login, /enforceRateLimit\(event, 'login', 10,/)
  assert.match(files.robokassa, /enforceRateLimit\(event, 'robokassa-result', 120,/)
  assert.match(files.robokassa, /verifyRobokassaSignature/)
})

test('spam-prone auth endpoints verify the Turnstile token server side', async () => {
  const turnstile = await read('server/utils/turnstile.ts')
  assert.match(
    turnstile,
    /https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/
  )
  assert.match(turnstile, /secret/)
  assert.match(turnstile, /remoteip/)
  assert.match(turnstile, /payload\.success === true/)
  assert.match(turnstile, /if \(!secret \|\| !getSiteKey\(\)\) return/)

  const guarded = {
    register: await read('server/api/auth/register.post.ts'),
    login: await read('server/api/auth/login.post.ts'),
    resend: await read('server/api/auth/email-verification/resend.post.ts'),
    resetRequest: await read('server/api/auth/password-reset/request.post.ts'),
  }

  for (const [name, source] of Object.entries(guarded)) {
    assert.match(
      source,
      /await assertHuman\(event, body\?\.turnstileToken\)/,
      `${name} missing captcha check`
    )
  }
})

test('turnstile secret stays server side while the site key is public', async () => {
  const config = await read('nuxt.config.ts')
  const publicBlock = config.match(/public:\s*\{[\s\S]*?\n\s*\},/)?.[0] || ''

  assert.match(config, /turnstileSecretKey: process\.env\.TURNSTILE_SECRET_KEY/)
  assert.doesNotMatch(publicBlock, /turnstileSecretKey/)
  assert.match(publicBlock, /turnstileSiteKey/)

  const widget = await read('components/auth/AuthTurnstile.vue')
  assert.doesNotMatch(widget, /TURNSTILE_SECRET|turnstileSecretKey/)
})

test('auth forms send a fresh captcha token with every attempt', async () => {
  const panel = await read('components/auth/AuthPanel.vue')

  assert.match(panel, /<AuthTurnstile ref="turnstile" v-model="turnstileToken" \/>/)
  assert.match(panel, /if \(missingCaptcha\(\)\) return/)
  assert.match(panel, /turnstileToken: turnstileToken\.value/)
  assert.match(panel, /turnstile\.value\?\.reset\(\)/)
  assert.match(panel, /refreshCaptcha\(\)/)

  const store = await read('stores/auth.store.ts')
  assert.match(store, /body: \{ email, password, turnstileToken \}/)
  assert.match(store, /turnstileToken,/)
  assert.match(store, /getCaptchaErrorMessage\(error\)/)
})

test('password hashing and robokassa verification use timing-safe compares', async () => {
  const authStorage = await read('server/utils/authStorage.ts')
  const subscription = await read('server/utils/subscriptionStorage.ts')

  assert.match(authStorage, /scryptSync/)
  assert.match(authStorage, /timingSafeEqual/)
  assert.match(subscription, /createHash\(algorithm\)/)
  assert.match(subscription, /timingSafeEqual/)
  assert.match(subscription, /startsWith\('shp_'\)/)
  assert.match(subscription, /password2/)
})

test('templates avoid v-html of arbitrary markup', async () => {
  const { readdir } = await import('node:fs/promises')
  const ignored = new Set(['.git', '.nuxt', '.output', 'node_modules'])
  const offenders = []

  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        await walk(path)
        continue
      }
      if (!entry.name.endsWith('.vue')) continue
      const content = await readFile(path, 'utf8')
      if (/\bv-html\b/.test(content)) offenders.push(path)
    }
  }

  await walk(root)
  assert.deepEqual(offenders, [])
})

test('middleware allows demo mode and protects private routes', async () => {
  const middleware = await read('middleware/entry.global.ts')
  assert.match(middleware, /accessMode === 'demo'/)
  assert.match(middleware, /!isAuthenticated && !isDemo && !isPublicRoute/)
  assert.match(middleware, /to\.query\.oauth === 'success'/)
  assert.match(middleware, /navigateTo\('\/auth'\)/)
  for (const route of ['/privacy', '/terms', '/support', '/auth', '/register', '/onboarding']) {
    assert.match(middleware, new RegExp(route.replace('/', '\\/')))
  }
})
