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
              <span>Профиль всегда с вами</span>
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
                placeholder="Не менее 6 символов"
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

            <p v-if="error" class="error-text">{{ error }}</p>

            <AppButton
              type="submit"
              variant="primary"
              :disabled="authStore.isLoading"
            >
              <span v-if="authStore.isLoading" class="spinner"></span>
              <span>{{ submitLabel }}</span>
            </AppButton>
          </form>

          <div class="card-footer">
            <span>{{ footerText }}</span>
            <NuxtLink :to="switchLink">{{ switchLabel }}</NuxtLink>
          </div>
        </GlassCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Shield, Download, UserCircle } from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import AppFormField from '~/components/ui/AppFormField.vue'
import AppInput from '~/components/ui/AppInput.vue'
import GlassCard from '~/components/base/GlassCard.vue'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth.store'

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
})

const error = ref('')

const isRegister = computed(() => props.mode === 'register')
const title = computed(() =>
  isRegister.value
    ? 'Ваше пространство начинается здесь'
    : 'Продолжите с того места, где остановились'
)
const description = computed(() =>
  isRegister.value
    ? 'Пара шагов — и вы получите доступ к системе осознанного управления задачами.'
    : 'Войдите, чтобы восстановить свои задачи, привычки и прогресс.'
)
const badge = computed(() => (isRegister.value ? 'Регистрация' : 'Вход'))
const heading = computed(() => (isRegister.value ? 'Создать аккаунт' : 'Войти'))
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

  if (form.password.length < 6) {
    error.value = 'Пароль должен быть не короче 6 символов'
    return
  }

  if (isRegister.value && form.password !== form.confirmPassword) {
    error.value = 'Пароли не совпадают'
    return
  }

  const result = isRegister.value
    ? await authStore.register(form.email, form.password, form.name)
    : await authStore.login(form.email, form.password)

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
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  position: relative;
  padding: 32px 16px;
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
  gap: 48px;
  max-width: 1100px;
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
    margin-bottom: 24px;

    h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.5rem;
      color: var(--text);
      margin: 12px 0 0;
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
