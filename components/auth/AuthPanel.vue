<template>
  <div class="auth-page">
    <div class="auth-shell">
      <aside class="auth-intro">
      <button type="button" class="back-button" aria-label="Вернуться назад" @click="goBack">
        <ArrowLeft :size="17" />
        <span>Вернуться</span>
      </button>
      <div class="intro-copy">
        <span class="eyebrow">{{ isRegister ? 'Начало работы' : 'Ваше пространство' }}</span>
        <h1>{{ introTitle }}</h1>
        <p>{{ introDescription }}</p>
      </div>
      <span class="intro-mark">CORE OF LIFE</span>
      </aside>
      <GlassCard class="auth-card">
      <template v-if="isRegister && !accessStore.hasSubscription">
        <div class="plan-head">
          <div class="paywall-icon"><LockKeyhole :size="22" /></div>
          <div>
            <span class="eyebrow">Полный доступ</span>
            <h1>Подписка</h1>
          </div>
        </div>

        <div class="plan-summary">
          <p>
            Откройте полный доступ ко всем возможностям приложения.
          </p>
        </div>

        <ul class="benefits">
          <li><Check :size="16" /> Регистрация и личный профиль</li>
          <li><Check :size="16" /> Все инструменты и разделы COF</li>
          <li><Check :size="16" /> Поддержка развития COF</li>
        </ul>

        <div class="plan-actions">
          <a
            class="payment-link"
            :href="SUBSCRIPTION_PAYMENT_URL"
            target="_blank"
            rel="noopener noreferrer"
          >
            Оплатить {{ SUBSCRIPTION_PRICE }} ₽
            <ArrowUpRight :size="17" />
          </a>
          <AppButton type="button" variant="secondary" @click="startDemo">
            Попробовать демо
          </AppButton>
        </div>
      </template>

      <template v-else>
        <div class="card-header">
          <span class="eyebrow">{{ isRegister ? 'Регистрация' : 'Вход' }}</span>
          <h1>{{ isRegister ? 'Создайте профиль' : 'С возвращением' }}</h1>
          <p>
            {{
              isRegister
                ? 'Создайте профиль и начните пользоваться COF.'
                : 'Войдите в свой профиль COF.'
            }}
          </p>
        </div>

        <form class="auth-form" @submit.prevent="submit">
          <AppFormField v-if="isRegister" label="Имя">
            <AppInput v-model="form.name" placeholder="Ваше имя" autocomplete="name" />
          </AppFormField>
          <AppFormField label="Email">
            <AppInput
              v-model="form.email"
              type="email"
              placeholder="email@example.com"
              autocomplete="email"
            />
          </AppFormField>
          <AppFormField label="Пароль">
            <AppInput
              v-model="form.password"
              type="password"
              placeholder="Не менее 8 символов"
              :autocomplete="isRegister ? 'new-password' : 'current-password'"
            />
          </AppFormField>

          <label v-if="isRegister" class="consent-control">
            <input v-model="form.acceptedTerms" type="checkbox" />
            <span>
              Принимаю <NuxtLink to="/terms">условия</NuxtLink> и
              <NuxtLink to="/privacy">политику конфиденциальности</NuxtLink>
            </span>
          </label>

          <p v-if="error" class="error-text">{{ error }}</p>
          <AppButton
            type="submit"
            variant="primary"
            :disabled="authStore.isLoading || (isRegister && !form.acceptedTerms)"
          >
            {{ authStore.isLoading ? 'Подождите…' : isRegister ? 'Создать профиль' : 'Войти' }}
          </AppButton>
        </form>

        <div v-if="!isRegister" class="demo-block">
          <div class="demo-block__icon" aria-hidden="true">
            <Play :size="17" />
          </div>
          <div class="demo-block__content">
            <span class="demo-block__label">Демо-режим</span>
            <strong>Сначала попробуйте COF</strong>
            <p>Изучите задачи, привычки и доску без регистрации.</p>
          </div>
          <AppButton type="button" variant="secondary" @click="startDemo">
            <Play :size="15" />
            Открыть демо
          </AppButton>
        </div>
      </template>

      <div class="card-footer">
        <span>{{ isRegister ? 'Уже есть профиль?' : 'Нужен полный доступ?' }}</span>
        <NuxtLink :to="isRegister ? '/auth' : '/register'">
          {{ isRegister ? 'Войти' : 'Оформить подписку' }}
        </NuxtLink>
      </div>
      <div class="legal-links">
        <NuxtLink to="/privacy">Конфиденциальность</NuxtLink>
        <NuxtLink to="/terms">Условия</NuxtLink>
        <NuxtLink to="/support">Поддержка</NuxtLink>
      </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ArrowLeft, ArrowUpRight, Check, LockKeyhole, Play } from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import AppFormField from '~/components/ui/AppFormField.vue'
