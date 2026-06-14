<template>
  <div class="auth-page">
    <div class="auth-workspace">
      <div class="auth-grid" :class="{ 'is-subscription-showcase': showSubscriptionShowcase }">
        <div class="auth-panel auth-intro">
          <AppButton type="button" variant="ghost" size="sm" class="back-action" @click="goBack">
            <ArrowLeft :size="16" />
            Назад
          </AppButton>

          <template v-if="showSubscriptionShowcase">
            <div class="showcase-copy">
              <span class="badge">Core of Life</span>
              <h1>
                Ваша система задач
                <span>в одном месте.</span>
              </h1>
              <p>
                Задачи, привычки, доска и фокус. Посмотрите, как всё работает, без регистрации.
              </p>

              <div class="device-progress" aria-hidden="true">
                <span class="active"></span>
                <span></span>
                <span></span>
              </div>

              <AppButton type="button" variant="primary" class="demo-action" @click="startDemo">
                <Play :size="15" />
                Попробовать демо
              </AppButton>
              <NuxtLink class="route-link" to="/auth">
                Уже есть профиль? Войти
                <ArrowUpRight :size="15" />
              </NuxtLink>
            </div>
          </template>

          <template v-else>
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
          </template>

          <div class="legal-links">
            <NuxtLink to="/privacy">Конфиденциальность</NuxtLink>
            <NuxtLink to="/terms">Условия</NuxtLink>
            <NuxtLink to="/support">Поддержка</NuxtLink>
          </div>
        </div>

        <div class="auth-panel auth-form-panel">
          <template v-if="showSubscriptionShowcase">
            <div class="subscription-header">
              <span class="badge">Полный доступ</span>
              <h2>Больше возможностей</h2>
              <p>Личный профиль и все инструменты Core of Life в одном доступе.</p>
            </div>

            <div class="subscription-shell">
              <div class="benefits-list">
                <div v-for="item in accessBenefits" :key="item.title" class="benefit-item">
                  <div>
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.description }}</span>
                  </div>
                  <Check :size="16" />
                </div>
              </div>

              <AppButton type="button" variant="primary" class="payment-action" @click="openPayment">
                Оплатить доступ · {{ SUBSCRIPTION_PRICE }} ₽
                <ArrowUpRight :size="16" />
              </AppButton>

              <AppButton type="button" variant="ghost" size="sm" class="demo-action-secondary" @click="startDemo">
                Попробовать демо
              </AppButton>

              <p class="subscription-note">
                Нажимая «Оплатить доступ», вы принимаете условия использования.
              </p>
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

            <form class="auth-form" @submit.prevent="submit">
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
import { computed, reactive, ref } from 'vue'
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

const props = defineProps<{ mode: 'login' | 'register' }>()
const accessStore = useAccessStore()
const authStore = useAuthStore()
const { addNotification } = useNotification()
const router = useRouter()
const isRegister = computed(() => props.mode === 'register')
const showSubscriptionShowcase = computed(() => isRegister.value && !accessStore.hasSubscription)

const keepShortWords = (text: string) =>
  text.replace(/(^|[\s(])([А-Яа-яЁё]{1,2})\s+/g, '$1$2\u00a0')

const accessBenefits = [
  { title: 'Личный профиль', description: keepShortWords('Ваше пространство Core of Life.') },
  { title: 'Все инструменты', description: keepShortWords('Задачи, доска, фокус и аналитика.') },
  { title: 'Обновления', description: keepShortWords('Новые функции входят в доступ.') },
]

const error = ref('')
const form = reactive({ name: '', email: '', password: '', acceptedTerms: false })

function startDemo() {
  resetDemoData()
  accessStore.startDemo()
  router.push('/')
}

function openPayment() {
  window.open(SUBSCRIPTION_PAYMENT_URL, '_blank', 'noopener,noreferrer')
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
  if (isRegister.value && !accessStore.hasSubscription) {
    error.value = 'Для регистрации нужна подписка'
    return
  }
  const result = isRegister.value
    ? await authStore.register(form.email, form.password, form.name, 'local', form.acceptedTerms)
    : await authStore.login(form.email, form.password, 'local')
  if (!result.success) {
    error.value = result.error || 'Не удалось выполнить действие'
    return
  }
  accessStore.activateSubscription()
  addNotification({ type: 'success', message: isRegister.value ? 'Профиль создан' : 'Вход выполнен' })
  router.push('/')
}
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100dvh;
  padding: 24px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 18% 16%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 32%),
    radial-gradient(circle at 82% 22%, color-mix(in srgb, white 10%, transparent), transparent 24%),
    radial-gradient(circle at 50% 82%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 28%),
    linear-gradient(180deg, color-mix(in srgb, var(--bg) 96%, transparent), var(--bg));
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-workspace {
  width: 100%;
  max-width: 1220px;
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

.auth-grid.is-subscription-showcase {
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
}

.auth-panel {
  @include glass;
  min-width: 0;
  min-height: 640px;
  padding: clamp(26px, 3.2vw, 40px);
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  box-sizing: border-box;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--bg) 98%, transparent));
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, white 8%, transparent),
    0 26px 60px color-mix(in srgb, var(--bg) 26%, transparent);

  @media (max-width: 560px) {
    padding: 24px;
  }
}

