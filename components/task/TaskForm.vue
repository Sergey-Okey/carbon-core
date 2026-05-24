<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
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
              :placeholder="titlePlaceholder"
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

          <div class="form-row" v-if="!hideType && form.type !== 'HABIT'">
            <div class="form-group">
              <label>Тип</label>
              <div class="select-wrapper">
                <select v-model="form.type">
                  <option value="TASK_DAY">На день</option>
                  <option value="TASK_WEEK">На неделю</option>
                  <option value="TASK_MONTH">На месяц</option>
                  <option value="TASK_YEAR">На год</option>
                </select>
                <ChevronDown :size="16" class="select-icon" />
              </div>
            </div>

            <div class="form-group">
              <label>Срок</label>
              <div class="date-wrapper">
                <input type="date" v-model="form.targetDate" />
                <Calendar :size="16" class="date-icon" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Теги</label>
            <div class="tags-cloud">
              <template v-for="tag in tagsStore.tags" :key="tag.id">
                <div class="tag-wrapper">
                  <button
                    type="button"
                    class="tag-btn"
                    :class="{ active: form.tagIds.includes(tag.id) }"
                    @click="toggleTag(tag.id)"
                  >
                    {{ tag.name }}
                  </button>
                  <button
                    v-if="!tag.isSystem"
                    class="tag-delete"
                    @click.stop="deleteTag(tag.id)"
                    title="Удалить тег"
                  >
                    <X :size="14" />
                  </button>
                </div>
              </template>
              <button
                type="button"
                class="tag-btn add-tag-btn"
                @click="openAddTagModal"
                title="Добавить тег"
              >
                <Plus :size="16" /> Добавить
              </button>
            </div>
          </div>

          <div class="form-group" v-if="!editing && form.type !== 'HABIT'">
            <label class="checkbox-label">
              <input type="checkbox" v-model="createBranch" />
              <span class="checkmark"></span>
              <span class="checkbox-text">Создать ветку из задачи</span>
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="emit('close')">
              Отмена
            </button>
            <button type="submit" class="btn-primary">
              {{ editing ? 'Сохранить' : submitButtonText }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showAddTagModal"
        class="modal-overlay"
        @click.self="closeAddTagModal"
      >
        <div class="modal tag-modal">
          <div class="modal-header">
            <h4>Новый тег</h4>
            <button class="close-btn" @click="closeAddTagModal">
              <X :size="18" />
            </button>
          </div>
          <form @submit.prevent="createTag">
            <div class="form-group">
              <label>Название</label>
              <input
                v-model="newTagName"
                type="text"
                placeholder="#важно"
                required
              />
            </div>
            <div class="form-group">
              <label>Ветка</label>
              <div class="select-wrapper">
                <select v-model="newTagBranchId" required>
                  <option value="FIN">Финансы</option>
                  <option value="BODY">Тело</option>
                  <option value="MIND">Интеллект</option>
                  <option value="LDR">Лидерство</option>
                </select>
                <ChevronDown :size="16" class="select-icon" />
              </div>
            </div>
            <div class="form-actions">
              <button
                type="button"
                class="btn-secondary"
                @click="closeAddTagModal"
              >
                Отмена
              </button>
              <button type="submit" class="btn-primary">Создать</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, watch, ref, computed } from 'vue'
import { X, ChevronDown, Calendar, Plus } from 'lucide-vue-next'
import { useTagsStore } from '~/stores/tags.store'
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
const { addNotification } = useNotification()
const editing = computed(() => !!props.task)
const createBranch = ref(false)

const form = reactive({
  title: '',
  description: '',
  type: props.defaultType || 'HABIT',
  targetDate: '',
  tagIds: [] as string[],
})

const modalTitle = computed(() => {
  if (editing.value) return 'Редактирование'
  return form.type === 'HABIT' ? 'Новая привычка' : 'Новая задача'
})

const submitButtonText = computed(() => {
  return form.type === 'HABIT' ? 'Добавить привычку' : 'Создать задачу'
})

