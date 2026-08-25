<template>
  <section class="profile" :class="{ 'is-entered': entered }" aria-label="Профиль">
    <div class="profile-bento">
      <article class="tile tile--avatar" style="--enter-i: 0">
        <button
          class="avatar-upload"
          type="button"
          aria-label="Сменить фото профиля"
          @click="triggerFileInput"
        >
          <img v-if="form.avatar" :src="form.avatar" alt="" />
          <UserCircle2 v-else :size="72" />
          <span class="avatar-overlay">
            <Camera :size="18" />
            <span>Сменить</span>
          </span>
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          hidden
          @change="handleAvatarChange"
        />
        <AppButton
          v-if="form.avatar"
          type="button"
          variant="link"
          class="avatar-remove"
          @click="removeAvatar"
        >
          Убрать фото
        </AppButton>
      </article>

      <article class="tile tile--readme" style="--enter-i: 1">
        <div class="readme-body">
          <template v-if="!isEditing">
            <div class="info-grid">
              <div class="info-item">
                <span>Имя</span>
                <strong>{{ displayName }}</strong>
              </div>
              <div class="info-item">
                <span>Email</span>
                <strong>{{ displayEmail }}</strong>
              </div>
            </div>

            <div class="info-item info-item--bio">
              <span>О себе</span>
              <p>{{ displayBio }}</p>
            </div>
          </template>

          <form v-else class="readme-form" @submit.prevent="saveProfile">
            <div class="pair">
              <label class="field">
                <span>Имя</span>
                <AppInput
                  id="profile-name"
                  v-model="form.name"
                  type="text"
                  maxlength="40"
                  autocomplete="name"
                  :invalid="Boolean(nameError)"
                />
                <em v-if="nameError">{{ nameError }}</em>
              </label>
              <label class="field">
                <span>Email</span>
                <AppInput
                  id="profile-email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                />
              </label>
            </div>

            <label class="field">
              <span>О себе</span>
              <AppInput
                id="profile-bio"
                v-model="form.bio"
                multiline
                :rows="4"
                maxlength="240"
                placeholder="Коротко о себе"
              />
            </label>

            <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
          </form>

          <div class="readme-actions">
            <div class="readme-actions__left">
              <template v-if="!isEditing">
                <AppButton type="button" variant="secondary" @click="startEditing">
                  <Pencil :size="16" />
                  Изменить
                </AppButton>
              </template>
              <template v-else>
                <AppButton
                  type="button"
                  variant="primary"
                  :loading="isSaving"
                  @click="saveProfile"
                >
                  Сохранить
                </AppButton>
                <AppButton type="button" variant="ghost" @click="cancelEditing">
                  Отмена
                </AppButton>
              </template>
            </div>
            <div class="readme-actions__right">
              <AppButton type="button" variant="secondary" @click="logout">
                <LogOut :size="16" />
                Выйти
              </AppButton>
              <AppButton type="button" variant="danger" @click="deleteAccount">
                <Trash2 :size="16" />
                Удалить
              </AppButton>
            </div>
          </div>
        </div>
      </article>

      <!-- Mid left: achievements -->
      <article class="tile tile--badges" style="--enter-i: 2">
        <header class="tile-head">
          <h2>Достижения</h2>
        </header>
        <div class="badge-grid">
          <div
            v-for="badge in primaryBadges"
            :key="badge.id"
            class="badge"
            :class="{ locked: !badge.earned }"
            :title="badge.title"
          >
            <component :is="badge.icon" class="badge__icon" aria-hidden="true" />
          </div>
        </div>
      </article>

      <article class="tile tile--heatmap" style="--enter-i: 3">
        <header class="tile-head">
          <h2>{{ yearTotal }} выполнений за год</h2>
          <span class="tile-head__aside">{{ heatmapAside }}</span>
        </header>
        <div class="heatmap-shell">
          <div
            class="heatmap"
            role="img"
            :aria-label="heatmapAriaLabel"
            :style="{ '--heat-cols': heatCols }"
          >
            <div
              v-for="(cell, index) in heatmapCells"
              :key="index"
              class="heat-cell"
              :data-level="cell.level"
              :title="cell.title"
            />
          </div>
        </div>
        <div class="heatmap-legend">
          <span>Меньше</span>
          <i data-level="0" />
          <i data-level="1" />
          <i data-level="2" />
          <i data-level="3" />
          <i data-level="4" />
          <span>Больше</span>
        </div>
      </article>

      <!-- Bottom: activity · access · profile -->
      <article class="tile tile--activity" style="--enter-i: 4">
        <header class="tile-head">
          <h2>Активность</h2>
          <span class="tile-head__aside">сегодня</span>
        </header>

        <div class="stat-rows">
          <div class="stat-row">
            <span>Сегодня</span>
            <strong>{{ todayCount }}</strong>
          </div>
          <div class="stat-row">
            <span>За неделю</span>
            <strong>{{ weekTotal }}</strong>
          </div>
          <div class="stat-row">
            <span>Всего</span>
            <strong>{{ userStore.completedTasksCount }}</strong>
          </div>
        </div>

        <div class="tile-foot">
          <span><CheckSquare :size="14" /> {{ activeTasks }} активных</span>
          <span><Timer :size="14" /> {{ focusSessionsToday }} фокус</span>
        </div>
      </article>

      <article class="tile tile--access" style="--enter-i: 5">
        <header class="tile-head">
          <h2>Доступ</h2>
          <button
            v-if="accessStore.isDemo"
            type="button"
            class="demo-exit"
            @click="exitDemoToRegister"
          >
            Демо
          </button>
          <span v-else class="tile-head__aside">{{ accessTitle }}</span>
        </header>

        <div class="stat-rows">
          <div class="stat-row">
            <span>Режим</span>
            <strong :class="{ 'is-demo': accessStore.isDemo }">{{ accessTitle }}</strong>
          </div>
          <div v-if="expiresLabel" class="stat-row">
            <span>Истекает</span>
            <strong>{{ expiresLabel }}</strong>
          </div>
          <div v-if="providerLabel" class="stat-row">
            <span>Вход</span>
            <strong>{{ providerLabel }}</strong>
          </div>
          <div v-if="createdLabel" class="stat-row">
            <span>Создан</span>
            <strong>{{ createdLabel }}</strong>
          </div>
        </div>

        <p class="tile-note">{{ accessNote }}</p>
        <AppButton
          v-if="accessStore.isDemo"
          type="button"
          variant="danger"
          class="demo-exit-cta"
          @click="exitDemoToRegister"
        >
          Завершить демо
        </AppButton>
      </article>

      <article class="tile tile--account" style="--enter-i: 6">
        <header class="tile-head">
          <h2>Профиль</h2>
          <span class="tile-head__aside">ур. {{ userStore.level }}</span>
        </header>

        <div class="stat-rows">
          <div class="stat-row">
            <span>Уровень</span>
            <strong>{{ userStore.level }}</strong>
          </div>
          <div class="stat-row">
            <span>Лига</span>
            <strong>{{ userStore.league }}</strong>
          </div>
          <div class="stat-row">
            <span>Очки лиги</span>
            <strong>{{ Math.round(userStore.leaguePoints) }}</strong>
          </div>
          <div class="stat-row">
            <span>До след. ур.</span>
            <strong>{{ userStore.currentProgress }}/{{ userStore.tasksForNextLevel }}</strong>
          </div>
        </div>

        <div class="level-bar" aria-hidden="true">
          <i :style="{ width: `${Math.min(100, levelPercent)}%` }" />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Award,
  CalendarDays,
  Camera,
  CheckSquare,
  Crown,
  Flame,
  LogOut,
  Medal,
  Pencil,
  Rocket,
  Sparkles,
  Star,
  Target,
  Timer,
  Trash2,
  Trophy,
  UserCircle2,
  Zap,
} from 'lucide-vue-next'
import { accessAwareStorage } from '~/utils/accessStorage'
import { mergeActivityCounts } from '~/utils/analyticsMath'
import { upgradeAvatarUrl } from '~/utils/avatarUrl'

