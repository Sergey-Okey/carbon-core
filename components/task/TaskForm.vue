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

        <AppFormField :label="scheduleLabel">
          <AppTimePicker v-if="isTodayTask" v-model="form.targetTime" />
          <AppDatePicker v-else v-model="form.targetDate" />
        </AppFormField>
      </div>

      <AppFormField label="Теги">
        <div class="tags-cloud">
          <template v-for="tag in form.tags" :key="tag.id">
            <div class="tag-wrapper" :style="{ '--tag-color': tag.color || 'var(--color-accent)' }">
              <button
                type="button"
                class="tag-btn active"
                aria-pressed="true"
                :style="{ '--tag-color': tag.color || 'var(--color-accent)' }"
              >
                <span class="tag-dot" />
                <span class="tag-name">{{ tag.name }}</span>
              </button>
              <button
                type="button"
                class="tag-delete"
                @click.stop="deleteTag(tag.id)"
                aria-label="Отвязать тег"
              >
                <X :size="14" />
              </button>
            </div>
          </template>
          <button
            type="button"
            class="tag-btn add-tag-btn"
            @click="openAddTagModal"
            aria-label="Добавить тег"
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
                    :style="{ '--tag-color': tag.color || 'var(--color-accent)' }"
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

      <div v-if="!editing && form.type !== 'HABIT'" class="form-toggle-row">
        <span class="checkbox-text">Создать ветку по задаче</span>
        <AppSwitch v-model="createBranch" aria-label="Создать ветку по задаче" />
      </div>
    </div>

    <template #footer>
      <div class="modal-actions">
        <AppButton variant="secondary" @click="emit('close')">Отмена</AppButton>
        <AppButton type="submit" variant="primary" data-tour="task-save">
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
import { X, Plus } from 'lucide-vue-next'
import type { AppSelectOption } from '~/types/ui.types'
import type { BranchId } from '~/types/branch.types'
import type { Task, TaskFormData, TaskTag, TaskType } from '~/types/task.types'
import type { Tag } from '~/types/tag.types'

const props = defineProps<{
  task?: Task
  defaultType?: TaskType
  hideType?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: TaskFormData): void
}>()

const tagsStore = useTagsStore()
const branchesStore = useBranchesStore()
const { success, warning } = useNotification()
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
  targetTime: '09:00',
  tagIds: [] as string[],
  tags: [] as TaskTag[],
})

