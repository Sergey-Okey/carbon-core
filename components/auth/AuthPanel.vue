<template>
  <div class="auth-page">
    <div
      class="auth-card"
      :class="{ 'is-mobile-form-open': isMobile && mobileFormOpen }"
    >
      <div
        class="auth-card__brand-slot"
        :class="{ 'is-mobile-landing': isMobile && !mobileFormOpen }"
      >
        <AuthBrandStage class="auth-card__brand" :slogan="brandSlogan" />

        <div
          v-if="isMobile && !mobileFormOpen"
          class="auth-mobile-dock"
          @pointerdown.stop
        >
          <AppButton
            type="button"
            variant="primary"
            size="lg"
            class="auth-mobile-dock__btn"
            @click="openMobileAuth"
          >
            Регистрация
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            size="lg"
            class="auth-mobile-dock__btn"
            @click.stop="startDemo"
          >
            <Play :size="18" />
            Демо
          </AppButton>
        </div>
      </div>

      <div
        v-if="!isMobile || mobileFormOpen"
        class="auth-card__form-slot"
        :class="{ 'is-mobile-overlay': isMobile && mobileFormOpen }"
      >
        <section ref="authFormPanel" class="auth-card__form">
          <div class="form-top">
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              class="back-action"
              @click="goBack"
            >
              <ArrowLeft :size="16" />
              Назад
            </AppButton>

            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              @click.stop="startDemo"
            >
              <Play :size="14" />
              Демо
            </AppButton>
          </div>

          <div class="form-header">
            <h1>{{ formTitle }}</h1>
            <p>{{ formDescription }}</p>
          </div>

        <template v-if="pendingVerification.active">
          <form class="auth-form" @submit.prevent="confirmEmailVerification">
            <div class="verification-card">
              <span>Код отправлен на</span>
              <strong>{{ pendingVerification.email }}</strong>
              <p>
                Введите код из письма и задайте пароль для входа. Код действует
                15 минут.
              </p>
            </div>
            <AppFormField
              label="Код подтверждения"
              :error="fieldErrors.code || undefined"
            >
              <AppInput
                v-model="pendingVerification.code"
                type="text"
                inputmode="numeric"
                placeholder="000000"
                autocomplete="one-time-code"
                maxlength="6"
                :invalid="Boolean(fieldErrors.code)"
                @update:model-value="onCodeInput"
              />
            </AppFormField>
            <AppFormField
              label="Пароль"
              hint="Не менее 8 символов, цифра и специальный символ"
              :error="fieldErrors.password || undefined"
            >
              <AppInput
                v-model="form.password"
                type="password"
                placeholder="Придумайте пароль"
                autocomplete="new-password"
                maxlength="128"
                :invalid="Boolean(fieldErrors.password)"
                @update:model-value="onPasswordInput"
              />
            </AppFormField>
            <AppFormField
              label="Подтвердите пароль"
              :error="fieldErrors.passwordConfirm || undefined"
            >
              <AppInput
                v-model="form.passwordConfirm"
                type="password"
                placeholder="Повторите пароль"
                autocomplete="new-password"
                maxlength="128"
                :invalid="Boolean(fieldErrors.passwordConfirm)"
                @update:model-value="onPasswordConfirmInput"
              />
            </AppFormField>
            <p v-if="resetMessage" class="success-text">{{ resetMessage }}</p>
            <p v-if="error" class="error-text">{{ error }}</p>
            <AppButton
              type="submit"
              variant="primary"
              class="submit-btn"
              :loading="authStore.isLoading"
              :disabled="authStore.isLoading"
            >
              {{
                authStore.isLoading ? 'Проверяем…' : 'Подтвердить и войти'
              }}
            </AppButton>
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              class="inline-action"
              @click="resendEmailVerification"
            >
              Отправить код ещё раз
            </AppButton>
          </form>
        </template>

        <template v-else-if="resetToken">
          <form class="auth-form" @submit.prevent="confirmPasswordReset">
            <AppFormField
              label="Новый пароль"
              hint="Минимум 8 символов"
              :error="fieldErrors.resetPassword || undefined"
            >
              <AppInput
                v-model="resetPassword"
                type="password"
                placeholder="Введите новый пароль"
                autocomplete="new-password"
                maxlength="128"
                :invalid="Boolean(fieldErrors.resetPassword)"
                @update:model-value="onResetPasswordInput"
              />
            </AppFormField>
            <p v-if="resetMessage" class="success-text">{{ resetMessage }}</p>
            <p v-if="error" class="error-text">{{ error }}</p>
            <AppButton
              type="submit"
              variant="primary"
              class="submit-btn"
              :loading="isConfirmingReset"
              :disabled="isConfirmingReset"
            >
              {{
                isConfirmingReset ? 'Сохраняем…' : 'Сохранить новый пароль'
              }}
            </AppButton>
          </form>
        </template>

        <template v-else-if="resetMode">
          <form class="auth-form" @submit.prevent="requestPasswordReset">
            <AppFormField
              label="Email профиля"
              :error="fieldErrors.resetEmail || undefined"
            >
              <AppInput
                v-model="resetEmail"
                type="email"
                inputmode="email"
                placeholder="email@example.com"
                autocomplete="email"
                maxlength="254"
                :invalid="Boolean(fieldErrors.resetEmail)"
                @update:model-value="onResetEmailInput"
              />
            </AppFormField>
            <p v-if="resetMessage" class="success-text">{{ resetMessage }}</p>
            <p v-if="error" class="error-text">{{ error }}</p>
            <AppButton
              type="submit"
              variant="primary"
              class="submit-btn"
              :loading="isRequestingReset"
              :disabled="isRequestingReset"
            >
              {{ isRequestingReset ? 'Отправляем…' : 'Отправить письмо' }}
            </AppButton>
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              class="inline-action"
              @click="resetMode = false"
            >
              Вернуться ко входу
            </AppButton>
          </form>
        </template>

        <template v-else>
          <form class="auth-form" @submit.prevent="submit">
            <AppFormField label="Email" :error="fieldErrors.email || undefined">
              <AppInput
                v-model="form.email"
                type="email"
                inputmode="email"
                placeholder="email@example.com"
                autocomplete="email"
                maxlength="254"
                :invalid="Boolean(fieldErrors.email)"
                @update:model-value="onEmailInput"
              />
            </AppFormField>

            <AppFormField
              v-if="!isRegister"
              label="Пароль"
              :error="fieldErrors.password || undefined"
            >
              <AppInput
                v-model="form.password"
                type="password"
                placeholder="Введите пароль"
                maxlength="128"
                autocomplete="current-password"
                :invalid="Boolean(fieldErrors.password)"
                @update:model-value="onPasswordInput"
              />
            </AppFormField>

            <AppButton
              v-if="!isRegister"
              type="button"
              variant="ghost"
              size="sm"
              class="inline-action forgot"
              @click="openResetMode"
            >
              Забыли пароль?
            </AppButton>

            <div v-if="isRegister" class="consent-block">
              <AppCheckbox
                v-model="form.acceptedTerms"
                size="sm"
                class="oauth-consent"
                :invalid="Boolean(fieldErrors.terms)"
                @update:model-value="fieldErrors.terms = ''"
              >
                Принимаю
                <NuxtLink to="/terms">условия использования</NuxtLink>
                и
                <NuxtLink to="/privacy">политику конфиденциальности</NuxtLink>
              </AppCheckbox>
              <p v-if="fieldErrors.terms" class="error-text" role="alert">
                {{ fieldErrors.terms }}
              </p>
            </div>

            <p v-if="error && !oauthMessage" class="error-text">{{ error }}</p>

            <AppButton
              type="submit"
              variant="primary"
              class="submit-btn"
              :loading="authStore.isLoading"
              :disabled="authStore.isLoading"
            >
              {{
                authStore.isLoading
                  ? 'Подождите…'
                  : isRegister
                    ? 'Продолжить'
                    : 'Войти'
              }}
            </AppButton>
          </form>

          <div class="auth-divider"><span>или</span></div>

          <div class="oauth-actions" aria-label="Войти через сервис">
            <AppButton
              type="button"
              variant="secondary"
              class="oauth-button"
              :disabled="isStartingOAuth || !oauthProviders.google"
              @click="startOAuth('google')"
            >
              <svg
                class="oauth-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285f4"
                  d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
                />
                <path
                  fill="#34a853"
                  d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
                />
                <path
                  fill="#fbbc05"
                  d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.11-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z"
                />
                <path
                  fill="#ea4335"
                  d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
                />
              </svg>
              Google
            </AppButton>
            <AppButton
              type="button"
              variant="secondary"
              class="oauth-button"
              :disabled="isStartingOAuth || !oauthProviders.yandex"
              @click="startOAuth('yandex')"
            >
              <span class="oauth-icon yandex-icon" aria-hidden="true">Я</span>
              Яндекс
            </AppButton>
          </div>
          <p class="oauth-note">
            Продолжая через Google или Яндекс, вы принимаете
            <NuxtLink to="/terms">условия</NuxtLink>
            и
            <NuxtLink to="/privacy">политику конфиденциальности</NuxtLink>.
          </p>
          <p v-if="oauthMessage" class="error-text">{{ oauthMessage }}</p>

          <p class="switch-mode">
            {{ isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?' }}
            <button
              v-if="isMobile"
              type="button"
              class="switch-mode__link"
              @click="switchMobileAuthMode"
            >
              {{ isRegister ? 'Войти' : 'Зарегистрироваться' }}
            </button>
            <NuxtLink v-else :to="isRegister ? '/auth' : '/register'">
              {{ isRegister ? 'Войти' : 'Зарегистрироваться' }}
            </NuxtLink>
          </p>
        </template>

          <div class="legal-links">
            <NuxtLink to="/terms">Условия использования</NuxtLink>
            <NuxtLink to="/privacy">Конфиденциальность</NuxtLink>
            <NuxtLink to="/support">Поддержка</NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { ArrowLeft, Play } from 'lucide-vue-next'
import { resetDemoData } from '~/utils/accessStorage'
import { seedDemoWorkspaceIfNeeded } from '~/utils/demoSeed'
import { getBackendFetchOptions, getBackendUrl } from '~/utils/backend'

const props = defineProps<{ mode: 'login' | 'register' }>()
const accessStore = useAccessStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const isMobile = useMediaQuery('(max-width: 900px)')
const mobileFormOpen = ref(false)
const mobileAuthMode = ref<'login' | 'register'>(props.mode)

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const AUTH_VISIT_KEY = 'carbon-auth-visited'

function resolveMobileAuthMode(): 'login' | 'register' {
  if (!import.meta.client) return 'register'

  const users = safeParse<unknown[]>(localStorage.getItem('carbon-users'), [])
  if (users.length > 0) return 'login'

  const onboarding = safeParse<{ hasSeenOnboarding?: boolean } | null>(
    localStorage.getItem('carbon-onboarding'),
    null
  )
  if (onboarding?.hasSeenOnboarding) return 'login'

  if (localStorage.getItem(AUTH_VISIT_KEY) === '1') return 'login'

  return 'register'
}

const effectiveMode = computed(() => {
  if (isMobile.value && mobileFormOpen.value) return mobileAuthMode.value
  return props.mode
})

const isRegister = computed(() => effectiveMode.value === 'register')
const backendFetch = $fetch as unknown as <T = unknown>(
  url: string,
  options?: Record<string, unknown>
) => Promise<T>

const keepShortWords = (text: string) =>
  text.replace(/(^|[\s(])([А-Яа-яЁё]{1,2})\s+/g, '$1$2\u00a0')

const brandSlogan = computed(() =>
  keepShortWords('Рожденный в хаосе - стремится к порядку.')
)

const formTitle = computed(() =>
  isRegister.value ? 'Создайте аккаунт' : 'С возвращением'
)

const formDescription = computed(() =>
  keepShortWords(
    isRegister.value
      ? 'Укажите email — пароль зададите после подтверждения письма.'
      : 'Введите email и пароль, чтобы войти.'
  )
)

const AUTH_FORM_SCROLL_KEY = 'carbon-auth-open-form'

const authFormPanel = ref<HTMLElement | null>(null)
const error = ref('')
const form = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
  acceptedTerms: false,
})
const fieldErrors = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
  terms: '',
  code: '',
  resetEmail: '',
  resetPassword: '',
})
const pendingVerification = reactive({ active: false, email: '', code: '' })
const resetMode = ref(false)
const resetEmail = ref('')
const resetPassword = ref('')
const resetMessage = ref('')
const isRequestingReset = ref(false)
const isConfirmingReset = ref(false)
const isStartingOAuth = ref(false)
const oauthMessage = ref('')
const oauthProviders = reactive({ google: true, yandex: true })
const resetToken = computed(() => {
  const value = route.query.resetToken
  return typeof value === 'string' ? value : ''
})

