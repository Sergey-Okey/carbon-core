import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

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
  const privacy = await read('pages/privacy.vue')
  assert.match(authPanel, /form\.acceptedTerms/)
  assert.match(registerApi, /acceptedTerms === true/)
  assert.match(privacy, /Отзыв согласия/)
  assert.match(privacy, /Удаление данных/)
})

test('onboarding does not use CSS gradients', async () => {
  const onboarding = await read('pages/onboarding.vue')
  assert.doesNotMatch(onboarding, /(?:linear|radial|conic)-gradient\(/)
  assert.equal([...onboarding.matchAll(/<section id="step-\d+"/g)].length, 7)
  assert.doesNotMatch(onboarding, /id="step-product"/)
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
