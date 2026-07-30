<template>
  <section class="focus-page" aria-label="Фокус" data-tour="focus-page">
    <div class="focus-grid">
      <AnalyticsWidgetShell
        title="Сессия"
        :subtitle="sessionSubtitle"
        :icon="Target"
        :span="8"
        enter="fade-up"
        :draggable="false"
      >
        <template #aside>
          <span class="focus-aside">{{ activePreset.minutes }} мин</span>
        </template>

        <div class="timer-body">
          <div class="timer-stage" :class="{ running: isRunning }">
            <svg viewBox="0 0 220 220" class="timer-ring" aria-label="Таймер фокуса">
              <g class="ring-ticks">
                <line
                  v-for="tick in ringTicks"
                  :key="tick.index"
                  x1="110"
                  y1="15"
                  x2="110"
                  y2="29"
                  :class="{ active: tick.active }"
                  :style="{ '--tick-delay': `${tick.delay}ms` }"
                  :transform="`rotate(${tick.angle} 110 110)`"
                />
              </g>
            </svg>

            <div class="timer-center">
              <div class="timer-center__icon">
                <Target :size="24" />
              </div>
              <strong>{{ formattedTime }}</strong>
              <span>{{ isRunning ? 'идёт сессия' : 'готов к старту' }}</span>
            </div>
          </div>

          <div class="timer-actions">
            <AppButton type="button" variant="primary" data-tour="focus-start" @click="toggleTimer">
              <Pause v-if="isRunning" :size="16" />
              <Play v-else :size="16" />
              {{ isRunning ? 'Пауза' : 'Старт' }}
            </AppButton>
            <AppButton type="button" variant="secondary" @click="resetTimer">
              <RotateCcw :size="16" />
              Сброс
            </AppButton>
          </div>
        </div>
      </AnalyticsWidgetShell>

      <div class="focus-side">
        <AnalyticsWidgetShell
          title="Режим"
          :subtitle="`${activePreset.minutes} мин`"
          :icon="Timer"
          enter="slide-left"
          :draggable="false"
          fluid
        >
          <div class="mode-body">
            <div class="preset-seg" data-tour="focus-presets" role="radiogroup" aria-label="Пресеты фокуса">
              <button
                v-for="preset in presets"
                :key="preset.key"
                type="button"
                class="preset-chip"
                role="radio"
                :aria-checked="activePreset.key === preset.key"
                :class="{ active: activePreset.key === preset.key }"
                @click="setPreset(preset.key)"
              >
                <span class="preset-chip__icon" aria-hidden="true">
                  <component :is="preset.icon" :size="20" />
                </span>
                <span class="preset-chip__copy">
                  <span class="preset-chip__label">{{ preset.label }}</span>
                  <em>{{ preset.minutes }} мин</em>
                </span>
                <strong class="preset-chip__value">{{ preset.minutes }}</strong>
              </button>
            </div>
          </div>
        </AnalyticsWidgetShell>

        <AnalyticsWidgetShell
          title="Сегодня"
          :subtitle="sessionStatusLabel"
          :icon="Flame"
          enter="bounce-in"
          :draggable="false"
          fluid
        >
          <div class="today-body">
            <div class="today-stat">
              <strong>{{ completedSessions }}</strong>
              <span>{{ sessionLabel }}</span>
            </div>

            <div class="today-progress" aria-label="Прогресс текущей сессии">
              <div class="today-progress__meta">
                <span>Сессия</span>
                <span>{{ progressPercent }}%</span>
              </div>
              <div class="today-progress__track" role="progressbar" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100">
                <span class="today-progress__fill" :style="{ width: `${progressPercent}%` }" />
              </div>
              <p class="today-tip">
                Выберите длительность, затем стартуйте. Счётчик дня сохраняется сам.
              </p>
            </div>
          </div>
        </AnalyticsWidgetShell>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  Coffee,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Target,
  Timer,
} from 'lucide-vue-next'
import AnalyticsWidgetShell from '~/components/analytics/AnalyticsWidgetShell.vue'
import AppButton from '~/components/ui/primitives/AppButton.vue'
import { useNotification } from '~/composables/useNotification'
import { useGuidedTourStore } from '~/stores/guidedTour.store'
import { useFeedback } from '~/composables/useFeedback'
import { accessAwareStorage } from '~/utils/accessStorage'
import {
  FOCUS_STATE_KEY,
  emitFocusTimerUpdate,
  getFocusPresetSeconds,
  type FocusPresetKey,
} from '~/utils/focusTimer'

