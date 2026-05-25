<template>
  <section class="profile-page">
    <div class="profile-topbar">
      <button class="back-btn" type="button" @click="goToWorkspace('board')">
        <ChevronLeft :size="16" />
        В приложение
      </button>

      <div class="topbar-actions">
        <button class="nav-chip" type="button" @click="goToWorkspace('tasks')">
          <LayoutGrid :size="16" />
          Задачи
        </button>
        <button
          class="nav-chip"
          type="button"
          @click="goToWorkspace('settings')"
        >
          <Settings :size="16" />
          Настройки
        </button>
      </div>
    </div>

    <div class="profile-hero">
      <div class="hero-main">
        <button class="avatar-button" type="button" @click="triggerFileInput">
          <img v-if="form.avatar" :src="form.avatar" alt="avatar" />
          <UserCircle2 v-else :size="56" />
          <span class="avatar-overlay">
            <Camera :size="16" />
            Аватар
          </span>
        </button>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          hidden
          @change="handleAvatarChange"
        />

        <div class="hero-copy">
          <div class="eyebrow">Профиль</div>
          <h1>{{ previewName }}</h1>
          <p>{{ previewBio }}</p>
        </div>
      </div>

      <div class="hero-actions">
        <button class="ghost-btn" type="button" @click="triggerFileInput">
          Сменить аватар
        </button>
        <button
          v-if="form.avatar"
          class="ghost-btn danger"
          type="button"
          @click="removeAvatar"
        >
          Удалить аватар
        </button>
      </div>
    </div>

    <div class="profile-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="profile-content">
      <div v-if="activeTab === 'general'" class="tab-content">
        <GlassCard class="profile-card editor-card">
          <div class="section-head">
            <h2>Редактирование</h2>
            <span
              >Имя, email, био и аватар сохраняются локально и попадают в
              backup</span
            >
          </div>

          <form class="profile-form" @submit.prevent="saveProfile">
            <label class="field">
              <span>Имя</span>
              <input v-model.trim="form.name" type="text" maxlength="40" />
            </label>

            <label class="field">
              <span>Email</span>
              <input
                v-model.trim="form.email"
                type="email"
                autocomplete="email"
              />
            </label>

            <label class="field">
              <span>О себе</span>
              <textarea
                v-model.trim="form.bio"
                rows="5"
                maxlength="240"
              ></textarea>
            </label>

            <div class="save-row">
              <p v-if="error" class="error-text">{{ error }}</p>
              <p v-else-if="savedMessage" class="saved-text">
                {{ savedMessage }}
              </p>
            </div>

            <div class="form-actions">
              <button class="primary-btn" type="submit">
                Сохранить профиль
              </button>
            </div>
          </form>
        </GlassCard>
      </div>

      <div v-if="activeTab === 'progress'" class="tab-content">
        <GlassCard class="profile-card">
          <div class="section-head">
            <h2>Прогресс</h2>
            <span>Ключевые метрики текущего профиля</span>
          </div>

          <div class="stats-grid">
            <div class="stat-tile">
              <Zap :size="18" />
              <strong>{{ userStore.level }}</strong>
              <span>Уровень</span>
            </div>
            <div class="stat-tile">
              <Coins :size="18" />
              <strong>{{ userStore.coins }}</strong>
              <span>Монеты</span>
            </div>
            <div class="stat-tile">
              <Award :size="18" />
              <strong>{{ userStore.league }}</strong>
              <span>Лига</span>
            </div>
            <div class="stat-tile">
              <Star :size="18" />
              <strong>{{ userStore.totalXP }}</strong>
              <span>XP</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div v-if="activeTab === 'account'" class="tab-content">
        <GlassCard class="profile-card">
          <div class="section-head">
            <h2>Аккаунт</h2>
            <span>Сессия и регистрационные данные</span>
          </div>

          <div class="meta-list">
            <div class="meta-row">
              <span>Дата регистрации</span>
              <strong>{{ createdAtLabel }}</strong>
            </div>
            <div class="meta-row">
              <span>Текущий email</span>
              <strong>{{ authStore.currentUser?.email || 'Не указан' }}</strong>
            </div>
            <div class="meta-row">
              <span>Состояние</span>
              <strong>{{
                authStore.isAuthenticated ? 'Авторизован' : 'Гость'
              }}</strong>
            </div>
          </div>

          <div class="account-actions">
            <button class="ghost-btn" type="button" @click="logout">
              Выйти
            </button>
            <button
              class="ghost-btn danger"
              type="button"
              @click="deleteAccount"
            >
              Удалить аккаунт
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  Award,
  Camera,
  ChevronLeft,
  Coins,
  LayoutGrid,
  Settings,
  Star,
  UserCircle2,
  Zap,
} from 'lucide-vue-next'
import GlassCard from '~/components/base/GlassCard.vue'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth.store'
import { useUIStore } from '~/stores/ui.store'
import { useUserStore } from '~/stores/user.store'

