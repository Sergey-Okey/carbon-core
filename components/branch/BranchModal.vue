<template>
  <AppModal
    :title="branch ? 'Редактировать ветку' : 'Новая ветка'"
    kicker="Ветка"
    as-form
    size="lg"
    allow-overflow
    @close="emit('close')"
    @submit="handleSubmit"
  >
    <div class="board-form">
      <AppFormField
        label="Название"
        for-id="branch-name"
        :error="nameTouched && !canSubmit ? 'Укажите название ветки' : undefined"
      >
        <AppInput
          id="branch-name"
          v-model="form.name"
          placeholder="Название ветки"
          :invalid="nameTouched && !canSubmit"
          @blur="nameTouched = true"
        />
      </AppFormField>

      <AppFormField label="Описание" for-id="branch-description">
        <AppInput
          id="branch-description"
          v-model="form.description"
          multiline
          placeholder="Опишите направление..."
          :rows="3"
        />
      </AppFormField>

      <div class="visual-row">
        <AppFormField label="Иконка">
          <div class="icon-section">
              <TransitionGroup name="reveal-item" tag="div" class="icons-grid">
                <button
                  v-for="icon in visibleIconOptions"
                  :key="icon"
                  type="button"
                  class="icon-option"
                  :class="{ active: form.icon === icon }"
                  :aria-label="icon"
                  @click="form.icon = icon"
                >
                  <component :is="iconComponent(icon)" :size="20" />
                </button>
              </TransitionGroup>
              <button type="button" class="icons-toggle" @click="iconsExpanded = !iconsExpanded">
                {{ iconsExpanded ? 'Скрыть иконки' : `Ещё ${iconOptions.length - 9}` }}
                <ChevronDown :size="15" :class="{ rotated: iconsExpanded }" />
              </button>
          </div>
        </AppFormField>

        <AppFormField label="Цвет маркера">
          <AppCustomColorPicker v-model="form.markerColor" label="Выбрать цвет" />
        </AppFormField>
      </div>

      <AppFormField v-if="branch" label="Задачи ветки">
        <div class="tasks-section">
          <button type="button" class="toggle-btn" :class="{ expanded: tasksExpanded }" @click="tasksExpanded = !tasksExpanded">
            <span>Выбрать задачи ({{ form.taskIds.length }})</span>
            <ChevronDown :size="16" :class="{ rotated: tasksExpanded }" />
          </button>
          <Transition name="expand">
            <div v-if="tasksExpanded" class="tasks-list">
              <label
                v-for="task in availableTasks"
                :key="task.id"
                class="task-row"
                :class="{ selected: form.taskIds.includes(task.id) }"
                @click.prevent="toggleTask(task.id)"
              >
                <component :is="taskIcon(task.type)" :size="16" class="task-icon" />
                <span class="custom-checkbox">
                  <input type="checkbox" :checked="form.taskIds.includes(task.id)" />
                  <span class="checkmark"></span>
                </span>
                <span class="task-main">
                  <span class="task-title">{{ task.title }}</span>
                  <span v-if="task.done" class="task-state done">
                    Выполнена
                  </span>
                </span>
              </label>
              <button type="button" class="create-task-btn" @click="showQuickTask = true">
                <Plus :size="16" /> Создать и привязать задачу
              </button>
            </div>
          </Transition>
        </div>
      </AppFormField>

    </div>

    <template #footer>
      <AppButton v-if="branch" type="button" variant="danger" @click="emit('delete')">
        Удалить
      </AppButton>
      <div class="footer-actions">
        <AppButton type="button" variant="secondary" @click="emit('close')">
          Отмена
        </AppButton>
        <AppButton type="submit" variant="primary" :disabled="!canSubmit" data-tour="branch-save">
          {{ branch ? 'Сохранить' : 'Создать' }}
        </AppButton>
      </div>
    </template>
  </AppModal>
  <TaskForm v-if="showQuickTask" default-type="TASK_DAY" @close="showQuickTask = false" @save="handleQuickTask" />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  Award,
  Bell,
  BookOpen,
  Brain,
  Briefcase,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  Code,
  Compass,
  Dumbbell,
  Flag,
  FolderKanban,
  GraduationCap,
  Heart,
  Home,
  Lightbulb,
  ListTodo,
  Map,
  Plane,
  Rocket,
  Target,
  TrendingUp,
  Trophy,
  Users,
  WalletCards,
  Plus,
} from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import AppCustomColorPicker from '~/components/ui/AppCustomColorPicker.vue'
import AppFormField from '~/components/ui/AppFormField.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppModal from '~/components/ui/AppModal.vue'
import type { Branch } from '~/types/branch.types'
import { useTasksStore } from '~/stores/tasks.store'
import TaskForm from '~/components/task/TaskForm.vue'
import type { TaskFormData } from '~/types/task.types'