.auth-intro {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 28px;
  overflow: hidden;
}

.back-action {
  align-self: flex-start;
  margin-left: -8px;
  position: relative;
  z-index: 2;
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
  }
}

.showcase-copy {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 16px;
  max-width: 540px;

  .badge {
    display: inline-block;
    color: var(--dim);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.3rem, 4.2vw, 3.95rem);
    font-weight: 600;
    line-height: 0.96;
    letter-spacing: -0.05em;
    text-wrap: balance;

    span {
      display: block;
      color: var(--dim);
    }
  }

  p {
    margin: 0;
    max-width: 500px;
    color: var(--dim);
    font-size: 0.95rem;
    line-height: 1.65;
  }
}

.showcase-eyebrow {
  color: var(--dim);
  font-size: 0.8rem;
  line-height: 1.5;
}

.showcase-points {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  span {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 0 12px;
    border: var(--ui-border);
    border-radius: var(--border-radius-pill);
    background: color-mix(in srgb, var(--surface) 72%, transparent);
    color: var(--text);
    font-size: 0.76rem;
    line-height: 1;
    white-space: nowrap;
  }
}

.showcase-stage {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(0, 1fr);
  gap: 20px;
  align-items: end;
  min-height: 400px;
  margin-top: auto;
  padding: 12px 6px 6px;

  &::before {
    content: '';
    position: absolute;
    inset: 13% 10% 7%;
    border-radius: 999px;
    background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 24%, transparent) 0%, transparent 72%);
    filter: blur(46px);
    opacity: 0.9;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 4% 8% auto;
    height: 56%;
    background: linear-gradient(180deg, color-mix(in srgb, var(--text) 6%, transparent), transparent 82%);
    mask-image: linear-gradient(180deg, black, transparent);
    opacity: 0.5;
    pointer-events: none;
  }
}

.stage-title {
  position: absolute;
  inset: -10px 0 auto;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(3rem, 8vw, 6.8rem);
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.07em;
  color: color-mix(in srgb, var(--text) 8%, transparent);
  pointer-events: none;
  user-select: none;
}

.device-card {
  position: relative;
  z-index: 1;
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--ui-border-color) 90%, transparent);
  border-radius: 34px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--bg) 96%, transparent));
  box-shadow: inset 0 1px 0 color-mix(in srgb, white 10%, transparent), 0 24px 60px color-mix(in srgb, var(--bg) 36%, transparent);
}

.demo-device {
  transform: translateY(26px) scale(0.965);
  transform-origin: center bottom;
}

.device-screen {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  min-height: 292px;
  padding: 18px 16px 16px;
  border-radius: 26px;
  background:
    radial-gradient(circle at 20% 12%, color-mix(in srgb, var(--accent) 46%, transparent), transparent 40%),
    radial-gradient(circle at 82% 16%, color-mix(in srgb, white 16%, transparent), transparent 32%),
    linear-gradient(180deg, color-mix(in srgb, var(--surface) 88%, transparent), color-mix(in srgb, var(--bg) 98%, transparent));
}

.device-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: color-mix(in srgb, var(--text) 74%, transparent);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.device-copy {
  margin-top: auto;
  display: grid;
  gap: 10px;

  strong {
    color: var(--text);
    font-size: 1.92rem;
    line-height: 1.02;
    letter-spacing: -0.04em;
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.82rem;
    line-height: 1.55;
  }
}

.device-brand {
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 600;
}

.device-progress {
  display: inline-flex;
  gap: 6px;

  span {
    width: 22px;
    height: 4px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--text) 16%, transparent);
  }

  .active {
    background: var(--accent);
  }
}