const MAX_AVATAR_DIMENSION = 720
const AVATAR_QUALITY = 0.92

const accessStore = useAccessStore()
const authStore = useAuthStore()
const tasksStore = useTasksStore()
const userStore = useUserStore()
const { confirm } = useConfirm()
const { success, warning, info } = useNotification()
const router = useRouter()

async function exitDemoToRegister() {
  const ok = await confirm(
    'Завершить демо-режим и перейти к регистрации? Локальные демо-данные будут сброшены.'
  )
  if (!ok) return
  accessStore.leaveDemo()
  sessionStorage.setItem('cof-workspace-fresh', '1')
  sessionStorage.setItem('cof-exit-demo', '1')
  window.location.assign('/register')
}

const fileInput = ref<HTMLInputElement | null>(null)
const entered = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)
const nameError = ref('')
const formError = ref('')
const focusSessionsToday = ref(0)

const form = reactive({
  name: '',
  email: '',
  bio: '',
  avatar: '',
})

const draft = reactive({
  name: '',
  email: '',
  bio: '',
})

watch(
  () => authStore.currentUser,
  (user) => {
    if (isEditing.value) return
    form.name = user?.name || userStore.profile.name
    form.email = user?.email || userStore.profile.email
    form.bio = user?.bio || userStore.profile.bio
    form.avatar = upgradeAvatarUrl(user?.avatar || userStore.profile.avatar || '')
  },
  { immediate: true, deep: true }
)