const { push } = useNotification()
const guidedTour = useGuidedTourStore()
const { trigger } = useFeedback()

const presets = [
  { key: 'focus' as const, label: 'Фокус', minutes: 25, icon: Target },
  { key: 'short' as const, label: 'Пауза', minutes: 5, icon: Coffee },
  { key: 'long' as const, label: 'Отдых', minutes: 15, icon: Timer },
]

const activePresetKey = ref<FocusPresetKey>('focus')
const remainingSeconds = ref(presets[0].minutes * 60)
const isRunning = ref(false)
const completedSessions = ref(0)
let intervalId: number | null = null

const activePreset = computed(() =>
  presets.find((preset) => preset.key === activePresetKey.value) ?? presets[0]
)

const sessionSubtitle = computed(() =>
  isRunning.value ? `${activePreset.value.label} · идёт` : `${activePreset.value.label} · готов`
)

const todayKey = computed(() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})
const storageKey = computed(() => `cof-focus-sessions-${todayKey.value}`)
const totalSeconds = computed(() => activePreset.value.minutes * 60)
const progress = computed(() => {
  if (!totalSeconds.value) return 0
  return 1 - remainingSeconds.value / totalSeconds.value
})
const progressPercent = computed(() => Math.round(progress.value * 100))
const sessionLabel = computed(() => {
  const count = completedSessions.value
  if (count % 10 === 1 && count % 100 !== 11) return 'сессия'
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'сессии'
  return 'сессий'
})
const sessionStatusLabel = computed(() =>
  isRunning.value ? 'сессия идёт' : 'ожидание старта'
)
const ringTicks = computed(() => {
  const active = Math.round(progress.value * 56)
  return Array.from({ length: 56 }, (_, index) => ({
    index,
    angle: index * (360 / 56),
    active: index < active,
    delay: Math.max(0, 120 + index * 13 - index * index * 0.09),
  }))
})
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

function emitTimerState() {
  emitFocusTimerUpdate({
    preset: activePresetKey.value,
    remainingSeconds: remainingSeconds.value,
    isRunning: isRunning.value,
    endsAt: isRunning.value ? Date.now() + remainingSeconds.value * 1000 : null,
  })
}

function setPreset(key: FocusPresetKey) {
  activePresetKey.value = key
  stopTimer()
  remainingSeconds.value = getFocusPresetSeconds(activePresetKey.value)
  persistState()
}

function toggleTimer() {
  if (isRunning.value) {
    stopTimer()
    persistState()
    return
  }

  if (remainingSeconds.value <= 0) {
    remainingSeconds.value = totalSeconds.value
  }

  isRunning.value = true
  guidedTour.handleAction('focus-started')
  intervalId = window.setInterval(tick, 1000)
  persistState()
}

function tick() {
  if (remainingSeconds.value > 1) {
    remainingSeconds.value -= 1
    persistState()
    return
  }

  remainingSeconds.value = 0
  stopTimer()
  completedSessions.value += 1
  persistSessions()
  push({
    type: 'success',
    category: 'user',
    message: `${activePreset.value.label} завершён`,
  })
  void trigger('focusComplete')
  persistState()
}

function resetTimer() {
  stopTimer()
  remainingSeconds.value = totalSeconds.value
  persistState()
}

function stopTimer() {
  isRunning.value = false
  if (intervalId) {
    window.clearInterval(intervalId)
    intervalId = null
  }
}

