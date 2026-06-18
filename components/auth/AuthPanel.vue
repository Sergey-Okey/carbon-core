<template>
  <div class="auth-page">
    <div class="auth-workspace">
      <div class="auth-grid">
        <div class="auth-panel auth-intro">
          <AppButton type="button" variant="ghost" size="sm" class="back-action" @click="goBack">
            <ArrowLeft :size="16" />
            Назад
          </AppButton>

          <div class="intro-content">
            <span class="badge">Core of Life</span>
            <h1 v-if="isRegister">
              Соберите свою систему задач
              <span>в одном месте.</span>
            </h1>
            <h1 v-else>Продолжайте в своём ритме.</h1>
            <p>
              {{
                isRegister
                  ? 'Попробуйте готовое пространство или оформите доступ, чтобы создать личный профиль.'
                  : 'Войдите, чтобы вернуться к задачам, привычкам, фокусу и доске.'
              }}
            </p>
          </div>

          <div class="intro-actions">
            <AppButton type="button" variant="secondary" @click="startDemo">
              <Play :size="15" />
              Попробовать демо
            </AppButton>
            <NuxtLink class="route-link" :to="isRegister ? '/auth' : '/register'">
              {{ isRegister ? 'Уже есть профиль? Войти' : 'Нет профиля? Получить доступ' }}
              <ArrowUpRight :size="15" />
            </NuxtLink>
          </div>

          <div class="legal-links">
            <NuxtLink to="/privacy">Конфиденциальность</NuxtLink>
            <NuxtLink to="/terms">Условия</NuxtLink>
            <NuxtLink to="/support">Поддержка</NuxtLink>
          </div>
        </div>

        <div class="auth-panel auth-form-panel">
          <template v-if="isRegister && !accessStore.hasSubscription">
            <div class="subscription-header">
              <span class="badge">Полный доступ</span>
              <h2>Оформите подписку</h2>
              <p>После оплаты вы сможете создать профиль и пользоваться всеми разделами COF.</p>
            </div>

            <div class="benefits-list">
              <div v-for="item in accessBenefits" :key="item.title" class="benefit-item">
                <Check :size="16" />
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.description }}</span>
                </div>
              </div>
            </div>

            <div class="subscription-check">
              <AppFormField label="Email профиля">
                <AppInput
                  v-model="form.email"
                  type="email"
                  placeholder="email@example.com"
                  autocomplete="email"
                />
              </AppFormField>
              <button
                class="payment-link"
                type="button"
                @click="startSubscriptionPayment"
              >
                Оплатить доступ · {{ SUBSCRIPTION_PRICE }} ₽
                <ArrowUpRight :size="16" />
              </button>
              <AppButton
                type="button"
                variant="secondary"
                :disabled="isCheckingSubscription"
                @click="verifySubscription"
              >
                {{ isCheckingSubscription ? 'Проверяем…' : 'Проверить доступ' }}
              </AppButton>
              <p v-if="subscriptionError" class="error-text">{{ subscriptionError }}</p>
            </div>
          </template>

          <template v-else>
            <div class="form-header">
              <span class="badge">{{ isRegister ? 'Регистрация' : 'Авторизация' }}</span>
              <h2>{{ isRegister ? 'Создайте профиль' : 'С возвращением' }}</h2>
              <p>
                {{
                  isRegister
                    ? 'Укажите данные, которые будете использовать для входа.'
                    : 'Введите данные профиля, чтобы продолжить работу.'
                }}
              </p>
            </div>

            <label class="consent-control oauth-consent">
              <input v-model="form.acceptedTerms" type="checkbox" />
              <span class="checkmark"><Check :size="12" /></span>
              <span>
                Принимаю <NuxtLink to="/terms">условия использования</NuxtLink> и
                <NuxtLink to="/privacy">политику конфиденциальности</NuxtLink>
              </span>
            </label>

            <div class="oauth-actions" aria-label="Войти через сервис">
              <button
                class="oauth-button"
                type="button"
                :disabled="!form.acceptedTerms"
                @click="startOAuth('google')"
              >
                <svg class="oauth-icon google-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285f4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
                  <path fill="#34a853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
                  <path fill="#fbbc05" d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.11-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z" />
                  <path fill="#ea4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
                </svg>
                Google
              </button>
              <button
                class="oauth-button"
                type="button"
                :disabled="!form.acceptedTerms"
                @click="startOAuth('yandex')"
              >
                <span class="oauth-icon yandex-icon" aria-hidden="true">Я</span>
                Яндекс
              </button>
            </div>

            <div class="auth-divider"><span>или</span></div>

            <form v-if="resetToken" class="auth-form" @submit.prevent="confirmPasswordReset">
              <AppFormField label="Новый пароль" hint="Минимум 8 символов">
                <AppInput
                  v-model="resetPassword"
                  type="password"
                  placeholder="Введите новый пароль"
                  autocomplete="new-password"
                />
              </AppFormField>

              <p v-if="resetMessage" class="success-text">{{ resetMessage }}</p>
              <p v-if="error" class="error-text">{{ error }}</p>
              <AppButton type="submit" variant="primary" :disabled="isConfirmingReset">
                {{ isConfirmingReset ? 'Сохраняем…' : 'Сохранить новый пароль' }}
              </AppButton>
            </form>

            <form v-else-if="resetMode" class="auth-form" @submit.prevent="requestPasswordReset">
              <AppFormField label="Email профиля">
                <AppInput
                  v-model="resetEmail"
                  type="email"
                  placeholder="email@example.com"
                  autocomplete="email"
                />
              </AppFormField>

              <p v-if="resetMessage" class="success-text">{{ resetMessage }}</p>
              <p v-if="error" class="error-text">{{ error }}</p>
              <AppButton type="submit" variant="primary" :disabled="isRequestingReset">
                {{ isRequestingReset ? 'Отправляем…' : 'Отправить письмо' }}
              </AppButton>
              <button type="button" class="forgot-link" @click="resetMode = false">
                Вернуться ко входу
              </button>
            </form>

            <form v-else class="auth-form" @submit.prevent="submit">
              <AppFormField v-if="isRegister" label="Имя">
                <AppInput v-model="form.name" placeholder="Как к вам обращаться" autocomplete="name" />
              </AppFormField>
              <AppFormField label="Email">
                <AppInput
                  v-model="form.email"
                  type="email"
                  placeholder="email@example.com"
                  autocomplete="email"
                />
              </AppFormField>
              <AppFormField label="Пароль" :hint="isRegister ? 'Минимум 8 символов' : undefined">
                <AppInput
                  v-model="form.password"
                  type="password"
                  placeholder="Введите пароль"
                  :autocomplete="isRegister ? 'new-password' : 'current-password'"
                />
              </AppFormField>
              <button v-if="!isRegister" type="button" class="forgot-link" @click="openResetMode">
                Забыли пароль?
              </button>

              <p v-if="error" class="error-text">{{ error }}</p>
              <AppButton
                type="submit"
                variant="primary"
                :disabled="authStore.isLoading || (isRegister && !form.acceptedTerms)"
              >
                {{ authStore.isLoading ? 'Подождите…' : isRegister ? 'Создать профиль' : 'Войти' }}
              </AppButton>
            </form>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ArrowLeft, ArrowUpRight, Check, Play } from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import AppFormField from '~/components/ui/AppFormField.vue'