async function loadOAuthProviders() {
  try {
    const response = await backendFetch<{ google?: boolean; yandex?: boolean }>(
      getBackendUrl('/api/auth/providers'),
      { ...getBackendFetchOptions() }
    )
    oauthProviders.google = Boolean(response.google)
    oauthProviders.yandex = Boolean(response.yandex)
    if (!oauthProviders.google && !oauthProviders.yandex) {
      oauthMessage.value =
        'Вход через Google и Яндекс пока не настроен на сервере.'
    }
  } catch {
    oauthProviders.google = false
    oauthProviders.yandex = false
  }
}

function clearFieldErrors() {
  fieldErrors.email = ''
  fieldErrors.password = ''
  fieldErrors.passwordConfirm = ''
  fieldErrors.terms = ''
  fieldErrors.code = ''
  fieldErrors.resetEmail = ''
  fieldErrors.resetPassword = ''
}

function onEmailInput(value: string | number | undefined) {
  form.email = formatEmailInput(String(value ?? ''))
  fieldErrors.email = ''
}

function onCodeInput(value: string | number | undefined) {
  pendingVerification.code = formatCodeInput(String(value ?? ''))
  fieldErrors.code = ''
}

function onPasswordInput(value: string | number | undefined) {
  form.password = formatPasswordInput(String(value ?? ''))
  fieldErrors.password = ''
}

