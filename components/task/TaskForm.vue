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
            <div class="tag-wrapper" :style="{ '--tag-color': tag.color || 'var(--accent)' }">
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
                aria-label="Отвязать тег"
                data-tooltip="Отвязать тег"
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
            data-tooltip="Добавить тег"
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
import { reactive, watch, ref, computed } from 'vue'
import { X, Plus } from 'lucide-vue-next'
import { useBranchesStore } from '~/stores/branches.store'
import { useTagsStore } from '~/stores/tags.store'
import { useNotification } from '~/composables/useNotification'
import AppButton from '~/components/ui/primitives/AppButton.vue'
import AppColorPicker from '~/components/ui/forms/AppColorPicker.vue'
import AppCustomColorPicker from '~/components/ui/forms/AppCustomColorPicker.vue'
import AppDatePicker from '~/components/ui/forms/AppDatePicker.vue'
import AppFormField from '~/components/ui/forms/AppFormField.vue'
import AppInput from '~/components/ui/primitives/AppInput.vue'
import AppModal from '~/components/ui/overlays/AppModal.vue'
import AppSelect from '~/components/ui/forms/AppSelect.vue'
import AppSwitch from '~/components/ui/primitives/AppSwitch.vue'
import AppTimePicker from '~/components/ui/forms/AppTimePicker.vue'
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
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.form-toggle-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: var(--control-height-md);
  margin: 0;
  color: var(--text);
  font-size: 0.95rem;
  line-height: 1.3;
}

.tag-color-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.available-tags {
  display: grid;
  gap: 8px;
  margin-top: 2px;
}

.available-tags__label {
  color: var(--dim);
  font-size: 0.78rem;
  line-height: 1.35;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .tag-wrapper {
    display: inline-flex;
    align-items: center;
    border-radius: var(--border-radius-pill);
    background: color-mix(in srgb, var(--tag-color, var(--accent)) 10%, transparent);
  }

  .tag-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: var(--control-height-md);
    padding: 7px 10px;
    border: none;
    border-radius: var(--border-radius-pill);
    color: var(--text);
    background: transparent;
    font-size: 0.85rem;
    font-weight: 500;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);
    cursor: pointer;

    &:hover {
      background: color-mix(in srgb, var(--tag-color, var(--accent)) 8%, transparent);
      color: var(--text);
    }

    &.active {
      padding-right: 4px;
      background: transparent;
      color: var(--text);
    }
  }

  .tag-dot {
    flex: 0 0 auto;
    width: 12px;
    height: 12px;
    border-radius: var(--border-radius-pill);
    background: var(--tag-color, var(--accent));
  }

  .tag-delete {
    display: inline-grid;
    place-items: center;
    width: 28px;
    height: 28px;
    margin-right: 3px;
    padding: 0;
    border-radius: var(--border-radius-pill);
    background: transparent;
    border: none;
    color: var(--dim);
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &:hover {
      background: color-mix(in srgb, var(--error) 10%, transparent);
      color: var(--error);
    }
  }

  .add-tag-btn {
    background: transparent;
    border: none;
    color: var(--dim);
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      background: color-mix(in srgb, var(--accent) 7%, transparent);
    }
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}

@media (max-width: 640px) {
  .modal-form {
    gap: 14px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .available-tags {
    gap: 6px;
  }

  .tags-cloud {
    gap: 6px;

    .tag-btn {
      min-height: 44px;
      padding: 6px 12px;
      font-size: 0.8rem;
    }

    .tag-delete {
      width: 44px;
      height: 44px;
    }
  }
}

@media (max-width: 480px) {
  .tags-cloud {
    gap: 4px;

    .tag-btn {
      min-height: 44px;
      padding: 4px 8px;
      font-size: 0.75rem;
    }
  }
}
</style>