const isMobileHeatmap = ref(false)
let mediaHeatmap: MediaQueryList | null = null

function syncMobileHeatmap() {
  isMobileHeatmap.value = Boolean(mediaHeatmap?.matches)
}

onMounted(() => {
  void syncProfile()
  loadFocusSessions()
  mediaHeatmap = window.matchMedia('(max-width: 800px)')
  syncMobileHeatmap()
  mediaHeatmap.addEventListener('change', syncMobileHeatmap)
  requestAnimationFrame(() => {
    entered.value = true
  })
})

onUnmounted(() => {
  mediaHeatmap?.removeEventListener('change', syncMobileHeatmap)
})

const displayName = computed(() => form.name.trim() || userStore.displayName || 'Без имени')
const displayEmail = computed(() => form.email.trim() || authStore.currentUser?.email || 'Не указан')
const displayBio = computed(
  () => form.bio.trim() || 'Пока без описания — добавьте пару строк о себе.'
)

type BadgeItem = { id: string; title: string; icon: Component; earned: boolean }

const primaryBadges = computed<BadgeItem[]>(() => [
  { id: 'lvl1', title: 'Уровень 1+', icon: Zap, earned: userStore.level >= 1 },
  { id: 'lvl3', title: 'Уровень 3+', icon: Flame, earned: userStore.level >= 3 },
  { id: 'lvl5', title: 'Уровень 5+', icon: Trophy, earned: userStore.level >= 5 },
  { id: 'lvl8', title: 'Уровень 8+', icon: Crown, earned: userStore.level >= 8 },
  { id: 'tasks10', title: '10 задач', icon: CheckSquare, earned: userStore.completedTasksCount >= 10 },
  { id: 'tasks25', title: '25 задач', icon: Target, earned: userStore.completedTasksCount >= 25 },
  { id: 'tasks50', title: '50 задач', icon: Rocket, earned: userStore.completedTasksCount >= 50 },
  { id: 'tasks100', title: '100 задач', icon: Star, earned: userStore.completedTasksCount >= 100 },
  { id: 'silver', title: 'Серебро+', icon: Medal, earned: ['Серебро', 'Золото', 'Платина'].includes(userStore.league) },
  { id: 'gold', title: 'Золото+', icon: Award, earned: ['Золото', 'Платина'].includes(userStore.league) },
  { id: 'platinum', title: 'Платина', icon: Trophy, earned: userStore.league === 'Платина' },
  { id: 'today', title: 'Сделано сегодня', icon: CalendarDays, earned: todayCount.value > 0 },
  { id: 'week', title: 'Активная неделя', icon: Flame, earned: weekTotal.value >= 5 },
  { id: 'focus', title: 'Фокус сегодня', icon: Timer, earned: focusSessionsToday.value > 0 },
  { id: 'spark', title: 'Есть активность', icon: Sparkles, earned: yearTotal.value > 0 },
])

