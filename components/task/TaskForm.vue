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
          placeholder="Дополнительные детали (необязательно)"
        />
      </AppFormField>

      <div v-if="!hideType && form.type !== 'HABIT'" class="form-row">
        <AppFormField label="Тип">
          <AppSelect v-model="form.type" :options="taskTypeOptions" />
        </AppFormField>

        <AppFormField label="Срок">
          <div class="date-wrapper">
            <AppInput v-model="form.targetDate" type="date" />
            <Calendar :size="16" class="date-icon" />
          </div>
        </AppFormField>
      </div>

      <AppFormField label="Теги">
        <div class="tags-cloud">
          <template v-for="tag in visibleTags" :key="tag.id">
            <div class="tag-wrapper">
              <button
                type="button"
                class="tag-btn"
                :class="{ active: form.tagIds.includes(tag.id) }"
                :style="{ '--tag-color': tag.color || 'var(--accent)' }"
                :aria-pressed="form.tagIds.includes(tag.id)"
                @click="toggleTag(tag.id)"
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
            style="--tag-color: var(--accent)"
            @click="openAddTagModal"
            title="Добавить тег"
          >
            <Plus :size="16" />
            <span class="tag-name">Добавить</span>
          </button>
        </div>
      </AppFormField>

      <label v-if="!editing && form.type !== 'HABIT'" class="checkbox-label">
        <input type="checkbox" v-model="createBranch" />
        <span class="checkmark"></span>
        <span class="checkbox-text">Создать ветку из задачи</span>
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
        <AppInput v-model="newTagName" placeholder="Важно" required />
      </AppFormField>

      <AppFormField label="Ветка">
        <AppSelect
          v-model="newTagBranchId"
          :options="branchOptions"
          :disabled="branchOptions.length === 0"
          placeholder="Сначала создайте ветку"
        />
      </AppFormField>

      <AppFormField label="Цвет">
        <AppColorPicker v-model="newTagColor" />
      </AppFormField>
    </div>

    <template #footer>
      <div class="modal-actions">
        <AppButton variant="secondary" @click="closeAddTagModal">Отмена</AppButton>
        <AppButton
          type="submit"
          variant="primary"
          :disabled="branchOptions.length === 0"
        >
          Создать
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { reactive, watch, ref, computed } from 'vue'
import { X, Calendar, Plus } from 'lucide-vue-next'
import { useBranchesStore } from '~/stores/branches.store'
import { useTagsStore } from '~/stores/tags.store'
import { useNotification } from '~/composables/useNotification'
import AppButton from '~/components/ui/AppButton.vue'
import AppColorPicker from '~/components/ui/AppColorPicker.vue'
import AppFormField from '~/components/ui/AppFormField.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppModal from '~/components/ui/AppModal.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import type { AppSelectOption } from '~/types/ui.types'
import type { BranchId } from '~/types/branch.types'
import type { TagScope } from '~/types/tag.types'
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
  branchesStore.branches.map((branch) => ({
    label: branch.displayName,
    value: branch.id,
  }))
)
const currentTagScope = computed<TagScope>(() =>
  form.type === 'HABIT' ? 'habit' : 'task'
)
const visibleTags = computed(() => tagsStore.getTagsByScope(currentTagScope.value))

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
      createBranch.value = false
    } else {
      form.title = ''
      form.description = ''
      form.type = props.defaultType || 'HABIT'
      form.targetDate = ''
      form.tagIds = []
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

function toggleTag(tagId: string) {
  const index = form.tagIds.indexOf(tagId)
  if (index === -1) {
    form.tagIds.push(tagId)
  } else {
    form.tagIds.splice(index, 1)
  }
}

function handleSubmit() {
  if (!form.title.trim()) return
  const existingTagIds = new Set(visibleTags.value.map((tag) => tag.id))

  emit('save', {
    ...form,
    title: form.title.trim(),
    description: form.description.trim(),
    tagIds: form.tagIds.filter((tagId) => existingTagIds.has(tagId)),
    createBranch: !editing.value && createBranch.value,
  })
}
const showAddTagModal = ref(false)
const newTagName = ref('')
const newTagBranchId = ref<BranchId | ''>('')
const newTagColor = ref('var(--success)')

function openAddTagModal() {
  newTagName.value = ''
  newTagBranchId.value = branchesStore.branches[0]?.id || ''
  newTagColor.value = 'var(--success)'
  showAddTagModal.value = true
}

function closeAddTagModal() {
  showAddTagModal.value = false
}

function createTag() {
  if (!newTagName.value.trim()) return
  if (!newTagBranchId.value || !branchesStore.branches.some((branch) => branch.id === newTagBranchId.value)) {
    addNotification({ type: 'warning', message: 'Сначала создайте ветку для тега' })
    return
  }

  const name = newTagName.value.trim()

  const existing = tagsStore.tags.find(
    (t) =>
      t.scope === currentTagScope.value &&
      t.name.toLowerCase() === name.toLowerCase()
  )
  if (existing) {
    addNotification({ type: 'warning', message: 'Такой тег уже существует' })
    return
  }

  const tag = tagsStore.addTag({
    name,
    branchId: newTagBranchId.value,
    color: newTagColor.value,
    scope: currentTagScope.value,
    order: 999,
  })
  if (!form.tagIds.includes(tag.id)) {
    form.tagIds.push(tag.id)
  }

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
    addNotification({ type: 'error', message: 'Не удалось удалить тег' })
  }
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

.date-wrapper {
  position: relative;

  :deep(input[type='date']) {
    padding-right: 42px;
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
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 34px;
    padding: 7px 11px;
    background:
      linear-gradient(color-mix(in srgb, var(--tag-color) 8%, transparent), color-mix(in srgb, var(--tag-color) 8%, transparent)),
      var(--surface);
    border: 1px solid color-mix(in srgb, var(--tag-color) 30%, var(--border));
    border-radius: var(--border-radius-sm);
    color: var(--accent);
    font-size: 0.85rem;
    font-weight: 500;
    transition: all var(--transition-standard);
    cursor: pointer;

    &:hover {
      background:
        linear-gradient(color-mix(in srgb, var(--tag-color) 12%, transparent), color-mix(in srgb, var(--tag-color) 12%, transparent)),
        var(--surface);
      border-color: color-mix(in srgb, var(--tag-color) 55%, var(--border));
      color: var(--accent);
    }

    &.active {
      background:
        linear-gradient(color-mix(in srgb, var(--tag-color) 16%, transparent), color-mix(in srgb, var(--tag-color) 16%, transparent)),
        var(--surface);
      border-color: var(--tag-color);
      color: var(--accent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--tag-color) 12%, transparent);
    }
  }

  .tag-dot {
    flex: 0 0 auto;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--tag-color);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--tag-color) 18%, transparent);
  }

  .tag-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
      background: color-mix(in srgb, var(--accent) 8%, transparent);
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