function onPasswordConfirmInput(value: string | number | undefined) {
  form.passwordConfirm = formatPasswordInput(String(value ?? ''))
  fieldErrors.passwordConfirm = ''
}

function onResetEmailInput(value: string | number | undefined) {
  resetEmail.value = formatEmailInput(String(value ?? ''))
  fieldErrors.resetEmail = ''
}

function onResetPasswordInput(value: string | number | undefined) {
  resetPassword.value = formatPasswordInput(String(value ?? ''))
  fieldErrors.resetPassword = ''
}

function validateAuthForm() {
  clearFieldErrors()

  fieldErrors.email = validateEmail(form.email)

  if (isRegister.value) {
    if (!form.acceptedTerms) {
      fieldErrors.terms = 'Примите условия использования'
    }
  } else {
    fieldErrors.password = validatePassword(form.password)
  }

  return ![fieldErrors.email, fieldErrors.password, fieldErrors.terms].some(
    Boolean
  )
}

onMounted(() => {
  void loadOAuthProviders()

  if (import.meta.client && isMobile.value) {
    const hasDeepLink =
      Boolean(resetToken.value) ||
      route.query.oauth === 'success' ||
      typeof route.query.oauthError === 'string' ||
      typeof route.query.resetToken === 'string'

    if (hasDeepLink) {
      mobileAuthMode.value = props.mode === 'register' ? 'register' : 'login'
      mobileFormOpen.value = true
    }
  }

  if (
    import.meta.client &&
    sessionStorage.getItem(AUTH_FORM_SCROLL_KEY) === '1'
  ) {
    sessionStorage.removeItem(AUTH_FORM_SCROLL_KEY)
    scheduleAuthFormScroll()
  }

  const oauthError =
    typeof route.query.oauthError === 'string' ? route.query.oauthError : ''
  const oauthSuccess = route.query.oauth === 'success'

  if (oauthSuccess) {
    void authStore.init({ force: true }).then(() => {
      void router.replace('/')
    })
    return
  }

  if (!oauthError) return

  oauthMessage.value = getOAuthErrorMessage(oauthError)
  void router.replace({ path: isRegister.value ? '/register' : '/auth' })
})

