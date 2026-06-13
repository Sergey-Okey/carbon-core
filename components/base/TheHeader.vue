<template>
  <header ref="headerRoot" class="header">
    <div class="brand">
      <img class="brand-mark" src="/favicon.svg" alt="" aria-hidden="true" />
      <div class="brand-text">
        <span class="logo-text">CORE OF LIFE</span>
        <span class="logo-icon">COF</span>
      </div>
    </div>

    <div class="section-title" aria-live="polite">
      {{ currentSectionTitle }}
    </div>

    <div class="actions">
      <button
        v-if="showFocusWidget"
        class="focus-widget"
        type="button"
        aria-label="Вернуться к таймеру фокуса"
        data-tooltip="Таймер фокуса"
        data-tooltip-position="bottom"
        @click="openFocus"
      >
        <Timer :size="16" />
        <span class="focus-widget__time">{{ focusWidgetTime }}</span>
        <span class="focus-widget__label">{{ focusWidget.label }}</span>
      </button>
      <button
        v-if="accessStore.isDemo"
        :class="['demo-access', { 'is-highlighted': shouldHighlightGuideEntry }]"
        type="button"
        aria-label="Открыть подписку"
        data-tooltip="Демо: данные не сохраняются"
        data-tooltip-position="bottom"
        @click="navigateTo('/register')"
      >
        Демо
      </button>
      <button
        :class="['action-btn', { 'is-guided-prompt': shouldHighlightGuideEntry }]"
        type="button"
        aria-label="Открыть обучение"
        data-tooltip="Обучение"
        data-tooltip-position="bottom"
        @click="openOnboarding"
      >
        <HelpCircle :size="20" />
      </button>
      <NotificationCenter />
      <button
        class="profile-btn"
        type="button"
        aria-label="Открыть профиль"
        data-tooltip="Профиль"
        data-tooltip-position="bottom"
        @click="toggleProfilePanel"
      >
        <div v-if="userStore.profile.avatar" class="avatar-small">
          <img :src="userStore.profile.avatar" alt="" />
        </div>
        <UserCircle v-else :size="20" />
      </button>
    </div>
    <Teleport to="body">
      <Transition name="profile-panel">
        <section
          v-if="isProfileModalOpen"
          ref="profilePanel"
          class="profile-panel"
          @click.stop
        >
          <header class="profile-panel-header">
            <div class="account-preview">
              <div class="account-avatar">
                <img v-if="userStore.profile.avatar" :src="userStore.profile.avatar" alt="" />
                <UserCircle v-else :size="28" />
              </div>
              <div>
                <h3>{{ userName }}</h3>
                <span>{{ userEmail }}</span>
              </div>
            </div>
          </header>

          <div class="account-modal-actions">
            <AppButton type="button" variant="ghost" @click="openProfile">
              <UserCircle :size="16" />
              Профиль
            </AppButton>
            <AppButton type="button" variant="danger" @click="logout">
              <LogOut :size="16" />
              Выйти
            </AppButton>
          </div>
        </section>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { HelpCircle, LogOut, Timer, UserCircle } from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import NotificationCenter from '~/components/base/NotificationCenter.vue'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth.store'
import { useUserStore } from '~/stores/user.store'
import { useUIStore, type NavSection } from '~/stores/ui.store'
import { useGuidedTourStore } from '~/stores/guidedTour.store'
import { useAccessStore } from '~/stores/access.store'

const authStore = useAuthStore()
const userStore = useUserStore()
const uiStore = useUIStore()
const guidedTour = useGuidedTourStore()
const accessStore = useAccessStore()
const route = useRoute()
const { addNotification } = useNotification()
const isProfileModalOpen = ref(false)
const headerRoot = ref<HTMLElement | null>(null)
const profilePanel = ref<HTMLElement | null>(null)
const focusWidget = ref({
  isRunning: false,
  remainingSeconds: 0,
  label: 'Фокус',
})
let focusWidgetIntervalId: number | null = null

const sectionTitles: Record<NavSection, string> = {
  board: 'Доска',
  tasks: 'Задачи',
  shop: 'Фокус',
  analytics: 'Аналитика',
  settings: 'Настройки',
}

