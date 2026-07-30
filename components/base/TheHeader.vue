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
          :class="{ running: focusWidget.isRunning }"
          type="button"
          :aria-label="`Таймер фокуса: ${focusWidget.label}, ${focusWidgetTime}`"
          :aria-expanded="isFocusWidgetPanelOpen"
          aria-haspopup="dialog"
          data-tooltip="Таймер фокуса"
          data-tooltip-position="bottom"
          @click="toggleFocusWidgetPanel"
        >
          <Target class="focus-widget__icon" :size="18" aria-hidden="true" />
          <span class="focus-widget__time">{{ focusWidgetTime }}</span>
        </button>
      </template>

      <NotificationCenter />
      <HeaderUserMenu
        ref="userMenu"
        :open="isProfileModalOpen"
        :avatar="headerAvatar"
        @toggle="toggleProfilePanel"
        @open-profile="openProfile"
        @logout="logout"
      />
    </HeaderQuickActions>
    <Teleport to="body">
      <Transition name="sheet-backdrop">
        <button
          v-if="isFocusWidgetPanelOpen && showFocusWidget"
          type="button"
          class="sheet-backdrop"
          aria-label="Закрыть таймер фокуса"
          @click="closeFocusWidgetPanel"
        />
      </Transition>
      <Transition name="profile-panel">
        <section
          v-if="isFocusWidgetPanelOpen && showFocusWidget"
          ref="focusWidgetPanel"
          class="focus-widget-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Мини-таймер фокуса"
          @click.stop
        >
          <div class="sheet-handle" aria-hidden="true" />

          <div class="focus-widget-panel__head">
            <span>{{ focusWidget.label }}</span>
            <em>{{ focusWidget.isRunning ? 'Сессия идёт' : 'Пауза' }}</em>
          </div>

          <div class="focus-widget-panel__timer">
            <strong>{{ focusWidgetTime }}</strong>
            <div
              class="focus-widget-panel__ribs"
              role="progressbar"
              :aria-valuenow="Math.round(focusProgress * 100)"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`Прогресс сессии ${Math.round(focusProgress * 100)}%`"
            >
              <span
                v-for="index in FOCUS_RIB_COUNT"
                :key="index"
                class="focus-widget-panel__rib"
                :class="{ filled: index <= focusRibsFilled }"
              />
            </div>
          </div>

          <div class="focus-widget-panel__actions">
            <AppButton type="button" variant="primary" @click="toggleFocusTimer">
              <Pause v-if="focusWidget.isRunning" :size="16" />
              <Play v-else :size="16" />
              {{ focusWidget.isRunning ? 'Пауза' : 'Старт' }}
            </AppButton>
            <AppButton type="button" variant="secondary" @click="resetFocusTimer">
              <RotateCcw :size="16" />
              Сброс
            </AppButton>
          </div>

          <button class="focus-widget-panel__link" type="button" @click="openFocus">
            Открыть страницу фокуса
            <ExternalLink :size="14" />
          </button>
        </section>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ExternalLink, Pause, Play, RotateCcw, Target } from 'lucide-vue-next'
import type { NavSection } from '~/stores/ui.store'
import {
  emitFocusTimerAction,
  emitFocusTimerUpdate,
  getFocusPresetSeconds,
  readFocusTimerState,
  writeFocusTimerState,
  type FocusPresetKey,
  type FocusTimerSnapshot,
} from '~/utils/focusTimer'

const FOCUS_RIB_COUNT = 25

const authStore = useAuthStore()
const userStore = useUserStore()
const uiStore = useUIStore()
const guidedTour = useGuidedTourStore()
const accessStore = useAccessStore()
const route = useRoute()
const { info } = useNotification()
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

const currentSectionTitle = computed(() => {
  if (route.path === '/profile') return 'Профиль'
  return sectionTitles[uiStore.activeNav]
})

const headerAvatar = computed(
  () => authStore.currentUser?.avatar || userStore.profile.avatar || ''
)

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
const focusProgress = computed(() => {
  const total = focusPresetSeconds.value
  if (!total) return 0
  return Math.min(1, Math.max(0, 1 - focusWidget.value.remainingSeconds / total))
})
const focusRibsFilled = computed(() => Math.round(focusProgress.value * FOCUS_RIB_COUNT))
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
  info('Вы вышли из аккаунта')
  navigateTo('/auth')
}

