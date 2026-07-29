<template>
  <header ref="headerRoot" class="header">
    <HeaderBrand />

    <div class="section-title" aria-live="polite">
      {{ currentSectionTitle }}
    </div>

    <HeaderQuickActions
      :is-demo="accessStore.isDemo"
      :highlight-guide="shouldHighlightGuideEntry"
      @demo="navigateTo('/register')"
      @guide="openOnboarding"
    >
      <template #leading>
        <button
          v-if="showFocusWidget"
          class="focus-widget"
          type="button"
          aria-label="Открыть мини-таймер фокуса"
          data-tooltip="Таймер фокуса"
          data-tooltip-position="bottom"
          @click="toggleFocusWidgetPanel"
        >
          <Timer :size="16" />
          <span class="focus-widget__time">{{ focusWidgetTime }}</span>
          <span class="focus-widget__label">{{ focusWidget.label }}</span>
        </button>
      </template>

      <NotificationCenter />
      <HeaderUserMenu
        ref="userMenu"
        :open="isProfileModalOpen"
        :name="userName"
        :email="userEmail"
        :avatar="userStore.profile.avatar"
        @toggle="toggleProfilePanel"
        @open-profile="openProfile"
        @logout="logout"
      />
    </HeaderQuickActions>
    <Teleport to="body">
      <Transition name="profile-panel">
        <section
          v-if="isFocusWidgetPanelOpen && showFocusWidget"
          ref="focusWidgetPanel"
          class="focus-widget-panel"
          @click.stop
        >
          <div class="focus-widget-panel__head">
            <span>{{ focusWidget.label }}</span>
            <strong>{{ focusWidgetTime }}</strong>
          </div>
          <div class="focus-widget-panel__ring" :class="{ 'is-running': focusWidget.isRunning }">
            <div class="focus-widget-panel__core">
              <Timer :size="20" />
              <strong>{{ focusWidgetTime }}</strong>
              <span>{{ focusWidget.isRunning ? 'Сессия идёт' : 'Пауза' }}</span>
            </div>
          </div>
          <div class="focus-widget-panel__actions">
            <AppButton type="button" variant="primary" @click="toggleFocusTimer">
              <Timer :size="16" />
              {{ focusWidget.isRunning ? 'Пауза' : 'Старт' }}
            </AppButton>
            <AppButton type="button" variant="secondary" @click="resetFocusTimer">
              Сброс
            </AppButton>
          </div>
          <button class="focus-widget-panel__link" type="button" @click="openFocus">
            Открыть страницу фокуса
          </button>
        </section>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Timer } from 'lucide-vue-next'
import AppButton from '~/components/ui/primitives/AppButton.vue'
import HeaderBrand from '~/components/base/header/HeaderBrand.vue'
import HeaderQuickActions from '~/components/base/header/HeaderQuickActions.vue'
import HeaderUserMenu from '~/components/base/header/HeaderUserMenu.vue'
import NotificationCenter from '~/components/base/NotificationCenter.vue'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth.store'
import { useUserStore } from '~/stores/user.store'
import { useUIStore, type NavSection } from '~/stores/ui.store'
import { useGuidedTourStore } from '~/stores/guidedTour.store'
import { useAccessStore } from '~/stores/access.store'
import {
  emitFocusTimerAction,
  emitFocusTimerUpdate,
  getFocusPresetSeconds,
  readFocusTimerState,
  writeFocusTimerState,
  type FocusPresetKey,
  type FocusTimerSnapshot,
} from '~/utils/focusTimer'