import AppInput from '~/components/ui/AppInput.vue'
import GlassCard from '~/components/base/GlassCard.vue'
import {
  SUBSCRIPTION_PAYMENT_URL,
  SUBSCRIPTION_PRICE,
  useAccessStore,
} from '~/stores/access.store'
import { useAuthStore } from '~/stores/auth.store'
import { useNotification } from '~/composables/useNotification'

const props = defineProps<{ mode: 'login' | 'register' }>()
const accessStore = useAccessStore()
const authStore = useAuthStore()
const { addNotification } = useNotification()
const router = useRouter()
const isRegister = computed(() => props.mode === 'register')
const keepShortWords = (text: string) =>
  text.replace(/(^|[\s(])([А-Яа-яЁё]{1,2})\s+/g, '$1$2\u00a0')
const introTitle = computed(() =>
  keepShortWords(
    isRegister.value
      ? 'Сначала познакомьтесь с COF.'
      : 'Продолжайте с того места, где остановились.'
  )
)
const introDescription = computed(() =>
  keepShortWords(
    isRegister.value
      ? 'Откройте демо, чтобы изучить задачи, привычки и доску без регистрации. Для постоянного доступа оформите подписку и создайте профиль.'
      : 'Войдите в профиль, чтобы вернуться к своим задачам, привычкам и связанным этапам развития.'
  )
)
const error = ref('')
const form = reactive({ name: '', email: '', password: '', acceptedTerms: false })

function startDemo() {
  sessionStorage.clear()
  accessStore.startDemo()
  window.location.assign('/')
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/onboarding')
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
  --auth-gutter: clamp(12px, 2.4vw, 32px);
  min-height: 100dvh;
  padding: var(--auth-gutter);
  box-sizing: border-box;
  background: var(--bg);
  font-family: 'Inter', sans-serif;
}

.auth-shell {
  --auth-panel-padding: clamp(28px, 4vw, 60px);
  width: min(100%, 1440px);
  height: calc(100dvh - (var(--auth-gutter) * 2));
  min-height: 0;
  margin-inline: auto;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: stretch;
  overflow: hidden;
  border: var(--ui-border);
  border-radius: clamp(20px, 3vw, 34px);
  background: color-mix(in srgb, var(--surface) 74%, var(--bg));
}

.auth-intro {
  min-height: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: var(--auth-panel-padding);
  border-right: var(--ui-border);
  background: color-mix(in srgb, var(--surface) 42%, var(--bg));
}

.intro-copy {
  display: grid;
  align-content: center;
  flex: 1;
  max-width: 500px;

  h1 {
    max-width: 12ch;
    margin: 14px 0 22px;
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.5rem, 4.4vw, 4.9rem);
    font-weight: 600;
    line-height: 0.98;
    letter-spacing: -0.05em;
    overflow-wrap: normal;
    word-break: normal;
    hyphens: none;
    text-wrap: pretty;
  }

  p {
    max-width: 43ch;
    margin: 0;
    color: var(--dim);
    font-size: clamp(0.84rem, 1vw, 0.96rem);
    line-height: 1.7;
    overflow-wrap: normal;
    word-break: normal;
    hyphens: none;
    text-wrap: pretty;
  }
}

.intro-mark {
  color: var(--dim);
  font-family: 'Manrope', sans-serif;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.auth-card {
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: var(--auth-panel-padding);
  border: none;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
  background: transparent;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
  }
}

