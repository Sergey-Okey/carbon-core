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
          <span class="eyebrow">User profile</span>
          <h3>{{ previewName }}</h3>
          <p>{{ previewBio }}</p>
        </div>
      </div>

      <div class="head-actions">
        <AppButton type="button" variant="secondary" @click="goToWorkspace('board')">
          <ChevronLeft :size="16" />
          В приложение
        </AppButton>
        <AppButton type="button" variant="secondary" @click="goToWorkspace('settings')">
          <Settings :size="16" />
          Настройки
        </AppButton>
      </div>
    </header>

    <div class="profile-grid">
      <article class="profile-cell profile-cell--progress">
        <div class="cell-title">
          <span>Готовность</span>
          <strong>{{ completionRate }}%</strong>
        </div>
        <div class="radial-wrap">
          <svg viewBox="0 0 160 160" class="radial-chart" aria-label="Прогресс задач">
            <g>
              <line
                v-for="tick in radialTicks"
                :key="tick.index"
                x1="80"
                y1="20"
                x2="80"
                y2="34"
                :class="{ active: tick.active }"
                :transform="`rotate(${tick.angle} 80 80)`"
              />
            </g>
          </svg>
          <div class="radial-value">
            <strong>{{ completedTasks }}</strong>
            <span>готово</span>
          </div>
        </div>
      </article>

      <article class="profile-cell profile-cell--wide">
        <div class="cell-title">
          <span>Активность</span>
          <strong>{{ completedThisWeek }} за неделю</strong>
        </div>
        <div class="activity-bars" aria-label="Выполненные задачи за 14 дней">
          <span
            v-for="day in activitySeries"
            :key="day.date"
            :class="{ active: day.count > 0 }"
            :style="{ '--bar-level': `${Math.max(day.ratio * 100, day.count ? 14 : 4)}%` }"
            :title="`${day.label}: ${day.count}`"
          />
        </div>
        <div class="axis-row">
          <span>{{ activitySeries[0]?.label }}</span>
          <span>{{ activitySeries[activitySeries.length - 1]?.label }}</span>
        </div>
      </article>

      <article class="profile-cell profile-cell--stack">
        <div class="cell-title">
          <span>Рабочий контур</span>
          <strong>{{ activeTasks }}</strong>
        </div>
        <div class="metric-list">
          <div>
            <span>Активные задачи</span>
            <strong>{{ activeTasks }}</strong>
          </div>
          <div>
            <span>Привычки</span>
            <strong>{{ habitsCount }}</strong>
          </div>
          <div>
            <span>Ветки</span>
            <strong>{{ branchesStore.branches.length }}</strong>
          </div>
        </div>
      </article>

      <article class="profile-cell profile-cell--form">
        <div class="cell-title">
          <span>Данные профиля</span>
          <strong>{{ createdAtLabel }}</strong>
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

      <article class="profile-cell profile-cell--account">
        <div class="cell-title">
          <span>Аккаунт</span>
          <strong>{{ authStore.isAuthenticated ? 'Активен' : 'Гость' }}</strong>
        </div>

        <div class="account-list">
          <div>
            <span>Email</span>
            <strong>{{ authStore.currentUser?.email || form.email || 'Не указан' }}</strong>
          </div>
          <div>
            <span>Создан</span>
            <strong>{{ createdAtLabel }}</strong>
          </div>
          <div>
            <span>Фокус сегодня</span>
            <strong>{{ focusSessionsToday }}</strong>
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
import {
  Camera,
  ChevronLeft,
  LogOut,
  Settings,
  Trash2,
  UserCircle2,
} from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useUIStore } from '~/stores/ui.store'
import { useUserStore } from '~/stores/user.store'

const MAX_AVATAR_DIMENSION = 320
const AVATAR_QUALITY = 0.82

const authStore = useAuthStore()
const branchesStore = useBranchesStore()
const tasksStore = useTasksStore()
const uiStore = useUIStore()
const userStore = useUserStore()
const { addNotification } = useNotification()
const router = useRouter()
const fileInput = ref<HTMLInputElement | null>(null)
const error = ref('')
const savedMessage = ref('')
const focusSessionsToday = ref(0)

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
  () => form.bio || 'Короткое описание поможет профилю чувствоваться частью системы.'
)