const currentSectionTitle = computed(() => sectionTitles[uiStore.activeNav])
const shouldHighlightGuideEntry = computed(
  () => accessStore.isDemo && !guidedTour.hasStarted && !guidedTour.isCompleted
)
const showFocusWidget = computed(() => focusWidget.value.isRunning && uiStore.activeNav !== 'shop')
const focusWidgetTime = computed(() => {
  const minutes = Math.floor(focusWidget.value.remainingSeconds / 60)
  const seconds = focusWidget.value.remainingSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
const userName = computed(() => userStore.displayName || 'COF User')
const userEmail = computed(
  () => userStore.profile.email || authStore.currentUser?.email || 'Локальный профиль'
)

function openProfile() {
  isProfileModalOpen.value = false
  navigateTo('/profile')
}

async function openFocus() {
  isProfileModalOpen.value = false
  window.dispatchEvent(new CustomEvent('cof:close-notifications'))
  if (route.path !== '/') {
    await navigateTo('/')
  }
  uiStore.setActiveNav('shop')
}

async function openOnboarding() {
  isProfileModalOpen.value = false
  window.dispatchEvent(new CustomEvent('cof:close-notifications'))
  if (route.path !== '/') {
    await navigateTo('/')
  }
  guidedTour.start()
}

function toggleProfilePanel() {
  isProfileModalOpen.value = !isProfileModalOpen.value
  if (isProfileModalOpen.value) {
    window.dispatchEvent(new CustomEvent('cof:close-notifications'))
  }
}

function logout() {
  isProfileModalOpen.value = false
  authStore.logout()
  addNotification({ type: 'info', message: 'Вы вышли из аккаунта' })
  navigateTo('/auth')
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Node
  if (!headerRoot.value?.contains(target) && !profilePanel.value?.contains(target)) {
    isProfileModalOpen.value = false
  }
}

function closeProfilePanel() {
  isProfileModalOpen.value = false
}

function stopFocusWidgetTicker() {
  if (focusWidgetIntervalId) {
    window.clearInterval(focusWidgetIntervalId)
    focusWidgetIntervalId = null
  }
}

function startFocusWidgetTicker(endsAt?: number | null) {
  stopFocusWidgetTicker()
  if (!endsAt) return

  const sync = () => {
    const nextRemaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
    focusWidget.value.remainingSeconds = nextRemaining
    if (nextRemaining <= 0) {
      focusWidget.value.isRunning = false
      stopFocusWidgetTicker()
    }
  }

  sync()
  focusWidgetIntervalId = window.setInterval(sync, 1000)
}

function syncFocusWidgetFromStorage() {
  try {
    const raw = localStorage.getItem('cof-focus-state')
    if (!raw) {
      focusWidget.value = { isRunning: false, remainingSeconds: 0, label: 'Фокус' }
      stopFocusWidgetTicker()
      return
    }

    const state = JSON.parse(raw) as {
      remainingSeconds?: number
      isRunning?: boolean
      endsAt?: number | null
      preset?: 'focus' | 'short' | 'long'
    }

    const labels = {
      focus: 'Фокус',
      short: 'Пауза',
      long: 'Отдых',
    } as const

    focusWidget.value = {
      isRunning: state.isRunning === true,
      remainingSeconds: Number.isFinite(state.remainingSeconds)
        ? Math.max(0, Number(state.remainingSeconds))
        : 0,
      label: labels[state.preset ?? 'focus'] ?? 'Фокус',
    }

    if (focusWidget.value.isRunning) {
      startFocusWidgetTicker(state.endsAt)
    } else {
      stopFocusWidgetTicker()
    }
  } catch {
    focusWidget.value = { isRunning: false, remainingSeconds: 0, label: 'Фокус' }
    stopFocusWidgetTicker()
  }
}

function handleFocusTimerUpdate() {
  syncFocusWidgetFromStorage()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('cof:close-profile-panel', closeProfilePanel)
  window.addEventListener('cof:focus-timer-update', handleFocusTimerUpdate)
  syncFocusWidgetFromStorage()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('cof:close-profile-panel', closeProfilePanel)
  window.removeEventListener('cof:focus-timer-update', handleFocusTimerUpdate)
  stopFocusWidgetTicker()
})
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 3000;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: clamp(8px, 1.5vw, 12px);
  margin-block: max(12px, env(safe-area-inset-top, 0px)) 4px;
  margin-inline-start: max(12px, env(safe-area-inset-left, 0px));
  margin-inline-end: max(12px, env(safe-area-inset-right, 0px));
  padding-block: 8px;
  padding-inline: clamp(10px, 2vw, 14px);
  border-radius: var(--border-radius-lg);
  @include glass;
  background: transparent;
  border: var(--ui-border);
  transition:
    background var(--transition-standard),
    opacity var(--transition-standard);

  @include mobile {
    position: fixed;
    inset-inline: 0;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    margin: 0;
    padding-block: calc(env(safe-area-inset-top, 0px) + 8px) 8px;
    padding-inline: max(12px, env(safe-area-inset-left, 0px)) max(12px, env(safe-area-inset-right, 0px));
    border: none;
    border-bottom: var(--ui-border);
    border-radius: 0;
  }
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand-mark {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border: none;
  border-radius: var(--border-radius-md);
  background: transparent;

  @include mobile {
    width: 30px;
    height: 30px;
    border-radius: var(--border-radius-pill);
  }
}

.brand-text {
  min-width: 0;
  color: var(--text);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0;

  .logo-text {
    display: inline;
  }

  .logo-icon {
    display: none;
  }

  @include mobile {
    .logo-text {
      display: none;
    }

    .logo-icon {
      display: inline;
      font-size: 0.95rem;
      font-weight: 700;
    }
  }
}

.section-title {
  justify-self: center;
  max-width: min(320px, 40vw);
  overflow: hidden;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;

  @include mobile {
    display: none;
  }
}

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  min-width: 0;

  @include mobile {
    gap: 4px;
  }
}

