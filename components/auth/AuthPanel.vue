<template>
  <section class="auth-shell">
    <div class="auth-copy">
      <div class="eyebrow">Carbon Core</div>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>

      <div class="copy-cards">
        <div class="copy-card">
          <Sparkles :size="18" />
          <span>Строгий UI и единый стиль тем</span>
        </div>
        <div class="copy-card">
          <ShieldCheck :size="18" />
          <span>Локальное хранение и резервные копии</span>
        </div>
        <div class="copy-card">
          <UserRound :size="18" />
          <span>Профиль, аватар и данные сохраняются после перезагрузки</span>
        </div>
      </div>
    </div>

    <GlassCard class="auth-card">
      <div class="auth-card__header">
        <div class="auth-card__badge">{{ badge }}</div>
        <h2>{{ heading }}</h2>
        <p>{{ subheading }}</p>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <label v-if="isRegister" class="field">
          <span>Имя</span>
          <input
            v-model.trim="form.name"
            type="text"
            placeholder="Как к вам обращаться"
            autocomplete="name"
          />
        </label>

        <label class="field">
          <span>Email</span>
          <input
            v-model.trim="form.email"
            type="email"
            placeholder="name@example.com"
            autocomplete="email"
          />
        </label>

        <label class="field">
          <span>Пароль</span>
          <input
            v-model="form.password"
            type="password"
            placeholder="Не менее 6 символов"
            :autocomplete="isRegister ? 'new-password' : 'current-password'"
          />
        </label>

        <label v-if="isRegister" class="field">
          <span>Подтверждение пароля</span>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Повторите пароль"
            autocomplete="new-password"
          />
        </label>

        <p v-if="error" class="error-text">{{ error }}</p>

        <button class="submit-btn" type="submit" :disabled="authStore.isLoading">
          <span v-if="authStore.isLoading" class="spinner"></span>
          <span>{{ submitLabel }}</span>
        </button>
      </form>

      <div class="auth-card__footer">
        <span>{{ footerText }}</span>
        <NuxtLink :to="switchLink">{{ switchLabel }}</NuxtLink>
      </div>
    </GlassCard>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ShieldCheck, Sparkles, UserRound } from 'lucide-vue-next'
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
  isRegister.value ? 'Создайте профиль и начните путь' : 'Вернитесь в свой рабочий ритм'
)
const description = computed(() =>
  isRegister.value
    ? 'После регистрации данные профиля, аватар и настройки будут доступны в приложении и попадут в резервные копии.'
    : 'Войдите в существующий профиль, чтобы восстановить свои настройки, прогресс и персональные данные.'
)
const badge = computed(() => (isRegister.value ? 'Регистрация' : 'Авторизация'))
const heading = computed(() =>
  isRegister.value ? 'Новый аккаунт' : 'Вход в аккаунт'
)
const subheading = computed(() =>
  isRegister.value
    ? 'Минимум полей, максимум совместимости с текущим UI.'
    : 'Используйте email и пароль, которые вы уже сохраняли в приложении.'
)
const submitLabel = computed(() =>
  isRegister.value ? 'Создать аккаунт' : 'Войти'
)
const footerText = computed(() =>
  isRegister.value ? 'Уже есть аккаунт?' : 'Новый пользователь?'
)
const switchLabel = computed(() =>
  isRegister.value ? 'Перейти ко входу' : 'Создать аккаунт'
)
const switchLink = computed(() => (isRegister.value ? '/auth' : '/register'))

async function submit() {
  error.value = ''

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
.auth-shell {
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 480px);
  gap: 32px;
  align-items: center;
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 32px 0;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    width: min(100%, calc(100% - 24px));
    padding: 20px 0 32px;
  }
}

.auth-copy {
  padding: 24px 12px 24px 0;

  @media (max-width: 960px) {
    padding: 12px 4px 0;
  }

  .eyebrow {
    margin-bottom: 16px;
    color: var(--dim);
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  h1 {
    max-width: 12ch;
    margin: 0 0 18px;
    color: var(--accent);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.6rem, 6vw, 4.8rem);
    line-height: 0.96;
    letter-spacing: -0.04em;
  }

  p {
    max-width: 58ch;
    margin: 0;
    color: var(--dim);
    font-size: 1.02rem;
    line-height: 1.7;
  }
}

.copy-cards {
  display: grid;
  gap: 12px;
  margin-top: 28px;
}

.copy-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: rgba(var(--accent-rgb, 214, 214, 214), 0.04);
  color: var(--accent);

  svg {
    flex-shrink: 0;
    color: var(--accent);
  }

  span {
    line-height: 1.5;
  }
}

.auth-card {
  width: 100%;
  padding: 28px;
  border: 1px solid var(--border);

  @media (max-width: 640px) {
    padding: 22px 18px;
  }
}

.auth-card__header {
  margin-bottom: 22px;

  h2 {
    margin: 12px 0 8px;
    color: var(--accent);
    font-size: 1.5rem;
    line-height: 1.2;
  }

  p {
    margin: 0;
    color: var(--dim);
    line-height: 1.6;
  }
}

.auth-card__badge {
  display: inline-flex;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(var(--accent-rgb, 214, 214, 214), 0.06);
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-form {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;

  span {
    color: var(--dim);
    font-size: 0.84rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  input {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: color-mix(in srgb, var(--surface) 82%, transparent);
    color: var(--accent);
    font-size: 1rem;
    transition:
      border-color var(--transition-standard),
      transform var(--transition-standard);

    &::placeholder {
      color: var(--dim);
      opacity: 0.72;
    }

    &:focus {
      outline: none;
      border-color: var(--accent);
      transform: translateY(-1px);
    }
  }
}

.error-text {
  margin: -2px 0 0;
  color: var(--error);
  font-size: 0.92rem;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-top: 4px;
  padding: 15px 18px;
  border: none;
  border-radius: 18px;
  background: var(--accent);
  color: var(--bg);
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform var(--transition-standard),
    box-shadow var(--transition-standard),
    opacity var(--transition-standard);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
  }

  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.18);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.auth-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  color: var(--dim);
  font-size: 0.92rem;

  a {
    color: var(--accent);
    font-weight: 600;
    text-decoration: none;
  }

  @media (max-width: 480px) {
    align-items: flex-start;
    flex-direction: column;
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
