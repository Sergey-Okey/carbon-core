<template>
  <div class="tasks-toolbar">
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
      <div class="segment-row">
        <button
          v-for="option in viewOptions"
          :key="option.value"
          type="button"
          :class="{ active: viewModel === option.value }"
          @click="viewModel = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search, Tags } from 'lucide-vue-next'
import AppInput from '~/components/ui/AppInput.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import type { AppSelectOption } from '~/types/ui.types'

type TaskView = 'active' | 'all' | 'completed'

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

const viewOptions: { label: string; value: TaskView }[] = [
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
  set: (value: TaskView) => emit('update:view', value),
})
</script>

<style scoped lang="scss">
.tasks-toolbar {
  @include glass;
  position: sticky;
  top: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: minmax(220px, 1.25fr) minmax(180px, 0.85fr) minmax(292px, auto);
  gap: 20px;
  align-items: end;
  padding: 20px 24px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-lg);
  background: color-mix(in srgb, var(--surface) 70%, transparent);
  backdrop-filter: blur(12px);

  @include mobile {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
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
    padding-left: 34px;
    font-size: 0.9rem;
  }
}

.control-icon {
  position: absolute;
  left: 12px;
  color: var(--dim);
  pointer-events: none;
}

.segment-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  height: 40px;
  padding: 3px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);

  button {
    min-width: 0;
    margin: 0;
    padding: 0 8px;
    border: none;
    border-radius: var(--border-radius-sm);
    background: transparent;
    color: var(--dim);
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard),
      box-shadow var(--transition-standard);

    &:hover:not(.active) {
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      color: var(--accent);
    }

    &.active {
      background: var(--accent);
      color: var(--bg);
      box-shadow: var(--shadow-sm);
    }
  }
}

@media (max-width: 768px) {
  .tasks-toolbar {
    position: relative;
    gap: 14px;
  }

  .segment-row button {
    padding: 0 6px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .tasks-toolbar {
    padding: 12px;
  }

  .segment-row button {
    font-size: 0.75rem;
  }
}
</style>
