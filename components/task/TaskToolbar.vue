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
      <AppSegmentedControl
        v-model="viewModel"
        :options="viewOptions"
        label="Режим задач"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search, Tags } from 'lucide-vue-next'
import AppInput from '~/components/ui/AppInput.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import AppSegmentedControl from '~/components/ui/AppSegmentedControl.vue'
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
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);

  @include mobile {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 14px;
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

@media (max-width: 768px) {
  .tasks-toolbar {
    position: relative;
    gap: 14px;
  }
}

@media (max-width: 480px) {
  .tasks-toolbar {
    padding: 12px;
  }
}
</style>