function openMobileAuth() {
  mobileAuthMode.value = resolveMobileAuthMode()
  if (import.meta.client) {
    localStorage.setItem(AUTH_VISIT_KEY, '1')
  }
  mobileFormOpen.value = true
}

function closeMobileForm() {
  mobileFormOpen.value = false
  error.value = ''
  oauthMessage.value = ''
  clearFieldErrors()
}

function switchMobileAuthMode() {
  mobileAuthMode.value = isRegister.value ? 'login' : 'register'
  error.value = ''
  oauthMessage.value = ''
  clearFieldErrors()
}

function startDemo() {
  try {
    resetDemoData()
    accessStore.startDemo()
    void seedDemoWorkspaceIfNeeded()
      .catch(() => undefined)
      .finally(() => {
        void router.push('/')
      })
  } catch {
    accessStore.startDemo()
    void router.push('/')
  }
}

function scheduleAuthFormScroll() {
  if (!import.meta.client) return

  window.setTimeout(() => {
    if (!window.matchMedia('(max-width: 900px)').matches) return
    authFormPanel.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, 80)
}

function goBack() {
  if (isMobile.value && mobileFormOpen.value) {
    closeMobileForm()
    return
  }

  router.push('/onboarding')
}

function startOAuth(provider: 'google' | 'yandex') {
  error.value = ''
  oauthMessage.value = ''
  fieldErrors.terms = ''

  if (!oauthProviders[provider]) {
    oauthMessage.value =
      provider === 'google'
        ? 'Google вход не настроен. Добавьте NUXT_GOOGLE_CLIENT_ID и SECRET на сервере.'
        : 'Яндекс вход не настроен. Добавьте NUXT_YANDEX_CLIENT_ID и SECRET на сервере.'
    return
  }

  isStartingOAuth.value = true
  window.location.assign(
    getBackendUrl(
      `/api/auth/${provider}?acceptedTerms=true&termsVersion=2026-06-07`
    )
  )
}

function getOAuthErrorMessage(reason: string) {
  const map: Record<string, string> = {
    terms:
      'Перед входом через Google или Яндекс нужно принять условия использования.',
    provider:
      'OAuth не настроен или провайдер не вернул данные. Проверьте Client ID/Secret и redirect URI.',
    invalid: 'Некорректный ответ авторизации. Попробуйте войти ещё раз.',
    failed: 'Вход через сервис не выполнен. Попробуйте другой способ.',
  }

  return map[reason] || map.failed
}

function openResetMode() {
  error.value = ''
  resetMessage.value = ''
  pendingVerification.active = false
  resetEmail.value = form.email
  resetMode.value = true
}

async function confirmEmailVerification() {
  error.value = ''
  resetMessage.value = ''
  fieldErrors.code = validateVerificationCode(pendingVerification.code)
  fieldErrors.password = validatePassword(form.password, { strict: true })
  fieldErrors.passwordConfirm = validatePasswordConfirm(
    form.password,
    form.passwordConfirm
  )
  if (
    fieldErrors.code ||
    fieldErrors.password ||
    fieldErrors.passwordConfirm
  ) {
    return
  }

  const email = pendingVerification.email || form.email.trim().toLowerCase()
  const code = pendingVerification.code.trim()

  const result = await authStore.verifyEmail(email, code, form.password)
  if (!result.success) {
    error.value = result.error || 'Не удалось подтвердить email'
    return
  }

  accessStore.activateSubscription()
  router.push('/profile')
}

async function resendEmailVerification() {
  error.value = ''
  resetMessage.value = ''
  const email = pendingVerification.email || form.email.trim().toLowerCase()
  if (!email.includes('@')) {
    error.value = 'Укажите email профиля'
    return
  }

  try {
    const response = await backendFetch<{ ok: boolean; sent: boolean }>(
      getBackendUrl('/api/auth/email-verification/resend'),
      {
        method: 'POST',
        body: { email },
        ...getBackendFetchOptions(),
      }
    )
    resetMessage.value = response.sent
      ? 'Новый код отправлен. Проверьте почту.'
      : 'Код не отправлен: email уже подтверждён или почтовый сервис недоступен.'
  } catch {
    error.value =
      'Не удалось отправить новый код. Попробуйте ещё раз чуть позже.'
  } finally {
    pendingVerification.code = ''
  }
}

async function requestPasswordReset() {
  error.value = ''
  resetMessage.value = ''
  fieldErrors.resetEmail = validateEmail(resetEmail.value)
  if (fieldErrors.resetEmail) return

  const email = resetEmail.value.trim().toLowerCase()

  isRequestingReset.value = true
  try {
    const response = await backendFetch<{ ok: boolean; sent?: boolean }>(
      getBackendUrl('/api/auth/password-reset/request'),
      {
        method: 'POST',
        body: { email },
        ...getBackendFetchOptions(),
      }
    )
    resetMessage.value = response.sent
      ? 'Если профиль найден, письмо для восстановления уже отправлено.'
      : 'Заявка принята, но почта на сервере пока не настроена. Напишите в поддержку, чтобы восстановить доступ вручную.'
  } catch {
    error.value =
      'Не удалось отправить письмо. Проверьте email и попробуйте ещё раз.'
  } finally {
    isRequestingReset.value = false
  }
}

async function confirmPasswordReset() {
  error.value = ''
  resetMessage.value = ''
  fieldErrors.resetPassword = validatePassword(resetPassword.value)
  if (fieldErrors.resetPassword) return

  isConfirmingReset.value = true
  try {
    await backendFetch(getBackendUrl('/api/auth/password-reset/confirm'), {
      method: 'POST',
      body: { token: resetToken.value, password: resetPassword.value },
      ...getBackendFetchOptions(),
    })
    resetPassword.value = ''
    resetMessage.value = 'Пароль обновлён. Теперь можно войти.'
    await router.replace('/auth')
  } catch {
    error.value = 'Ссылка устарела или уже использована'
  } finally {
    isConfirmingReset.value = false
  }
}

async function submit() {
  error.value = ''
  oauthMessage.value = ''
  form.email = form.email.trim()

  if (!validateAuthForm()) {
    error.value = 'Проверьте поля формы'
    return
  }

  const wasRegister = isRegister.value
  const result: {
    success: boolean
    error?: string
    requiresVerification?: boolean
    email?: string
  } = wasRegister
    ? await authStore.register(form.email, 'cloud', form.acceptedTerms)
    : await authStore.login(form.email, form.password, 'cloud')
  if (!result.success) {
    error.value = result.error || 'Не удалось выполнить действие'
    if (!wasRegister && error.value.includes('Подтвердите email')) {
      pendingVerification.active = true
      pendingVerification.email = form.email.trim().toLowerCase()
      pendingVerification.code = ''
      form.password = ''
      form.passwordConfirm = ''
      resetMessage.value =
        'Введите код из письма и задайте пароль — или запросите новый код.'
    }
    return
  }
  if (result.requiresVerification) {
    pendingVerification.active = true
    pendingVerification.email = result.email || form.email.trim().toLowerCase()
    pendingVerification.code = ''
    form.password = ''
    form.passwordConfirm = ''
    resetMode.value = false
    resetMessage.value =
      'Мы отправили код на почту. Введите его и задайте пароль.'
    return
  }
  accessStore.activateSubscription()
  router.push('/')
}
</script>

<style scoped lang="scss">
.auth-page {
  --auth-substrate: var(--color-bg);
  width: 100%;
  height: 100dvh;
  margin: 0;
  padding: var(--space-2);
  box-sizing: border-box;
  overflow: hidden;
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.auth-card {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 550px);
  gap: var(--space-2);
  overflow: hidden;
  background: transparent;
  animation: fade-in var(--duration-normal) var(--ease-standard) both;
}

.auth-card__brand-slot,
.auth-card__form-slot {
  min-width: 0;
  min-height: 0;
  height: 100%;
  box-sizing: border-box;
  border-radius: var(--radius-lg);
  background: transparent;
  overflow: hidden;
}

.auth-card__brand-slot {
  padding: var(--space-2);
  position: relative;
  background: transparent;
}

.auth-card__form-slot {
  display: flex;
  justify-content: stretch;
  padding: var(--space-2);
}

.auth-card__brand {
  height: 100%;
  min-height: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg);
  transition: background var(--transition-standard);
}

