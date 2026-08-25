<template>
  <div class="bar-chart">
    <div class="bar-chart__controls">
      <div class="period" role="group" aria-label="Период">
        <button
          v-for="option in periodOptions"
          :key="option.days"
          type="button"
          class="period__btn"
          :class="{ active: modelValue === option.days }"
          @click="$emit('update:modelValue', option.days)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="!series.length || empty" class="bar-chart__empty">
      <p>Нет выполнений за период</p>
      <span>Закройте задачи — динамика появится здесь</span>
    </div>

    <div
      v-else
      ref="frame"
      class="bar-chart__frame"
      @pointerleave="hoverIndex = -1"
    >
      <div class="bar-chart__plot">
        <div class="bar-chart__grid" aria-hidden="true">
          <span
            v-for="tick in yTicks"
            :key="tick.key"
            class="grid-line"
            :style="{ bottom: `${tick.pct}%` }"
          />
        </div>

        <div
          class="bar-chart__bars"
          role="img"
          :aria-label="`Столбчатый график выполнений за ${modelValue} дней`"
        >
          <button
            v-for="(bar, index) in bars"
            :key="bar.key"
            type="button"
            class="bar"
            :class="{ hot: hoverIndex === index, muted: hoverIndex >= 0 && hoverIndex !== index }"
            :style="{ '--h': `${bar.height}%`, '--i': index }"
            :aria-label="`${bar.label}: ${bar.count}`"
            @pointerenter="hoverIndex = index"
            @focus="hoverIndex = index"
            @blur="hoverIndex = -1"
          >
            <span class="bar__track">
              <span class="bar__fill" />
            </span>
          </button>
        </div>

        <div class="bar-chart__y" aria-hidden="true">
          <span
            v-for="tick in yTicks"
            :key="`y-${tick.key}`"
            :style="{ bottom: `${tick.pct}%` }"
          >
            {{ tick.label }}
          </span>
        </div>
      </div>

      <div
        v-if="hoverBar"
        class="tooltip"
        :style="tooltipStyle"
      >
        <strong>{{ hoverBar.count }}</strong>
        <span>{{ hoverBar.label }}</span>
      </div>

      <div class="bar-chart__x">
        <span
          v-for="tick in xTicks"
          :key="tick.key"
          :style="{ left: tick.left }"
        >
          {{ tick.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityDayPoint, AnalyticsRangeDays } from '~/composables/useAnalyticsMetrics'

const props = defineProps<{
  series: ActivityDayPoint[]
  modelValue: AnalyticsRangeDays
  empty?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: AnalyticsRangeDays]
}>()

const periodOptions = [
  { days: 7 as const, label: '7д' },
  { days: 14 as const, label: '14д' },
  { days: 30 as const, label: '30д' },
]

const frame = ref<HTMLElement | null>(null)
const hoverIndex = ref(-1)

const maxCount = computed(() => Math.max(...props.series.map((day) => day.count), 1))

const bars = computed(() =>
  props.series.map((day) => ({
    key: day.date,
    label: day.label,
    shortLabel: day.shortLabel,
    count: day.count,
    height: Math.max(day.count > 0 ? 4 : 0, (day.count / maxCount.value) * 100),
    isToday: day.isToday,
  }))
)

const yTicks = computed(() => {
  const max = maxCount.value
  const steps = max <= 4 ? max : 4
  return Array.from({ length: steps + 1 }, (_, index) => {
    const value = Math.round((max * (steps - index)) / steps)
    return {
      key: `t-${index}`,
      label: String(value),
      pct: steps ? ((steps - index) / steps) * 100 : 0,
    }
  })
})

const xTicks = computed(() => {
  const list = bars.value
  if (!list.length) return []
  if (list.length <= 8) {
    return list.map((bar, index) => ({
      key: bar.key,
      label: bar.shortLabel,
      left: `${((index + 0.5) / list.length) * 100}%`,
    }))
  }
  const indexes = [0, Math.floor(list.length / 2), list.length - 1]
  return indexes.map((index) => ({
    key: list[index].key,
    label: list[index].shortLabel,
    left: `${((index + 0.5) / list.length) * 100}%`,
  }))
})

const hoverBar = computed(() => {
  if (hoverIndex.value < 0) return null
  return bars.value[hoverIndex.value] ?? null
})

const tooltipStyle = computed(() => {
  if (!hoverBar.value || !bars.value.length) return {}
  const left = ((hoverIndex.value + 0.5) / bars.value.length) * 100
  return {
    left: `clamp(48px, ${left}%, calc(100% - 48px))`,
  }
})
</script>