const levelPercent = computed(() =>
  Math.max(0, Math.min(100, userStore.levelProgressPercent || 0))
)

const accessTitle = computed(() => {
  if (accessStore.isDemo) return 'Демо'
  if (accessStore.hasSubscription || authStore.subscription.active) return 'Подписка'
  return 'Гость'
})

const accessNote = computed(() => {
  if (accessStore.isDemo) return 'Данные могут не сохраниться после сессии.'
  if (accessStore.hasSubscription || authStore.subscription.active) {
    return 'Полный доступ к разделам приложения.'
  }
  return 'Оформите доступ, чтобы сохранять прогресс.'
})

const expiresLabel = computed(() => {
  const expiresAt = authStore.subscription.expiresAt || accessStore.expiresAt
  return expiresAt ? formatDate(expiresAt) : ''
})

const providerLabel = computed(() => {
  const provider = authStore.currentUser?.provider
  if (provider === 'google') return 'Google'
  if (provider === 'yandex') return 'Яндекс'
  if (provider === 'local') return 'Email'
  return ''
})

const createdLabel = computed(() => {
  if (!authStore.currentUser?.createdAt) return ''
  return formatDate(authStore.currentUser.createdAt)
})

const activeTasks = computed(
  () => tasksStore.tasks.filter((task) => !task.done).length
)

const currentYear = computed(() => new Date().getFullYear())

const historyMap = computed(() =>
  mergeActivityCounts({
    history: tasksStore.completedTasksHistory || [],
    log: tasksStore.completionLog || [],
    tasks: tasksStore.tasks || [],
  })
)

const yearCells = computed(() => {
  const year = currentYear.value
  const start = new Date(year, 0, 1)
  const startOffset = start.getDay()
  const cells: { level: number; title: string }[] = []

  for (let i = 0; i < startOffset; i += 1) {
    cells.push({ level: 0, title: '' })
  }

  const end = new Date(year, 11, 31)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = localDateKey(d)
    const count = historyMap.value.get(key) || 0
    const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4
    cells.push({
      level,
      title: count
        ? `${key}: ${count}`
        : key,
    })
  }

  return cells
})

const yearWeeks = computed(() => Math.max(1, Math.ceil(yearCells.value.length / 7)))

/** On mobile show fewer recent weeks so cubes stay large and readable. */
const MOBILE_HEAT_WEEKS = 14

const heatCols = computed(() => {
  if (!isMobileHeatmap.value) return yearWeeks.value
  return Math.min(MOBILE_HEAT_WEEKS, yearWeeks.value)
})

const heatmapCells = computed(() => {
  const cells = yearCells.value
  if (!isMobileHeatmap.value) return cells
  const weeks = heatCols.value
  const startWeek = Math.max(0, Math.ceil(cells.length / 7) - weeks)
  return cells.slice(startWeek * 7)
})

const heatmapAside = computed(() =>
  isMobileHeatmap.value ? `${heatCols.value} нед` : String(currentYear.value)
)

const heatmapAriaLabel = computed(() =>
  isMobileHeatmap.value
    ? `Активность за последние ${heatCols.value} недель`
    : `Активность за ${currentYear.value}`
)