.auth-card > :deep(*) {
  width: min(100%, 480px);
  max-width: 480px;
  margin-inline: auto;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  min-height: 34px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 700;
  transition: color var(--transition-standard);

  &:hover {
    color: var(--text);
  }
}

.card-header {
  margin-block: auto 24px;

  h1 {
    margin: 10px 0 12px;
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.04;
    letter-spacing: -0.04em;
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.86rem;
    line-height: 1.6;
  }
}

.eyebrow {
  color: var(--dim);
  font-family: 'Manrope', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.paywall-icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  place-items: center;
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
  color: var(--text);
  background: color-mix(in srgb, var(--surface) 72%, transparent);
}

.plan-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  margin-block: auto 24px;

  h1 {
    margin: 6px 0 0;
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.04;
    letter-spacing: -0.04em;
  }
}

.plan-summary {
  padding-bottom: 20px;
  border-bottom: var(--ui-border);

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.86rem;
    line-height: 1.6;
  }
}

.benefits {
  display: grid;
  gap: 12px;
  margin: 20px 0 22px;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--dim);
    font-size: 0.84rem;

    svg {
      color: var(--text);
    }
  }
}

.plan-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  :deep(.app-button) {
    width: 100%;
    white-space: nowrap;
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;

    :deep(.app-button) {
      width: 100%;
    }
  }
}

.payment-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: var(--control-height-md);
  margin: 0;
  border-radius: var(--border-radius-md);
  background: var(--accent);
  color: var(--bg);
  font-family: 'Manrope', sans-serif;
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
}

.auth-card :deep(.app-button) {
  width: 100%;
}

.auth-form {
  display: grid;
  gap: 15px;
}

.consent-control {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: var(--dim);
  font-size: 0.74rem;
  line-height: 1.5;

  input {
    width: 15px;
    height: 15px;
    margin: 1px 0 0;
    accent-color: var(--accent);
  }

  a {
    color: var(--text);
  }
}

.error-text {
  margin: 0;
  color: var(--error);
  font-size: 0.78rem;
}

.demo-block {
  @include glass;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  margin-top: 22px;
  padding: 16px;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);

  :deep(.app-button) {
    width: auto;
  }
}

.demo-block__icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--text);
}

.demo-block__content {
  display: grid;
  min-width: 0;
  gap: 3px;

  strong {
    overflow: hidden;
    color: var(--text);
    font-size: 0.84rem;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.7rem;
    line-height: 1.45;
  }
}

.demo-block__label {
  color: var(--dim);
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.card-footer,
.legal-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 6px 10px;
  color: var(--dim);
  font-size: 0.72rem;

  a {
    color: var(--text);
    font-weight: 600;
    text-decoration: none;
  }
}

.card-footer {
  margin-top: auto;
  padding-top: 24px;
  border-top: var(--ui-border);
}

.legal-links {
  margin-top: 10px;
  font-size: 0.66rem;
}

@media (max-width: 860px) {
  .auth-page {
    --auth-gutter: 10px;
    min-height: 100dvh;
    overflow-y: auto;
  }

  .auth-shell {
    --auth-panel-padding: clamp(20px, 6vw, 32px);
    height: auto;
    min-height: calc(100dvh - (var(--auth-gutter) * 2));
    grid-template-columns: 1fr;
    border-radius: var(--border-radius-md);
  }

  .auth-intro {
    min-height: 200px;
    padding: var(--auth-panel-padding);
    border-right: none;
    border-bottom: var(--ui-border);
  }

  .intro-copy {
    padding-block: 32px 14px;

    h1 {
      max-width: 16ch;
      margin: 8px 0 0;
      font-size: clamp(2rem, 9vw, 3.2rem);
    }

    p {
      display: none;
    }
  }

  .intro-mark {
    display: none;
  }

  .auth-card {
    height: auto;
    min-height: 520px;
    padding: var(--auth-panel-padding);
    overflow: visible;
  }

  .card-header,
  .plan-head {
    margin-top: 0;
  }

  .card-footer {
    margin-top: auto;
  }
}

@media (max-width: 480px) {
  .plan-actions {
    grid-template-columns: 1fr;
  }

  .demo-block {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .demo-block :deep(.app-button) {
    grid-column: 1 / -1;
    width: 100%;
  }
}
</style>
