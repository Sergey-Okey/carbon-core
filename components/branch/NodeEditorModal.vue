<template>
  <AppModal
    :title="props.isCreateMode ? 'Новый этап' : 'Редактировать этап'"
    kicker="Этап"
    as-form
    size="md"
    allow-overflow
    @close="emit('close')"
    @submit="handleSubmit"
  >
    <div class="board-form">
      <AppFormField
        label="Название"
        for-id="milestone-name"
        :error="nameTouched && !canSubmit ? 'Укажите название этапа' : undefined"
      >
        <AppInput
          id="milestone-name"
          v-model="form.name"
          placeholder="Название этапа"
          :invalid="nameTouched && !canSubmit"
          @blur="nameTouched = true"
        />
      </AppFormField>

      <AppFormField label="Описание" for-id="milestone-description">
        <AppInput
          id="milestone-description"
          v-model="form.description"
          multiline
          placeholder="Краткое описание этапа..."
          :rows="3"
        />
      </AppFormField>

      <AppFormField label="Иконка">
        <div class="icon-section">
          <button type="button" class="toggle-btn" @click="iconsExpanded = !iconsExpanded">
            <span class="selected-icon">
              <component :is="iconComponent(form.icon)" :size="20" />
            </span>
            <ChevronDown :size="16" :class="{ rotated: iconsExpanded }" />
          </button>

          <Transition name="expand">
            <div v-if="iconsExpanded" class="icons-grid">
              <button
                v-for="icon in iconOptions"
                :key="icon"
                type="button"
                class="icon-option"
                :class="{ active: form.icon === icon }"
                :title="icon"
                @click="form.icon = icon"
              >
                <component :is="iconComponent(icon)" :size="20" />
              </button>
            </div>
          </Transition>
        </div>
      </AppFormField>

      <AppFormField label="Привязанные задачи">
        <div class="tasks-section">
          <button type="button" class="toggle-btn" @click="tasksExpanded = !tasksExpanded">
            <span>Выбрать задачи ({{ form.taskIds.length }})</span>
            <ChevronDown :size="16" :class="{ rotated: tasksExpanded }" />
          </button>

          <Transition name="expand">
            <div v-if="tasksExpanded" class="tasks-list">
              <label
                v-for="task in activeTasks"
                :key="task.id"
                class="task-row"
                :class="{ selected: form.taskIds.includes(task.id) }"
              >
                <span class="custom-checkbox">
                  <input v-model="form.taskIds" type="checkbox" :value="task.id" />
                  <span class="checkmark"></span>
                </span>
                <span class="task-title">{{ task.title }}</span>
                <span class="task-marker" :class="task.type" :title="taskTypeMeta(task.type).title">
                  {{ taskTypeMeta(task.type).label }}
                </span>
              </label>

              <div v-if="activeTasks.length === 0" class="empty-list">
                Нет доступных задач
              </div>
            </div>
          </Transition>
        </div>
      </AppFormField>
    </div>

    <template #footer>
      <AppButton
        v-if="!props.isCreateMode"
        type="button"
        variant="danger"
        @click="handleDelete"
      >
        Удалить
      </AppButton>
      <div class="footer-actions">
        <AppButton type="button" variant="secondary" @click="emit('close')">
          Отмена
        </AppButton>
        <AppButton type="submit" variant="primary" :disabled="!canSubmit">
          {{ props.isCreateMode ? 'Создать' : 'Сохранить' }}
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  Award,
  BookOpen,
  Brain,
  Briefcase,
  Camera,
  ChevronDown,
  Code,
  Coffee,
  Dumbbell,
  Globe,
  Heart,
  Music,
  Target,
  TrendingUp,
  Users,
} from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import AppFormField from '~/components/ui/AppFormField.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppModal from '~/components/ui/AppModal.vue'
import { useConfirm } from '~/composables/useConfirm'
import { useTasksStore } from '~/stores/tasks.store'
import type { Milestone } from '~/types/branch.types'

const props = defineProps<{ milestone: Milestone; isCreateMode?: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', updates: Partial<Milestone>): void
  (e: 'delete'): void
}>()

const tasksStore = useTasksStore()
const { confirm } = useConfirm()
const iconsExpanded = ref(false)
const tasksExpanded = ref(false)
const nameTouched = ref(false)