function loadSessions() {
  const value = accessAwareStorage.getItem(storageKey.value)
  const parsed = value ? Number(value) : 0
  completedSessions.value = Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function persistSessions() {
  accessAwareStorage.setItem(storageKey.value, String(completedSessions.value))
}

function persistState() {
  accessAwareStorage.setItem(
    FOCUS_STATE_KEY,
    JSON.stringify({
      preset: activePresetKey.value,
      remainingSeconds: remainingSeconds.value,
      isRunning: isRunning.value,
      endsAt: isRunning.value ? Date.now() + remainingSeconds.value * 1000 : null,
    })
  )
  emitTimerState()
}

function restoreState() {
  try {
    const raw = accessAwareStorage.getItem(FOCUS_STATE_KEY)
    if (!raw) return
    const state = JSON.parse(raw) as {
      preset?: FocusPresetKey
      remainingSeconds?: number
      isRunning?: boolean
      endsAt?: number | null
    }
    if (presets.some((preset) => preset.key === state.preset)) {
      activePresetKey.value = state.preset as FocusPresetKey
    }
    if (Number.isFinite(state.remainingSeconds)) {
      remainingSeconds.value = Math.max(0, Number(state.remainingSeconds))
    }
    if (state.isRunning && state.endsAt) {
      remainingSeconds.value = Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000))
      if (remainingSeconds.value > 0) {
        isRunning.value = true
        intervalId = window.setInterval(tick, 1000)
      }
    }
  } catch {
    accessAwareStorage.removeItem(FOCUS_STATE_KEY)
  }
}

function handleFocusTimerAction(event: Event) {
  const detail = (event as CustomEvent<{ action?: 'toggle' | 'reset' }>).detail
  if (!detail?.action) return

  if (detail.action === 'toggle') {
    toggleTimer()
    return
  }

  if (detail.action === 'reset') {
    resetTimer()
  }
}

onMounted(() => {
  loadSessions()
  restoreState()
  window.addEventListener('cof:focus-timer-action', handleFocusTimerAction)
  emitTimerState()
})
onBeforeUnmount(() => {
  persistState()
  window.removeEventListener('cof:focus-timer-action', handleFocusTimerAction)
  stopTimer()
})
</script>

<style scoped lang="scss">
.focus-page {
  display: grid;
  gap: var(--space-4);
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.focus-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-flow: dense;
  gap: var(--space-4);
  width: 100%;
  align-items: stretch;

  :deep(.widget-shell[class*='enter-']) {
    animation-delay: var(--enter-delay, 0ms);
  }

  :deep(.widget-shell.span-8) {
    --tile-h: 560px;
    min-height: 560px;
  }
}

.focus-side {
  display: grid;
  grid-column: span 4;
  grid-template-rows: 1.15fr 0.85fr;
  gap: var(--space-4);
  min-width: 0;
  min-height: 560px;
  height: 100%;

  :deep(.widget-shell.is-fluid) {
    height: 100%;
    min-height: 0;
  }
}

.focus-aside {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  white-space: nowrap;
}

.timer-body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
  min-height: 0;
  width: 100%;
}

.timer-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 360px);
  aspect-ratio: 1;
  flex: 0 0 auto;
  margin-inline: auto;
}

.timer-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  overflow: visible;
}

.ring-ticks line {
  stroke: color-mix(in srgb, var(--color-accent) 18%, transparent);
  stroke-dasharray: 14;
  stroke-dashoffset: 14;
  stroke-linecap: round;
  stroke-width: 2.8;
  opacity: 0.7;
  animation: focus-tick-in 520ms cubic-bezier(0.16, 1, 0.3, 1) var(--tick-delay) both;
  transition:
    stroke var(--transition-standard),
    opacity var(--transition-standard);

  &.active {
    stroke: var(--color-accent);
    opacity: 1;
  }
}

.timer-center {
  position: absolute;
  inset: 0;
  width: min(74%, 280px);
  margin: auto;
  color: var(--color-text-primary);
  opacity: 0;
  transform: scale(0.97);
  animation: focus-value-in 460ms cubic-bezier(0.16, 1, 0.3, 1) 520ms both;
  pointer-events: none;

  .timer-center__icon,
  strong {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .timer-center__icon {
    top: calc(50% - 64px);
    display: grid;
    place-items: center;
    color: var(--color-accent);
  }

  strong {
    top: 50%;
    width: auto;
    min-width: 5.25ch;
    max-width: 100%;
    font-family: 'Space Grotesk', var(--font-sans);
    font-size: clamp(2.8rem, 8vw, 4.8rem);
    font-weight: var(--weight-bold);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.055em;
    line-height: 0.82;
    text-align: center;
    white-space: nowrap;
    transform: translate(-50%, -50%);
  }

  span {
    position: absolute;
    top: calc(50% + 40px);
    left: 50%;
    transform: translateX(-50%);
    max-width: 100%;
    overflow: hidden;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    line-height: 1;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.timer-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  max-width: 360px;
}

.mode-body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  width: 100%;
}

.preset-seg {
  @include nest-shell(var(--radius-md), var(--space-1));
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
  min-height: 0;
  border: var(--ui-border);
  background: var(--color-surface-1);
  box-shadow: var(--shadow-xs);
}

.preset-chip {
  @include nest-item;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-3);
  flex: 1 1 0;
  width: 100%;
  min-height: 64px;
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 1px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(.active) {
      background: color-mix(in srgb, var(--color-accent) 8%, transparent);
      color: var(--color-text-primary);
    }
  }

  &.active {
    background: var(--color-accent);
    color: var(--color-bg);

    .preset-chip__icon,
    .preset-chip__copy em,
    .preset-chip__value {
      color: inherit;
    }

    .preset-chip__copy em {
      opacity: 0.85;
    }
  }
}