const titlePlaceholder = computed(() => {
  return form.type === 'HABIT'
    ? 'Например: Пить воду'
    : 'Например: Прочитать 20 страниц'
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

watch(
  () => props.defaultType,
  (newType) => {
    if (!editing.value && newType) {
      form.type = newType
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
  emit('save', {
    ...form,
    createBranch: !editing.value && createBranch.value,
  })
  return
  /*

  if (editing.value) {
    emit('save', { ...form })
  } else {
    const result = tasksStore.addTask({ ...form })
    if (result) {
      // Если выбрано создание ветки - создаем её
      if (createBranch.value) {
        const branchesStore = useBranchesStore()
        branchesStore.addBranch(
          result.title, // Название задачи как название ветки
          'question', // Значок "?" для последующего выбора
          form.description || '',
          [result.id] // Привязываем созданную задачу
        )
        addNotification({
          type: 'success',
          message: `Ветка «${result.title}» создана в доске`,
        })
      } else {
        addNotification({
          type: 'success',
          message:
            form.type === 'HABIT'
              ? `Привычка «${result.title}» добавлена`
              : `«${result.title}» добавлено`,
        })
      }
      emit('close')
    } else {
      addNotification({
        type: 'warning',
        message: 'Лимит задач на этот период исчерпан',
      })
    }
  }
  */
}

const showAddTagModal = ref(false)
const newTagName = ref('')
const newTagBranchId = ref<'FIN' | 'BODY' | 'MIND' | 'LDR'>('FIN')

function openAddTagModal() {
  newTagName.value = ''
  newTagBranchId.value = 'FIN'
  showAddTagModal.value = true
}

function closeAddTagModal() {
  showAddTagModal.value = false
}

function createTag() {
  if (!newTagName.value.trim()) return
  let name = newTagName.value.trim()
  if (!name.startsWith('#')) name = '#' + name

  const existing = tagsStore.tags.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  )
  if (existing) {
    addNotification({ type: 'warning', message: 'Такой тег уже существует' })
    return
  }

  tagsStore.addTag({ name, branchId: newTagBranchId.value, order: 999 })
  addNotification({ type: 'success', message: `Тег «${name}» добавлен` })
  closeAddTagModal()
}

function deleteTag(tagId: string) {
  const success = tagsStore.deleteTag(tagId)
  if (success) {
    addNotification({ type: 'success', message: 'Тег удалён' })
    const index = form.tagIds.indexOf(tagId)
    if (index !== -1) form.tagIds.splice(index, 1)
  } else {
    addNotification({ type: 'error', message: 'Нельзя удалить системный тег' })
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
  background: color-mix(in srgb, var(--bg) 70%, transparent);
  backdrop-filter: blur(6px);
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

.tag-modal {
  max-width: 380px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;

  h3,
  h4 {
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  h3 {
    font-size: 1.3rem;
  }
  h4 {
    font-size: 1.1rem;
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
    color: var(--dim);
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

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    text-transform: none;
    letter-spacing: normal;
    font-weight: normal;
    margin-bottom: 0;

    input[type='checkbox'] {
      display: none;
    }

    .checkmark {
      position: relative;
      display: inline-block;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      background: var(--surface);
      border: 2px solid var(--border);
      border-radius: var(--border-radius-sm);
      transition: all var(--transition-standard);

      &::after {
        content: '';
        position: absolute;
        display: none;
        left: 6px;
        top: 2px;
        width: 5px;
        height: 10px;
        border: solid var(--bg);
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }

    input[type='checkbox']:checked + .checkmark {
      background: var(--accent);
      border-color: var(--accent);
      &::after {
        display: block;
      }
    }

    .checkbox-text {
      font-size: 0.95rem;
      color: var(--accent);
    }

    &:hover .checkmark {
      border-color: var(--accent);
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

.date-wrapper {
  position: relative;

  input[type='date'] {
    appearance: none;
    padding-right: 40px;
    cursor: pointer;

    &::-webkit-calendar-picker-indicator {
      opacity: 0;
      position: absolute;
      right: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  }

  .date-icon {
    position: absolute;
    right: 16px;
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

  .tag-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

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

  .tag-delete {
    position: absolute;
    top: -6px;
    right: -6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--dim);
    cursor: pointer;
    transition: all 0.1s;
    padding: 0;

    &:hover {
      background: var(--error);
      color: var(--surface);
      border-color: var(--error);
    }
  }

  .add-tag-btn {
    background: transparent;
    border: 1px dashed var(--border);
    color: var(--dim);
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      background: var(--surface);
      border-style: solid;
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
      box-shadow: var(--shadow-sm);
    }
  }
}

/* ✅ АДАПТАЦИЯ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
  }

  .modal {
    width: 100%;
    max-width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    position: sticky;
    top: 0;
    background: var(--bg);
    z-index: 10;
    border-bottom: 1px solid var(--border);
    padding: 16px 20px;

    h3,
    h4 {
      font-size: 1.1rem;
    }

    .close-btn {
      width: 28px;
      height: 28px;
    }
  }

  form {
    padding: 20px 16px 24px;
    flex: 1;
    overflow-y: auto;
  }

  .form-group {
    margin-bottom: 16px;

    label {
      font-size: 0.8rem;
    }

    input,
    select {
      padding: 10px 12px;
      font-size: 16px; /* Предотвращает зум на iOS */
    }
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 8px;
    margin-top: 20px;
    padding: 0 0 20px 0;

    button {
      width: 100%;
      padding: 14px 16px;
    }
  }

  .tags-cloud {
    gap: 6px;

    .tag-btn {
      padding: 6px 12px;
      font-size: 0.8rem;
    }
  }

  .tag-modal {
    max-width: 100vw;
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 12px 16px;
  }

  form {
    padding: 16px 12px 20px;
  }

  .form-group {
    margin-bottom: 12px;

    input,
    select {
      padding: 8px 10px;
    }
  }

  .tags-cloud {
    gap: 4px;

    .tag-btn {
      padding: 4px 8px;
      font-size: 0.75rem;
    }
  }
}
</style>
