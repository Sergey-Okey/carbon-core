<template>
  <div class="tag-chart">
    <div v-if="empty || !items.length" class="tag-chart__empty">
      <p>{{ emptyTitle }}</p>
      <span>{{ emptyHint }}</span>
    </div>
    <template v-else>
      <ul class="tag-chart__rows">
        <li
          v-for="(item, index) in items"
          :key="item.id"
          class="tag-row"
          :class="{
            hot: active === item.id,
            dim: active && active !== item.id,
          }"
          :style="{ '--i': index, '--bar-color': item.color }"
          @pointerenter="active = item.id"
          @pointerleave="active = null"
        >
          <div class="tag-row__head">
            <span class="swatch" :style="{ background: item.color }" />
            <strong class="name">{{ item.name }}</strong>
            <span class="count">{{ item.total }}</span>
            <span class="share">{{ item.share }}%</span>
          </div>
          <div class="tag-row__track">
            <span class="tag-row__fill" :style="{ width: `${item.bar}%` }" />
          </div>
        </li>
      </ul>

      <p class="tag-chart__summary">
        <template v-if="activeItem">
          <strong :style="{ color: activeItem.color }">{{ activeItem.name }}</strong>
          · {{ activeItem.done }}/{{ activeItem.total }} выполнено · {{ activeItem.percent }}%
        </template>
        <template v-else>
          Преобладает
          <strong :style="{ color: topTag?.color }">{{ topTag?.name }}</strong>
          · {{ topTag?.share }}% · {{ items.length }} тегов
        </template>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export type TagChartItem = {
  id: string
  name: string
  color: string
  total: number
  done: number
  percent: number
  share: number
}

const props = withDefaults(
  defineProps<{
    items: TagChartItem[]
    empty?: boolean
    emptyTitle?: string
    emptyHint?: string
  }>(),
  {
    empty: false,
    emptyTitle: 'Нет тегов',
    emptyHint: 'Добавьте теги к задачам — здесь появится гистограмма',
  }
)

const active = ref<string | null>(null)

const topTag = computed(() => props.items[0] ?? null)

const items = computed(() => {
  const max = Math.max(...props.items.map((item) => item.total), 1)
  return props.items.map((item) => ({
    ...item,
    bar: Math.max(item.total > 0 ? 8 : 0, Math.round((item.total / max) * 100)),
  }))
})

const activeItem = computed(() => items.value.find((item) => item.id === active.value) ?? null)
</script>

<style scoped lang="scss">
.tag-chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.tag-chart__empty {
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

.tag-chart__rows {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: var(--space-3);
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: hidden;
}

.tag-row {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
  cursor: pointer;
  transition: opacity 180ms ease;

  &.dim {
    opacity: 0.38;
  }
}

.tag-row__head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.swatch {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: 0 0 auto;
  transition: transform 180ms ease;
}

.tag-row.hot .swatch {
  transform: scale(1.25);
}

.name {
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count,
.share {
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.count {
  color: var(--color-text-muted);
}

.share {
  color: var(--color-text-primary);
  font-weight: var(--weight-bold);
  min-width: 2.5em;
  text-align: right;
}

.tag-row__track {
  height: 14px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
  overflow: hidden;
}

.tag-row__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: color-mix(in srgb, var(--bar-color, var(--accent)) 70%, transparent);
  transform-origin: left center;
  transition:
    width 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    background 180ms ease,
    filter 180ms ease;
  animation: bar-grow 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i, 0) * 55ms);
}

.tag-row.hot .tag-row__fill {
  background: var(--bar-color, var(--accent));
  filter: brightness(1.06);
}

.tag-chart__summary {
  margin: 0;
  margin-top: auto;
  flex: 0 0 auto;
  min-height: 1.2em;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);

  strong {
    font-weight: var(--weight-semibold);
  }
}

@keyframes bar-grow {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@media (max-width: 767px) {
  .tag-chart__rows {
    gap: var(--space-2);
  }

  .tag-row__track {
    height: 12px;
  }

  .name {
    font-size: var(--text-xs);
  }

  .count,
  .share,
  .tag-chart__summary {
    font-size: var(--text-xs);
  }
}

@media (max-width: 420px) {
  .tag-row__head {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .count {
    display: none;
  }
}
</style>