const MAX_AVATAR_DIMENSION = 320
const AVATAR_QUALITY = 0.82

const authStore = useAuthStore()
const uiStore = useUIStore()
const userStore = useUserStore()
const { addNotification } = useNotification()
const router = useRouter()
const fileInput = ref<HTMLInputElement | null>(null)
const error = ref('')
const savedMessage = ref('')
const activeTab = ref('general')

const tabs = [
  { key: 'general', label: 'Общее' },
  { key: 'progress', label: 'Прогресс' },
  { key: 'account', label: 'Аккаунт' },
]

const form = reactive({
  name: '',
  email: '',
  bio: '',
  avatar: '',
})

watch(
  () => authStore.currentUser,
  (user) => {
    form.name = user?.name || userStore.profile.name
    form.email = user?.email || userStore.profile.email
    form.bio = user?.bio || userStore.profile.bio
    form.avatar = user?.avatar || userStore.profile.avatar
  },
  { immediate: true, deep: true }
)

const previewName = computed(() => form.name || userStore.displayName)
const previewBio = computed(
  () =>
    form.bio ||
    'Добавьте короткое описание, чтобы профиль выглядел в духе остального интерфейса приложения.'
)

const createdAtLabel = computed(() => {
  if (!authStore.currentUser?.createdAt) return 'Неизвестно'
  return new Date(authStore.currentUser.createdAt).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
})

function triggerFileInput() {
  fileInput.value?.click()
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('file read failed'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('image load failed'))
    image.src = src
  })
}

async function compressAvatar(file: File): Promise<string> {
  const rawDataUrl = await readFileAsDataUrl(file)
  const image = await loadImage(rawDataUrl)

  const scale = Math.min(
    1,
    MAX_AVATAR_DIMENSION / Math.max(image.width, image.height)
  )
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) return rawDataUrl

  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', AVATAR_QUALITY)
}

async function handleAvatarChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    form.avatar = await compressAvatar(file)
    error.value = ''
    savedMessage.value = ''
  } catch {
    error.value = 'Не удалось обработать изображение'
  }
}

function removeAvatar() {
  form.avatar = ''
  error.value = ''
  savedMessage.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

function saveProfile() {
  error.value = ''
  savedMessage.value = ''

  if (!form.name.trim()) {
    error.value = 'Укажите имя профиля'
    return
  }

  if (!form.email.trim()) {
    error.value = 'Укажите email'
    return
  }

  const result = authStore.updateProfile({
    name: form.name,
    email: form.email,
    bio: form.bio,
    avatar: form.avatar,
  })

  if (!result.success) {
    error.value = result.error || 'Не удалось сохранить профиль'
    return
  }

  savedMessage.value = 'Изменения сохранены'
  addNotification({ type: 'success', message: 'Профиль обновлён' })
}

async function goToWorkspace(section: 'board' | 'tasks' | 'settings') {
  uiStore.setActiveNav(section)
  await router.push('/')
}

function logout() {
  authStore.logout()
  addNotification({ type: 'info', message: 'Вы вышли из аккаунта' })
  router.push('/auth')
}

function deleteAccount() {
  if (!confirm('Удалить аккаунт? Доступ к нему будет потерян.')) return

  authStore.deleteAccount()
  addNotification({ type: 'success', message: 'Аккаунт удалён' })
  router.push('/auth')
}
</script>

<style scoped lang="scss">
.profile-page {
  display: grid;
  gap: 24px;
}

.profile-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 8px;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: var(--border-radius-sm);
  background: transparent;
  color: var(--dim);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-standard);

  &:hover {
    background: var(--glass-surface);
    color: var(--text);
  }

  &.active {
    background: var(--accent);
    color: var(--bg);
    border-color: var(--accent);
  }
}