const actionableTasks = computed(() =>
  tasksStore.tasks.filter((task) => task.type !== 'HABIT')
)
const activeTasks = computed(() => actionableTasks.value.filter((task) => !task.done).length)
const completedTasks = computed(() => actionableTasks.value.filter((task) => task.done).length)
const habitsCount = computed(() => tasksStore.tasks.filter((task) => task.type === 'HABIT').length)
const completionRate = computed(() => {
  if (!actionableTasks.value.length) return 0
  return Math.round((completedTasks.value / actionableTasks.value.length) * 100)
})

const radialTicks = computed(() => {
  const active = Math.round((completionRate.value / 100) * 44)
  return Array.from({ length: 44 }, (_, index) => ({
    index,
    angle: index * (360 / 44),
    active: index < active,
  }))
})

const activitySeries = computed(() => {
  const days = createDateRange(14)
  const max = Math.max(...tasksStore.completedTasksHistory.map((item) => item.count), 1)

  return days.map((date) => {
    const item = tasksStore.completedTasksHistory.find((history) => history.date === date.key)
    const count = item?.count ?? 0
    return {
      date: date.key,
      label: date.label,
      count,
      ratio: count / max,
    }
  })
})

const completedThisWeek = computed(() =>
  activitySeries.value.slice(-7).reduce((sum, day) => sum + day.count, 0)
)

const createdAtLabel = computed(() => {
  if (!authStore.currentUser?.createdAt) return 'Локально'
  return new Date(authStore.currentUser.createdAt).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
})

function createDateRange(daysCount: number) {
  const dates: { key: string; label: string }[] = []
  const now = new Date()

  for (let offset = daysCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(now)
    date.setDate(now.getDate() - offset)
    dates.push({
      key: getLocalDateKey(date),
      label: date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
    })
  }

  return dates
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function loadFocusSessions() {
  if (!import.meta.client) return
  const value = window.localStorage.getItem(`cof-focus-sessions-${getLocalDateKey(new Date())}`)
  const parsed = value ? Number(value) : 0
  focusSessionsToday.value = Number.isFinite(parsed) ? Math.max(0, parsed) : 0
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
    persistAvatar()
  } catch {
    error.value = 'Не удалось обработать изображение'
  }
}

function removeAvatar() {
  form.avatar = ''
  error.value = ''
  savedMessage.value = ''
  if (fileInput.value) fileInput.value.value = ''
  persistAvatar()
}

function persistAvatar() {
  if (authStore.currentUser) {
    const result = authStore.updateProfile({ avatar: form.avatar })

    if (!result.success) {
      error.value = result.error || 'Не удалось сохранить аватар'
      return
    }
  } else {
    userStore.updateProfile({ avatar: form.avatar })
  }

  savedMessage.value = form.avatar ? 'Аватар сохранен' : 'Аватар удален'
  addNotification({
    type: 'success',
    message: savedMessage.value,
  })
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
  addNotification({ type: 'success', message: 'Профиль обновлен' })
}

async function goToWorkspace(section: 'board' | 'settings') {
  uiStore.setActiveNav(section)
  await router.push('/')
}

function logout() {
  authStore.logout()
  addNotification({ type: 'info', message: 'Вы вышли из аккаунта' })
  router.push('/auth')
}

function deleteAccount() {
  if (!confirm('Удалить аккаунт? Это действие нельзя отменить.')) return

  authStore.deleteAccount()
  addNotification({ type: 'success', message: 'Аккаунт удален' })
  router.push('/auth')
}

onMounted(loadFocusSessions)
</script>

<style scoped lang="scss">
.profile-page {
  display: grid;
  gap: 14px;
  width: 100%;
  min-width: 0;
}

.profile-head,
.profile-cell {
  @include glass;
  border: var(--ui-border);
}

.profile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
  border-radius: var(--border-radius-lg);

  @include mobile {
    align-items: stretch;
    flex-direction: column;
    padding: 14px;
  }
}

.identity {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;

  @include mobile {
    align-items: flex-start;
  }
}

.avatar-button {
  position: relative;
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  flex: 0 0 auto;
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  color: var(--text);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 28px;
    border-radius: var(--border-radius-pill);
    background: color-mix(in srgb, var(--bg) 72%, transparent);
    color: var(--text);
    font-size: 0.74rem;
    font-weight: 700;
  }

  @include mobile {
    width: 78px;
    height: 78px;
    border-radius: var(--border-radius-md);
  }
}

