import assert from 'node:assert/strict'
import { access, readdir, readFile } from 'node:fs/promises'
import test from 'node:test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => readFile(join(root, relativePath), 'utf8')
const SITE = 'https://coreoflife.ru'

const INDEXABLE_PAGES = {
  'pages/onboarding.vue': {
    path: '/onboarding',
    title: 'Управление задачами, привычками и целями',
    description:
      'Core of Life объединяет задачи, привычки, цели, аналитику и фокус в одном приложении.',
  },
  'pages/privacy.vue': {
    path: '/privacy',
    title: 'Политика конфиденциальности',
    description: 'Обработка, хранение, экспорт и удаление данных в Core of Life.',
  },
  'pages/terms.vue': {
    path: '/terms',
    title: 'Условия использования, оферта и возврат | Core of Life',
    description:
      'Публичная оферта Core of Life, правила оплаты подписки, условия возврата, безопасность аккаунта и обработка данных пользователя.',
  },
  'pages/support.vue': {
    path: '/support',
    title: 'Поддержка',
    description: 'Помощь с Core of Life, аккаунтом и запросами по данным.',
  },
}

const NOINDEX_PAGES = {
  'pages/index.vue': {
    path: '/',
    title: 'Приложение',
    description: 'Личное пространство Core of Life.',
  },
  'pages/profile.vue': {
    path: '/profile',
    title: 'Профиль',
    description: 'Профиль и прогресс пользователя Core of Life.',
  },
  'pages/auth.vue': {
    path: '/auth',
    title: 'Вход',
    description: 'Вход в личное пространство Core of Life.',
  },
  'pages/register.vue': {
    path: '/register',
    title: 'Регистрация',
    description: 'Создание профиля Core of Life.',
  },
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractLocs(sitemap) {
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort()
}

test('robots.txt allows crawling and points to the production sitemap', async () => {
  const robots = await read('public/robots.txt')
  assert.match(robots, /User-agent:\s*\*/)
  assert.match(robots, /Allow:\s*\//)
  assert.match(robots, new RegExp(`Sitemap:\\s*${escapeRegExp(`${SITE}/sitemap.xml`)}`))
  assert.doesNotMatch(robots, /Disallow:\s*\//)
  assert.doesNotMatch(robots, /localhost|127\.0\.0\.1/)
})

test('sitemap lists only HTTPS indexable marketing and trust URLs', async () => {
  const sitemap = await read('public/sitemap.xml')
  assert.match(sitemap, /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/)
  assert.doesNotMatch(sitemap, /localhost|127\.0\.0\.1/)
  assert.doesNotMatch(sitemap, /<loc>http:\/\//)

  const locs = extractLocs(sitemap)
  const expected = Object.values(INDEXABLE_PAGES)
    .map((page) => `${SITE}${page.path}`)
    .sort()

  assert.deepEqual(locs, expected)

  for (const banned of [`${SITE}/`, `${SITE}/auth`, `${SITE}/register`, `${SITE}/profile`]) {
    assert.equal(locs.includes(banned), false, `${banned} must stay out of sitemap`)
  }
})

test('favicon, apple-ready icons, and PWA manifest assets exist and are wired', async () => {
  for (const file of ['public/app.ico', 'public/favicon.svg', 'public/site.webmanifest']) {
    await access(join(root, file))
  }

  const favicon = await read('public/favicon.svg')
  assert.match(favicon, /^<svg[\s>]/i)

  const manifest = JSON.parse(await read('public/site.webmanifest'))
  assert.equal(manifest.name, 'Core of Life')
  assert.equal(manifest.short_name, 'COF')
  assert.equal(manifest.start_url, '/')
  assert.equal(manifest.display, 'standalone')
  assert.equal(manifest.theme_color, '#121212')
  assert.equal(manifest.background_color, '#121212')
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2)
  assert.match(manifest.description || '', /задач|привычк|цел/i)

  const config = await read('nuxt.config.ts')
  assert.match(config, /href: '\/app\.ico'/)
  assert.match(config, /href: '\/favicon\.svg'/)
  assert.match(config, /href: '\/site\.webmanifest'/)
})

test('nuxt app.head sets Russian lang, titles, description, social cards, and theme', async () => {
  const config = await read('nuxt.config.ts')
  assert.match(config, /htmlAttrs:\s*\{\s*lang:\s*'ru'\s*\}/)
  assert.match(config, /title:\s*'Core of Life'/)
  assert.match(config, /titleTemplate:\s*'%s · COF'/)
  assert.match(config, /charset:\s*'utf-8'/)
  assert.match(config, /viewport-fit=cover/)
  assert.match(config, /Core of Life помогает управлять задачами/)
  assert.match(config, /property: 'og:type',\s*content: 'website'/)
  assert.match(config, /property: 'og:site_name',\s*content: 'Core of Life'/)
  assert.match(config, /name: 'twitter:card',\s*content: 'summary'/)
  assert.match(config, /name: 'theme-color',\s*content: '#121212'/)
})

test('indexable public pages declare title, description, and index,follow', async () => {
  for (const [file, meta] of Object.entries(INDEXABLE_PAGES)) {
    const source = await read(file)
    assert.match(source, /useSeoMeta\(\{/, `${file} missing useSeoMeta`)
    assert.match(
      source,
      new RegExp(`title:\\s*'${escapeRegExp(meta.title)}'`),
      `${file} title`
    )
    assert.match(source, new RegExp(escapeRegExp(meta.description)), `${file} description`)
    assert.match(source, /robots:\s*'index, follow'/, `${file} robots`)
  }
})

test('app, auth, and profile pages stay noindex with title and description', async () => {
  for (const [file, meta] of Object.entries(NOINDEX_PAGES)) {
    const source = await read(file)
    assert.match(source, /useSeoMeta\(\{/, `${file} missing useSeoMeta`)
    assert.match(
      source,
      new RegExp(`title:\\s*'${escapeRegExp(meta.title)}'`),
      `${file} title`
    )
    assert.match(source, new RegExp(escapeRegExp(meta.description)), `${file} description`)
    assert.match(source, /robots:\s*'noindex, nofollow'/, `${file} robots`)
  }
})

test('onboarding ships Open Graph tags and SoftwareApplication JSON-LD', async () => {
  const onboarding = await read('pages/onboarding.vue')
  assert.match(onboarding, /ogTitle:\s*'Core of Life'/)
  assert.match(onboarding, /ogDescription:/)
  assert.match(onboarding, /ogType:\s*'website'/)
  assert.match(onboarding, /twitterCard:\s*'summary'/)
  assert.match(onboarding, /type:\s*'application\/ld\+json'/)
  assert.match(onboarding, /SoftwareApplication/)
  assert.match(onboarding, /ProductivityApplication/)
  assert.match(onboarding, /operatingSystem:\s*'Web'/)
  assert.match(onboarding, /@context': 'https:\/\/schema\.org'/)
})

test('app shell keeps Yandex verification and Metrika identifiers', async () => {
  const app = await read('app.vue')
  assert.match(app, /name:\s*'yandex-verification'/)
  assert.match(app, /14510841d1302b8d/)
  assert.match(app, /109905993/)
  assert.match(app, /mc\.yandex\.ru\/metrika/)
  assert.match(app, /mc\.yandex\.ru\/watch\/109905993/)
})

test('Capacitor packaging keeps stable public app identity', async () => {
  const capacitor = await read('capacitor.config.ts')
  assert.match(capacitor, /appId:\s*'app\.coreoflife\.cof'/)
  assert.match(capacitor, /appName:\s*'Core of Life'/)
  assert.match(capacitor, /webDir:\s*'\.output\/public'/)
})

test('every top-level page declares useSeoMeta and errordocs stay noindex', async () => {
  const pageFiles = (await readdir(join(root, 'pages')))
    .filter((name) => name.endsWith('.vue'))
    .map((name) => `pages/${name}`)

  assert.deepEqual(
    pageFiles.sort(),
    [
      'pages/auth.vue',
      'pages/index.vue',
      'pages/onboarding.vue',
      'pages/privacy.vue',
      'pages/profile.vue',
      'pages/register.vue',
      'pages/support.vue',
      'pages/terms.vue',
    ].sort()
  )

  for (const file of pageFiles) {
    const source = await read(file)
    assert.match(source, /useSeoMeta\(\{/, `${file} must declare SEO meta`)
  }

  const errorDocs = (await readdir(join(root, 'pages/errordocs')))
    .filter((name) => name.endsWith('.vue'))
    .map((name) => `pages/errordocs/${name}`)

  assert.ok(errorDocs.length >= 6)
  for (const file of errorDocs) {
    const source = await read(file)
    assert.match(source, /useSeoMeta\(\{/, `${file} missing useSeoMeta`)
    assert.match(source, /robots:\s*'noindex, nofollow'/, `${file} must be noindex`)
  }
})

test('sitemap paths are a subset of indexable page routes', async () => {
  const sitemap = await read('public/sitemap.xml')
  const locs = extractLocs(sitemap)
  const indexablePaths = new Set(Object.values(INDEXABLE_PAGES).map((page) => page.path))

  for (const loc of locs) {
    assert.ok(loc.startsWith(SITE), `${loc} must use production origin`)
    const path = loc.slice(SITE.length) || '/'
    assert.ok(indexablePaths.has(path), `${path} is in sitemap but not marked indexable`)
  }
})

test('middleware public allowlist covers SEO trust and auth entry routes', async () => {
  const middleware = await read('middleware/entry.global.ts')
  for (const route of ['/onboarding', '/privacy', '/terms', '/support', '/auth', '/register']) {
    assert.match(middleware, new RegExp(escapeRegExp(route)))
  }
})
