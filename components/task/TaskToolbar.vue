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

    <div class="toolbar-body">
      <div class="search-field">
        <label for="task-search">Поиск</label>
        <div class="control-wrapper">
          <Search :size="16" class="control-icon" />
          <AppInput
            id="task-search"
            v-model="searchModel"
            type="search"
            size="sm"
            placeholder="Название или описание"
          />
          <button
            v-if="searchModel.trim()"
            type="button"
            class="search-clear"
            aria-label="Очистить поиск"
            @click="searchModel = ''"
          >
            <X :size="14" />
          </button>
        </div>
      </div>

      <div class="filter-field">
        <label for="task-tag">Тег</label>
        <AppSelect
          id="task-tag"
          v-model="tagModel"
          size="sm"
          :options="tagOptions"
          placeholder="Выберите тег"
        >
          <template #icon>
            <Tags :size="16" />
          </template>
        </AppSelect>
      </div>

      <div class="view-switch" aria-label="Режим задач">
        <div class="view-switch__head">
          <span class="control-label">Режим</span>
          <button
            v-if="hasActiveFilters"
            type="button"
            class="clear-filters"
            @click="clearFilters"
          >
            Сбросить
          </button>
        </div>
        <AppSegmentedControl
          v-model="viewModel"
          size="sm"
          :options="viewOptions"
          label="Режим задач"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, ChevronUp, Search, Tags, X } from 'lucide-vue-next'
import type { AppSelectOption } from '~/types/ui.types'

type TaskView = 'active' | 'all' | 'completed'

const COLLAPSE_STORAGE_KEY = 'cof-tasks-toolbar-collapsed'

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

const hasActiveFilters = computed(
  () =>
    props.search.trim() !== '' ||
    props.selectedTagId !== 'all' ||
    props.view !== 'active'
)

const collapsedSummary = computed(() => {
  const parts: string[] = []

  if (props.search.trim()) {
    parts.push('Поиск: ' + props.search.trim())
  }

  if (props.selectedTagId !== 'all' && activeTagLabel.value) {
    parts.push(activeTagLabel.value)
  }

  if (props.view !== 'active' && activeViewLabel.value) {
    parts.push(activeViewLabel.value)
  }

  return parts.join(' · ')
})

const searchModel = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value),
})

const tagModel = computed({
  get: () => props.selectedTagId,
  set: (value: string) => emit('update:selectedTagId', value),
})

const viewModel = computed({
  get: () => props.view,
  set: (value: string) => emit('update:view', value as TaskView),
})

function clearFilters() {
  emit('update:search', '')
  emit('update:selectedTagId', 'all')
  emit('update:view', 'active')
}

onMounted(() => {
  if (!import.meta.client) return
  const saved = localStorage.getItem(COLLAPSE_STORAGE_KEY)
  if (saved !== null) {
    isCollapsed.value = saved === 'true'
    return
  }
  isCollapsed.value = window.matchMedia('(max-width: 767px)').matches
})

watch(isCollapsed, (value) => {
  if (import.meta.client) {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, String(value))
  }
})
</script>

<style scoped lang="scss">
.tasks-toolbar {
  @include collapse-panel(var(--space-4));

  @include mobile {
    --nest-pad: var(--space-3);
    padding: var(--nest-pad);

    &.collapsed {
      @include collapse-panel-compact;

      .toolbar-body {
        display: none;
      }
    }
  }
}

.toolbar-body {
  display: grid;
  grid-template-columns: minmax(220px, 1.25fr) minmax(180px, 0.85fr) minmax(292px, auto);
  gap: var(--panel-gap);
  align-items: end;

  @include mobile {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
}

.toolbar-toggle {
  display: none;
}

label,
.control-label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.view-switch__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  min-height: calc(var(--text-xs) * var(--leading-tight, 1.2) + var(--space-2));
  margin-bottom: var(--space-2);

  .control-label {
    margin-bottom: 0;
  }
}

.clear-filters {
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-accent);
  font: inherit;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: opacity var(--transition-standard);

  &:hover {
    opacity: 0.8;
  }
}

.control-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  :deep(.app-input) {
    padding-inline-start: var(--space-9);
    padding-inline-end: var(--space-9);
    font-size: var(--text-sm);
  }
}

.control-icon {
  position: absolute;
  inset-inline-start: var(--space-3);
  z-index: 1;
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-clear {
  position: absolute;
  inset-inline-end: var(--space-2);
  z-index: 1;
  display: grid;
  place-items: center;
  width: var(--space-6);
  height: var(--space-6);
  margin: 0;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;

  &:hover {
    color: var(--color-text-primary);
    background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  }
}

@include mobile {
  .toolbar-toggle {
    @include collapse-toggle;
  }

  .toolbar-toggle__copy {
    @include collapse-toggle-copy;
  }

  .tasks-toolbar.collapsed .toolbar-toggle__copy {
    gap: 0;
  }

  .toolbar-toggle__summary {
    @include collapse-toggle-summary;
  }

  .toolbar-toggle__icon {
    @include collapse-toggle-icon;
  }

  .view-switch {
    :deep(.app-segmented) {
      --nest-pad: 2px;
      min-height: var(--control-height-sm);
      padding: var(--nest-pad);
    }

    :deep(.segment-option) {
      min-height: var(--control-height-sm);
    }
  }
}
</style>