const authStore = useAuthStore()
const userStore = useUserStore()
const uiStore = useUIStore()
const guidedTour = useGuidedTourStore()
const accessStore = useAccessStore()
const route = useRoute()
const { addNotification } = useNotification()
const isProfileModalOpen = ref(false)
const isFocusWidgetPanelOpen = ref(false)
const headerRoot = ref<HTMLElement | null>(null)
const userMenu = ref<{ panelRef?: HTMLElement | null } | null>(null)
const focusWidgetPanel = ref<HTMLElement | null>(null)
const focusWidget = ref({
  preset: 'focus' as FocusPresetKey,
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
const focusPresetSeconds = computed(
  () =>
    ({
      focus: 25 * 60,
      short: 5 * 60,
      long: 15 * 60,
    })[focusWidget.value.preset] || 25 * 60
)
const showFocusWidget = computed(
  () =>
    uiStore.activeNav !== 'shop' &&
    (focusWidget.value.isRunning || focusWidget.value.remainingSeconds < focusPresetSeconds.value)
)
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
  isFocusWidgetPanelOpen.value = false
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
  if (isProfileModalOpen.value) isFocusWidgetPanelOpen.value = false
  if (isProfileModalOpen.value) {
    window.dispatchEvent(new CustomEvent('cof:close-notifications'))
  }
}

function toggleFocusWidgetPanel() {
  isProfileModalOpen.value = false
  isFocusWidgetPanelOpen.value = !isFocusWidgetPanelOpen.value
  if (isFocusWidgetPanelOpen.value) {
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
  const profilePanelEl = userMenu.value?.panelRef ?? null
  if (
    !headerRoot.value?.contains(target) &&
    !profilePanelEl?.contains(target) &&
    !focusWidgetPanel.value?.contains(target)
  ) {
    isProfileModalOpen.value = false
    isFocusWidgetPanelOpen.value = false
  }
}

function closeProfilePanel() {
  isProfileModalOpen.value = false
}

function closeFocusWidgetPanel() {
  isFocusWidgetPanelOpen.value = false
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
    const state = readFocusTimerState()
    if (!state) {
      focusWidget.value = { preset: 'focus', isRunning: false, remainingSeconds: 0, label: 'Фокус' }
      stopFocusWidgetTicker()
      return
    }

    focusWidget.value = {
      preset: state.preset,
      isRunning: state.isRunning,
      remainingSeconds: state.remainingSeconds,
      label:
        ({
          focus: 'Фокус',
          short: 'Пауза',
          long: 'Отдых',
        } satisfies Record<FocusPresetKey, string>)[state.preset] ?? 'Фокус',
    }

    if (focusWidget.value.isRunning) {
      startFocusWidgetTicker(state.endsAt)
    } else {
      stopFocusWidgetTicker()
    }
  } catch {
    focusWidget.value = { preset: 'focus', isRunning: false, remainingSeconds: 0, label: 'Фокус' }
    stopFocusWidgetTicker()
  }
}

function handleFocusTimerUpdate(event?: Event) {
  const detail = (event as CustomEvent<FocusTimerSnapshot | null> | undefined)?.detail
  if (detail) {
    focusWidget.value = {
      preset: detail.preset,
      isRunning: detail.isRunning,
      remainingSeconds: detail.remainingSeconds,
      label: detail.label,
    }

    if (detail.isRunning) startFocusWidgetTicker(detail.endsAt)
    else stopFocusWidgetTicker()
    return
  }

  syncFocusWidgetFromStorage()
}

function toggleFocusTimer() {
  writeFocusTimerState({
    preset: focusWidget.value.preset,
    remainingSeconds: focusWidget.value.remainingSeconds,
    isRunning: !focusWidget.value.isRunning,
    endsAt: focusWidget.value.isRunning ? null : Date.now() + focusWidget.value.remainingSeconds * 1000,
  })
  emitFocusTimerUpdate()
  emitFocusTimerAction('toggle')
}

function resetFocusTimer() {
  writeFocusTimerState({
    preset: focusWidget.value.preset,
    remainingSeconds: getFocusPresetSeconds(focusWidget.value.preset),
    isRunning: false,
    endsAt: null,
  })
  emitFocusTimerUpdate()
  emitFocusTimerAction('reset')
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('cof:close-profile-panel', closeProfilePanel)
  window.addEventListener('cof:close-focus-widget-panel', closeFocusWidgetPanel)
  window.addEventListener('cof:focus-timer-update', handleFocusTimerUpdate)
  syncFocusWidgetFromStorage()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('cof:close-profile-panel', closeProfilePanel)
  window.removeEventListener('cof:close-focus-widget-panel', closeFocusWidgetPanel)
  window.removeEventListener('cof:focus-timer-update', handleFocusTimerUpdate)
  stopFocusWidgetTicker()
})
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: clamp(var(--space-2), 1.5vw, var(--space-3));
  margin-block: max(var(--space-3), env(safe-area-inset-top, 0px)) var(--space-1);
  margin-inline-start: max(var(--space-3), env(safe-area-inset-left, 0px));
  margin-inline-end: max(var(--space-3), env(safe-area-inset-right, 0px));
  padding-block: var(--space-2);
  padding-inline: clamp(var(--space-2), 2vw, var(--space-3));
  border-radius: var(--radius-lg);
  /* Real glass: do not use surface-panel here — opaque fill kills blur. */
  @include glass;
  overflow: visible;
  background-color: var(--glass-surface);
  box-shadow: none;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    opacity var(--transition-standard);

  @include mobile {
    position: fixed;
    inset-inline: 0;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--space-2);
    margin: 0;
    padding-block: calc(env(safe-area-inset-top, 0px) + var(--space-2)) var(--space-2);
    padding-inline: max(var(--space-3), env(safe-area-inset-left, 0px)) max(var(--space-3), env(safe-area-inset-right, 0px));
    border: none;
    border-bottom: var(--ui-border);
    border-radius: 0;
    backdrop-filter: var(--glass-strong-filter);
    -webkit-backdrop-filter: var(--glass-strong-filter);
    background-color: color-mix(in srgb, var(--surface) 55%, transparent);
  }
}