function handleDocumentClick(event: MouseEvent) {
  if (import.meta.client && window.matchMedia('(max-width: 767px)').matches) {
    return
  }
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
  gap: var(--space-2);
  min-height: var(--space-9);
  padding: var(--space-1) var(--space-3);
  border: var(--ui-border);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-accent) 12%, var(--color-surface-1));
  color: var(--color-text-primary);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    transform var(--transition-standard);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: color-mix(in srgb, var(--color-accent) 18%, var(--color-surface-1));
      border-color: color-mix(in srgb, var(--color-accent) 28%, var(--ui-border-color));
    }
  }

  &:active {
    transform: translateY(1px);
  }

  &.running {
    border-color: color-mix(in srgb, var(--color-accent) 36%, var(--ui-border-color));
  }

  @include mobile {
    min-height: var(--space-8);
    padding: var(--space-1) var(--space-2);
  }
}

.focus-widget__icon {
  flex: 0 0 auto;
  color: var(--color-accent);
}

.focus-widget__time {
  font-family: 'Space Grotesk', var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums;
  line-height: var(--leading-none, 1);
}

.focus-widget-panel {
  @include glass;
  position: fixed;
  inset-block-start: calc(72px + env(safe-area-inset-top, 0px));
  inset-inline-end: max(var(--space-3), env(safe-area-inset-right, 0px));
  z-index: var(--z-dropdown);
  display: grid;
  gap: var(--space-4);
  width: min(300px, calc(100dvw - var(--space-6)));
  padding: var(--space-4);
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  color: var(--color-text-primary);
}

.sheet-backdrop {
  display: none;
}

.sheet-handle {
  display: none;
}

.focus-widget-panel__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);

  span {
    color: var(--color-text-primary);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
  }

  em {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-style: normal;
    font-weight: var(--weight-medium);
  }
}

.focus-widget-panel__timer {
  display: grid;
  gap: var(--space-3);

  strong {
    font-family: 'Space Grotesk', var(--font-sans);
    font-size: clamp(2rem, 6vw, 2.6rem);
    font-weight: var(--weight-bold);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.04em;
    line-height: 1;
  }
}

.focus-widget-panel__ribs {
  display: flex;
  align-items: stretch;
  gap: 2px;
  height: 28px;
}

.focus-widget-panel__rib {
  flex: 1 1 0;
  min-width: 0;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-text-muted) 28%, transparent);
  transition: background 180ms linear;

  &.filled {
    background: var(--color-text-primary);
  }
}

.focus-widget-panel__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);

  :deep(.app-button) {
    width: 100%;
    min-height: var(--space-11);
  }
}

.focus-widget-panel__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: var(--space-9);
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: color var(--transition-standard);

  &:hover {
    color: var(--color-text-primary);
  }
}

.profile-panel-enter-active,
.profile-panel-leave-active,
.sheet-backdrop-enter-active,
.sheet-backdrop-leave-active {
  transition:
    opacity var(--transition-emphasized),
    transform var(--transition-emphasized);
}

.profile-panel-enter-from,
.profile-panel-leave-to {
  opacity: 0;
  transform: translateY(-18px);
}

.sheet-backdrop-enter-from,
.sheet-backdrop-leave-to {
  opacity: 0;
}

@include mobile {
  .sheet-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: calc(var(--z-modal) - 1);
    margin: 0;
    padding: 0;
    border: none;
    background: color-mix(in srgb, var(--color-bg) 48%, transparent);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .sheet-handle {
    display: none;
  }

  .focus-widget-panel {
    inset-block-start: calc(
      env(safe-area-inset-top, 0px) + var(--space-2) + var(--space-11) + var(--space-2) + 1px
    );
    inset-block-end: auto;
    inset-inline-start: 0;
    inset-inline-end: 0;
    z-index: var(--z-modal);
    width: 100%;
    max-width: none;
    padding: var(--space-4);
    border-top: none;
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  }
}
</style>
