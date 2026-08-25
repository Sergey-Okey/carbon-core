<template>
  <div class="hero">
    <div v-if="empty" class="hero__empty">
      <p>{{ emptyTitle }}</p>
      <span>{{ emptyHint }}</span>
    </div>
    <template v-else>
      <div class="hero__value">
        <strong>{{ value }}</strong>
        <span>{{ unit }}</span>
      </div>

      <div
        class="hero__ticks"
        role="img"
        :aria-label="`Прогресс ${clamped}%`"
      >
        <span
          v-for="n in ticks"
          :key="n"
          class="tick"
          :class="{ on: n <= activeTicks, hot: hoverTick === n }"
          @pointerenter="hoverTick = n"
          @pointerleave="hoverTick = null"
        />
      </div>

      <p class="hero__detail">{{ hoverDetail }}</p>

      <div v-if="metrics.length" class="hero__metrics">
        <span
          v-for="metric in metrics"
          :key="metric.key"
          class="metric-chip"
          :class="{ hot: hoverMetric === metric.key }"
          @pointerenter="hoverMetric = metric.key"
          @pointerleave="hoverMetric = null"
        >
          <component :is="metric.icon" v-if="metric.icon" :size="12" aria-hidden="true" />
          <strong>{{ metric.value }}</strong>
          {{ metric.label }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
export type HeroMetric = {
  key: string
  label: string
  value: string | number
  icon?: Component
}

const props = withDefaults(
  defineProps<{
    value: string | number
    unit?: string
    progress?: number
    metrics?: HeroMetric[]
    ticks?: number
    empty?: boolean
    emptyTitle?: string
    emptyHint?: string
  }>(),
  {
    unit: '',
    progress: 0,
    metrics: () => [],
    ticks: 24,
    empty: false,
    emptyTitle: 'Нет данных',
    emptyHint: 'Прогресс появится здесь',
  }
)

const hoverTick = ref<number | null>(null)
const hoverMetric = ref<string | null>(null)
const clamped = computed(() => Math.min(100, Math.max(0, props.progress)))
const activeTicks = computed(() => Math.round((clamped.value / 100) * props.ticks))

const hoverDetail = computed(() => {
  if (hoverTick.value != null) {
    const filled = hoverTick.value <= activeTicks.value
    return filled
      ? `Сегмент ${hoverTick.value} из ${props.ticks} · в прогрессе (${clamped.value}%)`
      : `Сегмент ${hoverTick.value} из ${props.ticks} · ещё не заполнен`
  }
  const metric = props.metrics.find((item) => item.key === hoverMetric.value)
  if (metric) return `${metric.label}: ${metric.value}`
  return `Сегодня ${props.value} ${props.unit} · ${clamped.value}%`.trim()
})
</script>

<style scoped lang="scss">
.hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-3);
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.hero__empty {
  display: grid;
  place-content: center;
  gap: var(--space-1);
  flex: 1;
  text-align: center;

  p {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
  }

  span {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
  }
}

.hero__value {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);

  strong {
    color: var(--color-text-primary);
    font-size: clamp(var(--text-3xl), 4vw, var(--text-4xl));
    font-weight: var(--weight-bold);
    line-height: 1;
    letter-spacing: -0.04em;
    font-variant-numeric: tabular-nums;
  }

  span {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
}

.hero__ticks {
  display: flex;
  align-items: stretch;
  gap: var(--space-1);
  height: 22px;
}

.tick {
  flex: 1 1 0;
  min-width: 2px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--color-text-primary) 10%, transparent);
  cursor: pointer;
  transition:
    background 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease;

  &.on {
    background: var(--accent);
  }

  &.hot {
    transform: scaleY(1.35) scaleX(1.08);
    background: color-mix(in srgb, var(--accent) 82%, var(--color-text-inverse) 18%);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent);
  }
}

.hero__detail {
  margin: 0;
  min-height: 1.2em;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

.hero__metrics {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1) var(--space-3);
  margin-top: auto;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  cursor: default;
  transition: color 160ms ease;

  strong {
    color: var(--color-text-primary);
    font-weight: var(--weight-semibold);
    font-variant-numeric: tabular-nums;
    transition: color 160ms ease;
  }

  &.hot {
    color: var(--color-text-secondary);

    strong {
      color: var(--accent);
    }
  }
}

@media (max-width: 767px) {
  .hero__value strong {
    font-size: clamp(var(--text-2xl), 8vw, var(--text-4xl));
  }

  .hero__ticks {
    height: 18px;
    gap: 2px;
  }

  .hero__detail,
  .metric-chip {
    font-size: var(--text-xs);
  }
}

@media (max-width: 420px) {
  .tick:nth-child(2n) {
    display: none;
  }

  .hero__metrics {
    gap: var(--space-1) var(--space-2);
  }
}
</style>
