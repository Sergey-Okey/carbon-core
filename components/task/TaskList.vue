<template>
  <div class="task-list" :class="{ 'task-list--habits': taskType === 'HABITS' }">
    <div class="list-header">
      <div class="title-group">
        <div class="title-wrapper">
          <h3>{{ title }}</h3>
          <button
            v-if="taskType !== 'HABITS' && !hideRuleHint"
            type="button"
            class="info-badge"
            :aria-label="ruleHint"
            :aria-expanded="isRuleTooltipVisible"
            @mouseenter="showRuleTooltip"
            @mouseleave="hideRuleTooltip"
            @focus="showRuleTooltip"
            @blur="hideRuleTooltip"
            @click.stop="showRuleTooltip"
          >
            <Info :size="14" />
          </button>
          <Teleport to="body">
            <span
              v-if="isRuleTooltipVisible"
              class="task-rule-tooltip"
              :class="`is-${ruleTooltipPlacement}`"
              :style="ruleTooltipStyle"
              role="tooltip"
            >
              <span class="tooltip-title">Лимит задач</span>
              <span>{{ ruleHint }}</span>
            </span>
          </Teleport>
        </div>
        <span class="list-hint">{{ listHint }}</span>
      </div>
      <button
        v-if="!hideAdd"
        class="add-btn"
        :class="{ limited: isAddLimited }"
        :aria-label="addButtonTitle"
        :data-tour="tourTarget"
        @click="handleAddClick"
      >
        <Plus :size="20" />
      </button>
    </div>
    <TransitionGroup name="task-list" class="tasks" tag="div">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :disable-toggle="disableToggle"
        :restore-mode="restoreMode"
        @toggle="handleToggle"
        @delete="handleDelete"
        @edit="handleEdit"
        @restore="handleRestore"
      />
      <EmptyState
        v-if="tasks.length === 0"
        key="empty-state"
        size="sm"
        :description="emptyText || emptyMessage"
      />
    </TransitionGroup>
    <Teleport to="body">
      <TaskForm
        v-if="showForm && !externalForm"
        :task="editingTask"
        :default-type="defaultType"
        @close="closeForm"
        @save="handleSave"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Plus, Info } from 'lucide-vue-next'
import type { Task, TaskFormData, TaskType } from '~/types/task.types'

const props = defineProps<{
  taskType: TaskType | 'HABITS'
  title: string
  defaultType?: TaskType
  tasksOverride?: Task[]
  hideAdd?: boolean
  hideRuleHint?: boolean
  emptyText?: string
  externalForm?: boolean
  disableToggle?: boolean
  restoreMode?: 'completed' | 'deleted'
}>()

const emit = defineEmits<{
  (e: 'add', type: TaskType): void
  (e: 'edit', task: Task): void
}>()

const tasksStore = useTasksStore()
const { warning, success } = useNotification()
const { saveTask, toggleTask, removeTask } = useTaskActions()
const showForm = ref(false)
const editingTask = ref<Task | undefined>(undefined)
const isRuleTooltipVisible = ref(false)
const ruleTooltipPosition = ref({ x: 0, y: 0 })
const ruleTooltipPlacement = ref<'top' | 'bottom'>('top')

const tasks = computed(() => {
  if (props.tasksOverride) return props.tasksOverride
  if (props.taskType === 'HABITS') {
    return tasksStore.getHabits()
  }
  return tasksStore.getTasksByType(props.taskType)
})

const ruleHint = computed(() => {
  const map: Record<string, string> = {
    TASK_DAY: 'До 3 активных задач на день. Завершите одну, чтобы добавить новую.',
    TASK_WEEK: 'До 3 активных задач на неделю. Держите фокус на главном.',
    TASK_MONTH: 'До 3 активных задач на месяц. Планируйте только ключевые цели.',
    TASK_YEAR: 'До 3 активных задач на год. Оставьте стратегические приоритеты.',
  }
  return map[props.taskType as string] || ''
})
const emptyMessage = computed(() => {
  if (props.taskType === 'HABITS') return 'Нет привычек. Добавьте первую.'
  return 'Нет активных задач. Можно добавить до 3.'
})

const listHint = computed(() => {
  if (props.restoreMode === 'deleted') {
    return `${tasks.value.length} в корзине`
  }

  if (props.restoreMode === 'completed') {
    return `${tasks.value.length} завершено`
  }

  if (props.hideAdd && props.hideRuleHint) {
    return `${tasks.value.length} завершено`
  }

  if (props.taskType === 'HABITS') {
    return tasks.value.length === 1 ? '1 привычка' : `${tasks.value.length} привычек`
  }

  return `${tasks.value.length} из 3 активных`
})

const isAddLimited = computed(() => {
  const type = props.defaultType || (props.taskType as TaskType)
  return props.taskType !== 'HABITS' && !tasksStore.canAddTask(type)
})

const addButtonTitle = computed(() =>
  isAddLimited.value ? 'Завершите одну задачу, чтобы добавить новую' : 'Добавить'
)

const tourTarget = computed(() => {
  const type = props.defaultType || props.taskType
  if (type === 'HABIT') return 'habit-add'
  return type === 'TASK_DAY' ? 'task-add-day' : undefined
})

const ruleTooltipStyle = computed(() => ({
  left: `${ruleTooltipPosition.value.x}px`,
  top: `${ruleTooltipPosition.value.y}px`,
}))