import AppInput from '~/components/ui/AppInput.vue'
import {
  SUBSCRIPTION_PAYMENT_URL,
  SUBSCRIPTION_PRICE,
  useAccessStore,
} from '~/stores/access.store'
import { useAuthStore } from '~/stores/auth.store'
import { useNotification } from '~/composables/useNotification'
import { resetDemoData } from '~/utils/accessStorage'
import { getBackendFetchOptions, getBackendUrl } from '~/utils/backend'

const props = defineProps<{ mode: 'login' | 'register' }>()
const accessStore = useAccessStore()
const authStore = useAuthStore()
const { addNotification } = useNotification()
const router = useRouter()
const route = useRoute()
const isRegister = computed(() => props.mode === 'register')
const backendFetch = $fetch as unknown as <T = unknown>(
  url: string,
  options?: Record<string, unknown>
) => Promise<T>

const keepShortWords = (text: string) =>
  text.replace(/(^|[\s(])([А-Яа-яЁё]{1,2})\s+/g, '$1$2\u00a0')

const accessBenefits = [
  { title: 'Личный профиль', description: keepShortWords('Вход и доступ к вашему пространству COF.') },
  { title: 'Все инструменты', description: keepShortWords('Задачи, привычки, доска, фокус и аналитика.') },
  { title: 'Дальнейшие обновления', description: keepShortWords('Новые возможности будут доступны в профиле.') },
]

const PENDING_SUBSCRIPTION_KEY = 'carbon-pending-subscription'
const PENDING_SUBSCRIPTION_TTL = 24 * 60 * 60 * 1000

const error = ref('')
const subscriptionEmail = ref('')
const subscriptionError = ref('')
const isCheckingSubscription = ref(false)
const form = reactive({ name: '', email: '', password: '', acceptedTerms: false })
const resetMode = ref(false)
const resetEmail = ref('')
const resetPassword = ref('')
const resetMessage = ref('')
const isRequestingReset = ref(false)
const isConfirmingReset = ref(false)
const resetToken = computed(() => {
  const value = route.query.resetToken
  return typeof value === 'string' ? value : ''
})

onMounted(() => {
  const oauthError = typeof route.query.oauthError === 'string' ? route.query.oauthError : ''
  void resumePendingSubscription()
  if (!oauthError) return

  const message = getOAuthErrorMessage(oauthError)
  error.value = message
  addNotification({ type: 'warning', message, duration: 6000 })
  void router.replace('/auth')
})

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function readPendingSubscription() {
  if (!import.meta.client) return null

  try {
    const parsed = JSON.parse(localStorage.getItem(PENDING_SUBSCRIPTION_KEY) || 'null') as {
      email?: string
      createdAt?: number
    } | null

    if (!parsed?.email || !parsed.createdAt) return null
    if (Date.now() - parsed.createdAt > PENDING_SUBSCRIPTION_TTL) {
      localStorage.removeItem(PENDING_SUBSCRIPTION_KEY)
      return null
    }

    return parsed
  } catch {
    localStorage.removeItem(PENDING_SUBSCRIPTION_KEY)
    return null
  }
}

function writePendingSubscription(email: string) {
  if (!import.meta.client) return
  localStorage.setItem(
    PENDING_SUBSCRIPTION_KEY,
    JSON.stringify({ email, createdAt: Date.now() })
  )
}

function clearPendingSubscription() {
  if (import.meta.client) localStorage.removeItem(PENDING_SUBSCRIPTION_KEY)
}

function buildSubscriptionPaymentUrl(email: string) {
  const url = new URL(SUBSCRIPTION_PAYMENT_URL)
  url.searchParams.set('EMail', email)
  url.searchParams.set('Email', email)
  url.searchParams.set('Shp_email', email)
  url.searchParams.set('Shp_return', 'register')
  return url.toString()
}

async function resumePendingSubscription() {
  const pending = readPendingSubscription()
  if (!pending) return
  const pendingEmail = pending.email
  if (!pendingEmail) return

  subscriptionEmail.value = pendingEmail
  if (!form.email) form.email = pendingEmail

  if (!isRegister.value) {
    await router.replace('/register')
    return
  }

  const activated = await verifySubscription(pendingEmail, { silentMissing: true })
  if (!activated) return

  clearPendingSubscription()
  addNotification({
    type: 'success',
    message: 'Оплата найдена. Теперь можно создать профиль',
    duration: 6000,
  })
}

function startDemo() {
  resetDemoData()
  accessStore.startDemo()
  router.push('/')
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/onboarding')
}

function startOAuth(provider: 'google' | 'yandex') {
  const consent = form.acceptedTerms
    ? '?acceptedTerms=true&termsVersion=2026-06-07'
    : ''
  window.location.assign(`/api/auth/${provider}${consent}`)
}

function startSubscriptionPayment() {
  const email = normalizeEmail(form.email || subscriptionEmail.value)
  subscriptionError.value = ''

  if (!email.includes('@')) {
    subscriptionError.value = 'Сначала укажите email будущего профиля'
    return
  }

  subscriptionEmail.value = email
  form.email = email
  writePendingSubscription(email)
  window.location.assign(buildSubscriptionPaymentUrl(email))
}

function getOAuthErrorMessage(reason: string) {
  const map: Record<string, string> = {
    subscription:
      'Аккаунт не найден или подписка не активна. Сначала оплатите доступ, затем завершите регистрацию.',
    terms: 'Перед входом через Google или Яндекс нужно принять условия использования.',
    provider: 'Не удалось получить данные аккаунта у провайдера. Попробуйте ещё раз.',
    invalid: 'Некорректный ответ авторизации. Попробуйте войти ещё раз.',
    failed: 'Вход через сервис не выполнен. Проверьте подписку или попробуйте другой способ.',
  }

  return map[reason] || map.failed
}

function openResetMode() {
  error.value = ''
  resetMessage.value = ''
  resetEmail.value = form.email
  resetMode.value = true
}

async function requestPasswordReset() {
  error.value = ''
  resetMessage.value = ''
  const email = resetEmail.value.trim().toLowerCase()
  if (!email.includes('@')) {
    error.value = 'Укажите email профиля'
    return
  }

  isRequestingReset.value = true
  try {
    await backendFetch(getBackendUrl('/api/auth/password-reset/request'), {
      method: 'POST',
      body: { email },
      ...getBackendFetchOptions(),
    })
    resetMessage.value = 'Если профиль найден, письмо для восстановления уже отправлено.'
  } catch {
    error.value = 'Не удалось отправить письмо. Попробуйте чуть позже'
  } finally {
    isRequestingReset.value = false
  }
}

async function confirmPasswordReset() {
  error.value = ''
  resetMessage.value = ''
  if (resetPassword.value.length < 8) {
    error.value = 'Пароль должен быть не короче 8 символов'
    return
  }

  isConfirmingReset.value = true
  try {
    await backendFetch(getBackendUrl('/api/auth/password-reset/confirm'), {
      method: 'POST',
      body: { token: resetToken.value, password: resetPassword.value },
      ...getBackendFetchOptions(),
    })
    resetPassword.value = ''
    resetMessage.value = 'Пароль обновлён. Теперь можно войти.'
    addNotification({ type: 'success', message: 'Пароль обновлён' })
    await router.replace('/auth')
  } catch {
    error.value = 'Ссылка устарела или уже использована'
  } finally {
    isConfirmingReset.value = false
  }
}

async function verifySubscription(
  emailValue = form.email || subscriptionEmail.value,
  options: { silentMissing?: boolean } = {}
) {
  const email = normalizeEmail(emailValue)
  subscriptionError.value = ''

  if (!email.includes('@')) {
    subscriptionError.value = 'Укажите email профиля'
    return false
  }

  isCheckingSubscription.value = true
  try {
    const status = await backendFetch<{ active: boolean; expiresAt?: string }>(
      getBackendUrl('/api/subscription/status'),
      {
        query: { email },
        ...getBackendFetchOptions(),
      }
    )

    if (!status.active) {
      if (options.silentMissing) return false
      subscriptionError.value = 'Оплата для этого email пока не найдена'
      return false
    }

    subscriptionEmail.value = email
    if (!form.email) form.email = email
    accessStore.activateSubscription()
    clearPendingSubscription()
    return true
  } catch {
    subscriptionError.value = 'Не удалось проверить оплату. Попробуйте чуть позже'
    return false
  } finally {
    isCheckingSubscription.value = false
  }
}

async function submit() {
  error.value = ''
  form.email = form.email.trim()
  form.name = form.name.trim()
  if (!form.email || !form.password || (isRegister.value && !form.name)) {
    error.value = 'Заполните обязательные поля'
    return
  }
  if (form.password.length < 8) {
    error.value = 'Пароль должен быть не короче 8 символов'
    return
  }
  if (!accessStore.hasSubscription && !(await verifySubscription(form.email))) {
    error.value = 'Для входа и регистрации нужна активная подписка'
    return
  }
  const wasRegister = isRegister.value
  const result = wasRegister
    ? await authStore.register(form.email, form.password, form.name, 'cloud', form.acceptedTerms)
    : await authStore.login(form.email, form.password, 'cloud')
  if (!result.success) {
    error.value = result.error || 'Не удалось выполнить действие'
    return
  }
  accessStore.activateSubscription()
  if (wasRegister) {
    addWelcomeRegistrationLetter(form.name)
  }
  addNotification({ type: 'success', message: wasRegister ? 'Профиль создан' : 'Вход выполнен' })
  router.push('/')
}

function addWelcomeRegistrationLetter(name: string) {
  const displayName = name.trim() || 'Добро пожаловать'

  addNotification({
    type: 'success',
    category: 'user',
    source: 'platform',
    history: true,
    silent: true,
    message: `${displayName}, регистрация прошла успешно. Начните с трёх простых шагов: создайте первую ветку, добавьте 1-3 задачи на сегодня и запустите фокус на 25 минут. Пусть Core of Life помогает держать курс спокойно, без лишнего шума.`,
  })
}
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100dvh;
  padding: 24px;
  box-sizing: border-box;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-workspace {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.auth-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.94fr) minmax(0, 1.06fr);
  gap: 24px;
  align-items: stretch;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: 20px;

    .auth-panel {
      min-height: 0;
    }
  }
}