const props = defineProps<{ branch?: Branch | null }>()
const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'save',
    data: { name: string; icon: string; description: string; taskIds: string[]; markerColor: string }
  ): void
  (e: 'delete'): void
}>()

const iconsExpanded = ref(false)
const tasksExpanded = ref(false)
const nameTouched = ref(false)
const showQuickTask = ref(false)
const tasksStore = useTasksStore()
const availableTasks = computed(() =>
  tasksStore.tasks.filter(
    (task) =>
      form.taskIds.includes(task.id) || (task.type !== 'HABIT' && task.type !== 'PURCHASE')
  )
)

const iconOptions = [
  'trending-up',
  'dumbbell',
  'brain',
  'users',
  'target',
  'briefcase',
  'heart',
  'book-open',
  'award',
  'code',
  'rocket',
  'flag',
  'compass',
  'map',
  'plane',
  'home',
  'graduation-cap',
  'lightbulb',
  'trophy',
  'wallet-cards',
  'folder-kanban',
  'calendar-days',
]
const visibleIconOptions = computed(() => (iconsExpanded.value ? iconOptions : iconOptions.slice(0, 9)))

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
    award: Award,
    code: Code,
    rocket: Rocket,
    flag: Flag,
    compass: Compass,
    map: Map,
    plane: Plane,
    home: Home,
    'graduation-cap': GraduationCap,
    lightbulb: Lightbulb,
    trophy: Trophy,
    'wallet-cards': WalletCards,
    'folder-kanban': FolderKanban,
    'calendar-days': CalendarDays,
  }
  return map[name] || Target
}

const taskIcon = (type: string) =>
  ({ TASK_DAY: CheckSquare, TASK_WEEK: CalendarDays, TASK_MONTH: Bell, TASK_YEAR: Flag })[type] ||
  ListTodo

const canSubmit = computed(() => form.name.trim().length > 0)

const form = reactive({
  name: '',
  icon: 'target',
  description: '',
  markerColor: '#d6d6d6',
  taskIds: [] as string[],
})

watch(
  () => props.branch,
  (newBranch) => {
    nameTouched.value = false
    iconsExpanded.value = false

    if (newBranch) {
      form.name = newBranch.displayName
      form.icon = newBranch.icon
      form.description = newBranch.description || ''
      form.markerColor = newBranch.markerColor || newBranch.backgroundColor || '#d6d6d6'
        form.taskIds = [...(newBranch.directTaskIds || newBranch.taskIds || [])]
    } else {
      form.name = ''
      form.icon = 'target'
      form.description = ''
      form.markerColor = '#d6d6d6'
      form.taskIds = []
    }
  },
  { immediate: true }
)

function handleSubmit() {
  nameTouched.value = true
  if (!canSubmit.value) return
  emit('save', { ...form, name: form.name.trim() })
}

function toggleTask(taskId: string) {
  const index = form.taskIds.indexOf(taskId)
  if (index === -1) form.taskIds.push(taskId)
  else form.taskIds.splice(index, 1)
}

function handleQuickTask(data: TaskFormData) {
  const task = tasksStore.addTask({
    title: data.title || 'Новая задача',
    description: data.description,
    type: data.type || 'TASK_DAY',
    targetDate: data.targetDate,
    targetTime: data.targetTime,
    tagIds: data.tagIds || [],
    tags: data.tags || [],
  })
  if (!task) return
  form.taskIds.push(task.id)
  tasksExpanded.value = true
  showQuickTask.value = false
}
</script>

<style scoped lang="scss">
.board-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.visual-row {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) 1px minmax(180px, 0.65fr);
  align-items: start;
  column-gap: 18px;

  > :last-child {
    grid-column: 3;
  }

  &::after {
    content: '';
    grid-column: 2;
    grid-row: 1;
    align-self: stretch;
    width: 1px;
    background: var(--ui-border-color);
  }
}

