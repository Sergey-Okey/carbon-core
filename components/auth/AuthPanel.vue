<template>
  <div class="auth-page">
    <div class="bg-ambient"></div>

    <div class="auth-grid">
      <!-- Левая колонка: приветственный текст -->
      <div
        v-motion
        :initial="{ opacity: 0, x: -30 }"
        :enter="{ opacity: 1, x: 0, transition: { duration: 500, delay: 100 } }"
        class="auth-intro"
      >
        <div class="intro-content">
          <div class="eyebrow">Core of Life</div>
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>

          <div class="feature-cards">
            <div class="feature-card">
              <Shield :size="20" />
              <span>Локальное хранение</span>
            </div>
            <div class="feature-card">
              <Download :size="20" />
              <span>Бэкапы в один клик</span>
            </div>
            <div class="feature-card">
              <UserCircle :size="20" />
              <span>Локальный профиль</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Правая колонка: форма (стеклянная) -->
      <div
        v-motion
        :initial="{ opacity: 0, x: 30 }"
        :enter="{ opacity: 1, x: 0, transition: { duration: 500, delay: 200 } }"
      >
        <GlassCard class="auth-card">
          <div class="card-header">
            <div class="badge">{{ badge }}</div>
            <h2>{{ heading }}</h2>
            <p>{{ formDescription }}</p>
          </div>

          <div class="local-notice">
            <Shield :size="18" />
            <span>Аккаунт и данные сохраняются только на этом устройстве.</span>
          </div>

          <form class="auth-form" @submit.prevent="submit">
            <AppFormField v-if="isRegister" label="Имя">
              <AppInput
                v-model="form.name"
                placeholder="Ваше имя"
                autocomplete="name"
              />
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

            <AppFormField v-if="isRegister" label="Подтверждение">
              <AppInput
                v-model="form.confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                autocomplete="new-password"
              />
            </AppFormField>

            <div v-if="isRegister" class="consent-control">
              <input id="registration-consent" v-model="form.acceptedTerms" type="checkbox" />
              <span>
                <label for="registration-consent">Я принимаю</label>
                <NuxtLink to="/terms">условия использования</NuxtLink>
                и <NuxtLink to="/privacy">политику конфиденциальности</NuxtLink>
              </span>
            </div>

            <p v-if="error" class="error-text">{{ error }}</p>

            <AppButton
              type="submit"
              variant="primary"
              :disabled="authStore.isLoading || (isRegister && !form.acceptedTerms)"
            >
              <span v-if="authStore.isLoading" class="spinner"></span>
              <span>{{ submitLabel }}</span>
            </AppButton>
          </form>

          <div v-if="oauthProviders.length" class="oauth-section">
            <div class="oauth-divider"><span>или войдите через</span></div>
            <div class="oauth-actions">
              <button
                v-for="provider in oauthProviders"
                :key="provider.key"
                type="button"
                class="oauth-button"
                @click="startOAuth(provider.key)"
              >
                <span class="oauth-mark">{{ provider.mark }}</span>
                <span>{{ provider.label }}</span>
              </button>
            </div>
          </div>

          <div class="card-footer">
            <span>{{ footerText }}</span>
            <NuxtLink :to="switchLink">{{ switchLabel }}</NuxtLink>
          </div>
          <div class="legal-links">
            <NuxtLink to="/privacy">Конфиденциальность</NuxtLink>
            <NuxtLink to="/terms">Условия</NuxtLink>
            <NuxtLink to="/support">Поддержка</NuxtLink>
          </div>
        </GlassCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Shield, Download, UserCircle } from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import AppFormField from '~/components/ui/AppFormField.vue'
import AppInput from '~/components/ui/AppInput.vue'
import GlassCard from '~/components/base/GlassCard.vue'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth.store'
import { getBackendFetchOptions, getBackendUrl } from '~/utils/backend'

const props = defineProps<{
  mode: 'login' | 'register'
}>()

const authStore = useAuthStore()
const { addNotification } = useNotification()
const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
})

const error = ref('')
const providerAvailability = ref({ google: false, yandex: false })
const oauthProviders = computed(() =>
  isRegister.value
    ? []
    : [
    { key: 'google' as const, label: 'Google', mark: 'G', enabled: providerAvailability.value.google },
    { key: 'yandex' as const, label: 'Яндекс', mark: 'Я', enabled: providerAvailability.value.yandex },
      ].filter((provider) => provider.enabled)
)

const isRegister = computed(() => props.mode === 'register')
const title = computed(() =>
  isRegister.value
    ? 'Начните с трёх важных задач'
    : 'Вернитесь к своему плану'
)
const description = computed(() =>
  isRegister.value
    ? 'Создайте локальное пространство без облака и лишней настройки.'
    : 'Войдите в локальный профиль на этом устройстве.'
)
const badge = computed(() => (isRegister.value ? 'Регистрация' : 'Вход'))
const heading = computed(() => (isRegister.value ? 'Создать аккаунт' : 'Войти'))
const formDescription = computed(() =>
  isRegister.value
    ? 'Понадобятся имя, email и пароль.'
    : 'Используйте данные локального аккаунта.'
)
const submitLabel = computed(() =>
  isRegister.value ? 'Создать аккаунт' : 'Войти'
)
const footerText = computed(() =>
  isRegister.value ? 'Уже есть аккаунт?' : 'Нет аккаунта?'
)
const switchLabel = computed(() => (isRegister.value ? 'Войти' : 'Регистрация'))
const switchLink = computed(() => (isRegister.value ? '/auth' : '/register'))