.auth-panel {
  @include glass;
  min-width: 0;
  min-height: 600px;
  padding: clamp(26px, 3.2vw, 40px);
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  box-sizing: border-box;

  @media (max-width: 560px) {
    padding: 24px;
  }
}

/* Левая панель (введение) */
.auth-intro {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.back-action {
  align-self: flex-start;
  margin-left: -8px;
}

.intro-content {
  display: grid;
  align-content: center;
  flex: 1;
  max-width: 460px;

  .badge {
    display: inline-block;
    margin-bottom: 14px;
    color: var(--dim);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0 0 18px;
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.2rem, 4vw, 3.5rem);
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.045em;
    overflow-wrap: normal;
    word-break: normal;
    hyphens: none;
    text-wrap: pretty;

    span {
      display: block;
      color: var(--dim);
    }
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.9rem;
    line-height: 1.6;
    overflow-wrap: normal;
    word-break: normal;
    hyphens: none;
  }
}

.intro-actions {
  display: flex;
  flex-direction: column;
  gap: 14px;

  :deep(.app-button) {
    width: 100%;
  }

  .route-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--text);
    font-size: 0.85rem;
    font-weight: 500;
    text-decoration: none;
    width: fit-content;
    transition: gap var(--transition-standard);

    &:hover {
      gap: 12px;
    }
  }
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 16px;
  margin-top: 2px;
  text-align: center;

  a {
    color: var(--dim);
    font-size: 0.7rem;
    text-decoration: none;
    transition: color var(--transition-standard);

    &:hover {
      color: var(--accent);
    }
  }
}