.focus-widget {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding-inline: 10px 12px;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--text);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard),
    transform var(--transition-standard),
    box-shadow var(--transition-standard);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: color-mix(in srgb, var(--accent) 18%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 16%, transparent);
    }
  }

  &:active {
    transform: translateY(1px);
  }

  svg {
    flex: 0 0 auto;
  }

  @include mobile {
    min-height: 32px;
    padding-inline: 8px 10px;
  }
}

.focus-widget__time {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.focus-widget__label {
  color: var(--dim);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;

  @include mobile {
    display: none;
  }
}

.demo-access {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding-inline: 10px;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--text);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 14%, transparent);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard),
    box-shadow var(--transition-standard),
    transform var(--transition-standard);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: color-mix(in srgb, var(--accent) 20%, transparent);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 22%, transparent);
    }
  }

  &:active {
    transform: translateY(1px);
  }

  &.is-highlighted {
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--accent) 28%, transparent),
      0 0 0 5px color-mix(in srgb, var(--accent) 10%, transparent);
    animation: demo-accent-pulse 1.9s ease-in-out infinite;
  }

  @include mobile {
    min-height: 32px;
    padding-inline: 8px;
  }
}

.action-btn,
.profile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  border: none;
  border-radius: var(--border-radius-md);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      color: var(--text);
    }
  }

  &:active {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--accent) 18%, transparent);
    outline-offset: 2px;
  }

  @include mobile {
    width: 44px;
    height: 44px;
    border-radius: var(--border-radius-md);
  }
}

.action-btn.is-guided-prompt {
  color: var(--text);
  animation: help-icon-pulse 1.4s ease-in-out infinite;
}

.action-btn.is-guided-prompt svg {
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--accent) 26%, transparent));
}

.actions :deep(.notification-trigger) {
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  min-height: var(--control-icon-size);
  padding: 0;
  border: none;
  border-radius: var(--border-radius-md);
  background: transparent;
  color: var(--dim);

  &:hover,
  &:focus-visible {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--text);
  }

  &:active {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }

  @include mobile {
    width: 44px;
    height: 44px;
    min-height: 44px;
  }
}

.avatar-small {
  width: 28px;
  height: 28px;
  overflow: hidden;
  border: none;
  border-radius: var(--border-radius-pill);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.account-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.profile-panel {
  @include glass;
  position: fixed;
  inset-block-start: calc(72px + env(safe-area-inset-top, 0px));
  inset-inline-end: max(12px, env(safe-area-inset-right, 0px));
  z-index: 4300;
  inline-size: min(320px, calc(100dvw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)));
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background: transparent;
  color: var(--text);
}

.profile-panel-header {
  padding: 14px;
  border-bottom: var(--ui-border);
}

.account-avatar {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: var(--border-radius-md);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  color: var(--text);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.account-preview h3,
.account-preview span {
  display: block;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-preview h3 {
  color: var(--text);
  font-size: 0.98rem;
  font-weight: 700;
}

.account-preview span {
  margin-top: 4px;
  color: var(--dim);
  font-size: 0.84rem;
}

.account-modal-actions {
  display: grid;
  gap: 6px;
  padding: 10px;

  :deep(.app-button) {
    justify-content: flex-start;
  }
}

.profile-panel-enter-active,
.profile-panel-leave-active {
  transition:
    opacity var(--transition-standard),
    transform var(--transition-standard);
}

.profile-panel-enter-from,
.profile-panel-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes help-icon-pulse {
  0%,
  100% {
    background: transparent;
    transform: scale(1);
  }
  40% {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    transform: scale(1.06);
  }
}

@keyframes demo-accent-pulse {
  0%,
  100% {
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--accent) 28%, transparent),
      0 0 0 0 color-mix(in srgb, var(--accent) 0%, transparent);
  }
  45% {
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--accent) 36%, transparent),
      0 0 0 6px color-mix(in srgb, var(--accent) 12%, transparent);
  }
}

@media (max-width: 640px) {
  .profile-panel {
    inset-block-start: calc(70px + env(safe-area-inset-top, 0px));
    inset-inline-start: max(12px, env(safe-area-inset-left, 0px));
    inset-inline-end: max(12px, env(safe-area-inset-right, 0px));
    inline-size: auto;
  }
}
</style>
