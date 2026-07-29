<template>
  <section class="profile-page" aria-label="Профиль">
    <header class="profile-head">
      <div class="identity">
        <button class="avatar-button" type="button" @click="triggerFileInput">
          <img v-if="form.avatar" :src="form.avatar" alt="" />
          <UserCircle2 v-else :size="42" />
          <span><Camera :size="14" />Аватар</span>
        </button>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          hidden
          @change="handleAvatarChange"
        />

        <div class="identity-copy">
          <span class="eyebrow">Профиль</span>
          <h3>{{ previewName }}</h3>
          <p>{{ previewBio }}</p>
        </div>
      </div>

      <div class="head-actions">
        <AppButton type="button" variant="secondary" @click="goToWorkspace('board')">
          <ChevronLeft :size="16" />
          Вернуться
        </AppButton>
        <AppButton type="button" variant="secondary" @click="goToWorkspace('settings')">
          <Settings :size="16" />
          Настройки
        </AppButton>
      </div>
    </header>

    <div class="profile-grid">
      <article class="profile-cell profile-cell--form">
        <div class="cell-title">
          <span>Данные профиля</span>
          <strong>{{ isSyncing ? 'Синхронизация…' : createdAtLabel }}</strong>
        </div>

        <form class="profile-form" @submit.prevent="saveProfile">
          <label class="field">
            <span>Имя</span>
            <input v-model.trim="form.name" type="text" maxlength="40" />
          </label>

          <label class="field">
            <span>Email</span>
            <input v-model.trim="form.email" type="email" autocomplete="email" />
          </label>

          <label class="field">
            <span>О себе</span>
            <textarea v-model.trim="form.bio" maxlength="240" rows="5" />
          </label>

          <div class="feedback-row">
            <p v-if="error" class="error-text">{{ error }}</p>
            <p v-else-if="savedMessage" class="saved-text">{{ savedMessage }}</p>
          </div>

          <div class="form-actions">
            <AppButton type="submit" variant="primary">Сохранить</AppButton>
            <AppButton v-if="form.avatar" type="button" variant="secondary" @click="removeAvatar">
              Убрать аватар
            </AppButton>
          </div>
        </form>
      </article>

      <article class="profile-cell">
        <div class="cell-title">
          <span>Подписка</span>
          <strong>{{ subscriptionStatus }}</strong>
        </div>

        <div class="info-list">
          <div>
            <span>Режим</span>
            <strong>{{ accessModeLabel }}</strong>
          </div>
          <div>
            <span>Активирована</span>
            <strong>{{ activatedAtLabel }}</strong>
          </div>
          <div>
            <span>Истекает</span>
            <strong>{{ expiresAtLabel }}</strong>
          </div>
          <div>
            <span>Сохранение данных</span>
            <strong>{{ accessStore.canPersist ? 'Доступно' : 'Недоступно' }}</strong>
          </div>
        </div>
      </article>

      <article class="profile-cell">
        <div class="cell-title">
          <span>Аккаунт</span>
          <strong>{{ isSyncing ? 'Синхронизация…' : authStore.isAuthenticated ? 'Активен' : 'Гость' }}</strong>
        </div>

        <div class="info-list">
          <div>
            <span>Email</span>
            <strong>{{ authStore.currentUser?.email || form.email || 'Не указан' }}</strong>
          </div>
          <div>
            <span>Провайдер</span>
            <strong>{{ providerLabel }}</strong>
          </div>
          <div>
            <span>Создан</span>
            <strong>{{ isSyncing ? 'Синхронизация…' : createdAtLabel }}</strong>
          </div>
        </div>

        <div class="danger-zone">
          <AppButton type="button" variant="secondary" @click="logout">
            <LogOut :size="16" />
            Выйти
          </AppButton>
          <AppButton type="button" variant="danger" @click="deleteAccount">
            <Trash2 :size="16" />
            Удалить
          </AppButton>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Camera, ChevronLeft, LogOut, Settings, Trash2, UserCircle2 } from 'lucide-vue-next'