/* Правая панель (форма/подписка) */
.auth-form-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-form-panel > * {
  width: min(100%, 480px);
  margin-inline: auto;
}

.form-header,
.subscription-header {
  margin-bottom: 26px;
  text-align: left;

  .badge {
    display: block;
    margin-bottom: 9px;
    color: var(--dim);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0 0 10px;
    color: var(--text);
    font-size: clamp(1.65rem, 3vw, 2rem);
    font-weight: 600;
    line-height: 1.08;
    letter-spacing: -0.03em;
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.85rem;
    line-height: 1.5;
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;

  :deep(.app-button) {
    width: 100%;
    margin-top: 2px;
  }
}

.oauth-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.oauth-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-width: 0;
  min-height: var(--control-height-md);
  padding: 0 16px;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--accent) 7%, transparent);
    border-color: var(--ui-border-color);
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--accent) 16%, transparent);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.oauth-icon {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
}

.yandex-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fc3f1d;
  font-family: Arial, sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0;
  color: var(--dim);
  font-size: 0.72rem;

  &::before,
  &::after {
    content: '';
    height: 1px;
    flex: 1;
    background: var(--ui-border-color);
  }
}

.consent-control {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--dim);

  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .checkmark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    margin-top: 1px;
    border: var(--ui-border);
    border-radius: 4px;
    background: var(--glass-surface);
    color: transparent;
    transition: all var(--transition-standard);
  }

  input:checked + .checkmark {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--bg);
  }

  input:focus-visible + .checkmark {
    outline: 2px solid color-mix(in srgb, var(--accent) 18%, transparent);
    outline-offset: 2px;
  }

  a {
    color: var(--accent);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.oauth-consent {
  margin-bottom: 16px;
}

.error-text {
  margin: 0;
  color: var(--error);
  font-size: 0.8rem;
  text-align: left;
}

.success-text {
  margin: 0;
  color: var(--success);
  font-size: 0.8rem;
  line-height: 1.4;
  text-align: left;
}

.forgot-link {
  align-self: flex-start;
  width: fit-content;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--dim);
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  transition: color var(--transition-standard);

  &:hover {
    color: var(--text);
  }
}

