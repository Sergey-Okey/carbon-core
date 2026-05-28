<template>
  <AppModal :title="modalTitle" as-form @close="emit('close')" @submit="handleSubmit">
    <div class="modal-form">
      <AppFormField label="Название">
        <AppInput
          v-model="form.title"
          :placeholder="titlePlaceholder"
          required
        />
      </AppFormField>

      <AppFormField label="Описание">
        <AppInput
          v-model="form.description"
          placeholder="Краткое описание задачи (необязательно)"
        />
      </AppFormField>

      <div v-if="!hideType && form.type !== 'HABIT'" class="form-row">
        <AppFormField label="Тип">
          <AppSelect v-model="form.type" :options="taskTypeOptions" />
        </AppFormField>

        <AppFormField label="Дата">
          <AppDatePicker v-model="form.targetDate" />
        </AppFormField>
      </div>

      <AppFormField label="Теги">
        <div class="tags-cloud">
          <template v-for="tag in form.tags" :key="tag.id">
            <div class="tag-wrapper">
              <button
                type="button"
                class="tag-btn active"
                aria-pressed="true"
                :style="{ '--tag-color': tag.color || 'var(--accent)' }"
              >
                <span class="tag-dot" />
                <span class="tag-name">{{ tag.name }}</span>
              </button>
              <button
                type="button"
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
            <Plus :size="16" />
            <span class="tag-name">Добавить</span>
          </button>
        </div>

          <div class="available-tags">
          <div class="available-tags__label">Выбрать из существующих</div>
          <div class="tags-cloud">
            <template v-if="allTags.length">
              <template v-if="availableTags.length">
                <template v-for="tag in availableTags" :key="tag.id">
                  <button
                    type="button"
                    class="tag-btn"
                    :style="{ '--tag-color': tag.color || 'var(--accent)' }"
                    @click="selectExistingTag(tag)"
                  >
                    <span class="tag-dot" />
                    <span class="tag-name">{{ tag.name }}</span>
                  </button>
                </template>
              </template>
              <p v-else class="helper-text">Все теги выбраны</p>
            </template>
            <p v-else class="helper-text">Нет тегов</p>
          </div>
        </div>
      </AppFormField>

      <label v-if="!editing && form.type !== 'HABIT'" class="checkbox-label">
        <input type="checkbox" v-model="createBranch" />
        <span class="checkmark"></span>
        <span class="checkbox-text">Создать ветку по задаче</span>
      </label>
    </div>

    <template #footer>
      <div class="modal-actions">
        <AppButton variant="secondary" @click="emit('close')">Отмена</AppButton>
        <AppButton type="submit" variant="primary">
          {{ editing ? 'Сохранить' : submitButtonText }}
        </AppButton>
      </div>
    </template>
  </AppModal>

  <AppModal
    v-if="showAddTagModal"
    title="Новый тег"
    size="sm"
    as-form
    @close="closeAddTagModal"
    @submit="createTag"
  >
    <div class="modal-form">
      <AppFormField label="Название">
        <AppInput v-model="newTagName" placeholder="Тег" required />
      </AppFormField>

      <AppFormField label="Ветка">
        <AppSelect
          v-model="newTagBranchId"
          :options="branchOptions"
          placeholder="Для задачи"
        />
      </AppFormField>

      <AppFormField label="Цвет">
        <div class="tag-color-row">
          <AppColorPicker v-model="newTagColor" />
          <AppCustomColorPicker v-model="newTagColor" />
        </div>
      </AppFormField>
    </div>

    <template #footer>
      <div class="modal-actions">
        <AppButton variant="secondary" @click="closeAddTagModal">Отмена</AppButton>
        <AppButton
          type="submit"
          variant="primary"
        >
          Создать
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { reactive, watch, ref, computed } from 'vue'
import { X, Plus } from 'lucide-vue-next'
import { v4 as uuidv4 } from 'uuid'
import { useBranchesStore } from '~/stores/branches.store'
import { useTagsStore } from '~/stores/tags.store'
import { useNotification } from '~/composables/useNotification'
import AppButton from '~/components/ui/AppButton.vue'
import AppColorPicker from '~/components/ui/AppColorPicker.vue'
import AppCustomColorPicker from '~/components/ui/AppCustomColorPicker.vue'
import AppDatePicker from '~/components/ui/AppDatePicker.vue'
import AppFormField from '~/components/ui/AppFormField.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppModal from '~/components/ui/AppModal.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import type { AppSelectOption } from '~/types/ui.types'
import type { BranchId } from '~/types/branch.types'
import type { Task, TaskTag } from '~/types/task.types'
import type { Tag, TagScope } from '~/types/tag.types'

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
const branchesStore = useBranchesStore()
const { addNotification } = useNotification()
const editing = computed(() => !!props.task)
const createBranch = ref(false)
const taskTypeOptions: AppSelectOption[] = [
  { label: 'На день', value: 'TASK_DAY' },
  { label: 'На неделю', value: 'TASK_WEEK' },
  { label: 'На месяц', value: 'TASK_MONTH' },
  { label: 'На год', value: 'TASK_YEAR' },
]
const branchOptions = computed<AppSelectOption[]>(() =>
  [
    { label: 'Без ветки', value: '' },
    ...branchesStore.branches.map((branch) => ({
      label: branch.displayName,
      value: branch.id,
    })),
  ]
)
const form = reactive({
  title: '',
  description: '',
  type: props.defaultType || 'HABIT',
  targetDate: '',
  tagIds: [] as string[],
  tags: [] as TaskTag[],
})