.device-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  border-radius: var(--border-radius-pill);
  background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 72%, white));
  color: var(--bg);
  font-size: 0.88rem;
  font-weight: 600;
}

.access-headline {
  display: grid;
  gap: 8px;
  margin-bottom: 4px;

  strong {
    color: var(--text);
    font-size: 1.82rem;
    line-height: 1.02;
    letter-spacing: -0.04em;
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.8rem;
    line-height: 1.5;
  }
}

.mini-benefits {
  display: grid;
  gap: 12px;
  margin-top: auto;
}

.mini-benefit {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;
  padding: 12px 13px;
  border: var(--ui-border);
  border-radius: 20px;
  background: color-mix(in srgb, var(--surface) 80%, transparent);

  strong {
    display: block;
    margin-bottom: 4px;
    color: var(--text);
    font-size: 0.84rem;
    font-weight: 600;
  }

  span {
    color: var(--dim);
    font-size: 0.74rem;
    line-height: 1.45;
  }

  svg {
    margin-top: 2px;
    color: var(--accent);
  }
}

.mini-note {
  margin-top: 2px;
  color: var(--dim);
  font-size: 0.72rem;
  text-align: center;
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

.subscription-shell {
  display: grid;
  gap: 18px;
}

.subscription-price-line {
  display: grid;
  gap: 10px;
  padding: 20px 20px 18px;
  border: var(--ui-border);
  border-radius: calc(var(--border-radius-lg) + 4px);
  background:
    radial-gradient(circle at 85% 14%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 32%),
    linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--bg) 98%, transparent));

  strong {
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2rem, 4vw, 2.6rem);
    font-weight: 600;
    line-height: 0.95;
    letter-spacing: -0.05em;
  }
}

