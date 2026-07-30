<template>
  <div class="hour-bars">
    <div v-if="empty || !items.length" class="hour-bars__empty">
      <p>{{ emptyTitle }}</p>
      <span>{{ emptyHint }}</span>
    </div>
    <template v-else>
      <div class="hour-bars__chart" role="img" :aria-label="ariaLabel">
        <div
          v-for="(item, index) in items"
          :key="item.key"
          class="bar"
          :class="{ hot: active === item.key }"
          :style="{ '--i': index }"
          @pointerenter="active = item.key"
          @pointerleave="active = null"
        >
          <span class="bar__value">{{ item.value }}</span>
          <span class="bar__track">
            <span class="bar__fill" :style="{ height: `${item.percent}%` }" />
          </span>
          <span class="bar__label">{{ item.label }}</span>
        </div>
      </div>
      <p class="hour-bars__hint">Пик активности: <strong>{{ topLabel }}</strong></p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export type HourBarItem = {
  key: string
  label: string
  value: number
  percent: number
}

const props = withDefaults(
  defineProps<{
    items: HourBarItem[]
    empty?: boolean
    emptyTitle?: string
    emptyHint?: string
    ariaLabel?: string
  }>(),
  {
    empty: false,
    emptyTitle: 'Нет данных',
    emptyHint: 'Отмечайте задачи — здесь появятся активные часы',
    ariaLabel: 'Столбчатая диаграмма активности по часам',
  }
)

const active = ref<string | null>(null)

const topLabel = computed(() => {
  if (!props.items.length) return '—'
  return [...props.items].sort((a, b) => b.value - a.value)[0].label
})
</script>

<style scoped lang="scss">
.hour-bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
  min-height: 0;
}

.hour-bars__empty {
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

.hour-bars__chart {
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  align-items: end;
  gap: var(--space-2);
  flex: 1;
  min-height: 0;
}

.bar {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  justify-items: center;
  gap: var(--space-1);
  height: 100%;
  min-width: 0;
  cursor: default;
}

.bar__value {
  color: var(--color-text-muted);
  font-size: 0.68rem;
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
  opacity: 0;
  transition: opacity var(--transition-standard);
}

.bar.hot .bar__value {
  opacity: 1;
  color: var(--color-text-primary);
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
}

.bar__fill {
  display: block;
  width: 100%;
  min-height: 4px;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: color-mix(in srgb, var(--accent) 55%, transparent);
  transform-origin: bottom center;
  transition:
    height 0.55s cubic-bezier(0.16, 1, 0.3, 1),
    background var(--transition-standard);
  animation: hour-bar-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i, 0) * 45ms);
}

@keyframes hour-bar-rise {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

.bar.hot .bar__fill {
  background: var(--accent);
}

.bar__label {
  color: var(--color-text-muted);
  font-size: 0.62rem;
  font-weight: var(--weight-medium);
  white-space: nowrap;
}

.hour-bars__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);

  strong {
    color: var(--color-text-primary);
    font-weight: var(--weight-semibold);
  }
}

@media (max-width: 767px) {
  .hour-bars__chart {
    gap: var(--space-1);
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 2px;
    grid-auto-columns: minmax(36px, 1fr);
  }

  .bar__value,
  .bar__label {
    font-size: var(--text-xs);
  }
}

@media (max-width: 420px) {
  .hour-bars__chart {
    grid-auto-columns: minmax(40px, 1fr);
  }
}
</style>