const currentScope = computed<TagScope>(() =>
  form.type === 'HABIT' ? 'habit' : 'task'
)

const allTags = computed<Tag[]>(() => tagsStore.getTagsByScope(currentScope.value))
const availableTags = computed<Tag[]>(() =>
  allTags.value.filter((tag) => !form.tagIds.includes(tag.id))
)

const modalTitle = computed(() => {
  if (editing.value) return 'Редактирование задачи'
  return form.type === 'HABIT' ? 'Новая привычка' : 'Новая задача'
})

const submitButtonText = computed(() => {
  return form.type === 'HABIT' ? 'Добавить привычку' : 'Создать задачу'
})

const titlePlaceholder = computed(() => {
  return form.type === 'HABIT'
    ? 'Пример: бег по утрам'
    : 'Пример: подготовить отчёт'
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
      form.tags = getTaskTags(newTask)
      createBranch.value = false
    } else {
      form.title = ''
      form.description = ''
      form.type = props.defaultType || 'HABIT'
      form.targetDate = ''
      form.tagIds = []
      form.tags = []
      createBranch.value = false
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

function handleSubmit() {
  if (!form.title.trim()) return

  emit('save', {
    ...form,
    title: form.title.trim(),
    description: form.description.trim(),
    tagIds: [],
    tags: form.tags.map((tag, index) => ({ ...tag, order: index })),
    createBranch: !editing.value && createBranch.value,
  })
}
const showAddTagModal = ref(false)
const newTagName = ref('')
const newTagBranchId = ref<BranchId | ''>('')
const newTagColor = ref('var(--success)')

function openAddTagModal() {
  newTagName.value = ''
  newTagBranchId.value = ''
  newTagColor.value = 'var(--success)'
  showAddTagModal.value = true
}

function closeAddTagModal() {
  showAddTagModal.value = false
}

function createTag() {
  if (!newTagName.value.trim()) return
  if (newTagBranchId.value && !branchesStore.branches.some((branch) => branch.id === newTagBranchId.value)) return

  const name = newTagName.value.trim()
  const existingGlobal = tagsStore.tags.find(
    (tag) => tag.name.toLowerCase() === name.toLowerCase() && tag.scope === currentScope.value
  )
  if (existingGlobal) {
    if (!form.tagIds.includes(existingGlobal.id)) {
      selectExistingTag(existingGlobal)
      addNotification({ type: 'success', message: `Тег «${name}» добавлен к задаче` })
    } else {
      addNotification({ type: 'warning', message: 'Такой тег уже существует' })
    }
    closeAddTagModal()
    return
  }

  const tag = tagsStore.addTag({
    name,
    branchId: newTagBranchId.value,
    color: newTagColor.value,
    scope: currentScope.value,
    order: tagsStore.tags.length,
  })

  form.tags.push({ ...tag, order: form.tags.length })
  form.tagIds.push(tag.id)

  addNotification({ type: 'success', message: `Тег «${name}» добавлен` })
  closeAddTagModal()
}

function selectExistingTag(tag: Tag) {
  if (form.tagIds.includes(tag.id)) return
  form.tags.push({
    id: tag.id,
    name: tag.name,
    branchId: tag.branchId,
    color: tag.color,
    order: form.tags.length,
  })
  form.tagIds.push(tag.id)
}

function deleteTag(tagId: string) {
  const index = form.tags.findIndex((tag) => tag.id === tagId)
  if (index === -1) return
  form.tags.splice(index, 1)
  form.tagIds = form.tagIds.filter((id) => id !== tagId)
  addNotification({ type: 'success', message: 'Тег удалён' })
}

function getTaskTags(task: Task): TaskTag[] {
  if (task.tags?.length) {
    return task.tags.map((tag, index) => ({ ...tag, order: tag.order ?? index }))
  }

  return tagsStore.getTagsByIds(task.tagIds).map((tag, index) => ({
    id: uuidv4(),
    name: tag.name,
    branchId: tag.branchId,
    color: tag.color,
    order: index,
  }))
}
</script>

<style scoped lang="scss">
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: var(--accent);
  font-size: 0.95rem;
  cursor: pointer;

  input[type='checkbox'] {
    display: none;
  }

  .checkmark {
    @include glass;
    position: relative;
    display: inline-block;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    border: 2px solid var(--border);
    border-radius: var(--border-radius-sm);
    transition: all var(--transition-standard);

    &::after {
      position: absolute;
      display: none;
      left: 6px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid var(--bg);
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      content: '';
    }
  }

  input[type='checkbox']:checked + .checkmark {
    background: var(--accent);
    border-color: var(--accent);

    &::after {
      display: block;
    }
  }
}

.tag-color-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
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
    @include glass;
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    padding: 7px 12px 7px 10px;
    border: 1px solid color-mix(in srgb, var(--tag-color, var(--accent)) 22%, var(--border));
    border-radius: var(--border-radius-md);
    color: var(--tag-color, var(--accent));
    background: color-mix(in srgb, var(--tag-color, var(--accent)) 6%, transparent);
    font-size: 0.85rem;
    font-weight: 500;
    transition: all var(--transition-standard);
    cursor: pointer;

    &:hover {
      border-color: color-mix(in srgb, var(--tag-color, var(--accent)) 42%, var(--border));
      color: var(--tag-color, var(--accent));
    }

    &.active {
      background: color-mix(in srgb, var(--tag-color, var(--accent)) 12%, transparent);
      border-color: color-mix(in srgb, var(--tag-color, var(--accent)) 72%, var(--border));
      color: var(--tag-color, var(--accent));
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tag-color, var(--accent)) 18%, transparent);
    }
  }

  .tag-dot {
    flex: 0 0 auto;
    width: 10px;
    height: 10px;
    border-radius: var(--border-radius-pill);
    background: var(--tag-color, var(--accent));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--tag-color, var(--accent)) 12%, transparent);
  }

  .tag-delete {
    @include glass;
    position: absolute;
    top: -7px;
    right: -7px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 19px;
    height: 19px;
    border-radius: var(--border-radius-pill);
    border: 1px solid var(--glass-border);
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
    background: var(--glass-surface);
    border: 1px dashed var(--border);
    color: var(--dim);
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      background: color-mix(in srgb, var(--accent) 7%, transparent);
      border-style: solid;
    }
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .tags-cloud {
    gap: 6px;

    .tag-btn {
      padding: 6px 12px;
      font-size: 0.8rem;
    }
  }
}

@media (max-width: 480px) {
  .tags-cloud {
    gap: 4px;

    .tag-btn {
      padding: 4px 8px;
      font-size: 0.75rem;
    }
  }
}
</style>