.auth-card__form {
  --pad: var(--space-4);
  width: 100%;
  max-width: 550px;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-height: 0;
  height: 100%;
  margin-inline: auto;
  padding: var(--pad);
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-text-primary);
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  animation: fade-in var(--duration-normal) var(--ease-standard) both;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }

  :deep(.app-input) {
    min-height: 48px;
    font-size: var(--text-md);
  }

  :deep(.field-label) {
    font-size: var(--text-sm);
  }
}

.form-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-shrink: 0;
}

.back-action {
  margin-left: calc(var(--space-2) * -1);
}

.form-header {
  display: grid;
  gap: var(--space-2);
  flex-shrink: 0;

  h1 {
    margin: 0;
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    font-size: clamp(1.85rem, 2.8vw, 2.4rem);
    font-weight: var(--weight-semibold);
    letter-spacing: -0.035em;
    line-height: var(--leading-tight);
    overflow-wrap: normal;
    word-break: normal;
  }

  p {
    margin: 0;
    max-width: 36ch;
    color: var(--color-text-secondary);
    font-size: var(--text-md);
    line-height: var(--leading-normal);
    overflow-wrap: normal;
    word-break: normal;
  }
}

.consent-block {
  display: grid;
  gap: var(--space-1);
  flex-shrink: 0;
}

