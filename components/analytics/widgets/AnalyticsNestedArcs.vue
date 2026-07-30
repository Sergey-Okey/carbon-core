<template>
  <div class="nested-arcs">
    <div v-if="empty || !arcs.length" class="nested-arcs__empty">
      <p>Мало данных</p>
      <span>{{ emptyHint }}</span>
    </div>
    <template v-else>
      <div class="nested-arcs__chart" aria-hidden="true">
        <svg viewBox="0 0 200 120" class="nested-arcs__svg">
          <path
            v-for="arc in rendered"
            :key="`${arc.key}-track`"
            class="track"
            :d="arc.d"
            fill="none"
            :stroke-width="arc.stroke"
            stroke-linecap="round"
          />
          <path
            v-for="arc in rendered"
            :key="`${arc.key}-fill-${arc.revision}`"
            class="fill"
            :class="{ dim: active && active !== arc.key, reveal, hot: active === arc.key }"
            :d="arc.d"
            fill="none"
            :stroke="arc.color"
            :stroke-width="arc.stroke"
            stroke-linecap="round"
            :stroke-dasharray="arc.dashArray"
            :stroke-dashoffset="reveal ? arc.dashOffset : arc.dashArray"
            @pointerenter="active = arc.key"
            @pointerleave="active = null"
          />
        </svg>
        <div class="nested-arcs__score">
          <strong>{{ activeStat?.percent ?? score }}</strong>
          <span>%</span>
        </div>
      </div>

      <ul class="nested-arcs__legend">
        <li
          v-for="arc in arcs"
          :key="arc.key"
          :class="{ active: active === arc.key }"
          @pointerenter="active = arc.key"
          @pointerleave="active = null"
          @click="active = active === arc.key ? null : arc.key"
        >
          <span class="swatch" :style="{ background: arc.color || 'var(--accent)' }" />
          <div class="legend-copy">
            <strong>{{ arc.label }}</strong>
            <span>{{ arc.done }}/{{ arc.total }}</span>
          </div>
          <span class="legend-value">{{ arc.percent }}%</span>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

export type NestedArcItem = {
  key: string
  label: string
  percent: number
  done: number
  total: number
  color?: string
}

const props = withDefaults(
  defineProps<{
    arcs: NestedArcItem[]
    score?: number
    empty?: boolean
    emptyHint?: string
  }>(),
  {
    score: 0,
    empty: false,
    emptyHint: 'Добавьте данные для прогресса',
  }
)

const palette = [
  'var(--accent)',
  'color-mix(in srgb, var(--accent) 78%, var(--color-text-primary) 22%)',
  'color-mix(in srgb, var(--accent) 55%, var(--color-text-primary) 45%)',
  'color-mix(in srgb, var(--accent) 32%, var(--color-text-primary) 68%)',
]

const active = ref<string | null>(null)
const reveal = ref(false)
const revision = ref(0)

const activeStat = computed(() => props.arcs.find((arc) => arc.key === active.value) ?? null)

const arcsKeys = computed(() => props.arcs.map((arc) => arc.key).join('|'))

function kickReveal() {
  reveal.value = false
  revision.value += 1
  nextTick(() => {
    requestAnimationFrame(() => {
      reveal.value = true
    })
  })
}

onMounted(kickReveal)
watch(arcsKeys, () => {
  if (active.value && !props.arcs.some((arc) => arc.key === active.value)) {
    active.value = null
  }
  kickReveal()
})

function describeArc(cx: number, cy: number, r: number) {
  const start = polar(cx, cy, r, 180)
  const end = polar(cx, cy, r, 0)
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const rendered = computed(() => {
  const items = props.arcs.slice(0, 4)
  const baseR = 78
  const gap = 14
  const stroke = 11
  return items.map((item, index) => {
    const r = baseR - index * gap
    const length = Math.PI * r
    const pct = Math.min(100, Math.max(0, item.percent)) / 100
    return {
      key: item.key,
      revision: revision.value,
      d: describeArc(100, 100, r),
      stroke,
      color: item.color || palette[index % palette.length],
      dashArray: `${length}`,
      dashOffset: `${length * (1 - pct)}`,
    }
  })
})
</script>

<style scoped lang="scss">
.nested-arcs {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.nested-arcs__empty {
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

.nested-arcs__chart {
  position: relative;
  width: 100%;
  max-width: 300px;
  margin-inline: auto;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
}

.nested-arcs__svg {
  width: 100%;
  height: auto;
  max-height: 100%;
  overflow: visible;
}

.track {
  stroke: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
}

.fill {
  cursor: pointer;
  pointer-events: stroke;
  transition:
    stroke-dashoffset 0.85s cubic-bezier(0.16, 1, 0.3, 1),
    opacity var(--transition-standard),
    stroke-width var(--transition-standard);

  &.dim {
    opacity: 0.3;
  }

  &.hot {
    stroke-width: 13;
  }
}

.nested-arcs__score {
  position: absolute;
  left: 50%;
  bottom: 8px;
  display: flex;
  align-items: baseline;
  gap: 2px;
  transform: translateX(-50%);

  strong {
    color: var(--color-text-primary);
    font-size: clamp(1.6rem, 2.8vw, 2.1rem);
    font-weight: var(--weight-bold);
    line-height: 1;
    letter-spacing: -0.04em;
    font-variant-numeric: tabular-nums;
  }

  span {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
  }
}

.nested-arcs__legend {
  display: grid;
  gap: var(--space-1);
  margin: 0;
  padding: 0;
  list-style: none;
  flex: 0 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;

  li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background var(--transition-standard);

    &.active {
      background: color-mix(in srgb, var(--accent) 8%, transparent);
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background: color-mix(in srgb, var(--accent) 6%, transparent);
      }
    }
  }
}

.swatch {
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-copy {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
  min-width: 0;
  flex: 1 1 auto;

  strong {
    overflow: hidden;
    color: var(--color-text-secondary);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    flex: 0 0 auto;
    color: var(--color-text-muted);
    font-size: 0.68rem;
  }
}

.legend-value {
  flex: 0 0 auto;
  color: var(--color-text-primary);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 767px) {
  .nested-arcs {
    gap: var(--space-2);
  }

  .nested-arcs__chart {
    max-width: 240px;
  }

  .nested-arcs__score strong {
    font-size: clamp(1.35rem, 6vw, 1.8rem);
  }

  .legend-copy strong,
  .legend-value {
    font-size: var(--text-xs);
  }
}

@media (max-width: 420px) {
  .nested-arcs__legend li {
    padding: 2px var(--space-1);
  }
}
</style>
