<template>
  <div class="auth-page">
    <div class="auth-workspace">
      <main class="auth-grid">
        <aside class="auth-panel auth-panel--intro">
          <AppButton type="button" variant="ghost" size="sm" class="back-action" @click="goBack">
            <ArrowLeft :size="16" />
            Назад
          </AppButton>

          <div class="intro-main">
            <span class="eyebrow">Core of Life</span>
            <h1>{{ isRegister ? 'Соберите свою систему в одном месте.' : 'Продолжайте в своём ритме.' }}</h1>
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

          <nav class="legal-links" aria-label="Юридическая информация">
            <NuxtLink to="/privacy">Конфиденциальность</NuxtLink>
            <NuxtLink to="/terms">Условия</NuxtLink>
            <NuxtLink to="/support">Поддержка</NuxtLink>
          </nav>
        </aside>

        <section class="auth-panel auth-panel--main">
          <template v-if="isRegister && !accessStore.hasSubscription">
            <div class="panel-heading">
              <div class="panel-heading__icon"><LockKeyhole :size="20" /></div>
              <div>
                <span class="eyebrow">Полный доступ</span>
                <h2>Оформите подписку</h2>
                <p>После оплаты вы сможете создать профиль и пользоваться всеми разделами COF.</p>
              </div>
            </div>

            <div class="access-list">
              <div v-for="item in accessBenefits" :key="item.title" class="access-row">
                <Check :size="16" />
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.description }}</span>
                </div>
              </div>
            </div>

            <div class="primary-actions">
              <a
                class="payment-link"
                :href="SUBSCRIPTION_PAYMENT_URL"
                target="_blank"
                rel="noopener noreferrer"
              >
                Оплатить доступ · {{ SUBSCRIPTION_PRICE }} ₽
                <ArrowUpRight :size="16" />
              </a>
            </div>
          </template>

          <template v-else>
            <div class="panel-heading">
              <div class="panel-heading__icon">
                <component :is="isRegister ? UserPlus : LogIn" :size="20" />
              </div>
              <div>
                <span class="eyebrow">{{ isRegister ? 'Регистрация' : 'Авторизация' }}</span>
                <h2>{{ isRegister ? 'Создайте профиль' : 'С возвращением' }}</h2>
                <p>
                  {{
                    isRegister
                      ? 'Укажите данные, которые будете использовать для входа.'
                      : 'Введите данные профиля, чтобы продолжить работу.'
                  }}
                </p>
              </div>
            </div>

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

              <label v-if="isRegister" class="consent-control">
                <input v-model="form.acceptedTerms" type="checkbox" />
                <span class="consent-control__mark"><Check :size="12" /></span>
                <span>
                  Принимаю <NuxtLink to="/terms">условия использования</NuxtLink> и
                  <NuxtLink to="/privacy">политику конфиденциальности</NuxtLink>
                </span>
              </label>

              <p v-if="error" class="error-text">{{ error }}</p>
              <AppButton
                type="submit"
                variant="primary"
                :disabled="authStore.isLoading || (isRegister && !form.acceptedTerms)"
              >
                <component :is="isRegister ? UserPlus : LogIn" :size="16" />
                {{ authStore.isLoading ? 'Подождите…' : isRegister ? 'Создать профиль' : 'Войти' }}
              </AppButton>
            </form>
          </template>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ArrowLeft, ArrowUpRight, Check, LockKeyhole, LogIn, Play, UserPlus } from 'lucide-vue-next'
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

.auth-page {
  min-height: 100dvh;
  overflow-y: auto;
  padding: clamp(10px, 2vw, 24px);
}

.auth-workspace {
  display: grid;
  width: min(100%, 1180px);
  min-height: calc(100dvh - clamp(20px, 4vw, 48px));
  margin-inline: auto;
  align-content: center;
  gap: 14px;
}

.auth-head,
.auth-panel,
.auth-footer {
  @include glass;
  border: var(--ui-border);
}

.auth-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 18px;
  border-radius: var(--border-radius-lg);
}

.auth-head__title {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 14px;

  :deep(.app-button) {
    flex: 0 0 auto;
    padding-inline: 10px;
  }

  h1 {
    margin: 4px 0 0;
    overflow: hidden;
    color: var(--text);
    font-size: 1.28rem;
    font-weight: 700;
    line-height: 1.15;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.auth-head__mode {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.auth-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.75fr);
  gap: 14px;
  min-width: 0;
}

.auth-panel {
  min-width: 0;
  border-radius: var(--border-radius-lg);
}

.auth-panel--main {
  display: flex;
  min-height: 520px;
  padding: clamp(24px, 4vw, 46px);
  flex-direction: column;
  justify-content: center;
}

.auth-panel--main > * {
  width: min(100%, 520px);
  margin-inline: auto;
}

.panel-heading {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 14px;
  margin-bottom: 26px;

  h2 {
    margin: 7px 0 9px;
    color: var(--text);
    font-size: clamp(1.65rem, 3vw, 2.35rem);
    font-weight: 700;
    line-height: 1.06;
    letter-spacing: -0.035em;
  }

  p {
    max-width: 44ch;
    margin: 0;
    color: var(--dim);
    font-size: 0.82rem;
    line-height: 1.55;
  }
}

.panel-heading__icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--text);
}