.price-kicker {
  display: block;
  margin-bottom: 8px;
  color: var(--dim);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.price-caption {
  color: var(--dim);
  font-size: 0.82rem;
  line-height: 1.5;
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
  transition: background var(--transition-standard), border-color var(--transition-standard);

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
    background: var(--surface);
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

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background: color-mix(in srgb, var(--surface) 60%, transparent);
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

.subscription-note {
  margin: -4px 0 0;
  color: var(--dim);
  font-size: 0.78rem;
  line-height: 1.5;
  text-align: center;
}

@media (max-width: 820px) {
  .auth-page {
    align-items: stretch;
    justify-content: flex-start;
    overflow: hidden;
    padding: 16px;
  }

  .auth-workspace {
    max-width: none;
    overflow: hidden;
  }

  .auth-grid {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    height: calc(100dvh - 32px);
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .auth-grid.is-subscription-showcase {
    grid-template-columns: 1fr;
  }

  .auth-panel {
    position: relative;
    min-width: 0;
    min-height: 0;
    max-height: 100%;
    flex: 0 0 calc(100vw - 54px);
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
    order: 1;
    justify-content: flex-start;
  }

  .auth-intro {
    order: 2;
    gap: 20px;
    transform: scale(0.97);
    transform-origin: left center;
  }

  .intro-content {
    flex: 0 0 auto;
    padding-block: 12px;
  }

  .showcase-stage {
    min-height: 0;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stage-title {
    inset-block-start: 8px;
    font-size: clamp(2.5rem, 14vw, 4.8rem);
  }

  .device-copy strong,
  .access-headline strong {
    font-size: 1.4rem;
  }

  .subscription-price-line {
    padding: 18px 18px 16px;
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
  .subscription-shell {
    width: 100%;
  }

  .auth-form {
    gap: 13px;
  }

  .auth-divider {
    margin: 15px 0;
  }

  .benefits-list {
    margin-bottom: 0;
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
  }

  .auth-panel {
    flex-basis: calc(100vw - 38px);
    min-height: 0;
    padding: 18px;
  }

  .auth-intro {
    transform: scale(0.975);
  }

  .showcase-copy {
    gap: 12px;
  }

  .showcase-copy h1 {
    font-size: clamp(1.95rem, 8.5vw, 2.8rem);
  }

  .showcase-stage {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .demo-device {
    transform: none;
  }

  .device-screen {
    min-height: 0;
  }

  .device-copy strong,
  .access-headline strong {
    font-size: 1.28rem;
  }

  .showcase-points {
    gap: 8px;

    span {
      min-height: 30px;
      padding-inline: 10px;
      font-size: 0.72rem;
    }
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

  .subscription-note {
    font-size: 0.76rem;
  }
}

/* Стартовый экран доступа: две самостоятельные карточки, как два экрана продукта. */
.auth-workspace {
  position: relative;
}

.auth-grid.is-subscription-showcase {
  position: relative;
  max-width: 940px;
  margin-inline: auto;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(18px, 3vw, 34px);

  &::before {
    content: 'CORE OF LIFE';
    position: absolute;
    z-index: 0;
    top: -70px;
    left: 50%;
    width: max-content;
    transform: translateX(-50%);
    color: color-mix(in srgb, var(--text) 8%, transparent);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(4.6rem, 11vw, 9rem);
    font-weight: 700;
    line-height: 0.9;
    letter-spacing: -0.08em;
    pointer-events: none;
    user-select: none;
  }

  .auth-panel {
    position: relative;
    z-index: 1;
    height: clamp(620px, calc(100dvh - 48px), 780px);
    min-height: 0;
    border-radius: clamp(30px, 4vw, 46px);
    overflow: hidden;
  }

  .auth-intro {
    justify-content: flex-start;
    background:
      radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 38%),
      radial-gradient(circle at 82% 46%, color-mix(in srgb, var(--text) 7%, transparent), transparent 32%),
      color-mix(in srgb, var(--surface) 95%, var(--bg));
  }

  .auth-intro::after {
    content: '';
    position: absolute;
    inset: 12% 8% 30%;
    border-radius: 999px;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    filter: blur(64px);
    pointer-events: none;
  }

  .back-action,
  .showcase-copy,
  .legal-links {
    position: relative;
    z-index: 1;
  }

  .showcase-copy {
    align-content: end;
    flex: 1;
    max-width: none;
    padding-top: clamp(90px, 20vh, 190px);
    gap: 14px;
  }

  .showcase-copy h1 {
    max-width: 390px;
    font-size: clamp(2.2rem, 3.5vw, 3rem);
    line-height: 0.98;
    letter-spacing: -0.045em;
    overflow-wrap: normal;
    word-break: normal;
    hyphens: none;
  }

  .showcase-copy p {
    max-width: 360px;
    font-size: 0.86rem;
    line-height: 1.55;
  }

  .demo-action {
    width: 100%;
    margin-top: 10px;
  }

  .route-link {
    justify-self: center;
    color: var(--dim);
    font-size: 0.78rem;
    text-decoration: none;
  }

  .route-link:hover {
    color: var(--text);
  }

  .auth-form-panel {
    justify-content: flex-start;
    padding-top: clamp(42px, 6vw, 66px);
    background: color-mix(in srgb, var(--surface) 96%, var(--bg));
  }

  .subscription-header,
  .subscription-shell {
    width: 100%;
  }

  .subscription-header {
    text-align: center;
  }

  .subscription-header h2 {
    margin-bottom: 12px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2rem, 3vw, 2.55rem);
    line-height: 1;
    letter-spacing: -0.045em;
  }

  .subscription-header p {
    max-width: 300px;
    margin-inline: auto;
    font-size: 0.82rem;
    line-height: 1.5;
  }

  .subscription-shell {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .benefits-list {
    margin: auto 0 20px;
    border-radius: 24px;
    background: color-mix(in srgb, var(--surface) 84%, transparent);
  }

  .benefit-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    padding: 15px 18px;
  }

  .benefit-item svg {
    margin-top: 0;
  }

  .subscription-note {
    max-width: 320px;
    margin: 14px auto 0;
    color: color-mix(in srgb, var(--dim) 82%, transparent);
    font-size: 0.68rem;
    line-height: 1.45;
    text-align: center;
  }
}

/* Типографика витрины повторяет строгую сетку экранов из референса. */
.auth-grid.is-subscription-showcase {
  max-width: 900px;
  gap: 24px;

  &::before {
    top: -54px;
    color: color-mix(in srgb, var(--text) 6%, transparent);
    font-size: clamp(4rem, 9vw, 7.5rem);
  }

  .auth-panel {
    @include glass;
    height: clamp(620px, calc(100dvh - 64px), 740px);
    padding: calc(var(--panel-padding) + 10px);
    border: var(--ui-border);
    border-radius: var(--border-radius-lg);
  }

  .auth-intro {
    background: var(--glass-surface);
  }

  .auth-intro::after {
    display: none;
  }

  .back-action {
    margin: 0;
  }

  .showcase-copy {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-content: initial;
    gap: var(--panel-gap);
    padding-top: 80px;
  }

  .showcase-copy .badge,
  .subscription-header .badge {
    margin: 0;
    color: var(--dim);
    font-size: 0.64rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .showcase-copy h1 {
    max-width: 100%;
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.05rem, 3vw, 2.55rem);
    font-weight: 500;
    line-height: 1.06;
    letter-spacing: -0.04em;
    text-wrap: balance;
  }

  .showcase-copy h1 span {
    color: var(--dim);
  }

  .showcase-copy p {
    max-width: 330px;
    margin: 0;
    color: var(--dim);
    font-size: 0.78rem;
    line-height: 1.55;
  }

  .device-progress {
    margin: 4px 0 8px;
  }

  .device-progress span {
    width: 18px;
    height: 3px;
    background: color-mix(in srgb, var(--text) 14%, transparent);
  }

  .device-progress .active {
    background: var(--accent);
  }

  .demo-action,
  .payment-action,
  .demo-action-secondary {
    width: 100%;
    max-width: 100%;
    margin-top: 0;
    box-sizing: border-box;
  }

  .route-link {
    min-height: 28px;
    margin: 0;
    color: var(--dim);
    font-size: 0.72rem;
    font-weight: 500;
    line-height: 1.3;
    text-align: center;
  }

  .legal-links {
    gap: 12px;
    margin-top: 0;
  }

  .legal-links a {
    font-size: 0.62rem;
  }

  .auth-form-panel {
    @include glass;
    justify-content: flex-start;
    padding: 46px calc(var(--panel-padding) + 10px) calc(var(--panel-padding) + 10px);
  }

  .subscription-header {
    display: grid;
    gap: 8px;
    margin: 0;
    text-align: center;
  }

  .subscription-header h2 {
    max-width: 330px;
    margin: 12px auto 0;
    font-family: inherit;
    font-size: clamp(1.7rem, 2.5vw, 2rem);
    font-weight: 500;
    line-height: 1.08;
    letter-spacing: -0.035em;
    text-wrap: balance;
  }

  .subscription-header p {
    max-width: 290px;
    margin: 0 auto;
    color: var(--dim);
    font-size: 0.76rem;
    line-height: 1.5;
    text-align: center;
  }

  .subscription-shell {
    gap: var(--panel-gap);
  }

  .benefits-list {
    margin: auto 0 var(--panel-gap);
    border: var(--ui-border);
    border-radius: var(--border-radius-lg);
    background: transparent;
  }

  .benefit-item {
    gap: 16px;
    min-height: 64px;
    padding: 12px 14px;
    border-bottom: var(--ui-border);
  }

  .benefit-item strong {
    margin-bottom: 3px;
    font-size: 0.78rem;
    font-weight: 500;
    line-height: 1.25;
  }

  .benefit-item span {
    font-size: 0.68rem;
    line-height: 1.4;
  }

  .benefit-item svg {
    width: 15px;
    height: 15px;
    color: var(--text);
  }

  .subscription-note {
    max-width: 280px;
    margin-top: 2px;
    font-size: 0.62rem;
    line-height: 1.4;
  }
}

@media (max-width: 820px) {
  .auth-grid.is-subscription-showcase {
    display: flex;
    max-width: none;
    margin: 0;
    gap: 12px;

    &::before {
      display: none;
    }

    .auth-panel {
      flex: 0 0 calc(100vw - 54px);
      min-height: 0;
      height: calc(100dvh - 32px);
      border-radius: 30px;
    }

    .auth-intro {
      order: 1;
      transform: none;
    }

    .auth-form-panel {
      order: 2;
      padding-top: 28px;
    }

    .showcase-copy {
      padding-top: 44px;
    }

    .showcase-copy h1 {
      font-size: clamp(1.95rem, 9vw, 2.4rem);
    }

    .auth-form-panel {
      padding: 34px var(--panel-padding) var(--panel-padding);
    }
  }
}

@media (max-width: 480px) {
  .auth-grid.is-subscription-showcase {
    .auth-panel {
      flex-basis: calc(100vw - 38px);
      height: calc(100dvh - 20px);
      padding: 20px;
    }

    .showcase-copy {
      padding-top: 18px;
    }

    .subscription-header {
      margin-bottom: 14px;
    }

    .subscription-header h2 {
      font-size: 1.8rem;
    }

    .benefit-item {
      padding: 12px 14px;
    }
  }
}
</style>