const yearTotal = computed(() => {
  const prefix = `${currentYear.value}-`
  let total = 0
  for (const [date, count] of historyMap.value.entries()) {
    if (date.startsWith(prefix)) total += count
  }
  return total
})

const weekDays = computed(() => {
  const days: { count: number }[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    days.push({ count: historyMap.value.get(localDateKey(date)) || 0 })
  }
  return days
})

const weekTotal = computed(() => weekDays.value.reduce((sum, day) => sum + day.count, 0))
const todayCount = computed(() => weekDays.value[weekDays.value.length - 1]?.count || 0)

function localDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function loadFocusSessions() {
  const key = `cof-focus-sessions-${localDateKey(new Date())}`
  const raw = accessAwareStorage.getItem(key)
  const parsed = Number(raw)
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
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, width, height)
  const preferPng = file.type === 'image/png' || file.type === 'image/webp'
  if (preferPng) return canvas.toDataURL('image/png')
  return canvas.toDataURL('image/jpeg', AVATAR_QUALITY)
}

async function handleAvatarChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    form.avatar = await compressAvatar(file)
    formError.value = ''
  } catch {
    formError.value = 'Не удалось обработать изображение'
  }
}

function removeAvatar() {
  form.avatar = ''
  formError.value = ''
}

function startEditing() {
  draft.name = form.name
  draft.email = form.email
  draft.bio = form.bio
  nameError.value = ''
  formError.value = ''
  isEditing.value = true
}

function cancelEditing() {
  form.name = draft.name
  form.email = draft.email
  form.bio = draft.bio
  nameError.value = ''
  formError.value = ''
  isEditing.value = false
}

async function syncProfile() {
  if (!authStore.isAuthenticated) return
  const result = await authStore.refreshSession()
  if (!result.success) warning(result.error || 'Не удалось обновить профиль')
}

async function saveProfile() {
  nameError.value = ''
  formError.value = ''

  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    bio: form.bio.trim(),
    avatar: form.avatar,
  }

  if (!payload.name) {
    nameError.value = 'Укажите имя'
    return
  }

  isSaving.value = true
  try {
    if (authStore.isAuthenticated) {
      const result = await authStore.updateProfile(payload)
      if (!result.success) {
        formError.value = result.error || 'Не удалось сохранить'
        return
      }
    } else {
      userStore.updateProfile(payload)
    }
    form.name = payload.name
    form.email = payload.email
    form.bio = payload.bio
    isEditing.value = false
    success('Профиль сохранён')
  } finally {
    isSaving.value = false
  }
}

async function logout() {
  await authStore.logout()
  info('Вы вышли из аккаунта')
  await router.push('/auth')
}

async function deleteAccount() {
  if (!authStore.isAuthenticated) {
    const ok = await confirm('Очистить локальный профиль?')
    if (!ok) return
    userStore.resetProfile()
    info('Локальный профиль очищен')
    return
  }

  const ok = await confirm('Удалить аккаунт безвозвратно?')
  if (!ok) return

  const result = await authStore.deleteAccount()
  if (!result.success) {
    formError.value = result.error || 'Не удалось удалить аккаунт'
    return
  }

  info('Аккаунт удалён')
  await router.push('/auth')
}
</script>

<style scoped lang="scss">
.profile {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.profile-bento {
  display: grid;
  grid-template-columns: minmax(200px, 0.85fr) repeat(3, minmax(0, 1fr));
  grid-template-areas:
    'avatar readme   readme   readme'
    'activity access account  account'
    'badges heat     heat     heat';
  gap: var(--space-3);
  width: 100%;
  align-items: stretch;
}

.tile {
  @include surface-panel;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
  min-height: 0;
  padding: var(--space-4);
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  opacity: 0;
  transform: translateY(10px);
}

.profile.is-entered .tile {
  animation: profile-panel-in 380ms ease-out both;
  animation-delay: calc(var(--enter-i, 0) * 50ms);
}

@keyframes profile-panel-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile {
    opacity: 1;
    transform: none;
  }

  .profile.is-entered .tile {
    animation: none;
  }
}