.oauth-consent {
  color: var(--color-text-secondary);

  :deep(a) {
    color: var(--color-text-primary);
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: var(--color-accent);
    }
  }
}

.oauth-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
  flex-shrink: 0;
}

.oauth-button {
  width: 100%;
}

.oauth-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.yandex-icon {
  display: inline-grid;
  place-items: center;
  border-radius: var(--radius-sm);
  background: #fc3f1d;
  color: #fff;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
}

.auth-divider {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  flex-shrink: 0;

  &::before,
  &::after {
    content: '';
    height: 1px;
    background: var(--color-border);
  }
}

.auth-form {
  display: grid;
  gap: var(--space-3);
  flex: 0 0 auto;
  align-content: start;
  overflow: visible;
}

.password-row {
  display: grid;
  gap: var(--space-3);

  &.is-split {
    grid-template-columns: 1fr 1fr;

    @media (max-width: 560px) {
      grid-template-columns: 1fr;
    }
  }
}

.verification-card {
  @include surface-panel;
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);

  strong {
    color: var(--color-text-primary);
  }

  p {
    margin: var(--space-1) 0 0;
    line-height: var(--leading-normal);
  }
}

.submit-btn {
  width: 100%;
  min-height: 52px;
  font-size: var(--text-md);
}

.inline-action {
  justify-self: start;
  width: fit-content;

  &.forgot {
    margin-top: calc(var(--space-1) * -1);
  }
}