const allTags = computed<Tag[]>(() => tagsStore.tags)
const availableTags = computed<Tag[]>(() =>
  allTags.value.filter((tag) => !form.tagIds.includes(tag.id))
)
const isTodayTask = computed(() => form.type === 'TASK_DAY')
const scheduleLabel = computed(() => (isTodayTask.value ? 'Время' : 'Дата'))

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
      form.targetTime = newTask.targetTime || '09:00'
      form.tagIds = [...newTask.tagIds]
      form.tags = getTaskTags(newTask)
      createBranch.value = false
    } else {
      form.title = ''
      form.description = ''
      form.type = props.defaultType || 'HABIT'
      form.targetDate = ''
      form.targetTime = '09:00'
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

watch(
  () => form.type,
  (newType) => {
    if (newType === 'TASK_DAY') {
      form.targetDate = getTodayDateString()
      if (!form.targetTime) form.targetTime = '09:00'
      return
    }

    form.targetTime = ''
    if (!form.targetDate) form.targetDate = getTodayDateString()
  },
  { immediate: true }
)

function handleSubmit() {
  if (!form.title.trim()) return

  emit('save', {
    ...form,
    title: form.title.trim(),
    description: form.description.trim(),
    targetDate: form.type === 'TASK_DAY' ? getTodayDateString() : form.targetDate,
    targetTime: form.type === 'TASK_DAY' ? form.targetTime : '',
    tagIds: [...form.tagIds],
    tags: form.tags.map((tag, index) => ({ ...tag, order: index })),
    createBranch: !editing.value && createBranch.value,
  })
}
const showAddTagModal = ref(false)
const newTagName = ref('')
const newTagBranchId = ref<BranchId | ''>('')
const newTagColor = ref('var(--color-success)')

function openAddTagModal() {
  newTagName.value = ''
  newTagBranchId.value = ''
  newTagColor.value = 'var(--color-success)'
  showAddTagModal.value = true
}

function closeAddTagModal() {
  showAddTagModal.value = false
}

function createTag() {
  if (!newTagName.value.trim()) return
  if (newTagBranchId.value && !branchesStore.branches.some((branch) => branch.id === newTagBranchId.value)) return

  const name = newTagName.value.trim()
  const existingGlobal = tagsStore.findTagByName(name, newTagBranchId.value)
  if (existingGlobal) {
    if (!form.tagIds.includes(existingGlobal.id)) {
      selectExistingTag(existingGlobal)
      success(`Тег «${name}» добавлен`)
    } else {
      warning('Этот тег уже выбран')
    }
    closeAddTagModal()
    return
  }

  const tag = tagsStore.addTag({
    name,
    branchId: newTagBranchId.value,
    color: newTagColor.value,
    order: tagsStore.tags.length,
  })

  form.tags.push({ ...tag, order: form.tags.length })
  form.tagIds.push(tag.id)

  success(`Тег «${name}» создан`)
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
  success('Тег отвязан')
}

function getTaskTags(task: Task): TaskTag[] {
  if (task.tags?.length) {
    return task.tags.map((tag, index) => ({ ...tag, order: tag.order ?? index }))
  }

  return tagsStore.getTagsByIds(task.tagIds).map((tag, index) => ({
    id: tag.id,
    name: tag.name,
    branchId: tag.branchId,
    color: tag.color,
    order: index,
  }))
}

function getTodayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped lang="scss">
.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-width: 0;
  width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  align-items: start;

  @include mobile {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}

.form-toggle-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--control-height-md);
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--body-size);
  line-height: var(--body-leading);
}

.tag-color-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.available-tags {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.available-tags__label,
.helper-text {
  @include meta-text;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);

  .tag-wrapper {
    display: inline-flex;
    align-items: center;
    border-radius: var(--radius-full);
    background: color-mix(in srgb, var(--tag-color, var(--color-accent)) 10%, transparent);
  }

  .tag-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: var(--control-height-md);
    padding: var(--space-2) var(--space-3);
    border: none;
    border-radius: var(--radius-full);
    color: var(--color-text-primary);
    background: transparent;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    transition:
      background var(--transition-standard),
      color var(--transition-standard);
    cursor: pointer;

    &:hover {
      background: color-mix(in srgb, var(--tag-color, var(--color-accent)) 8%, transparent);
    }

    &.active {
      padding-inline-end: var(--space-1);
    }
  }

  .tag-dot {
    flex: 0 0 auto;
    width: 12px;
    height: 12px;
    border-radius: var(--radius-full);
    background: var(--tag-color, var(--color-accent));
  }

  .tag-delete {
    display: inline-grid;
    place-items: center;
    width: 28px;
    height: 28px;
    margin-inline-end: var(--space-1);
    padding: 0;
    border-radius: var(--radius-full);
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &:hover {
      background: color-mix(in srgb, var(--color-error) 10%, transparent);
      color: var(--color-error);
    }
  }

  .add-tag-btn {
    background: transparent;
    border: var(--ui-border);
    border-style: dashed;
    color: var(--color-text-muted);

    &:hover {
      background: color-mix(in srgb, var(--color-accent) 7%, transparent);
      color: var(--color-text-primary);
    }
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  width: 100%;

  @include mobile {
    flex-direction: column-reverse;
    gap: var(--space-2);

    :deep(.app-button) {
      width: 100%;
      min-height: var(--space-11);
    }
  }
}
</style>