.tile--avatar {
  grid-area: avatar;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-3);
}

.tile--readme {
  grid-area: readme;
}

.tile--badges {
  grid-area: badges;
  gap: var(--space-3);
  padding: var(--space-3);
  height: 100%;
}

.tile--heatmap {
  grid-area: heat;
  gap: var(--space-3);
}

.tile--activity {
  grid-area: activity;
}

.tile--access {
  grid-area: access;
}

.tile--account {
  grid-area: account;
}

.tile-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  flex: 0 0 auto;

  h2 {
    @include heading-2;
    color: var(--color-text-primary);
  }
}

.tile-head__aside {
  @include meta-text;
  font-weight: var(--weight-medium);
  letter-spacing: 0.02em;
  text-transform: lowercase;
}

.stat-rows {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  justify-content: space-evenly;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex: 1;
  min-height: var(--space-9);
  padding-block: var(--space-1);
  border-bottom: var(--ui-border);

  &:last-child {
    border-bottom: none;
  }

  span {
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    line-height: var(--leading-tight);
  }

  strong {
    color: var(--color-text-primary);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    line-height: var(--leading-tight);
    text-align: right;
    overflow-wrap: break-word;
  }
}

.tile-foot {
  @include meta-text;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-4);
  flex: 0 0 auto;
  padding-top: var(--space-3);
  border-top: var(--ui-border);

  span {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }
}

.tile-note {
  @include meta-text;
  flex: 0 0 auto;
  padding-top: var(--space-3);
  border-top: var(--ui-border);
}

.demo-exit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--space-7);
  padding-inline: var(--space-3);
  border: 1px solid color-mix(in srgb, var(--color-error) 45%, transparent);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-error) 16%, transparent);
  color: var(--color-error);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  cursor: pointer;
  transition: background var(--transition-standard);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: color-mix(in srgb, var(--color-error) 24%, transparent);
    }
  }
}

.stat-row strong.is-demo {
  color: var(--color-error);
}

.demo-exit-cta {
  margin-top: auto;
  width: 100%;
}

.level-bar {
  width: 100%;
  height: 6px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-text-primary) 10%, transparent);

  i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--color-text-primary);
  }
}

.avatar-upload {
  position: relative;
  display: grid;
  place-items: center;
  flex: 1 1 auto;
  width: 100%;
  max-width: min(280px, 100%);
  max-height: 100%;
  aspect-ratio: 1;
  padding: 0;
  overflow: hidden;
  border: none;
  border-radius: calc(var(--radius-lg) - 4px);
  background: var(--color-surface-2);
  color: var(--color-text-secondary);
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: var(--space-1);
  justify-items: center;
  background: color-mix(in srgb, var(--color-bg, #0b0b0b) 55%, transparent);
  color: var(--color-text-primary);
  font-size: var(--text-xs);
  opacity: 0;
  transition: opacity var(--transition-standard);
}

@media (hover: hover) and (pointer: fine) {
  .avatar-upload:hover .avatar-overlay {
    opacity: 1;
  }
}

.avatar-upload:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  outline-offset: 2px;

  .avatar-overlay {
    opacity: 1;
  }
}

.avatar-remove {
  width: 100%;
  max-width: 280px;
}

.readme-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
  min-height: 0;
  height: 100%;
}

