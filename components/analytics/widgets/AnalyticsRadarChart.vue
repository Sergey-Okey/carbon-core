<template>
  <div class="radar">
    <div v-if="empty || !items.length" class="radar__empty">
      <p>{{ emptyTitle }}</p>
      <span>{{ emptyHint }}</span>
    </div>
    <template v-else>
      <svg class="radar__svg" viewBox="0 0 280 280" role="img" :aria-label="ariaLabel">
        <polygon
          v-for="(grid, index) in grids"
          :key="`g-${index}`"
          class="radar__grid"
          :points="grid"
        />
        <line
          v-for="axis in axes"
          :key="axis.key"
          class="radar__axis"
          x1="140"
          y1="140"
          :x2="axis.x"
          :y2="axis.y"
        />
        <polygon class="radar__fill" :points="polygon" />
        <polyline class="radar__stroke" :points="polygon" />
        <g
          v-for="point in points"
          :key="point.key"
          @pointerenter="active = point.key"
          @pointerleave="active = null"
        >
          <circle
            class="radar__dot"
            :class="{ hot: active === point.key }"
            :cx="point.x"
            :cy="point.y"
            r="4"
          />
        </g>
        <text
          v-for="label in labels"
          :key="label.key"
          class="radar__label"
          :class="{ hot: active === label.key }"
          :x="label.x"
          :y="label.y"
          text-anchor="middle"
          dominant-baseline="middle"
          @pointerenter="active = label.key"
          @pointerleave="active = null"
        >
          {{ label.text }}
        </text>
        <g v-if="activePoint" class="radar__tooltip">
          <rect
            :x="activePoint.x - 18"
            :y="activePoint.y - 26"
            width="36"
            height="18"
            rx="5"
          />
          <text :x="activePoint.x" :y="activePoint.y - 13" text-anchor="middle">
            {{ activePoint.value }}%
          </text>
        </g>
      </svg>
      <p class="radar__avg">Среднее: {{ average }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
export type RadarItem = {
  key: string
  label: string
  value: number
}

const props = withDefaults(
  defineProps<{
    items: RadarItem[]
    empty?: boolean
    emptyTitle?: string
    emptyHint?: string
    ariaLabel?: string
  }>(),
  {
    empty: false,
    emptyTitle: 'Мало данных',
    emptyHint: 'Баланс появится после активности',
    ariaLabel: 'Радар метрик',
  }
)

const active = ref<string | null>(null)
const cx = 140
const cy = 140
const maxR = 102

function polar(index: number, total: number, r: number) {
  const angle = (360 / total) * index - 90
  const rad = (angle * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const average = computed(() => {
  if (!props.items.length) return 0
  return Math.round(
    props.items.reduce((sum, item) => sum + item.value, 0) / props.items.length
  )
})

const grids = computed(() =>
  [0.25, 0.5, 0.75, 1].map((ratio) => {
    const n = props.items.length || 5
    return Array.from({ length: n }, (_, i) => {
      const p = polar(i, n, maxR * ratio)
      return `${p.x},${p.y}`
    }).join(' ')
  })
)

const axes = computed(() => {
  const n = props.items.length || 5
  return props.items.map((item, index) => {
    const p = polar(index, n, maxR)
    return { key: item.key, x: p.x, y: p.y }
  })
})

const points = computed(() => {
  const n = props.items.length || 5
  return props.items.map((item, index) => {
    const r = (Math.min(100, Math.max(0, item.value)) / 100) * maxR
    const p = polar(index, n, r)
    return { key: item.key, x: p.x, y: p.y, value: item.value }
  })
})

const polygon = computed(() => points.value.map((p) => `${p.x},${p.y}`).join(' '))

const activePoint = computed(() => points.value.find((p) => p.key === active.value) ?? null)

const labels = computed(() => {
  const n = props.items.length || 5
  return props.items.map((item, index) => {
    const p = polar(index, n, maxR + 22)
    return { key: item.key, text: item.label, x: p.x, y: p.y }
  })
})
</script>

<style scoped lang="scss">
.radar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.radar__empty {
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

.radar__svg {
  width: min(100%, 340px);
  max-height: 100%;
  height: 100%;
  overflow: visible;
  flex: 1 1 auto;
}

.radar__grid {
  fill: none;
  stroke: color-mix(in srgb, var(--color-text-primary) 10%, transparent);
  stroke-width: 1;
}

.radar__axis {
  stroke: color-mix(in srgb, var(--color-text-primary) 12%, transparent);
  stroke-width: 1;
}

.radar__fill {
  fill: color-mix(in srgb, var(--accent) 16%, transparent);
  opacity: 0;
  animation: radar-fill-in 0.7s ease 0.25s both;
}

.radar__stroke {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-dasharray: 800;
  stroke-dashoffset: 800;
  animation: radar-draw 0.9s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes radar-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes radar-fill-in {
  to {
    opacity: 1;
  }
}

.radar__dot {
  fill: var(--accent);
  stroke: var(--color-surface-1);
  stroke-width: 2;
  transition: r var(--transition-standard);

  &.hot {
    r: 5.5;
  }
}

.radar__label {
  fill: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: fill var(--transition-standard);

  &.hot {
    fill: var(--accent);
  }
}

.radar__tooltip {
  pointer-events: none;

  rect {
    fill: var(--color-surface-1);
    stroke: color-mix(in srgb, var(--color-text-primary) 12%, transparent);
    stroke-width: 1;
  }

  text {
    fill: var(--accent);
    font-size: var(--text-2xs);
    font-weight: 700;
    text-anchor: middle;
    font-variant-numeric: tabular-nums;
  }
}

.radar__avg {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 767px) {
  .radar__svg {
    max-width: 260px;
  }

  .radar__label {
    font-size: var(--text-xs);
  }

  .radar__avg {
    font-size: var(--text-xs);
  }
}

@media (max-width: 420px) {
  .radar__svg {
    max-width: 220px;
  }

  .radar__label {
    font-size: var(--text-2xs);
  }
}
</style>