.section-title {
  justify-self: center;
  max-width: min(320px, 40vw);
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;

  @include mobile {
    display: none;
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

.focus-widget-panel {
  @include glass;
  position: fixed;
  inset-block-start: calc(72px + env(safe-area-inset-top, 0px));
  inset-inline-end: max(12px, env(safe-area-inset-right, 0px));
  z-index: var(--z-dropdown);
  display: grid;
  gap: 14px;
  width: min(320px, calc(100dvw - 24px));
  padding: 14px;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  color: var(--text);
}

.focus-widget-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  span {
    color: var(--dim);
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  strong {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
  }
}

.focus-widget-panel__ring {
  display: grid;
  place-items: center;
  min-height: 188px;
  border-radius: 24px;
  background:
    radial-gradient(circle at center, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 62%),
    color-mix(in srgb, var(--surface) 72%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 10%, transparent);

  &.is-running {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 12%, transparent);
  }
}

.focus-widget-panel__core {
  display: grid;
  justify-items: center;
  gap: 8px;

  svg {
    color: var(--accent);
  }

  strong {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.4rem, 7vw, 3.6rem);
    font-weight: 700;
    line-height: 0.9;
    letter-spacing: -0.05em;
  }

  span {
    color: var(--dim);
    font-size: 0.8rem;
    font-weight: 700;
  }
}

.focus-widget-panel__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  :deep(.app-button) {
    width: 100%;
  }
}

.focus-widget-panel__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  border: none;
  background: transparent;
  color: var(--dim);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: color var(--transition-standard);

  &:hover {
    color: var(--text);
  }
}

@media (max-width: 640px) {
  .focus-widget-panel {
    inset-block-start: calc(70px + env(safe-area-inset-top, 0px));
    inset-inline-start: max(var(--space-3), env(safe-area-inset-left, 0px));
    inset-inline-end: max(var(--space-3), env(safe-area-inset-right, 0px));
    width: auto;
  }
}
</style>
