<template>
  <section class="focus-page" aria-label="Фокус">
    <header class="focus-head">
      <div>
        <span class="eyebrow">Deep work</span>
        <h3>Фокус</h3>
      </div>
      <div class="focus-mode">
        <Timer :size="18" />
        <span>{{ activePreset.label }}</span>
      </div>
    </header>

    <div class="focus-shell">
      <article class="timer-card">
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
            <Target :size="24" />
            <strong>{{ formattedTime }}</strong>
            <span>{{ isRunning ? 'идет сессия' : 'готов к старту' }}</span>
          </div>
        </div>

        <div class="timer-actions">
          <AppButton type="button" variant="primary" @click="toggleTimer">
            <Pause v-if="isRunning" :size="16" />
            <Play v-else :size="16" />
            {{ isRunning ? 'Пауза' : 'Старт' }}
          </AppButton>
          <AppButton type="button" variant="secondary" @click="resetTimer">
            <RotateCcw :size="16" />
            Сброс
          </AppButton>
        </div>
      </article>

      <aside class="focus-side">
        <div class="focus-panel">
          <div class="panel-title">
            <span>Режим</span>
            <strong>{{ activePreset.minutes }} мин</strong>
          </div>
          <div class="preset-grid">
            <button
              v-for="preset in presets"
              :key="preset.key"
              type="button"
              :class="{ active: activePreset.key === preset.key }"
              @click="setPreset(preset.key)"
            >
              <component :is="preset.icon" :size="16" />
              <span>{{ preset.label }}</span>
            </button>
          </div>
        </div>

        <Transition name="focus-stat">
          <div v-if="!isRunning" class="focus-panel focus-panel--counter">
            <div class="panel-title">
              <span>Сегодня</span>
              <strong>{{ completedSessions }}</strong>
            </div>
            <div class="session-counter" aria-label="Фокус-сессии сегодня">
              <strong>{{ completedSessions }}</strong>
              <span>{{ sessionLabel }}</span>
            </div>
            <p>Счетчик сохраняется для текущего дня и возвращается после паузы или завершения.</p>
          </div>
        </Transition>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  Coffee,
  Pause,
  Play,
  RotateCcw,
  Target,
  Timer,
} from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import { useNotification } from '~/composables/useNotification'

type PresetKey = 'focus' | 'short' | 'long'

const { addNotification } = useNotification()

const presets = [
  { key: 'focus' as const, label: 'Фокус', minutes: 25, icon: Target },
  { key: 'short' as const, label: 'Пауза', minutes: 5, icon: Coffee },
  { key: 'long' as const, label: 'Отдых', minutes: 15, icon: Timer },
]

const activePresetKey = ref<PresetKey>('focus')
const remainingSeconds = ref(presets[0].minutes * 60)
const isRunning = ref(false)
const completedSessions = ref(0)
let intervalId: ReturnType<typeof window.setInterval> | null = null

