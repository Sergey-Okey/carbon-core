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

            <a
              class="payment-link"
              :href="SUBSCRIPTION_PAYMENT_URL"
              target="_blank"
              rel="noopener noreferrer"
            >
              Оплатить доступ · {{ SUBSCRIPTION_PRICE }} ₽
              <ArrowUpRight :size="16" />
            </a>
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

const keepShortWords = (text: string) =>
  text.replace(/(^|[\s(])([А-Яа-яЁё]{1,2})\s+/g, '$1$2\u00a0')

const accessBenefits = [
  { title: 'Личный профиль', description: keepShortWords('Вход и доступ к вашему пространству COF.') },
  { title: 'Все инструменты', description: keepShortWords('Задачи, привычки, доска, фокус и аналитика.') },
  { title: 'Дальнейшие обновления', description: keepShortWords('Новые возможности будут доступны в профиле.') },
]

const error = ref('')
const form = reactive({ name: '', email: '', password: '', acceptedTerms: false })

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
  border-radius: var(--border-radius-pill);
  color: var(--bg);
  font-weight: 600;
  text-decoration: none;
  transition: opacity var(--transition-standard);

  &:hover {
    opacity: 0.9;
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
  }

  .auth-panel {
    flex-basis: calc(100vw - 38px);
    min-height: 0;
    padding: 18px;
  }

  .auth-intro {
    transform: scale(0.975);
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