.icon-section {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tasks-section {
  display: grid;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
}

.tasks-list {
  display: grid;
  gap: 6px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  max-height: 190px;
  padding: 8px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background: var(--glass-surface);
  backdrop-filter: var(--glass-filter);
  -webkit-backdrop-filter: var(--glass-filter);
  box-shadow: 0 14px 34px color-mix(in srgb, var(--bg) 18%, transparent);
}

.task-row {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 10px 12px;
  box-sizing: border-box;
  border-radius: var(--border-radius-md);
  color: var(--text);
  font-size: 0.82rem;
  cursor: pointer;

  &.selected {
    background: var(--accent);
    color: var(--bg);

    .task-icon {
      color: var(--bg);
    }
  }
}

.custom-checkbox {
  position: relative;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
  }
}

.checkmark {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: var(--border-radius-sm);
  background: var(--glass-surface);
  transition: background var(--transition-standard);

  input:checked + & {
    background: var(--accent);
  }
}

.empty-list {
  padding: 10px;
  color: var(--dim);
  font-size: 0.76rem;
  text-align: center;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: var(--control-height-md);
  padding: 0 14px;
  color: var(--text);
  background: transparent;
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;

  svg {
    flex: 0 0 auto;
    transition: transform var(--transition-standard);
  }

  &:hover {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--text);
  }

  &.expanded {
    border-color: color-mix(in srgb, var(--accent) 24%, var(--ui-border-color));
    background: color-mix(in srgb, var(--accent) 6%, transparent);
  }

  .rotated {
    transform: rotate(180deg);
  }
}

.selected-icon {
  display: inline-flex;
  align-items: center;
  color: var(--text);
}

.icons-grid {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 6px;
}

.icons-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 5px 9px;
  color: var(--dim);
  font-size: 0.76rem;
  background: transparent;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;

  svg {
    transition: transform var(--transition-standard);
  }

  .rotated {
    transform: rotate(180deg);
  }
}

.task-icon {
  color: var(--dim);
}

.task-main {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.task-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-state {
  justify-self: flex-start;
  padding: 2px 7px;
  border-radius: var(--border-radius-pill);
  font-size: 0.66rem;
  font-weight: 700;
  line-height: 1.2;

  &.done {
    background: color-mix(in srgb, var(--success) 13%, transparent);
    color: var(--success);
  }
}

.icon-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  min-width: var(--control-icon-size);
  flex: 0 0 var(--control-icon-size);
  aspect-ratio: 1;
  color: var(--dim);
  background: transparent;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  transition:
    color 0.16s ease,
    background 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;

  &:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    transform: translateY(-1px);
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

.create-task-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  min-height: 40px;
  padding: 0 14px;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--accent) 7%, transparent);
  color: var(--text);
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;

  &:hover {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    transform: translateY(-1px);
  }
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
    opacity 160ms ease,
    transform 180ms cubic-bezier(0.2, 0, 0, 1);
  will-change: opacity, transform;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.reveal-item-enter-active,
.reveal-item-leave-active,
.reveal-item-move {
  transition:
    opacity 0.16s ease,
    transform 0.18s ease;
}

.reveal-item-enter-from,
.reveal-item-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.88);
}

.reveal-item-leave-active {
  position: absolute;
}

@media (max-width: 640px) {
  .board-form {
    gap: 12px;
  }

  .visual-row {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1px auto;
    row-gap: 18px;

    > :last-child {
      grid-column: 1;
      grid-row: 3;
    }

    &::after {
      grid-column: 1;
      grid-row: 2;
      width: auto;
      height: 1px;
    }
  }

  .icons-grid {
    gap: 8px;
  }

  .icons-toggle,
  .create-task-btn {
    width: 100%;
    justify-content: center;
    white-space: normal;
    text-align: center;
  }

  .tasks-list {
    max-height: min(300px, 46dvh);
    padding: 7px;
    border-radius: var(--border-radius-md);
  }

  .task-row {
    grid-template-columns: auto auto minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
  }

  .task-title {
    white-space: normal;
    line-height: 1.35;
  }

  .task-state {
    font-size: 0.64rem;
  }

  .footer-actions {
    width: 100%;
    flex-direction: column;
    margin-left: 0;

    :deep(.app-button) {
      width: 100%;
    }
  }

  .toggle-btn {
    min-height: 44px;
  }

  .icon-option {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    flex-basis: 44px;
  }

}
</style>