import AppButton from '~/components/ui/primitives/AppButton.vue'
import { useNotification } from '~/composables/useNotification'
import { useAccessStore } from '~/stores/access.store'
import { useAuthStore } from '~/stores/auth.store'
import { useUIStore } from '~/stores/ui.store'
import { useUserStore } from '~/stores/user.store'

const MAX_AVATAR_DIMENSION = 320
const AVATAR_QUALITY = 0.82

const accessStore = useAccessStore()
const authStore = useAuthStore()
const uiStore = useUIStore()
const userStore = useUserStore()
const { addNotification } = useNotification()
const router = useRouter()
const fileInput = ref<HTMLInputElement | null>(null)
const error = ref('')
const savedMessage = ref('')
const isSyncing = ref(false)

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

onMounted(() => {
  void syncProfileFromServer()
})

const previewName = computed(() => form.name || userStore.displayName)
const previewBio = computed(
  () => form.bio || 'Короткое описание поможет быстрее вернуться в рабочий ритм.'
)
const createdAtLabel = computed(() => {
  if (!authStore.currentUser?.createdAt) return 'Локально'
  return new Date(authStore.currentUser.createdAt).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
})
const accessModeLabel = computed(() => {
  if (accessStore.hasSubscription) return 'Подписка'
  if (accessStore.isDemo) return 'Демо'
  return 'Гость'
})
const subscriptionStatus = computed(() => {
  if (authStore.subscription.active || accessStore.hasSubscription) return 'Активна'
  if (accessStore.isDemo) return 'Демо-режим'
  return 'Не активна'
})
const activatedAtLabel = computed(() => {
  if (!accessStore.activatedAt) return '—'
  return new Date(accessStore.activatedAt).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
})
const expiresAtLabel = computed(() => {
  const expiresAt = authStore.subscription.expiresAt || accessStore.expiresAt
  if (!expiresAt) return '—'
  return new Date(expiresAt).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
})
const providerLabel = computed(() => {
  const provider = authStore.currentUser?.provider
  if (provider === 'google') return 'Google'
  if (provider === 'yandex') return 'Яндекс'
  if (provider === 'local') return 'Email'
  return 'Локально'
})

async function syncProfileFromServer(showMessage = false) {
  if (!authStore.isAuthenticated) return

  isSyncing.value = true
  const result = await authStore.refreshSession()
  isSyncing.value = false

  if (!result.success) {
    if (showMessage) addNotification({ type: 'warning', message: result.error || 'Не удалось синхронизировать профиль' })
    return
  }

  if (showMessage) addNotification({ type: 'success', message: 'Профиль синхронизирован' })
}
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
  const scale = Math.min(1, MAX_AVATAR_DIMENSION / Math.max(image.width, image.height))
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
  savedMessage.value = ''
  error.value = ''
}

async function saveProfile() {
  error.value = ''
  savedMessage.value = ''

  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    bio: form.bio.trim(),
    avatar: form.avatar,
  }

  if (!payload.name) {
    error.value = 'Укажите имя'
    return
  }

  if (authStore.isAuthenticated) {
    const result = await authStore.updateProfile(payload)
    if (!result.success) {
      error.value = result.error || 'Не удалось сохранить профиль'
      return
    }
  } else {
    userStore.updateProfile(payload)
  }

  savedMessage.value = 'Изменения сохранены'
  addNotification({ type: 'success', message: 'Профиль обновлён' })
}

async function goToWorkspace(section: 'board' | 'settings') {
  uiStore.setActiveNav(section)
  await router.push('/')
}

async function logout() {
  await authStore.logout()
  addNotification({ type: 'info', message: 'Вы вышли из аккаунта' })
  await router.push('/auth')
}

async function deleteAccount() {
  if (!authStore.isAuthenticated) {
    userStore.resetProfile()
    addNotification({ type: 'info', message: 'Локальный профиль очищен' })
    return
  }

  const result = await authStore.deleteAccount()
  if (!result.success) {
    error.value = result.error || 'Не удалось удалить аккаунт'
    return
  }

  addNotification({ type: 'info', message: 'Аккаунт удалён' })
  await router.push('/auth')
}
</script>

<style scoped lang="scss">
.profile-page {
  display: grid;
  gap: 20px;
}

.profile-head,
.profile-cell {
  @include surface-panel;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
}

.profile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px;
}

