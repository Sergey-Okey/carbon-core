<template>
  <div class="category-chart">
    <div v-if="empty || !items.length" class="category-chart__empty">
      <p>{{ emptyTitle }}</p>
      <span>{{ emptyHint }}</span>
    </div>
    <svg
      v-else
      class="category-chart__svg"
      viewBox="0 0 320 320"
      role="img"
      :aria-label="ariaLabel"
    >
      <g
        v-for="seg in segments"
        :key="seg.key"
        class="segment"
        :class="{ hot: active === seg.key, dim: active && active !== seg.key }"
        @pointerenter="active = seg.key"
        @pointerleave="active = null"
      >
        <path class="segment__track" :d="seg.trackPath" />
        <path class="segment__fill" :d="seg.fillPath" :fill="seg.color" />
        <text
          class="segment__value"
          :x="seg.labelX"
          :y="seg.labelY - 7"
          text-anchor="middle"
        >
          {{ seg.value }}
        </text>
        <text
          class="segment__name"
          :x="seg.labelX"
          :y="seg.labelY + 9"
          text-anchor="middle"
        >
          {{ seg.shortLabel }}
        </text>
      </g>
    </svg>
    <p class="category-chart__summary">
      <template v-if="activeSeg">
        <strong>{{ activeSeg.label }}</strong>
        · {{ activeSeg.value }} задач
      </template>
      <template v-else>
        <strong>{{ totalCount }}</strong>
        задач · {{ segments.length }} категорий
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
export type CategoryItem = {
  key: string
  label: string
  value: number
  color?: string
}

const props = withDefaults(
  defineProps<{
    items: CategoryItem[]
    empty?: boolean
    emptyTitle?: string
    emptyHint?: string
    ariaLabel?: string
  }>(),
  {
    empty: false,
    emptyTitle: 'Нет данных',
    emptyHint: 'Категории появятся здесь',
    ariaLabel: 'Диаграмма категорий',
  }
)

const active = ref<string | null>(null)
const cx = 160
const cy = 160
const innerR = 34
const outerR = 138
const gapDeg = 5
const cornerR = 16

const palette = [
  'color-mix(in srgb, var(--accent) 92%, var(--color-text-inverse) 8%)',
  'color-mix(in srgb, var(--accent) 72%, var(--color-text-primary) 28%)',
  'color-mix(in srgb, var(--accent) 55%, var(--color-text-primary) 45%)',
  'color-mix(in srgb, var(--color-text-primary) 42%, transparent)',
  'color-mix(in srgb, var(--accent) 38%, var(--color-text-primary) 62%)',
  'color-mix(in srgb, var(--color-text-primary) 28%, transparent)',
  'color-mix(in srgb, var(--accent) 64%, transparent)',
  'color-mix(in srgb, var(--color-text-primary) 55%, transparent)',
]