const activePreset = computed(() =>
  presets.find((preset) => preset.key === activePresetKey.value) ?? presets[0]
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
const sessionLabel = computed(() => {
  const count = completedSessions.value
  if (count % 10 === 1 && count % 100 !== 11) return 'сессия'
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'сессии'
  return 'сессий'
})

function setPreset(key: PresetKey) {
  activePresetKey.value = key
  stopTimer()
  remainingSeconds.value = activePreset.value.minutes * 60
}

function toggleTimer() {
  if (isRunning.value) {
    stopTimer()
    return
  }

  if (remainingSeconds.value <= 0) {
    remainingSeconds.value = totalSeconds.value
  }

  isRunning.value = true
  intervalId = window.setInterval(tick, 1000)
}

function tick() {
  if (remainingSeconds.value > 1) {
    remainingSeconds.value -= 1
    return
  }

  remainingSeconds.value = 0
  stopTimer()
  completedSessions.value += 1
  persistSessions()
  addNotification({
    type: 'success',
    message: `${activePreset.value.label} завершен`,
  })
}

function resetTimer() {
  stopTimer()
  remainingSeconds.value = totalSeconds.value
}

function stopTimer() {
  isRunning.value = false
  if (intervalId) {
    window.clearInterval(intervalId)
    intervalId = null
  }
}

function loadSessions() {
  const value = window.localStorage.getItem(storageKey.value)
  const parsed = value ? Number(value) : 0
  completedSessions.value = Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function persistSessions() {
  window.localStorage.setItem(storageKey.value, String(completedSessions.value))
}

onMounted(loadSessions)
onBeforeUnmount(stopTimer)
</script>

<style scoped lang="scss">
.focus-page {
  display: grid;
  gap: 14px;
  width: 100%;
  min-width: 0;
}

.focus-head,
.timer-card,
.focus-panel {
  @include glass;
  border: var(--ui-border);
}

.focus-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: var(--border-radius-lg);

  h3 {
    margin: 4px 0 0;
    overflow: hidden;
    color: var(--text);
    font-size: 1.28rem;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;

    @include mobile {
      font-size: 1.08rem;
    }
  }

  @include mobile {
    align-items: center;
    flex-direction: row;
    padding: 14px;
  }
}

.focus-head > div:first-child {
  min-width: 0;
}

.eyebrow {
  color: var(--dim);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;

  @include mobile {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.focus-mode {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--text) 8%, transparent);
  color: var(--text);
  font-size: 0.86rem;
  font-weight: 700;
  white-space: nowrap;

  @include mobile {
    flex: 0 0 auto;
    min-height: 34px;
    padding: 0 10px;
    font-size: 0.82rem;
  }
}

.focus-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  gap: 14px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.timer-card {
  display: grid;
  gap: 22px;
  justify-items: center;
  min-height: 520px;
  padding: 28px;
  border-radius: var(--border-radius-lg);

  @include mobile {
    min-height: 0;
    padding: 22px 16px;
  }
}

.timer-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: min(420px, 100%);
  aspect-ratio: 1;
}

.timer-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-ticks line {
  stroke: color-mix(in srgb, var(--text) 16%, transparent);
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
    stroke: var(--text);
    opacity: 1;
  }
}

.timer-stage.running .ring-ticks line.active {
  stroke: var(--accent);
}

.timer-center {
  position: absolute;
  display: grid;
  justify-items: center;
  gap: 8px;
  color: var(--text);
  opacity: 0;
  transform: scale(0.97);
  animation: focus-value-in 460ms cubic-bezier(0.16, 1, 0.3, 1) 520ms both;

  strong {
    min-width: 5ch;
    font-size: clamp(3.2rem, 11vw, 5.8rem);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    text-align: center;
  }

  span {
    color: var(--dim);
    font-size: 0.86rem;
    font-weight: 700;
  }
}

.timer-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;

  @include mobile {
    width: 100%;

    :deep(.app-button) {
      flex: 1 1 140px;
      min-height: 44px;
    }
  }
}

.focus-side {
  display: grid;
  gap: 14px;
  align-content: start;
}

.focus-panel {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: var(--border-radius-lg);
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  span {
    color: var(--dim);
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  strong {
    color: var(--text);
    font-size: 0.92rem;
  }
}

.preset-grid {
  display: grid;
  gap: 8px;

  button {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 0 12px;
    border: none;
    border-radius: var(--border-radius-pill);
    background: transparent;
    color: var(--dim);
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &:hover {
      background: color-mix(in srgb, var(--accent) 7%, transparent);
      color: var(--text);
    }

    &.active {
      background: var(--accent);
      color: var(--bg);
    }
  }
}

.focus-panel--counter {
  overflow: hidden;
}

.session-counter {
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: var(--text);

  strong {
    font-size: clamp(2.4rem, 7vw, 4.1rem);
    line-height: 0.92;
  }

  span {
    color: var(--dim);
    font-size: 0.9rem;
    font-weight: 700;
  }
}

.focus-panel p {
  margin: 0;
  color: var(--dim);
  font-size: 0.84rem;
  line-height: 1.45;
}

.focus-stat-enter-active,
.focus-stat-leave-active {
  transition:
    opacity var(--transition-standard),
    transform var(--transition-standard);
}

.focus-stat-enter-from,
.focus-stat-leave-to {
  opacity: 0;
  transform: translateY(8px);
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
</style>
