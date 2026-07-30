<template>
  <div class="activity-list">
    <div v-if="empty || !items.length" class="activity-list__empty">
      <p>{{ emptyTitle }}</p>
      <span>{{ emptyHint }}</span>
    </div>
    <template v-else>
      <div v-if="hasMixedTypes" class="activity-list__filters">
        <button
          v-for="option in filterOptions"
          :key="option.value"
          type="button"
          class="filter-chip"
          :class="{ active: filter === option.value }"
          @click="filter = option.value"
        >
          {{ option.label }}
        </button>
      </div>
      <ul class="activity-list__rows">
        <li
          v-for="item in filteredItems"
          :key="item.key"
          class="activity-list__row"
          :class="item.kind"
          @click="onSelect(item)"
        >
          <span class="row-icon" :class="item.kind">
            <component :is="iconFor(item.kind)" :size="18" />
          </span>
          <div class="row-copy">
            <strong>{{ item.title }}</strong>
            <span v-if="item.meta">{{ item.meta }}</span>
          </div>
          <div class="row-trail">
            <span v-if="item.badge" class="badge">{{ item.badge }}</span>
            <span v-if="item.value" class="value">{{ item.value }}</span>
          </div>
          <div v-if="typeof item.progress === 'number'" class="mini">
            <span :style="{ width: `${item.progress}%` }" />
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircle2, Flag, GitBranch } from 'lucide-vue-next'

export type ActivityListKind = 'task' | 'branch' | 'milestone'

export type ActivityListItem = {
  key: string
  title: string
  meta?: string
  badge?: string
  value?: string
  progress?: number
  kind: ActivityListKind
  targetId: string
}

const props = withDefaults(
  defineProps<{
    items: ActivityListItem[]
    empty?: boolean
    emptyTitle?: string
    emptyHint?: string
  }>(),
  {
    empty: false,
    emptyTitle: 'Пока пусто',
    emptyHint: 'Активность появится после выполнений',
  }
)

const emit = defineEmits<{
  select: [item: ActivityListItem]
}>()

const filter = ref<'all' | ActivityListKind>('all')

const filterOptions = [
  { value: 'all' as const, label: 'Все' },
  { value: 'task' as const, label: 'Задачи' },
  { value: 'branch' as const, label: 'Ветки' },
  { value: 'milestone' as const, label: 'Этапы' },
]

const hasMixedTypes = computed(() => {
  const types = new Set(props.items.map((item) => item.kind))
  return types.size > 1
})

const filteredItems = computed(() => {
  if (filter.value === 'all' || !hasMixedTypes.value) return props.items
  return props.items.filter((item) => item.kind === filter.value)
})

function iconFor(kind: ActivityListKind) {
  if (kind === 'branch') return GitBranch
  if (kind === 'milestone') return Flag
  return CheckCircle2
}

function onSelect(item: ActivityListItem) {
  emit('select', item)
}
</script>

<style scoped lang="scss">
.activity-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.activity-list__empty {
  display: grid;
  place-content: center;
  gap: var(--space-1);
  flex: 1;
  width: 100%;
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

.activity-list__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  flex: 0 0 auto;
  margin-bottom: var(--space-2);
  min-width: 0;
}

.filter-chip {
  min-height: 26px;
  padding: 0 var(--space-3);
  border: var(--ui-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-secondary);
  font: inherit;
  font-size: 0.7rem;
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard),
    border-color var(--transition-standard);

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(.active) {
      color: var(--color-text-primary);
    }
  }

  &.active {
    border-color: color-mix(in srgb, var(--accent) 45%, transparent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    color: var(--accent);
  }
}

.activity-list__rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: hidden;
  overflow-y: auto;
  min-height: 0;
  min-width: 0;
}

.activity-list__row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-2) var(--space-3);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: var(--space-3);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      border-color: color-mix(in srgb, var(--accent) 22%, transparent);
    }
  }
}

.row-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);

  &.branch,
  &.milestone {
    background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
    color: var(--color-text-secondary);
  }
}

.row-copy {
  display: grid;
  gap: 2px;
  min-width: 0;

  strong {
    color: var(--color-text-primary);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: var(--color-text-muted);
    font-size: 0.7rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.row-trail {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--space-1);
  max-width: 42%;
  min-width: 0;
}

.badge {
  max-width: 100%;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
  color: var(--color-text-secondary);
  font-size: 0.64rem;
  font-weight: var(--weight-semibold);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.value {
  color: var(--accent);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.mini {
  grid-column: 1 / -1;
  height: 3px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  overflow: hidden;

  span {
    display: block;
    height: 100%;
    background: var(--accent);
  }
}
</style>