.password-hint {
  margin: calc(var(--space-1) * -1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
}

.oauth-note {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
  flex-shrink: 0;

  a {
    color: var(--color-text-secondary);
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: var(--color-text-primary);
    }
  }
}

.switch-mode {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  flex-shrink: 0;

  a,
  &__link {
    color: var(--color-text-primary);
    font-weight: var(--weight-medium);
    text-decoration: none;
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    cursor: pointer;

    &:hover {
      color: var(--color-accent);
    }
  }
}

.auth-mobile-dock {
  display: none;
}

.auth-mobile-dock__btn {
  width: 100%;
  min-height: 64px;
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2) var(--space-4);
  margin-top: auto;
  padding-top: var(--space-2);
  flex-shrink: 0;
  text-align: center;

  a {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    text-decoration: none;

    &:hover {
      color: var(--color-text-secondary);
    }
  }
}

.error-text,
.success-text {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-tight);
}

.error-text {
  color: var(--color-error);
}

.success-text {
  color: var(--color-success);
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 900px) {
  .auth-page {
    padding: var(--space-2);
  }

  .auth-card {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    gap: 0;
  }

  .auth-card__brand-slot {
    padding: 0;
    background: transparent;
  }

  .auth-card__brand-slot.is-mobile-landing {
    grid-row: 1 / -1;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    height: 100%;
    min-height: 0;
    padding: 0;
  }

  .auth-card__brand-slot.is-mobile-landing .auth-card__brand {
    position: relative;
    z-index: 1;
    flex: 1 1 auto;
    min-height: 0;

    height: 0;
    pointer-events: none;
  }

  .auth-mobile-dock {
    display: grid;
    position: relative;
    z-index: 6;
    flex: 0 0 auto;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
    width: 100%;
    padding-inline: 0;
    padding-bottom: max(var(--space-2), env(safe-area-inset-bottom, 0px));
    box-sizing: border-box;
    pointer-events: auto;
    isolation: isolate;
  }

  .auth-mobile-dock__btn {
    min-height: 64px;
    font-size: var(--text-lg);
  }

  .auth-card__form-slot.is-mobile-overlay {
    position: fixed;
    inset: 0;
    z-index: 15;
    padding: var(--space-2);
    padding-bottom: max(var(--space-2), env(safe-area-inset-bottom, 0px));
    background: var(--color-bg);
  }

  .auth-card__form-slot.is-mobile-overlay .auth-card__form {
    background: transparent;
  }

  .auth-card__form {
    --pad: var(--space-3);
    max-width: none;
    height: 100%;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
  }

  .form-header h1 {
    font-size: clamp(1.5rem, 7vw, 2rem);
  }

  .oauth-actions {
    grid-template-columns: 1fr 1fr;
  }

  .oauth-note {
    text-align: center;
  }

  .switch-mode {
    text-align: center;
  }

  .password-row.is-split {
    grid-template-columns: 1fr;
  }
}

@media (max-height: 760px) {
  .form-header p {
    display: none;
  }

  .auth-card__form {
    gap: var(--space-2);
    --pad: var(--space-3);
  }

  .auth-form {
    gap: var(--space-2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-card,
  .auth-card__form {
    animation: none;
  }
}
</style>