.identity-copy {
  min-width: 0;

  h3 {
    margin: 4px 0 6px;
    overflow-wrap: anywhere;
    color: var(--text);
    font-size: clamp(1.55rem, 4vw, 2.35rem);
    font-weight: 700;
    line-height: 1;
  }

  p {
    max-width: 62ch;
    margin: 0;
    color: var(--dim);
    font-size: 0.92rem;
    line-height: 1.5;
  }
}

.eyebrow {
  color: var(--dim);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.head-actions,
.form-actions,
.danger-zone {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.head-actions {
  justify-content: flex-end;

  @include mobile {
    :deep(.app-button) {
      flex: 1 1 140px;
    }
  }
}

.profile-grid {
  display: grid;
  grid-template-columns: minmax(230px, 0.8fr) minmax(0, 1.35fr) minmax(240px, 0.85fr);
  gap: 14px;

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.profile-cell {
  display: grid;
  gap: 16px;
  min-width: 0;
  padding: 18px;
  border-radius: var(--border-radius-lg);
}

.profile-cell--wide,
.profile-cell--form {
  @media (min-width: 1081px) {
    grid-column: span 2;
  }
}

.profile-cell--form {
  @media (max-width: 1080px) {
    grid-column: 1 / -1;
  }
}

.cell-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;

  span {
    overflow: hidden;
    color: var(--dim);
    font-size: 0.75rem;
    font-weight: 700;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  strong {
    color: var(--text);
    font-size: 0.9rem;
    font-weight: 700;
    text-align: right;
    white-space: nowrap;
  }
}

.radial-wrap {
  position: relative;
  display: grid;
  place-items: center;
  width: min(240px, 100%);
  margin: 0 auto;
  aspect-ratio: 1;
}

.radial-chart {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);

  line {
    stroke: color-mix(in srgb, var(--accent) 16%, transparent);
    stroke-linecap: round;
    stroke-width: 3;

    &.active {
      stroke: var(--accent);
    }
  }
}

.radial-value {
  position: absolute;
  display: grid;
  justify-items: center;
  gap: 4px;

  strong {
    color: var(--text);
    font-size: clamp(2.4rem, 7vw, 4.2rem);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  span {
    color: var(--dim);
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
  }
}

.activity-bars {
  display: grid;
  grid-template-columns: repeat(14, minmax(6px, 1fr));
  align-items: end;
  gap: 5px;
  min-height: 128px;

  span {
    display: block;
    height: var(--bar-level);
    min-height: 6px;
    border-radius: var(--border-radius-pill);
    background: color-mix(in srgb, var(--accent) 12%, transparent);

    &.active {
      background: var(--accent);
    }
  }
}

.axis-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--dim);
  font-size: 0.74rem;
}

.metric-list,
.account-list {
  display: grid;
  gap: 2px;
}

.metric-list div,
.account-list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  border-bottom: var(--ui-border);

  &:last-child {
    border-bottom: none;
  }

  span {
    color: var(--dim);
    font-size: 0.86rem;
  }

  strong {
    min-width: 0;
    overflow: hidden;
    color: var(--text);
    font-size: 0.92rem;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  input,
  textarea {
    width: 100%;
    min-width: 0;
    border: var(--ui-border);
    border-radius: var(--border-radius-md);
    background: transparent;
    color: var(--text);
    font: inherit;
    transition:
      background var(--transition-standard),
      border-color var(--transition-standard);

    &:focus,
    &:focus-visible {
      outline: none;
      background: color-mix(in srgb, var(--accent) 5%, transparent);
      border-color: var(--ui-border-color);
    }
  }

  input {
    min-height: 44px;
    padding: 0 13px;
  }

  textarea {
    min-height: 132px;
    padding: 12px 13px;
    resize: vertical;
  }
}

.feedback-row {
  min-height: 20px;

  p {
    margin: 0;
    font-size: 0.86rem;
  }
}

.error-text {
  color: var(--error);
}

.saved-text {
  color: var(--success);
}

.danger-zone {
  align-content: end;
  margin-top: auto;

  :deep(.app-button) {
    flex: 1 1 120px;
  }
}

@include mobile {
  .profile-cell {
    padding: 14px;
  }

  .activity-bars {
    min-height: 112px;
  }
}
</style>
