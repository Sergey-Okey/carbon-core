<template>
  <div class="tasks-toolbar" :class="{ collapsed: isCollapsed }">
    <button
      type="button"
      class="toolbar-toggle"
      :aria-expanded="!isCollapsed"
      @click="isCollapsed = !isCollapsed"
    >
      <span>Поиск и фильтры</span>
      <ChevronDown v-if="isCollapsed" :size="18" />
      <ChevronUp v-else :size="18" />
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
        placeholder="Все теги"
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
    gap: 12px;
    padding: 12px;

    &.collapsed {
      gap: 0;
      padding: 3px;

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
    min-height: 44px;
    padding-inline: 12px;
    border: none;
    border-radius: var(--border-radius-md);
    background: transparent;
    color: var(--text);
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;

    svg {
      color: var(--dim);
    }
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
      padding: 3px;
    }
  }
}
</style>
