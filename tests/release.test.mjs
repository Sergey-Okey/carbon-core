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
  assert.match(authPanel, /AppCheckbox/)
  assert.match(registerApi, /acceptedTerms === true/)
  assert.match(oauthRoute, /acceptedTerms === 'true'/)
  assert.match(authStorage, /Terms consent is required/)
  assert.match(privacy, /Отзыв согласия/)
  assert.match(privacy, /Удаление данных/)
  assert.match(
    authPanel,
    /register\(\s*form\.email,\s*form\.password,\s*form\.name,\s*'cloud'/
  )
  assert.doesNotMatch(authPanel, /class="auth-mode"/)
  assert.doesNotMatch(authPanel, /class="auth-topbar"/)
  assert.match(authPanel, /Попробовать демо/)
  assert.doesNotMatch(authPanel, /Уже оплатил/)
  assert.match(authPanel, /overflow-wrap: normal/)
  assert.match(authPanel, /keepShortWords/)
})

test('auth forms use rate limits and reset mail supports STARTTLS', async () => {
  const registerApi = await read('server/api/auth/register.post.ts')
  const loginApi = await read('server/api/auth/login.post.ts')
  const resetApi = await read('server/api/auth/password-reset/request.post.ts')
  const smtp = await read('server/utils/smtp.ts')

  assert.match(registerApi, /enforceRateLimit/)
  assert.match(loginApi, /enforceRateLimit/)
  assert.match(resetApi, /enforceRateLimit/)
  assert.doesNotMatch(registerApi, /verifyCaptcha/)
  assert.doesNotMatch(loginApi, /verifyCaptcha/)
  assert.doesNotMatch(resetApi, /verifyCaptcha/)
  assert.match(smtp, /process\.env\.SMTP_HOST/)
  assert.match(smtp, /process\.env\.SMTP_PASSWORD/)
  assert.match(smtp, /STARTTLS/)
  assert.match(smtp, /net\.connect/)
})

test('password reset can create a password for oauth accounts', async () => {
  const authStorage = await read('server/utils/authStorage.ts')
  const createResetBlock = authStorage.match(/export async function createPasswordResetToken[\s\S]*?export async function resetAccountPassword/)?.[0] || ''
  const resetBlock = authStorage.match(/export async function resetAccountPassword[\s\S]*?export async function upsertOAuthAccount/)?.[0] || ''

  assert.doesNotMatch(createResetBlock, /provider\)\s*!==\s*'local'/)
  assert.match(resetBlock, /SET password_hash/)
  assert.doesNotMatch(resetBlock, /provider\s*=\s*'local'/)
})

test('email registration requires a mailed verification code before session', async () => {
  const registerApi = await read('server/api/auth/register.post.ts')
  const verifyApi = await read('server/api/auth/email-verification/verify.post.ts')
  const resendApi = await read('server/api/auth/email-verification/resend.post.ts')
  const authStorage = await read('server/utils/authStorage.ts')
  const authStore = await read('stores/auth.store.ts')
  const authPanel = await read('components/auth/AuthPanel.vue')

  assert.match(registerApi, /createPendingRegistration/)
  assert.match(registerApi, /requiresVerification/)
  assert.doesNotMatch(registerApi, /setOAuthSession/)
  assert.match(verifyApi, /verifyEmailCode/)
  assert.match(verifyApi, /setOAuthSession/)
  assert.match(resendApi, /sendMail/)
  assert.match(authStorage, /email_verified_at/)
  assert.match(authStorage, /cof_pending_registrations/)
  assert.match(authStorage, /INSERT INTO cof_users/)
  assert.match(authStorage, /Verification code is invalid/)
  assert.match(authStore, /verifyEmail/)
  assert.match(authPanel, /pendingVerification/)
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
  const timePicker = await read('components/ui/forms/AppTimePicker.vue')

  assert.match(settings, /<AppTimePicker/)
  assert.doesNotMatch(settings, /type="time"/)
  assert.match(timePicker, /class="time-popover"/)
})

test('ui primitives live in the design-system folder structure', async () => {
  const expected = [
    'components/ui/primitives/AppButton.vue',
    'components/ui/primitives/AppInput.vue',
    'components/ui/forms/AppFormField.vue',
    'components/ui/overlays/AppModal.vue',
    'components/ui/feedback/EmptyState.vue',
    'components/ui/navigation/AppSegmentedControl.vue',
  ]

  for (const path of expected) {
    await assert.doesNotReject(() => read(path))
  }

  await assert.rejects(() => read('components/ui/AppButton.vue'))
})

test('demo mode persists locally with a three hour TTL', async () => {
  const accessStorage = await read('utils/accessStorage.ts')
  const accessStore = await read('stores/access.store.ts')

  assert.match(accessStorage, /DEMO_TTL_MS = 3 \* 60 \* 60 \* 1000/)
  assert.match(accessStorage, /DEMO_STORAGE_KEY/)
  assert.match(accessStorage, /carbon-demo-storage/)
  assert.match(accessStore, /expiresAt/)
  assert.match(accessStore, /DEMO_TTL_MS/)
})

test('app keeps launch animation', async () => {
  const app = await read('app.vue')
  const launch = await read('components/base/AppLaunchScreen.vue')

  assert.match(app, /<AppLaunchScreen \/>/)
  assert.match(launch, /DotSphereLoader/)
  assert.match(launch, /mode="boot"/)
})

test('new users start with registration instead of login', async () => {
  const onboarding = await read('pages/onboarding.vue')
  const middleware = await read('middleware/entry.global.ts')

  assert.match(onboarding, /authStore\.isAuthenticated \? '\/' : '\/register'/)
  assert.match(middleware, /if \(hasUsers\) return navigateTo\('\/auth'\)/)
  assert.match(middleware, /hasSeenOnboarding \? '\/register' : '\/onboarding'/)
})

test('production secrets stay out of the git tree', async () => {
  const { existsSync } = await import('node:fs')
  const gitignore = await read('.gitignore')
  const example = await read('deploy/.env.production.example')
  assert.equal(existsSync(new URL('../deploy/.env.production', import.meta.url)), false)
  assert.match(gitignore, /\.env\.production/)
  assert.match(example, /replace-with-at-least-32-random-characters/)
  assert.match(example, /replace-me@127\.0\.0\.1/)
  assert.doesNotMatch(example, /postgresql:\/\/cof:[^r]/)
})
