<template>
  <div class="tasks-toolbar" :class="{ collapsed: isCollapsed }">
    <button
      type="button"
      class="toolbar-toggle"
      :aria-expanded="!isCollapsed"
      @click="isCollapsed = !isCollapsed"
    >
      <span class="toolbar-toggle__copy">
        <strong>Поиск и фильтры</strong>
        <span v-if="collapsedSummary" class="toolbar-toggle__summary">{{ collapsedSummary }}</span>
      </span>
      <span class="toolbar-toggle__icon">
        <ChevronDown v-if="isCollapsed" :size="18" />
        <ChevronUp v-else :size="18" />
      </span>
    </button>

    <div class="search-field">
      <label for="task-search">Поиск</label>
      <div class="control-wrapper">
        <Search :size="16" class="control-icon" />
        <AppInput
          id="task-search"
          v-model="searchModel"
          type="search"
          placeholder="Название или описание"
        />
      </div>
    </div>

    <div class="filter-field">
      <label for="task-tag">Тег</label>
      <AppSelect
        id="task-tag"
        v-model="tagModel"
        :options="tagOptions"
        placeholder="Выберите тег"
      >
        <template #icon>
          <Tags :size="16" />
        </template>
      </AppSelect>
    </div>

    <div class="view-switch" aria-label="Режим задач">
      <span class="control-label">Режим</span>
      <AppSegmentedControl
        v-model="viewModel"
        :options="viewOptions"
        label="Режим задач"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, ChevronUp, Search, Tags } from 'lucide-vue-next'
import AppInput from '~/components/ui/AppInput.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import AppSegmentedControl from '~/components/ui/AppSegmentedControl.vue'
import type { AppSelectOption } from '~/types/ui.types'

type TaskView = 'active' | 'all' | 'completed'

const isCollapsed = ref(false)

const props = defineProps<{
  search: string
  selectedTagId: string
  view: TaskView
  tagOptions: AppSelectOption[]
}>()

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:selectedTagId', value: string): void
  (e: 'update:view', value: TaskView): void
}>()

const viewOptions = [
  { label: 'Активные', value: 'active' },
  { label: 'Все', value: 'all' },
  { label: 'Завершённые', value: 'completed' },
]

const activeTagLabel = computed(() => {
  const option = props.tagOptions.find((item) => item.value === props.selectedTagId)
  return option?.label ?? ''
})

const activeViewLabel = computed(() => {
  const option = viewOptions.find((item) => item.value === props.view)
  return option?.label ?? ''
})

const collapsedSummary = computed(() => {
  const parts: string[] = []

  if (props.search.trim()) {
    parts.unshift('Поиск: ' + props.search.trim())
  }

  if (props.selectedTagId !== 'all' && activeTagLabel.value) {
    parts.push(activeTagLabel.value)
  }

  if (props.view !== 'active' && activeViewLabel.value) {
    parts.push(activeViewLabel.value)
  }

  return parts.join(' | ')
})

const searchModel = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value.trim()),
})

const tagModel = computed({
  get: () => props.selectedTagId,
  set: (value: string) => emit('update:selectedTagId', value),
})

const viewModel = computed({
  get: () => props.view,
  set: (value: string) => emit('update:view', value as TaskView),
})
</script>

<style scoped lang="scss">
.tasks-toolbar {
  @include glass;
  display: grid;
  grid-template-columns: minmax(220px, 1.25fr) minmax(180px, 0.85fr) minmax(292px, auto);
  gap: var(--panel-gap);
  align-items: end;
  padding: var(--panel-padding);
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);

  @include mobile {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 14px;
  }
}

.toolbar-toggle {
  display: none;
}

label,
.control-label {
  display: block;
  margin-bottom: 6px;
  color: var(--dim);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.control-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  :deep(.app-input) {
    padding-inline-start: 34px;
    font-size: 0.9rem;
  }
}

.control-icon {
  position: absolute;
  inset-inline-start: 12px;
  z-index: 1;
  color: var(--dim);
  pointer-events: none;
}

@media (max-width: 768px) {
  .tasks-toolbar {
    position: relative;
    gap: 10px;
    padding: 10px;

    &.collapsed {
      gap: 0;
      min-height: 52px;
      padding: 8px;

      .search-field,
      .filter-field,
      .view-switch {
        display: none;
      }
    }
  }

  .toolbar-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 36px;
    gap: 12px;
    padding: 8px 10px 8px 12px;
    border: none;
    border-radius: calc(var(--border-radius-lg) - 6px);
    background: color-mix(in srgb, var(--glass-surface) 92%, transparent);
    color: var(--text);
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    svg {
      color: var(--dim);
    }
  }

  .toolbar-toggle__copy {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    text-align: left;

    strong {
      font-size: 0.84rem;
      line-height: 1.15;
    }
  }

  .tasks-toolbar.collapsed .toolbar-toggle__copy {
    gap: 0;
  }

  .toolbar-toggle__summary {
    max-width: 100%;
    color: var(--dim);
    font-size: 0.7rem;
    font-weight: 500;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .toolbar-toggle__icon {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: var(--border-radius-pill);
  }

  @media (hover: hover) and (pointer: fine) {
    .toolbar-toggle:hover {
      background: color-mix(in srgb, var(--accent) 8%, transparent);
    }
  }

  .view-switch {
    :deep(.app-segmented) {
      min-height: var(--control-height-sm);
      padding: 2px;
    }

    :deep(.segment-option) {
      min-height: var(--control-height-sm);
      border-radius: calc(var(--border-radius-md) - 2px);
    }
  }
}

@media (max-width: 480px) {
  .tasks-toolbar {
    padding: 12px;

    &.collapsed {
      padding: 8px;
    }
  }
}
</style>