async function submit() {
  error.value = ''
  form.name = form.name.trim()
  form.email = form.email.trim()

  if (!form.email || !form.password || (isRegister.value && !form.name)) {
    error.value = 'Заполните обязательные поля'
    return
  }

  if (form.password.length < 8) {
    error.value = 'Пароль должен быть не короче 8 символов'
    return
  }

  if (isRegister.value && form.password !== form.confirmPassword) {
    error.value = 'Пароли не совпадают'
    return
  }

  if (isRegister.value && !form.acceptedTerms) {
    error.value = 'Подтвердите согласие с условиями и политикой конфиденциальности'
    return
  }

  const result = isRegister.value
    ? await authStore.register(form.email, form.password, form.name, 'local', form.acceptedTerms)
    : await authStore.login(form.email, form.password, 'local')

  if (!result.success) {
    error.value = result.error || 'Не удалось выполнить действие'
    return
  }

  addNotification({
    type: 'success',
    message: isRegister.value ? 'Аккаунт создан' : 'Вход выполнен',
  })

  router.push('/')
}

function startOAuth(provider: 'google' | 'yandex') {
  window.location.assign(getBackendUrl(`/api/auth/${provider}`))
}

onMounted(async () => {
  if (isRegister.value) return

  try {
    providerAvailability.value = await $fetch(getBackendUrl('/api/auth/providers'), {
      ...getBackendFetchOptions(),
    })
  } catch {
    providerAvailability.value = { google: false, yandex: false }
  }
})
</script>

<style scoped lang="scss">
.auth-page {
  min-block-size: 100vh;
  min-block-size: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  font-family: 'Inter', sans-serif;
  overflow: visible;
  position: relative;
  padding: clamp(18px, 4vw, 40px) 16px;
}

.bg-ambient {
  position: absolute;
  inset: -10%;
  background: color-mix(in srgb, var(--accent) 5%, transparent);
  z-index: 0;
  filter: blur(40px);
  animation: app-glow-breathe 16s ease-in-out infinite alternate;
}

.auth-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(28px, 5vw, 56px);
  max-width: 1040px;
  width: 100%;
  align-items: center;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0;
    max-width: 440px;
  }
}

.auth-intro {
  display: flex;
  align-items: center;
  padding-right: 24px;

  @media (max-width: 768px) {
    display: none;
  }

  .intro-content {
    max-width: 480px;
  }

  .eyebrow {
    font-family: 'Manrope', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--dim);
    margin-bottom: 20px;
  }

  h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--text);
    margin-bottom: 20px;
  }

  p {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--dim);
    margin-bottom: 32px;
  }
}

.feature-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-card {
  @include glass;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: var(--ui-border);
  border-radius: var(--border-radius-sm);
  color: var(--text);
  font-family: 'Manrope', sans-serif;
  font-size: 0.9rem;

  svg {
    opacity: 0.7;
    flex-shrink: 0;
  }
}

.auth-card {
  @include glass;
  padding: 32px;
  border: var(--ui-border);

  @media (max-width: 480px) {
    padding: 24px;
  }

  .card-header {
    margin-bottom: 18px;

    h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.5rem;
      color: var(--text);
      margin: 12px 0 0;
    }

    p {
      margin-top: 8px;
      color: var(--dim);
      font-size: 0.82rem;
      line-height: 1.45;
    }
  }

  .badge {
    display: inline-flex;
    padding: 4px 12px;
    border: var(--ui-border);
    border-radius: var(--border-radius-pill);
    background: color-mix(in srgb, var(--accent) 6%, transparent);
    color: var(--text);
    font-family: 'Manrope', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

.auth-form {
  display: grid;
  gap: 14px;
}

.error-text {
  color: var(--error);
  font-size: 0.85rem;
  margin: -2px 0;
}

.auth-form :deep(.app-button) {
  width: 100%;
  margin-top: 4px;
  font-family: 'Manrope', sans-serif;
  font-weight: 600;
}

.spinner {
  width: 16px;
  height: 16px;
  border: var(--ui-border);
  border-top-color: var(--bg);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 0.85rem;
  color: var(--dim);

  a {
    color: var(--text);
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.local-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding: 10px 12px;
  border: var(--ui-border);
  border-radius: var(--border-radius-sm);
  background: color-mix(in srgb, var(--surface) 72%, transparent);
  color: var(--dim);
  font-size: 0.76rem;
  line-height: 1.4;

  svg {
    flex: 0 0 auto;
    color: var(--text);
  }
}

.consent-control {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  color: var(--dim);
  cursor: pointer;
  font-size: 0.78rem;
  line-height: 1.45;

  input {
    width: 18px;
    height: 18px;
    margin: 1px 0 0;
    accent-color: var(--accent);
    cursor: pointer;
  }

  a {
    color: var(--text);
    font-weight: 600;
  }

  label {
    cursor: pointer;
  }
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 14px;
  color: var(--dim);
  font-size: 0.7rem;
}

.oauth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-block: 18px 14px;
  color: var(--dim);
  font-size: 0.78rem;

  &::before,
  &::after {
    flex: 1;
    height: 1px;
    background: color-mix(in srgb, var(--text) 12%, transparent);
    content: '';
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
  min-height: 44px;
  padding-inline: 12px;
  border: var(--ui-border);
  border-radius: var(--border-radius-sm);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  transition:
    background var(--transition-standard),
    color var(--transition-standard),
    opacity var(--transition-standard);

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.42;
  }
}

.oauth-button.is-unavailable {
  opacity: 0.62;
}

.oauth-mark {
  display: grid;
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  place-items: center;
  border: var(--ui-border);
  border-radius: 50%;
  font-size: 0.75rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