function showRuleTooltip(event: MouseEvent | FocusEvent) {
  const target = event.currentTarget as HTMLElement | null
  if (!target) return

  const rect = target.getBoundingClientRect()
  const tooltipWidth = Math.min(280, window.innerWidth - 24)
  const centeredLeft = rect.left + rect.width / 2 - tooltipWidth / 2
  const left = Math.min(window.innerWidth - tooltipWidth - 12, Math.max(12, centeredLeft))
  const showBelow = rect.top < 110
  ruleTooltipPlacement.value = showBelow ? 'bottom' : 'top'
  ruleTooltipPosition.value = {
    x: left,
    y: showBelow ? rect.bottom + 8 : rect.top - 8,
  }
  isRuleTooltipVisible.value = true
}

function hideRuleTooltip() {
  isRuleTooltipVisible.value = false
}

function handleAddClick() {
  const type = props.defaultType || (props.taskType as TaskType)

  if (props.taskType === 'HABITS') {
    if (props.externalForm) emit('add', type)
    else showForm.value = true
    return
  }

  if (!tasksStore.canAddTask(type)) {
    warning(
      `Достигнут лимит: 3 активные задачи на ${props.title.toLowerCase()}. Завершите что-то, чтобы добавить новое.`,
      { duration: 5000 }
    )
    return
  }

  if (props.externalForm) {
    emit('add', type)
    return
  }

  showForm.value = true
}

function handleEdit(task: Task) {
  if (props.externalForm) {
    emit('edit', task)
    return
  }

  editingTask.value = task
  showForm.value = true
}

function handleToggle(taskId: string) {
  toggleTask(taskId)
}

function handleDelete(taskId: string) {
  removeTask(taskId)
}

function handleRestore(taskId: string) {
  const restored =
    props.restoreMode === 'deleted'
      ? tasksStore.restoreTask(taskId)
      : tasksStore.reopenTask(taskId)

  if (restored) {
    success('Задача восстановлена')
  } else {
    warning('Сначала освободите место: в горизонте уже 3 активные задачи.')
  }
}

function closeForm() {
  showForm.value = false
  editingTask.value = undefined
}

function handleSave(taskData: TaskFormData) {
  const saved = saveTask(taskData, {
    editingTask: editingTask.value,
    fallbackType: props.defaultType || (props.taskType as TaskType),
  })
  if (saved) closeForm()
}
</script>

<style scoped lang="scss">
.task-list {
  padding: var(--space-1) 0 0;

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3);
    min-height: 44px;
    margin-bottom: var(--space-4);
  }

  .title-group {
    min-width: 0;
  }

  .title-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  h3 {
    margin: 0;
    font-weight: var(--weight-semibold);
    font-size: var(--text-lg);
    color: var(--color-text-primary);
    letter-spacing: -0.01em;
  }

  .list-hint {
    display: block;
    margin-top: var(--space-1);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    line-height: var(--leading-tight);
  }

  .info-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: var(--radius-full);
    color: var(--color-text-muted);
    cursor: help;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &:hover {
      background: color-mix(in srgb, var(--color-accent) 8%, transparent);
      color: var(--color-text-primary);
    }
  }

  .add-btn {
    width: 34px;
    height: 34px;
    min-height: 34px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-primary);
    cursor: pointer;
    border: var(--ui-border);
    border-style: dashed;
    background: transparent;
    flex-shrink: 0;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &:hover {
      background: color-mix(in srgb, var(--color-accent) 8%, transparent);
      color: var(--color-text-primary);
    }

    &:active {
      background: color-mix(in srgb, var(--color-accent) 12%, transparent);
    }

    &.limited {
      color: var(--color-text-muted);
      border: var(--ui-border);
      border-style: dashed;
    }

    @include mobile {
      width: 44px;
      height: 44px;
      min-height: 44px;
    }
  }

  @media (pointer: coarse), (max-width: 767px) {
    .add-btn {
      width: 44px;
      height: 44px;
      min-height: 44px;
    }
  }

  .tasks {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  &.task-list--habits {
    .tasks {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: var(--space-2);
    }
  }

  .empty-state {
    grid-column: 1 / -1;
  }

  @media (max-width: 1180px) {
    &.task-list--habits .tasks {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: 980px) {
    &.task-list--habits .tasks {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .task-list-enter-active,
  .task-list-leave-active {
    transition:
      opacity var(--transition-standard),
      transform var(--transition-standard);
  }

  .task-list-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }

  .task-list-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }

  .task-list-move {
    transition: transform var(--transition-standard);
  }

  @include mobile {
    .list-header {
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    h3 {
      font-size: var(--text-md);
    }

    .tasks {
      gap: var(--space-2);
    }

    &.task-list--habits .tasks {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-content: start;
      align-items: start;
    }
  }

  @include narrow {
    .list-header {
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }

    h3 {
      font-size: var(--text-sm);
    }

    &.task-list--habits .tasks {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

.task-rule-tooltip {
  @include glass;
  position: fixed;
  display: grid;
  gap: var(--space-1);
  width: min(280px, calc(100vw - 24px));
  padding: var(--space-2) var(--space-3);
  border: var(--ui-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  text-align: left;
  white-space: normal;
  pointer-events: none;
  z-index: 7000;
  transform: translateY(-100%);

  &.is-bottom {
    transform: none;
  }

  .tooltip-title {
    color: var(--color-text-primary);
    font-size: var(--text-xs);
    font-weight: var(--weight-bold);
    line-height: 1.1;
  }
}
</style>