.auth-form {
  gap: 14px;

  :deep(.app-button) {
    width: 100%;
    margin-top: 4px;
  }
}

.consent-control {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 9px;
  align-items: start;
  cursor: pointer;

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  input:checked + .consent-control__mark {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--bg);
  }

  input:focus-visible + .consent-control__mark {
    outline: 2px solid color-mix(in srgb, var(--accent) 18%, transparent);
    outline-offset: 2px;
  }
}

.consent-control__mark {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border: var(--ui-border);
  border-radius: 6px;
  color: transparent;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    color var(--transition-standard);
}

.access-list {
  display: grid;
  margin-bottom: 24px;
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
}

.access-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 11px;
  padding: 15px 16px;
  border-bottom: var(--ui-border);

  &:last-child {
    border-bottom: none;
  }

  svg {
    margin-top: 2px;
    color: var(--text);
  }

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
    font-size: 0.72rem;
    line-height: 1.4;
  }
}

.primary-actions,
.primary-actions .payment-link {
  width: 100%;
}

.payment-link {
  min-height: var(--control-height-md);
  border-radius: var(--border-radius-pill);
  font-size: 0.88rem;
  font-weight: 500;
}

.auth-side {
  display: grid;
  gap: 14px;
  align-content: stretch;
}

.auth-panel--welcome,
.auth-panel--switch {
  display: flex;
  padding: 20px;
  flex-direction: column;
  gap: 16px;
}

.auth-panel--welcome {
  min-height: 270px;
  justify-content: space-between;

  :deep(.app-button) {
    width: 100%;
  }
}

.auth-panel--switch {
  min-height: 236px;

  > strong {
    color: var(--text);
    font-size: 1rem;
    line-height: 1.25;
  }

  > p {
    margin: 0;
    color: var(--dim);
    font-size: 0.78rem;
    line-height: 1.5;
  }
}

.side-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--dim);

  span {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  svg {
    color: var(--text);
  }
}

.auth-panel--welcome > div:nth-child(2) {
  display: grid;
  gap: 8px;

  strong {
    color: var(--text);
    font-size: clamp(1.4rem, 3vw, 2rem);
    line-height: 1.05;
    letter-spacing: -0.035em;
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.8rem;
    line-height: 1.5;
  }
}

.route-link {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 6px;
  margin-top: auto;
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
}

.auth-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 18px;
  border-radius: var(--border-radius-lg);
  color: var(--dim);
  font-size: 0.68rem;

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  a {
    color: var(--text);
    font-weight: 600;
    text-decoration: none;
  }
}

@media (max-width: 820px) {
  .auth-workspace {
    align-content: start;
  }

  .auth-grid {
    grid-template-columns: 1fr;
  }

  .auth-panel--main {
    min-height: 0;
  }

  .auth-side {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .auth-panel--welcome,
  .auth-panel--switch {
    min-height: 230px;
  }
}

@media (max-width: 560px) {
  .auth-head {
    align-items: flex-start;
  }

  .auth-head__title {
    align-items: flex-start;
    gap: 8px;
    flex-direction: column;
  }

  .auth-head__mode {
    min-height: 34px;
    padding-inline: 10px;

    span {
      display: none;
    }
  }

  .auth-side {
    grid-template-columns: 1fr;
  }

  .auth-panel--main,
  .auth-panel--welcome,
  .auth-panel--switch {
    padding: 18px;
  }

  .panel-heading {
    grid-template-columns: 1fr;
  }

  .auth-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}

.auth-workspace {
  width: min(100%, 1080px);
  align-content: center;
}

.auth-grid {
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: stretch;
}

.auth-panel--intro {
  display: flex;
  min-height: 580px;
  padding: clamp(24px, 4vw, 44px);
  flex-direction: column;
}

.back-action {
  align-self: flex-start;
  margin-left: -10px;
}

.intro-main {
  display: grid;
  max-width: 430px;
  margin-block: auto;

  h1 {
    margin: 12px 0 18px;
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.3rem, 4.8vw, 4rem);
    font-weight: 600;
    line-height: 0.98;
    letter-spacing: -0.05em;
    text-wrap: pretty;
  }

  p {
    max-width: 42ch;
    margin: 0;
    color: var(--dim);
    font-size: 0.84rem;
    line-height: 1.65;
  }
}

.intro-actions {
  display: grid;
  gap: 14px;
  margin-bottom: 22px;

  :deep(.app-button) {
    width: 100%;
  }
}

.intro-actions .route-link {
  margin-top: 0;
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0;
  color: var(--dim);
  font-size: 0.66rem;

  a {
    color: var(--dim);
    font-weight: 600;
    text-decoration: none;
  }
}

.auth-panel--main {
  min-height: 580px;
  padding: clamp(24px, 5vw, 54px);
}

@media (max-width: 820px) {
  .auth-grid {
    grid-template-columns: 1fr;
  }

  .auth-panel--intro,
  .auth-panel--main {
    min-height: auto;
  }

  .auth-panel--intro {
    gap: 28px;
  }

  .intro-main {
    margin-block: 24px;
  }
}

@media (max-width: 560px) {
  .auth-page {
    padding: 10px;
  }

  .auth-panel--intro,
  .auth-panel--main {
    padding: 20px;
  }

  .intro-main h1 {
    font-size: clamp(2rem, 12vw, 3rem);
  }
}
</style>
