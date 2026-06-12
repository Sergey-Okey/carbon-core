<template>
  <div class="auth-page">
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
          <div>
            <strong>Сначала посмотреть?</strong>
            <span>Данные демо удалятся после закрытия вкладки.</span>
          </div>
          <AppButton type="button" variant="secondary" @click="startDemo">
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
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ArrowLeft, ArrowUpRight, Check, LockKeyhole } from 'lucide-vue-next'
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
  --auth-gutter: clamp(14px, 2vw, 24px);
  --auth-gap: clamp(16px, 2.5vw, 32px);
  height: 100dvh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: var(--auth-gap);
  overflow: hidden;
  padding: var(--auth-gutter);
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.auth-intro {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: clamp(22px, 3vw, 42px);
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background: color-mix(in srgb, var(--surface) 44%, transparent);
  backdrop-filter: blur(22px) saturate(130%);
  -webkit-backdrop-filter: blur(22px) saturate(130%);
}

.intro-copy {
  display: grid;
  align-content: center;
  flex: 1;
  max-width: 560px;

  h1 {
    max-width: 14ch;
    margin: 12px 0 18px;
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.5rem, 5vw, 5.4rem);
    font-weight: 600;
    line-height: 0.94;
    letter-spacing: -0.055em;
    overflow-wrap: normal;
    word-break: normal;
    hyphens: none;
    text-wrap: balance;
  }

  p {
    max-width: 48ch;
    margin: 0;
    color: var(--dim);
    font-size: clamp(0.86rem, 1.2vw, 1rem);
    line-height: 1.65;
    overflow-wrap: normal;
    word-break: normal;
    hyphens: none;
    text-wrap: pretty;
  }
}

.intro-mark {
  color: var(--dim);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.auth-card {
  align-self: stretch;
  justify-self: stretch;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: clamp(22px, 3vw, 42px);
  border: var(--ui-border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
  background: color-mix(in srgb, var(--surface) 76%, transparent);
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
  }
}

.auth-card > :deep(*) {
  max-width: 520px;
  margin-inline: auto;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 10px;
  border: none;
  border-radius: var(--border-radius-pill);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 700;
}

@media (max-width: 860px) {
  .auth-page {
    height: auto;
    grid-template-columns: 1fr;
    align-content: start;
    gap: var(--auth-gutter);
    overflow-y: auto;
  }

  .auth-intro {
    height: auto;
    min-height: 180px;
    padding: clamp(18px, 5vw, 24px);
  }

  .intro-copy h1 {
    max-width: 16ch;
    margin: 8px 0 10px;
    font-size: clamp(2rem, 9vw, 3.2rem);
  }

  .intro-copy p,
  .intro-mark {
    display: none;
  }

  .auth-card {
    height: auto;
    align-self: start;
    display: block;
    overflow: visible;
  }
}

.card-header {
  margin-bottom: 22px;

  h1 {
    margin: 8px 0 10px;
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.65rem, 7vw, 2.2rem);
    line-height: 1.1;
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.84rem;
    line-height: 1.55;
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
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  border: var(--ui-border);
  border-radius: 50%;
  color: var(--text);
  background: color-mix(in srgb, var(--accent) 7%, transparent);
}

.plan-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;

  h1 {
    margin: 5px 0 0;
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.45rem, 6vw, 1.9rem);
    line-height: 1.12;
  }
}

.plan-head {
  padding-inline: 2px;
}

.plan-summary {
  padding: 14px;
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
  background: color-mix(in srgb, var(--surface) 62%, transparent);

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.78rem;
    line-height: 1.45;
  }
}

.benefits {
  display: grid;
  gap: 10px;
  margin: 16px 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 9px;
    color: var(--dim);
    font-size: 0.8rem;
  }
}

.plan-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

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
  min-height: 44px;
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
  gap: 13px;
}

.consent-control {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  color: var(--dim);
  font-size: 0.72rem;
  line-height: 1.45;

  input {
    margin-top: 2px;
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
  display: grid;
  gap: 12px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: var(--ui-border);

  div {
    display: grid;
    gap: 3px;
  }

  strong {
    color: var(--text);
    font-size: 0.82rem;
  }

  span {
    color: var(--dim);
    font-size: 0.7rem;
  }
}

.card-footer,
.legal-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
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
  padding-top: 16px;
  border-top: var(--ui-border);
}

.legal-links {
  margin-top: 10px;
  font-size: 0.66rem;
}

@media (max-width: 420px) {
  .auth-page {
    --auth-gutter: 10px;
  }

  .auth-intro,
  .auth-card {
    border-radius: var(--border-radius-md);
  }
}

@media (max-width: 860px) {
  .card-footer {
    margin-top: 20px;
  }
}
</style>