.profile-content {
  display: grid;
  gap: 24px;
}

.tab-content {
  display: grid;
  gap: 16px;
}

.profile-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.topbar-actions,
.hero-actions,
.account-actions,
.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.profile-hero {
  @include glass;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding: 28px;
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);

  @media (max-width: 860px) {
    align-items: flex-start;
    flex-direction: column;
  }
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
}

.avatar-button {
  position: relative;
  width: 120px;
  height: 120px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  background: var(--glass-surface);
  color: var(--dim);
  cursor: pointer;
  transition:
    transform var(--transition-standard),
    border-color var(--transition-standard);

  &:hover {
    transform: translateY(-2px);
    border-color: var(--accent);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-overlay {
  position: absolute;
  inset: auto 10px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--bg) 68%, transparent);
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 600;
}

.hero-copy {
  .eyebrow {
    margin-bottom: 10px;
    color: var(--dim);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0 0 8px;
    color: var(--accent);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2rem, 5vw, 3rem);
    line-height: 0.98;
    letter-spacing: -0.04em;
  }

  p {
    max-width: 56ch;
    margin: 0;
    color: var(--dim);
    line-height: 1.7;
  }
}

.profile-card {
  border: 1px solid var(--glass-border);
}

.section-head {
  margin-bottom: 20px;

  h2 {
    margin: 0 0 8px;
    color: var(--accent);
    font-size: 1.2rem;
  }

  span {
    color: var(--dim);
    line-height: 1.6;
  }
}

.profile-form {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;

  span {
    color: var(--dim);
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  input,
  textarea {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-md);
    background: var(--glass-surface);
    color: var(--accent);
    font-size: 1rem;
    transition: border-color var(--transition-standard);

    &:focus {
      outline: none;
      border-color: var(--accent);
    }
  }

  textarea {
    resize: vertical;
    min-height: 140px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stat-tile {
  display: grid;
  gap: 8px;
  padding: 16px;
  @include glass;
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);

  svg {
    color: var(--accent);
  }

  strong {
    color: var(--accent);
    font-size: 1.05rem;
  }

  span {
    color: var(--dim);
    font-size: 0.92rem;
  }
}

.meta-list {
  display: grid;
  gap: 12px;
  margin-bottom: 18px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--dim) 12%, transparent);

  &:last-child {
    border-bottom: none;
  }

  span {
    color: var(--dim);
  }

  strong {
    color: var(--accent);
    text-align: right;
  }

  @media (max-width: 480px) {
    flex-direction: column;
  }
}

.save-row {
  min-height: 22px;
}

.error-text {
  margin: 0;
  color: var(--error);
}

.saved-text {
  margin: 0;
  color: var(--success);
}

.primary-btn,
.ghost-btn,
.nav-chip,
.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: var(--border-radius-md);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform var(--transition-standard),
    background var(--transition-standard),
    border-color var(--transition-standard);
}

.primary-btn {
  border: none;
  background: var(--accent);
  color: var(--bg);

  &:hover {
    transform: translateY(-1px);
  }
}

.ghost-btn,
.nav-chip,
.back-btn {
  border: 1px solid var(--glass-border);
  background: var(--glass-surface);
  color: var(--accent);

  &:hover {
    background: var(--glass-surface);
  }
}

.ghost-btn.danger {
  color: var(--error);
  border-color: color-mix(in srgb, var(--error) 35%, var(--border));
}
</style>