.identity {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.avatar-button {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 96px;
  height: 96px;
  padding: 10px;
  border: var(--ui-border);
  border-radius: 26px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  color: var(--text);
  cursor: pointer;
  overflow: hidden;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard);

  img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
  }

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.78rem;
    color: var(--dim);
  }
}

.identity-copy {
  min-width: 0;

  h3 {
    margin: 4px 0 6px;
    font-size: 1.35rem;
    color: var(--text);
  }

  p {
    margin: 0;
    color: var(--dim);
    line-height: 1.45;
  }
}

.eyebrow {
  color: var(--dim);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
  gap: 20px;
}

.profile-cell {
  padding: 18px;
}

.profile-cell--form {
  grid-row: span 2;
}

.cell-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;

  span {
    color: var(--dim);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  strong {
    color: var(--text);
    font-size: 0.95rem;
  }
}

.profile-form {
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 8px;

  span {
    color: var(--dim);
    font-size: 0.82rem;
  }

  input,
  textarea {
    @include surface-panel;
    width: 100%;
    border: var(--ui-border);
    border-radius: var(--border-radius-md);
    padding: 12px 14px;
    color: var(--text);
    background: var(--color-surface-1);
    font: inherit;
    resize: vertical;
  }
}

.feedback-row {
  min-height: 20px;
}

.saved-text {
  margin: 0;
  color: var(--success);
  font-size: 0.82rem;
}

.error-text {
  margin: 0;
  color: var(--error);
  font-size: 0.82rem;
}

.form-actions,
.danger-zone {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.info-list {
  display: grid;
  gap: 12px;

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: var(--ui-border);
    border-radius: var(--border-radius-md);
    background: var(--color-surface-1);
  }

  span {
    color: var(--dim);
    font-size: 0.82rem;
  }

  strong {
    color: var(--text);
    font-size: 0.88rem;
    text-align: right;
  }
}

.danger-zone {
  margin-top: 18px;
}

@media (max-width: 960px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-cell--form {
    grid-row: auto;
  }
}

@media (max-width: 640px) {
  .profile-page {
    gap: 12px;
  }

  .profile-head,
  .profile-cell {
    padding: 14px;
    border-radius: var(--border-radius-lg);
  }

  .profile-head {
    display: grid;
    gap: 14px;
  }

  .identity {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
  }

  .avatar-button {
    width: 72px;
    height: 72px;
    padding: 8px;
    border-radius: var(--border-radius-lg);

    img {
      width: 36px;
      height: 36px;
    }

    span {
      max-width: 100%;
      overflow: hidden;
      font-size: 0.68rem;
      line-height: 1.1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .identity-copy {
    h3 {
      margin: 2px 0 4px;
      font-size: 1.08rem;
      line-height: 1.2;
    }

    p {
      display: -webkit-box;
      overflow: hidden;
      font-size: 0.82rem;
      line-height: 1.35;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
  }

  .head-actions,
  .form-actions,
  .danger-zone {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;

    :deep(.app-button) {
      width: 100%;
      min-height: 44px;
      padding-inline: 10px;
    }
  }

  .profile-grid {
    gap: 12px;
  }

  .cell-title {
    align-items: flex-start;
    margin-bottom: 14px;

    span {
      font-size: 0.7rem;
    }

    strong {
      font-size: 0.82rem;
      text-align: right;
    }
  }

  .profile-form {
    gap: 12px;
  }

  .field {
    gap: 7px;

    input,
    textarea {
      min-height: 44px;
      padding: 11px 12px;
      border-radius: var(--border-radius-md);
    }

    textarea {
      min-height: 108px;
    }
  }

  .info-list {
    gap: 8px;

    > div {
      display: grid;
      grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--border-radius-md);
    }

    span,
    strong {
      overflow-wrap: anywhere;
    }

    strong {
      font-size: 0.82rem;
      text-align: right;
    }
  }
}

@media (max-width: 380px) {
  .head-actions,
  .form-actions,
  .danger-zone {
    grid-template-columns: 1fr;
  }

  .info-list > div {
    grid-template-columns: 1fr;
  }

  .info-list strong {
    text-align: left;
  }
}
</style>
