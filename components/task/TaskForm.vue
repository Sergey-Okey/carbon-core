<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editing ? 'Редактирование' : 'Новая задача' }}</h3>
          <button class="close-btn" @click="emit('close')">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Название</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="Например: Прочитать 20 страниц"
              required
            />
          </div>

          <div class="form-group">
            <label>Описание</label>
            <input
              v-model="form.description"
              type="text"
              placeholder="Дополнительные детали (необязательно)"
            />
          </div>

          <div class="form-row" v-if="!hideType">
            <div class="form-group">
              <label>Тип</label>
              <div class="select-wrapper">
                <select v-model="form.type">
                  <option value="HABIT">Привычка</option>
                  <option value="TASK_DAY">На день</option>
                  <option value="TASK_WEEK">На неделю</option>
                  <option value="TASK_MONTH">На месяц</option>
                  <option value="TASK_YEAR">На год</option>
                </select>
                <ChevronDown :size="16" class="select-icon" />
              </div>
            </div>

            <div class="form-group" v-if="form.type !== 'HABIT'">
              <label>Срок</label>
              <input type="date" v-model="form.targetDate" />
            </div>
          </div>

          <div class="form-group">
            <label>Теги</label>
            <div class="tags-cloud">
              <button
                v-for="tag in tagsStore.tags"
                :key="tag.id"
                type="button"
                class="tag-btn"
                :class="{ active: form.tagIds.includes(tag.id) }"
                @click="toggleTag(tag.id)"
              >
                {{ tag.name }}
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="emit('close')">
              Отмена
            </button>
            <button type="submit" class="btn-primary">
              {{ editing ? 'Сохранить' : 'Создать задачу' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { X, ChevronDown } from 'lucide-vue-next'
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

function toggleTag(tagId: string) {
  const index = form.tagIds.indexOf(tagId)
  if (index === -1) {
    form.tagIds.push(tagId)
  } else {
    form.tagIds.splice(index, 1)
  }
}

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
        message: 'Лимит задач на этот период исчерпан',
      })
    }
  }
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border);
  background: var(--bg);
  @include glass;
  color: var(--accent);

  // Кастомный скроллбар
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 2px;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;

  h3 {
    font-weight: 600;
    font-size: 1.3rem;
    letter-spacing: -0.01em;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--dim);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all var(--transition-standard);

    &:hover {
      background: var(--surface);
      color: var(--accent);
    }
  }
}

form {
  padding: 20px 24px 24px;
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--accent);
  }

  input,
  select {
    width: 100%;
    padding: 12px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-md);
    color: var(--accent);
    font-size: 1rem;
    transition: border-color var(--transition-standard);

    &::placeholder {
      color: var(--dim);
      opacity: 0.6;
    }

    &:focus {
      border-color: var(--accent);
      outline: none;
    }
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.select-wrapper {
  position: relative;

  select {
    appearance: none;
    padding-right: 40px;
    cursor: pointer;
  }

  .select-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--dim);
    pointer-events: none;
  }
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .tag-btn {
    padding: 8px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-sm);
    color: var(--dim);
    font-size: 0.85rem;
    font-weight: 500;
    transition: all var(--transition-standard);
    cursor: pointer;

    &:hover {
      background: var(--border);
      color: var(--accent);
    }

    &.active {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--bg);
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;

  button {
    padding: 12px 24px;
    border-radius: var(--border-radius-md);
    font-weight: 500;
    font-size: 0.95rem;
    transition: all var(--transition-standard);
    cursor: pointer;
    border: none;
  }

  .btn-secondary {
    background: transparent;
    color: var(--dim);

    &:hover {
      background: var(--surface);
      color: var(--accent);
    }
  }

  .btn-primary {
    background: var(--accent);
    color: var(--bg);

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