/* Блок подписки */
.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 24px;
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
}

.benefit-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border-bottom: var(--ui-border);

  &:last-child {
    border-bottom: none;
  }

  svg {
    margin-top: 2px;
    color: var(--accent);
    flex-shrink: 0;
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  strong {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
  }

  span {
    font-size: 0.8rem;
    color: var(--dim);
    line-height: 1.4;
  }
}

.payment-link {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  gap: 10px;
  width: min(100%, 480px);
  max-width: 480px;
  min-height: var(--control-height-md);
  margin-inline: auto;
  padding: 12px 20px;
  box-sizing: border-box;
  background: var(--accent);
  border: none;
  border-radius: var(--border-radius-pill);
  color: var(--bg);
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  transition: opacity var(--transition-standard);

  &:hover {
    opacity: 0.9;
  }
}

.subscription-check {
  display: grid;
  gap: 12px;
  width: min(100%, 480px);
  max-width: 480px;
  margin: 14px auto 0;

  :deep(.app-button) {
    width: 100%;
  }

  .error-text {
    text-align: center;
  }
}

/* Адаптивность */
@media (max-width: 820px) {
  .auth-page {
    align-items: stretch;
    justify-content: flex-start;
    overflow: hidden;
    padding: 16px;
  }

  .auth-workspace {
    max-width: none;
    overflow: visible;
  }

  .auth-grid {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    height: calc(100dvh - 32px);
    padding-inline: 22px;
    box-sizing: border-box;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    scroll-padding-inline: 22px;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }

  }

  .auth-panel {
    position: relative;
    min-width: 0;
    min-height: 0;
    max-height: 100%;
    flex: 0 0 min(480px, calc(100vw - 78px));
    height: auto;
    overflow-y: auto;
    scroll-snap-align: center;
    scroll-snap-stop: always;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .auth-form-panel {
    order: 2;
    justify-content: flex-start;
  }

  .auth-intro {
    order: 1;
    gap: 20px;
  }

  .intro-content {
    flex: 0 0 auto;
    padding-block: 12px;
  }

  .intro-actions {
    gap: 10px;

    .route-link {
      align-self: center;
      justify-content: center;
      text-align: center;
    }
  }

  .form-header,
  .subscription-header {
    margin-bottom: 20px;
  }

  .subscription-header,
  .benefits-list,
  .payment-link {
    width: 100%;
  }

  .auth-form {
    gap: 13px;
  }

  .auth-divider {
    margin: 15px 0;
  }

  .benefits-list {
    margin-bottom: 18px;
  }

  .benefit-item {
    padding: 12px 14px;
    text-align: left;
  }
}

@media (max-width: 480px) {
  .auth-page {
    padding: 10px;
  }

  .auth-grid {
    height: calc(100dvh - 20px);
    padding-inline: 18px;
    scroll-padding-inline: 18px;
  }

  .auth-panel {
    flex-basis: calc(100vw - 88px);
    min-height: 0;
    padding: 18px;
  }

  .intro-content h1 {
    margin-bottom: 14px;
    font-size: clamp(1.8rem, 8vw, 2.4rem);
  }

  .intro-content p {
    font-size: 0.84rem;
    line-height: 1.5;
  }

  .form-header h2,
  .subscription-header h2 {
    font-size: 1.5rem;
  }

  .oauth-actions {
    gap: 8px;
  }

  .oauth-button {
    padding-inline: 12px;
  }

  .legal-links {
    gap: 8px 12px;
  }
}
</style>
