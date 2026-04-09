<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <GlassCard class="modal">
      <h3>{{ editing ? 'Редактировать' : 'Новая задача' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Название</label>
          <input v-model="form.title" required />
        </div>
        <div class="form-group">
          <label>Описание (опционально)</label>
          <input v-model="form.description" />
        </div>
        <div class="form-group" v-if="!hideType">
          <label>Тип</label>
          <select v-model="form.type">
            <option value="HABIT">Привычка</option>
            <option value="TASK_DAY">Задача на день</option>
            <option value="TASK_WEEK">Задача на неделю</option>
            <option value="TASK_MONTH">Задача на месяц</option>
            <option value="TASK_YEAR">Задача на год</option>
          </select>
        </div>
        <div class="form-group" v-if="form.type !== 'HABIT'">
          <label>Срок (дата)</label>
          <input type="date" v-model="form.targetDate" />
        </div>
        <div class="form-group">
          <label>Теги</label>
          <div class="tags-select">
            <label
              v-for="tag in tagsStore.tags"
              :key="tag.id"
              class="tag-option"
            >
              <input type="checkbox" :value="tag.id" v-model="form.tagIds" />
              {{ tag.name }}
            </label>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" @click="emit('close')">Отмена</button>
          <button type="submit" class="primary">
            {{ editing ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </form>
    </GlassCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import GlassCard from '~/components/base/GlassCard.vue'
import { useTagsStore } from '~/stores/tags.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useNotification } from '~/composables/useNotification'
import type { Task } from '~/types/task.types'

const props = defineProps<{
  task?: Task
  defaultType?: string
  hideType?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: any): void
}>()

const tagsStore = useTagsStore()
const tasksStore = useTasksStore()
const { addNotification } = useNotification()
const editing = computed(() => !!props.task)

const form = reactive({
  title: '',
  description: '',
  type: props.defaultType || 'HABIT',
  targetDate: '',
  tagIds: [] as string[],
})

watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      form.title = newTask.title
      form.description = newTask.description || ''
      form.type = newTask.type
      form.targetDate = newTask.targetDate || ''
      form.tagIds = [...newTask.tagIds]
    }
  },
  { immediate: true }
)

function handleSubmit() {
  if (editing.value) {
    emit('save', { ...form })
  } else {
    const result = tasksStore.addTask({ ...form })
    if (result) {
      addNotification({
        type: 'success',
        message: `«${result.title}» добавлено`,
      })
      emit('close')
    } else {
      addNotification({
        type: 'warning',
        message: `Достигнут лимит задач на выбранный период.`,
      })
    }
  }
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}
.modal {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  color: var(--accent);
}
.form-group {
  margin-bottom: 20px;
  label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.9rem;
    color: var(--dim);
  }
  input,
  select {
    width: 100%;
    padding: 10px 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-sm);
    color: var(--accent);
    &:focus {
      border-color: var(--accent);
      outline: none;
    }
  }
  .tags-select {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    .tag-option {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }
  }
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  button {
    padding: 10px 20px;
    border-radius: var(--border-radius-sm);
    background: var(--surface);
    color: var(--accent);
    &:hover {
      background: var(--border);
    }
    &.primary {
      background: var(--accent);
      color: var(--bg);
      font-weight: 500;
      &:hover {
        opacity: 0.9;
      }
    }
  }
}
</style>