<style scoped lang="scss">
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
  min-height: 0;
}

.bar-chart__controls {
  display: flex;
  justify-content: flex-end;
}

.period {
  --nest-radius: var(--radius-full);
  --nest-pad: 3px;
  display: inline-flex;
  gap: var(--space-1);
  padding: var(--nest-pad);
  border-radius: var(--nest-radius);
  background: color-mix(in srgb, var(--color-bg) 65%, transparent);
}

.period__btn {
  @include nest-item;
  min-height: var(--space-7);
  padding: 0 var(--space-3);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font: inherit;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &.active {
    background: var(--accent);
    color: var(--color-text-inverse);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(.active) {
      color: var(--accent);
    }
  }
}

.bar-chart__empty {
  display: grid;
  place-content: center;
  gap: var(--space-1);
  flex: 1;
  min-height: 0;
  text-align: center;

  p {
    margin: 0;
    color: var(--color-text-primary);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
  }

  span {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
  }
}

.bar-chart__frame {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: var(--space-2);
}

.bar-chart__plot {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 36px;
  flex: 1;
  min-height: 0;
}

.bar-chart__grid {
  position: absolute;
  inset: 0 36px 0 0;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px solid color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  transform: translateY(50%);
}

.bar-chart__bars {
  position: relative;
  z-index: 1;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  align-items: end;
  gap: var(--space-2);
  min-height: 0;
  height: 100%;
  padding-inline: var(--space-1);
}

.bar {
  position: relative;
  display: flex;
  align-items: end;
  justify-content: center;
  height: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--accent) 45%, transparent);
    outline-offset: 1px;
  }
}

.bar__track {
  display: flex;
  align-items: end;
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
  overflow: hidden;
  transition: opacity var(--transition-standard);
}

.bar__fill {
  display: block;
  width: 100%;
  height: var(--h, 0%);
  min-height: 0;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: color-mix(in srgb, var(--accent) 55%, transparent);
  transform-origin: bottom center;
  animation: bar-rise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i, 0) * 18ms);
  transition:
    height 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    background var(--transition-standard);
}

.bar.muted .bar__track {
  opacity: 0.35;
}

.bar.hot .bar__fill {
  background: var(--accent);
}

.bar-chart__y {
  position: relative;
  height: 100%;
  color: var(--color-text-muted);
  font-size: var(--text-2xs);
  font-weight: var(--weight-medium);
  font-variant-numeric: tabular-nums;

  span {
    position: absolute;
    right: 0;
    transform: translateY(50%);
  }
}

.bar-chart__x {
  position: relative;
  height: 1.1em;
  margin-right: var(--space-9);
  color: var(--color-text-muted);
  font-size: var(--text-2xs);
  font-weight: var(--weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.04em;

  span {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    white-space: nowrap;
  }
}

.tooltip {
  position: absolute;
  top: 8px;
  z-index: 3;
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border: 1px solid color-mix(in srgb, var(--color-text-primary) 10%, transparent);
  border-radius: var(--radius-sm);
  background: var(--color-surface-1);
  box-shadow: var(--shadow-sm);
  transform: translateX(-50%);
  pointer-events: none;

  strong {
    color: var(--color-text-primary);
    font-size: var(--text-sm);
    font-weight: var(--weight-bold);
    font-variant-numeric: tabular-nums;
  }

  span {
    color: var(--color-text-muted);
    font-size: var(--text-2xs);
  }
}

@keyframes bar-rise {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

@media (max-width: 1100px) {
  .bar-chart__bars {
    gap: var(--space-1);
  }

  .bar-chart__y {
    font-size: var(--text-xs);
  }

  .bar-chart__x {
    font-size: var(--text-xs);
    text-transform: none;
    letter-spacing: 0;
  }
}

@media (max-width: 767px) {
  .bar-chart__plot {
    grid-template-columns: minmax(0, 1fr) 28px;
  }

  .bar-chart__grid {
    inset: 0 28px 0 0;
  }

  .bar-chart__x {
    margin-right: var(--space-7);
  }

  .bar-chart__bars {
    gap: var(--space-1);
  }

  .tooltip {
    top: 4px;
    padding: var(--space-1) var(--space-2);
  }
}

@media (max-width: 420px) {
  .bar-chart__controls {
    justify-content: stretch;
  }

  .period {
    width: 100%;
  }

  .period__btn {
    flex: 1 1 0;
  }

  .bar-chart__y span:nth-child(even) {
    display: none;
  }
}
</style>
