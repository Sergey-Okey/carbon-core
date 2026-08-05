<template>
  <div class="heatmap">
    <div v-if="empty || !cells.length" class="heatmap__empty">
      <p>{{ emptyTitle }}</p>
      <span>{{ emptyHint }}</span>
    </div>
    <template v-else>
      <div
        class="heatmap__grid"
        role="img"
        aria-label="Тепловая карта активности за 30 дней"
      >
        <button
          v-for="(cell, index) in cells"
          :key="cell.key"
          type="button"
          class="cell"
          :class="[
            `level-${cell.level}`,
            {
              placeholder: cell.placeholder,
              today: cell.isToday,
              hot: active === cell.key,
              dim: Boolean(active) && active !== cell.key && !cell.placeholder,
            },
          ]"
          :style="{ '--i': index }"
          :disabled="cell.placeholder"
          :aria-label="
            cell.placeholder ? undefined : `${cell.label}: ${cell.count} выполнений`
          "
          @pointerenter="onEnter(cell)"
          @pointerleave="active = null"
          @focus="onEnter(cell)"
          @blur="active = null"
        >
          <span v-if="active === cell.key && !cell.placeholder" class="cell__value">
            {{ cell.count }}
          </span>
        </button>
      </div>

      <div class="heatmap__foot">
        <span class="heatmap__hint">
          <template v-if="activeCell">
            <strong>{{ activeCell.count }}</strong>
            · {{ activeCell.label }}
          </template>
          <template v-else>
            <strong>{{ activeDays }}</strong> активных дней из 30
          </template>
        </span>
        <div class="heatmap__scale" aria-hidden="true">
          <span>меньше</span>
          <span class="cell level-0" />
          <span class="cell level-1" />
          <span class="cell level-2" />
          <span class="cell level-3" />
          <span class="cell level-4" />
          <span>больше</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ActivityDayPoint } from '~/composables/useAnalyticsMetrics'

const props = withDefaults(
  defineProps<{
    days: ActivityDayPoint[]
    empty?: boolean
    emptyTitle?: string
    emptyHint?: string
  }>(),
  {
    empty: false,
    emptyTitle: 'Нет данных',
    emptyHint: 'Отмечайте задачи — здесь появится карта активности',
  }
)

const active = ref<string | null>(null)

const activeDays = computed(() => props.days.filter((day) => day.count > 0).length)

const activeCell = computed(() =>
  cells.value.find((cell) => cell.key === active.value && !cell.placeholder) ?? null
)

function weekdayIndex(dateKey: string) {
  const day = new Date(`${dateKey}T00:00:00`).getDay()
  return (day + 6) % 7
}


function levelForCount(count: number) {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

type HeatCell = {
  key: string
  placeholder: boolean
  level: number
  isToday: boolean
  label: string
  count: number
}

const cells = computed<HeatCell[]>(() => {
  if (!props.days.length) return []
  const leading = weekdayIndex(props.days[0].date)
  const placeholders: HeatCell[] = Array.from({ length: leading }, (_, i) => ({
    key: `pad-${i}`,
    placeholder: true,
    level: 0,
    isToday: false,
    label: '',
    count: 0,
  }))
  const real = props.days.map((day) => ({
    key: day.date,
    placeholder: false,
    level: levelForCount(day.count),
    isToday: day.isToday,
    label: day.label,
    count: day.count,
  }))
  return [...placeholders, ...real]
})

function onEnter(cell: HeatCell) {
  if (cell.placeholder) return
  active.value = cell.key
}
</script>

<style scoped lang="scss">
.heatmap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-3);
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.heatmap__empty {
  display: grid;
  place-content: center;
  gap: var(--space-1);
  flex: 1;
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

.heatmap__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-auto-flow: row;
  gap: 4px;
  flex: 1 1 auto;
  min-height: 0;
  align-content: center;
}

.cell {
  position: relative;
  aspect-ratio: 1;
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: color-mix(in srgb, var(--color-text-primary) 7%, transparent);
  color: var(--color-text-inverse);
  cursor: default;
  animation: heat-cell-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i, 0) * 12ms);
  transition:
    transform var(--transition-standard),
    background var(--transition-standard),
    opacity var(--transition-standard),
    outline-color var(--transition-standard);

  &.placeholder {
    background: transparent;
    animation: none;
    pointer-events: none;
  }

  &:not(.placeholder) {
    cursor: pointer;
  }

  &.today {
    outline: 1px solid color-mix(in srgb, var(--color-text-primary) 35%, transparent);
    outline-offset: 1px;
  }

  &.dim {
    opacity: 0.35;
  }

  &.hot {
    transform: scale(1.14);
    outline: 2px solid color-mix(in srgb, var(--accent) 70%, transparent);
    outline-offset: 1px;
    z-index: 1;
  }

  &.level-1 {
    background: color-mix(in srgb, var(--accent) 22%, transparent);
  }

  &.level-2 {
    background: color-mix(in srgb, var(--accent) 48%, transparent);
  }

  &.level-3 {
    background: color-mix(in srgb, var(--accent) 74%, var(--color-text-primary) 8%);
  }

  &.level-4 {
    background: var(--accent);
  }
}

.cell__value {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: clamp(0.55rem, 1.6vw, 0.72rem);
  font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  text-shadow: 0 1px 2px color-mix(in srgb, var(--color-bg) 55%, transparent);
}

.heatmap__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.heatmap__hint {
  color: var(--color-text-secondary);
  font-size: var(--text-xs);

  strong {
    color: var(--color-text-primary);
    font-weight: var(--weight-semibold);
    font-variant-numeric: tabular-nums;
  }
}

.heatmap__scale {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--color-text-muted);
  font-size: 0.62rem;

  .cell {
    width: 10px;
    height: 10px;
    animation: none;
    cursor: default;
  }
}

@keyframes heat-cell-in {
  from {
    opacity: 0;
    transform: scale(0.55);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 767px) {
  .heatmap__grid {
    gap: 3px;
  }

  .cell__value {
    font-size: var(--text-xs);
  }

  .heatmap__foot {
    flex-direction: column;
    align-items: flex-start;
  }

  .heatmap__hint,
  .heatmap__scale {
    font-size: var(--text-xs);
  }
}

@media (max-width: 420px) {
  .cell__value {
    display: none;
  }

  .heatmap__scale span:first-child,
  .heatmap__scale span:last-child {
    font-size: 0.7rem;
  }
}
</style>
