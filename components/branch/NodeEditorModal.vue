<template>
  <AppModal
    :title="props.isCreateMode ? 'Новый этап' : 'Редактировать этап'"
    kicker="Этап"
    as-form
    size="lg"
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

      <AppFormField label="Привязанные задачи">
        <div class="tasks-section">
          <button type="button" class="toggle-btn" :class="{ expanded: tasksExpanded }" @click="tasksExpanded = !tasksExpanded">
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
                @click.prevent="toggleTask(task.id)"
              >
                <component :is="taskIcon(task.type)" :size="16" class="task-icon" />
                <span class="custom-checkbox">
                  <input type="checkbox" :checked="form.taskIds.includes(task.id)" />
                  <span class="checkmark"></span>
                </span>
                <span class="task-main">
                  <span class="task-title">{{ task.title }}</span>
                  <span v-if="taskLinkedElsewhere(task.id)" class="linked-elsewhere">
                    Уже привязана
                  </span>
                  <span v-if="task.done" class="task-state done">
                    Выполнена
                  </span>
                </span>
                <span class="task-marker" :class="task.type" :title="taskTypeMeta(task.type).title">
                  {{ taskTypeMeta(task.type).label }}
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
        <AppButton type="submit" variant="primary" :disabled="!canSubmit" data-tour="milestone-save">
          {{ props.isCreateMode ? 'Создать' : 'Сохранить' }}
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
import { useConfirm } from '~/composables/useConfirm'
import { useTasksStore } from '~/stores/tasks.store'
import { useBranchesStore } from '~/stores/branches.store'
import type { Milestone } from '~/types/branch.types'
import TaskForm from '~/components/task/TaskForm.vue'
import type { TaskFormData } from '~/types/task.types'

const props = defineProps<{ milestone: Milestone; isCreateMode?: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', updates: Partial<Milestone>): void
  (e: 'delete'): void
}>()

const tasksStore = useTasksStore()
const branchesStore = useBranchesStore()
const { confirm } = useConfirm()
const iconsExpanded = ref(false)
const tasksExpanded = ref(false)
const nameTouched = ref(false)
const showQuickTask = ref(false)

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

const taskIdsLinkedToOtherMilestones = computed(
  () =>
    new Set(
      branchesStore.branches.flatMap((branch) =>
        branch.milestones
          .filter((milestone) => milestone.id !== props.milestone.id)
          .flatMap((milestone) => milestone.taskIds)
      )
    )
)

const activeTasks = computed(() =>
  tasksStore.tasks.filter(
    (task) =>
      (form.taskIds.includes(task.id) || !taskIdsLinkedToOtherMilestones.value.has(task.id)) &&
      task.type !== 'HABIT' &&
      task.type !== 'PURCHASE'
  )
)
const canSubmit = computed(() => form.name.trim().length > 0)

function taskLinkedElsewhere(taskId: string) {
  return branchesStore.branches.some((branch) =>
    branch.milestones.some(
      (milestone) => milestone.id !== props.milestone.id && milestone.taskIds.includes(taskId)
    )
  )
}

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
  markerColor: '#d6d6d6',
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
      form.markerColor = newVal.markerColor || newVal.backgroundColor || '#d6d6d6'
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
    markerColor: form.markerColor,
    taskIds: form.taskIds,
  })
}

async function handleDelete() {
  const ok = await confirm('Удалить этот этап?')
  if (!ok) return
  emit('delete')
  emit('close')
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
  width: 100%;
  min-width: 0;
  max-width: 100%;
  max-height: 220px;
  padding: 8px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  grid-column: 1 / -1;
  box-shadow: 0 14px 34px color-mix(in srgb, var(--bg) 18%, transparent);
}

.task-row {
  @include glass;
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 10px 12px;
  box-sizing: border-box;
  color: var(--text);
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;

  &.selected {
    background: var(--accent);
    color: var(--bg);

    .task-icon {
      color: var(--bg);
    }

    .task-marker {
      color: color-mix(in srgb, var(--bg) 72%, transparent);
    }
  }

  &.selected:hover {
    background: var(--accent);
    color: var(--bg);
  }
}

.tasks-section {
  padding: 0;
  border: none;
  background: transparent;
}

.custom-checkbox {
  position: relative;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;

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
    border-color: var(--text);
  }
}

.task-title {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-main {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.linked-elsewhere {
  color: var(--dim);
  font-size: 0.68rem;
  line-height: 1.25;
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
  color: var(--text);
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

  .task-row {
    grid-template-columns: auto auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
  }

  .tasks-list {
    position: static;
    max-height: min(300px, 46dvh);
    gap: 6px;
    padding: 7px;
    border-radius: var(--border-radius-md);
  }

  .task-title {
    white-space: normal;
    line-height: 1.35;
  }

  .task-marker {
    width: 22px;
    height: 22px;
    font-size: 0.7rem;
  }

  .task-state {
    font-size: 0.64rem;
  }
}
</style>