.readme-form {
  display: grid;
  flex: 1;
  gap: var(--space-5);
  align-content: start;
  min-height: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

.info-item {
  display: grid;
  gap: var(--space-2);
  min-width: 0;

  span {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  strong {
    color: var(--color-text-primary);
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    line-height: var(--leading-tight);
    overflow-wrap: anywhere;
  }

  p {
    margin: 0;
    color: var(--color-text-primary);
    font-size: var(--text-md);
    line-height: var(--leading-normal);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  &--bio {
    p {
      color: var(--color-text-secondary);
    }
  }
}

.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

.field {
  display: grid;
  gap: var(--space-2);
  min-width: 0;

  span {
    color: var(--color-text-primary);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }

  em {
    color: var(--color-error);
    font-size: var(--text-xs);
    font-style: normal;
  }
}

.readme-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-2);
  flex: 0 0 auto;
  margin-top: auto;
}

.readme-actions__left,
.readme-actions__right {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.readme-actions__right {
  margin-inline-start: auto;
}

.form-error {
  margin: 0;
  color: var(--color-error);
  font-size: var(--text-sm);
}

.badge-grid {
  display: grid;
  flex: 1 1 auto;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-template-rows: repeat(3, 1fr);
  place-items: center;
  gap: var(--space-2);
  min-height: 0;
}

.badge {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 100%;
  max-width: 56px;
  aspect-ratio: 1 / 1;
  border: var(--ui-border);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-accent) 14%, var(--color-surface-2));
  color: var(--color-text-primary);

  &.locked {
    opacity: 0.35;
    filter: grayscale(0.6);
  }
}

.badge__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.heatmap-shell {
  container-type: inline-size;
  width: 100%;
  min-width: 0;
}

.heatmap {
  --heat-gap: clamp(1px, 0.45cqi, var(--space-1));
  --heat-cols: 53;
  --heat-size: calc(
    (100cqi - (var(--heat-cols) - 1) * var(--heat-gap)) / var(--heat-cols)
  );
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, var(--heat-size));
  grid-auto-columns: var(--heat-size);
  gap: var(--heat-gap);
  width: 100%;
  min-width: 0;
}

.heat-cell {
  width: var(--heat-size);
  height: var(--heat-size);
  box-sizing: border-box;
  border-radius: clamp(1px, calc(var(--heat-size) * 0.18), 3px);
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
}

.heatmap-legend i {
  width: 11px;
  height: 11px;
  flex: 0 0 auto;
  border-radius: 2px;
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
}

.heat-cell[data-level='1'],
.heatmap-legend i[data-level='1'] {
  background: color-mix(in srgb, var(--color-text-primary) 22%, transparent);
}

.heat-cell[data-level='2'],
.heatmap-legend i[data-level='2'] {
  background: color-mix(in srgb, var(--color-text-primary) 40%, transparent);
}

.heat-cell[data-level='3'],
.heatmap-legend i[data-level='3'] {
  background: color-mix(in srgb, var(--color-text-primary) 62%, transparent);
}

.heat-cell[data-level='4'],
.heatmap-legend i[data-level='4'] {
  background: var(--color-text-primary);
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-1);
  flex: 0 0 auto;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

@media (max-width: 1100px) {
  .profile-bento {
    grid-template-columns: minmax(180px, 0.9fr) 1fr 1fr;
    grid-template-areas:
      'avatar readme readme'
      'activity access account'
      'badges heat   heat';
  }
}

@media (max-width: 767px) {
  .profile-bento {
    grid-template-columns: 1fr;
    grid-template-areas:
      'readme'
      'activity'
      'access'
      'account'
      'heat'
      'badges';
    gap: var(--space-3);
  }

  .tile--avatar {
    display: none;
  }

  .tile {
    padding: var(--space-3);
  }

  .tile--heatmap {
    padding: var(--space-3);
  }

  .heatmap {
    --heat-gap: clamp(var(--space-1), 0.9cqi, var(--space-1));
  }

  .heat-cell {
    border-radius: clamp(2px, calc(var(--heat-size) * 0.22), 4px);
  }

  .pair,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .readme-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .readme-actions__left,
  .readme-actions__right {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-inline-start: 0;
  }

  .readme-actions__left:has(> :only-child) {
    grid-template-columns: 1fr;
  }

  .readme-actions :deep(.app-button) {
    width: 100%;
    min-height: var(--space-11);
  }
}
</style>