function polar(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function fmt(n: number) {
  return n.toFixed(2)
}

function roundedWedge(rInner: number, rOuter: number, a0: number, a1: number, cr: number) {
  const span = a1 - a0
  if (span <= 0 || rOuter <= rInner) return ''

  const maxCr = Math.min(cr, (rOuter - rInner) / 2)
  const outerAngle = Math.min((maxCr / rOuter) * (180 / Math.PI), span / 3)
  const innerAngle =
    rInner > 1
      ? Math.min((maxCr / rInner) * (180 / Math.PI), span / 3)
      : outerAngle

  const outerCr = Math.min(maxCr, rOuter * Math.sin((outerAngle * Math.PI) / 180))
  const innerCr = Math.min(maxCr, rInner * Math.sin((innerAngle * Math.PI) / 180))

  const ao0 = a0 + outerAngle
  const ao1 = a1 - outerAngle
  const ai0 = a0 + innerAngle
  const ai1 = a1 - innerAngle

  const pOuterStart = polar(rOuter, ao0)
  const pOuterEnd = polar(rOuter, ao1)
  const pInnerEnd = polar(rInner, ai1)
  const pInnerStart = polar(rInner, ai0)

  const cOuterStart = polar(rOuter - outerCr, a0)
  const cOuterEnd = polar(rOuter - outerCr, a1)
  const cInnerEnd = polar(rInner + innerCr, a1)
  const cInnerStart = polar(rInner + innerCr, a0)

  const large = ao1 - ao0 > 180 ? 1 : 0
  const largeInner = ai1 - ai0 > 180 ? 1 : 0

  return [
    `M ${fmt(cOuterStart.x)} ${fmt(cOuterStart.y)}`,
    `Q ${fmt(polar(rOuter, a0).x)} ${fmt(polar(rOuter, a0).y)} ${fmt(pOuterStart.x)} ${fmt(pOuterStart.y)}`,
    `A ${fmt(rOuter)} ${fmt(rOuter)} 0 ${large} 1 ${fmt(pOuterEnd.x)} ${fmt(pOuterEnd.y)}`,
    `Q ${fmt(polar(rOuter, a1).x)} ${fmt(polar(rOuter, a1).y)} ${fmt(cOuterEnd.x)} ${fmt(cOuterEnd.y)}`,
    `L ${fmt(cInnerEnd.x)} ${fmt(cInnerEnd.y)}`,
    `Q ${fmt(polar(rInner, a1).x)} ${fmt(polar(rInner, a1).y)} ${fmt(pInnerEnd.x)} ${fmt(pInnerEnd.y)}`,
    `A ${fmt(rInner)} ${fmt(rInner)} 0 ${largeInner} 0 ${fmt(pInnerStart.x)} ${fmt(pInnerStart.y)}`,
    `Q ${fmt(polar(rInner, a0).x)} ${fmt(polar(rInner, a0).y)} ${fmt(cInnerStart.x)} ${fmt(cInnerStart.y)}`,
    'Z',
  ].join(' ')
}

const segments = computed(() => {
  const list = props.items.filter((item) => item.value > 0).slice(0, 8)
  const n = Math.max(list.length, 1)
  const step = 360 / n
  const maxVal = Math.max(...list.map((item) => item.value), 1)

  return list.map((item, index) => {
    const a0 = index * step + gapDeg / 2
    const a1 = (index + 1) * step - gapDeg / 2
    const mid = (a0 + a1) / 2
    const ratio = Math.max(0.12, item.value / maxVal)
    const fillOuter = innerR + (outerR - innerR) * ratio
    const labelPos = polar(Math.max(innerR + 28, fillOuter * 0.72), mid)
    const shortLabel =
      item.label.length > 10 ? `${item.label.slice(0, 9)}…` : item.label

    return {
      key: item.key,
      label: item.label,
      shortLabel,
      value: item.value,
      color: item.color || palette[index % palette.length],
      trackPath: roundedWedge(innerR, outerR, a0, a1, cornerR),
      fillPath: roundedWedge(innerR, fillOuter, a0, a1, Math.min(cornerR, 10 + ratio * 4)),
      labelX: labelPos.x,
      labelY: labelPos.y,
    }
  })
})

const activeSeg = computed(() => segments.value.find((seg) => seg.key === active.value) ?? null)
const totalCount = computed(() =>
  props.items.reduce((sum, item) => sum + Math.max(0, item.value), 0)
)
</script>

<style scoped lang="scss">
.category-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.category-chart__empty {
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

.category-chart__svg {
  width: 100%;
  max-width: 360px;
  max-height: 100%;
  height: 100%;
  overflow: visible;
  flex: 1 1 auto;
  min-height: 0;
}

.category-chart__summary {
  margin: 0;
  flex: 0 0 auto;
  min-height: 1.2em;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);

  strong {
    color: var(--color-text-primary);
    font-weight: var(--weight-semibold);
    font-variant-numeric: tabular-nums;
  }
}

.segment {
  cursor: pointer;
  transition: opacity 180ms ease;
  animation: petal-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
  transform-box: fill-box;
  transform-origin: center;

  &.dim {
    opacity: 0.32;
  }

  &.hot {
    .segment__fill {
      filter: brightness(1.12);
      transform: scale(1.045);
    }

    .segment__track {
      fill: color-mix(in srgb, var(--color-text-primary) 14%, transparent);
    }
  }
}

.segment__track {
  fill: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  transition: fill 180ms ease;
}

.segment__fill {
  transform-origin: center;
  transition:
    filter 180ms ease,
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes petal-in {
  from {
    opacity: 0;
    transform: scale(0.82);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.segment__value {
  fill: var(--color-text-primary);
  font-size: var(--text-md);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}

.segment__name {
  fill: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 600;
  pointer-events: none;
}

@media (max-width: 767px) {
  .category-chart__svg {
    max-width: 280px;
  }

  .segment__value {
    font-size: var(--text-sm);
  }

  .segment__name {
    font-size: var(--text-2xs);
  }

  .category-chart__summary {
    font-size: var(--text-xs);
  }
}

@media (max-width: 420px) {
  .category-chart__svg {
    max-width: 240px;
  }
}
</style>