const iconOptions = [
  'trending-up',
  'dumbbell',
  'brain',
  'users',
  'target',
  'briefcase',
  'heart',
  'book-open',
  'globe',
  'award',
  'coffee',
  'music',
  'camera',
  'code',
]

const iconComponent = (name: string) => {
  const map: Record<string, any> = {
    'trending-up': TrendingUp,
    dumbbell: Dumbbell,
    brain: Brain,
    users: Users,
    target: Target,
    briefcase: Briefcase,
    heart: Heart,
    'book-open': BookOpen,
    globe: Globe,
    award: Award,
    coffee: Coffee,
    music: Music,
    camera: Camera,
    code: Code,
  }
  return map[name] || Target
}

const activeTasks = computed(() => tasksStore.tasks.filter((task) => !task.done))
const canSubmit = computed(() => form.name.trim().length > 0)

function taskTypeMeta(type: string) {
  const map: Record<string, { label: string; title: string }> = {
    HABIT: { label: 'П', title: 'Привычка' },
    TASK_DAY: { label: 'Д', title: 'День' },
    TASK_WEEK: { label: 'Н', title: 'Неделя' },
    TASK_MONTH: { label: 'М', title: 'Месяц' },
    TASK_YEAR: { label: 'Г', title: 'Год' },
    PURCHASE: { label: 'К', title: 'Покупка' },
  }

  return map[type] || { label: type.charAt(0).toUpperCase(), title: type }
}

const form = reactive({
  name: '',
  description: '',
  icon: 'target',
  taskIds: [] as string[],
})

watch(
  () => props.milestone,
  (newVal) => {
    nameTouched.value = false
    iconsExpanded.value = false
    tasksExpanded.value = false

    if (newVal) {
      form.name = newVal.name
      form.description = newVal.description || ''
      form.icon = newVal.icon || 'target'
      form.taskIds = [...(newVal.taskIds || [])]
    }
  },
  { immediate: true }
)

function handleSubmit() {
  nameTouched.value = true
  if (!canSubmit.value) return
  emit('save', {
    name: form.name.trim(),
    description: form.description,
    icon: form.icon,
    taskIds: form.taskIds,
  })
}

async function handleDelete() {
  const ok = await confirm('Удалить этот этап?')
  if (!ok) return
  emit('delete')
  emit('close')
}
</script>

<style scoped lang="scss">
.board-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.icon-section,
.tasks-section {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: var(--control-height-md);
  padding: 0 14px;
  color: var(--accent);
  background: transparent;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--accent);
  }

  .rotated {
    transform: rotate(180deg);
  }
}

.selected-icon {
  display: inline-flex;
  align-items: center;
  color: var(--accent);
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(38px, 1fr));
  gap: 8px;
}

.icon-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  color: var(--dim);
  background: transparent;
  border: none;
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  transition:
    color var(--transition-standard),
    background var(--transition-standard);

  &:hover {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }

  &.active {
    color: var(--bg);
    background: var(--accent);
  }

  &.active:hover {
    color: var(--bg);
    background: var(--accent);
  }
}

.tasks-list {
  @include glass;
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 8px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  padding: 8px;
  overflow-y: auto;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
}

.task-row {
  @include glass;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: var(--accent);
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;

  &.selected {
    background: var(--accent);
    color: var(--bg);

    .task-marker {
      color: color-mix(in srgb, var(--bg) 72%, transparent);
    }
  }

  &.selected:hover {
    background: var(--accent);
    color: var(--bg);
  }
}

.custom-checkbox {
  position: relative;
  width: 18px;
  height: 18px;

  input {
    position: absolute;
    opacity: 0;
    inset: 0;
  }
}

.checkmark {
  display: block;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: var(--border-radius-sm);
  background: var(--glass-surface);

  input:checked + & {
    background: var(--accent);
    border-color: var(--accent);
  }
}

.task-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-marker,
.empty-list {
  color: var(--dim);
  font-size: 0.85rem;
}

.task-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
}

.empty-list {
  padding: 12px;
  text-align: center;
  background: var(--glass-surface);
  border: none;
  border-radius: var(--border-radius-lg);
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-left: auto;
}

.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .footer-actions {
    width: 100%;
    flex-direction: column;
    margin-left: 0;
  }

  .toggle-btn,
  .icon-option {
    min-height: 44px;
  }

  .task-row {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .task-marker {
    grid-column: 2;
  }
}
</style>
