import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const root = new URL('../', import.meta.url)

async function findMergeConflictMarkers(directory = root) {
  const ignored = new Set(['.git', '.nuxt', '.output', 'node_modules'])
  const markers = ['<'.repeat(7), '='.repeat(7), '>'.repeat(7)]
  const matches = []

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue
    const url = new URL(entry.name, directory)
    if (entry.isDirectory()) {
      matches.push(...await findMergeConflictMarkers(new URL(`${url.href}/`)))
      continue
    }
    if (!entry.isFile()) continue

    const content = await readFile(url, 'utf8').catch(() => '')
    if (content.split(/\r?\n/).some((line) => markers.some((marker) => line.startsWith(marker)))) {
      matches.push(url.pathname)
    }
  }

  return matches
}

test('repository has no unresolved merge conflicts', async () => {
  assert.deepEqual(await findMergeConflictMarkers(), [])
})

test('public trust pages remain accessible without authentication', async () => {
  const middleware = await read('middleware/entry.global.ts')
  for (const route of ['/privacy', '/terms', '/support']) assert.match(middleware, new RegExp(route))
  const privacy = await read('pages/privacy.vue')
  const terms = await read('pages/terms.vue')
  assert.match(privacy, /Cookies и внешние сервисы/)
  assert.match(privacy, /Срок хранения/)
  assert.match(terms, /Аккаунт и безопасность/)
})

test('registration requires explicit legal consent', async () => {
  const authPanel = await read('components/auth/AuthPanel.vue')
  const registerApi = await read('server/api/auth/register.post.ts')
  const oauthRoute = await read('server/api/auth/[provider].get.ts')
  const authStorage = await read('server/utils/authStorage.ts')
  const privacy = await read('pages/privacy.vue')
  assert.match(authPanel, /form\.acceptedTerms/)
  assert.match(registerApi, /acceptedTerms === true/)
  assert.match(registerApi, /verifyCaptcha/)
  assert.match(oauthRoute, /acceptedTerms === 'true'/)
  assert.match(authStorage, /Terms consent is required/)
  assert.match(privacy, /Отзыв согласия/)
  assert.match(privacy, /Удаление данных/)
  assert.match(authPanel, /register\(form\.email, form\.password, form\.name, 'cloud'/)
  assert.match(authPanel, /captchaToken/)
  assert.match(authPanel, /captchaAnswer/)
  assert.doesNotMatch(authPanel, /class="auth-mode"/)
  assert.doesNotMatch(authPanel, /class="auth-topbar"/)
  assert.match(authPanel, /Попробовать демо/)
  assert.doesNotMatch(authPanel, /Уже оплатил/)
  assert.match(authPanel, /overflow-wrap: normal/)
  assert.match(authPanel, /keepShortWords/)
})

test('auth forms use server captcha and reset mail supports STARTTLS', async () => {
  const captchaApi = await read('server/api/auth/captcha.get.ts')
  const loginApi = await read('server/api/auth/login.post.ts')
  const resetApi = await read('server/api/auth/password-reset/request.post.ts')
  const smtp = await read('server/utils/smtp.ts')

  assert.match(captchaApi, /createCaptchaChallenge/)
  assert.match(loginApi, /verifyCaptcha/)
  assert.match(resetApi, /verifyCaptcha/)
  assert.match(smtp, /STARTTLS/)
  assert.match(smtp, /net\.connect/)
})

test('robokassa result trusts only signed payment email', async () => {
  const resultApi = await read('server/api/payments/robokassa/result.ts')
  const subscriptionStorage = await read('server/utils/subscriptionStorage.ts')
  const emailLine = resultApi.split(/\r?\n/).find((line) => line.includes('const email =')) || ''
  const conflictBlock = subscriptionStorage.match(/ON CONFLICT \(invoice_id\)[\s\S]*?updated_at = NOW\(\)/)?.[0] || ''

  assert.match(emailLine, /getParam\(params, 'Shp_email'\)/)
  assert.doesNotMatch(emailLine, /params\.EMail|params\.Email|params\.email/)
  assert.doesNotMatch(conflictBlock, /email\s*=\s*EXCLUDED\.email/)
})

test('onboarding does not use CSS gradients', async () => {
  const onboarding = await read('pages/onboarding.vue')
  const headerStyle = onboarding.match(/\.fixed-header\s*\{([^}]*)\}/s)?.[1] || ''
  assert.doesNotMatch(onboarding, /(?:linear|radial|conic)-gradient\(/)
  assert.equal([...onboarding.matchAll(/<section id="step-\d+"/g)].length, 7)
  assert.doesNotMatch(onboarding, /id="step-product"/)
  assert.doesNotMatch(headerStyle, /position:\s*(?:fixed|sticky)/)
  assert.match(headerStyle, /border:\s*none/)
  assert.match(onboarding, /\.first-slide\s*\{[^}]*scroll-snap-align:\s*start/s)
})

test('Android targets API 35 and release signing is externalized', async () => {
  const variables = await read('android/variables.gradle')
  const build = await read('android/app/build.gradle')
  assert.match(variables, /targetSdkVersion = 35/)
  assert.match(build, /COF_KEYSTORE_PATH/)
})

test('PWA manifest has standalone display and launch icons', async () => {
  const manifest = JSON.parse(await read('public/site.webmanifest'))
  assert.equal(manifest.display, 'standalone')
  assert.ok(manifest.icons.length >= 2)
})

test('tags remain shared between tasks and habits', async () => {
  const tagsStore = await read('stores/tags.store.ts')
  const taskForm = await read('components/task/TaskForm.vue')

  assert.match(tagsStore, /function normalizeTags\(tasks: Task\[\] = \[\]\)/)
  assert.match(tagsStore, /scope: undefined/)
  assert.match(tagsStore, /function mergeTags/)
  assert.match(tagsStore, /function updateTag/)
  assert.match(tagsStore, /task\.tagIds = task\.tagIds/)
  assert.doesNotMatch(taskForm, /getTagsByScope\(currentScope/)
})

test('strict typecheck inherits Nuxt module resolution', async () => {
  const tsconfig = JSON.parse((await read('tsconfig.json')).replace(/^\uFEFF/, ''))
  assert.equal(tsconfig.extends, './.nuxt/tsconfig.json')
  assert.equal(tsconfig.compilerOptions.moduleResolution, undefined)
})

test('theme schedule uses the custom time picker', async () => {
  const settings = await read('components/settings/SettingsPanel.vue')
  const timePicker = await read('components/ui/AppTimePicker.vue')

  assert.match(settings, /<AppTimePicker/)
  assert.doesNotMatch(settings, /type="time"/)
  assert.match(timePicker, /class="time-popover"/)
})

test('native app keeps launch animation and skips onboarding route', async () => {
  const app = await read('app.vue')
  const launch = await read('components/base/AppLaunchScreen.vue')
  const middleware = await read('middleware/entry.global.ts')

  assert.match(app, /<AppLaunchScreen \/>/)
  assert.match(launch, /Capacitor\.isNativePlatform\(\)/)
  assert.match(launch, /launch-pulse/)
  assert.match(middleware, /isNative && to\.path === '\/onboarding'/)
})

test('new users start with registration instead of login', async () => {
  const onboarding = await read('pages/onboarding.vue')
  const middleware = await read('middleware/entry.global.ts')

  assert.match(onboarding, /authStore\.isAuthenticated \? '\/' : '\/register'/)
  assert.match(middleware, /if \(hasUsers\) return navigateTo\('\/auth'\)/)
  assert.match(middleware, /hasSeenOnboarding \? '\/register' : '\/onboarding'/)
})