.preset-chip__icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
  color: var(--color-accent);
}

.preset-chip.active .preset-chip__icon {
  background: color-mix(in srgb, var(--color-bg) 18%, transparent);
}

.preset-chip__copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.preset-chip__label {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  line-height: 1.2;
}

.preset-chip__copy em {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-style: normal;
  font-weight: var(--weight-medium);
}

.preset-chip__value {
  font-family: 'Space Grotesk', var(--font-sans);
  font-size: clamp(1.6rem, 2.4vw, 2.1rem);
  font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--color-text-primary);
}

.today-body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: 0;
  width: 100%;
}

.today-stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;

  strong {
    color: var(--color-text-primary);
    font-family: 'Space Grotesk', var(--font-sans);
    font-size: clamp(2.4rem, 4vw, 3.2rem);
    font-weight: var(--weight-bold);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.05em;
    line-height: 0.95;
  }

  span {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
}

.today-progress {
  display: grid;
  gap: var(--space-2);
  margin-top: auto;
}

.today-progress__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
}

.today-progress__track {
  height: 8px;
  overflow: hidden;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
}

.today-progress__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-accent);
  transition: width var(--transition-standard);
}

.today-tip {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
}

@keyframes focus-tick-in {
  from {
    opacity: 0;
    stroke-dashoffset: 14;
  }

  to {
    opacity: 0.7;
    stroke-dashoffset: 0;
  }
}

@keyframes focus-value-in {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ring-ticks line,
  .timer-center {
    animation: none;
    opacity: 1;
    transform: none;
    stroke-dashoffset: 0;
  }
}

@media (max-width: 1100px) {
  .focus-grid {
    gap: var(--space-3);
    grid-template-columns: repeat(6, minmax(0, 1fr));

    :deep(.widget-shell.span-8) {
      grid-column: span 6;
      --tile-h: auto;
      min-height: 420px;
      height: auto;
    }
  }

  .focus-side {
    grid-column: span 6;
    grid-template-rows: auto auto;
    min-height: 0;
    height: auto;
  }
}

@include mobile {
  .focus-page {
    gap: var(--space-3);
  }

  .focus-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);

    :deep(.widget-shell.span-8) {
      grid-column: span 1;
      --tile-h: auto;
      min-height: 0;
      height: auto;
    }
  }

  .focus-side {
    grid-column: span 1;
    grid-template-rows: auto auto;
    gap: var(--space-3);
    min-height: 0;
    height: auto;
    order: 1;
  }

  .focus-grid :deep(.widget-shell.span-8) {
    order: 0;
  }

  .preset-chip {
    min-height: 56px;
    flex: 0 0 auto;
  }

  .timer-stage {
    width: min(100%, 300px);
  }

  .timer-center {
    width: min(76%, 240px);

    .timer-center__icon {
      top: calc(50% - 54px);
    }

    strong {
      font-size: clamp(2.6rem, 14vw, 3.8rem);
    }

    span {
      top: calc(50% + 34px);
      font-size: var(--text-xs);
    }
  }

  .timer-actions {
    max-width: none;

    :deep(.app-button) {
      flex: 1 1 140px;
      min-height: 44px;
    }
  }

  .timer-body {
    gap: var(--space-4);
  }
}

@include narrow {
  .focus-page,
  .focus-grid,
  .focus-side {
    gap: var(--space-2);
  }
}
</style>
