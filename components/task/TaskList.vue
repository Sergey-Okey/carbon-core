<template>
  <div class="task-list">
    <div class="list-header">
      <div class="title-wrapper">
        <h3>{{ title }}</h3>
        <div v-if="taskType !== 'HABITS' && !hideRuleHint" class="info-badge" :title="ruleHint">
          <Info :size="14" />
          <span class="tooltip">{{ ruleHint }}</span>
        </div>
      </div>
      <button v-if="!hideAdd" class="add-btn" @click="handleAddClick">
        <Plus :size="20" />
      </button>
    </div>
    <TransitionGroup name="task-list" class="tasks" tag="div">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :disable-toggle="disableToggle"
        @toggle="handleToggle"
        @delete="handleDelete"
        @edit="handleEdit"
      />
      <p v-if="tasks.length === 0" key="empty-state" class="empty">
        {{ emptyText || emptyMessage }}
      </p>
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
import { ref, computed } from 'vue'
import { useTasksStore } from '~/stores/tasks.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useNotification } from '~/composables/useNotification'
import TaskCard from './TaskCard.vue'
import TaskForm from './TaskForm.vue'
import { Plus, Info } from 'lucide-vue-next'
import type { Task, TaskType } from '~/types/task.types'

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
}>()

const emit = defineEmits<{
  (e: 'add', type: TaskType): void
  (e: 'edit', task: Task): void
}>()

const tasksStore = useTasksStore()
const branchesStore = useBranchesStore()
const { addNotification } = useNotification()
const showForm = ref(false)
const editingTask = ref<Task | undefined>(undefined)

const tasks = computed(() => {
  if (props.tasksOverride) return props.tasksOverride
  if (props.taskType === 'HABITS') {
    return tasksStore.getHabits()
  }
  return tasksStore.getTasksByType(props.taskType)
})

const ruleHint = computed(() => {
  const map: Record<string, string> = {
    TASK_DAY:
      'Не более 3 активных задач на день. Выполненные — можно добавлять новые.',
    TASK_WEEK: 'Не более 3 активных задач на неделю.',
    TASK_MONTH: 'Не более 3 активных задач на месяц.',
    TASK_YEAR: 'Не более 3 активных задач на год.',
  }
  return map[props.taskType as string] || ''
})

const emptyMessage = computed(() => {
  if (props.taskType === 'HABITS') return 'Нет привычек. Добавьте первую.'
  return 'Нет активных задач. Можно добавить до 3.'
})

function handleAddClick() {
  const type = props.defaultType || (props.taskType as TaskType)

  if (props.taskType === 'HABITS') {
    if (props.externalForm) emit('add', type)
    else showForm.value = true
    return
  }

  if (!tasksStore.canAddTask(type)) {
    addNotification({
      type: 'warning',
      message: `Достигнут лимит: 3 активные задачи на ${props.title.toLowerCase()}. Завершите что-то, чтобы добавить новое.`,
      duration: 5000,
    })
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
  tasksStore.completeTask(taskId)
}

function handleDelete(taskId: string) {
  tasksStore.deleteTask(taskId)
}

function closeForm() {
  showForm.value = false
  editingTask.value = undefined
}

function handleSave(taskData: any) {
  const { createBranch, ...cleanTaskData } = taskData

  if (editingTask.value) {
    tasksStore.updateTask(editingTask.value.id, cleanTaskData)
    addNotification({
      type: 'success',
      message: 'Задача обновлена',
    })
    closeForm()
    return
  }

  const result = tasksStore.addTask({
    ...cleanTaskData,
    type: props.defaultType || (props.taskType as TaskType),
  })

  if (!result) {
    addNotification({
      type: 'error',
      message: 'Не удалось добавить задачу',
    })
    return
  }

  if (createBranch && result.type !== 'HABIT') {
    branchesStore.addBranch(result.title, 'help-circle', result.description || '', [result.id])
    addNotification({
      type: 'success',
      message: `Ветка «${result.title}» создана в доске`,
    })
  } else {
    addNotification({
      type: 'success',
      message:
        result.type === 'HABIT'
          ? `Привычка «${result.title}» добавлена`
          : `«${result.title}» добавлено`,
    })
  }

  closeForm()
}
</script>

<style scoped lang="scss">
.task-list {
  padding: 4px 0 0;

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 44px;
    margin-bottom: 16px;
  }

  .title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  h3 {
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--accent);
    letter-spacing: -0.01em;
  }

  .info-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--dim);
    cursor: help;

    &:hover .tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(-4px);
    }
  }

  .tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface);
    color: var(--accent);
    padding: 6px 12px;
    border-radius: var(--border-radius-md);
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1.4;
    white-space: normal;
    width: max-content;
    max-width: 240px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-md);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, transform 0.2s;
    pointer-events: none;
    z-index: 100;
    backdrop-filter: blur(4px);
    background: color-mix(in srgb, var(--surface) 95%, transparent);
  }

  .add-btn {
    @include glass;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    background: color-mix(in srgb, var(--surface) 80%, transparent);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all var(--transition-standard);

    &:hover {
      background: var(--surface);
      transform: scale(1.02);
      box-shadow: var(--shadow-md);
      border-color: var(--accent);
    }

    &:active {
      transform: scale(0.96);
    }
  }

  .tasks {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .empty {
    text-align: center;
    color: var(--dim);
    padding: 24px 16px;
    font-size: 0.9rem;
    border: 1px dashed var(--border);
    border-radius: var(--border-radius-lg);
    background: color-mix(in srgb, var(--surface) 40%, transparent);
    backdrop-filter: blur(2px);
  }

  /* Анимации списка */
  .task-list-enter-active,
  .task-list-leave-active {
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  }

  .task-list-enter-from {
    opacity: 0;
    transform: translateX(-16px);
  }

  .task-list-leave-to {
    opacity: 0;
    transform: translateX(16px);
  }

  .task-list-move {
    transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .list-header {
      gap: 12px;
      margin-bottom: 16px;
    }

    h3 {
      font-size: 1rem;
    }

    .add-btn {
      width: 36px;
      height: 36px;
    }

    .tasks {
      gap: 10px;
    }

    .tooltip {
      max-width: 200px;
      white-space: normal;
      font-size: 0.7rem;
      padding: 4px 8px;
    }
  }

  @media (max-width: 480px) {
    .list-header {
      gap: 8px;
      margin-bottom: 12px;
    }

    .title-wrapper {
      gap: 6px;
    }

    h3 {
      font-size: 0.95rem;
    }

    .info-badge {
      width: 16px;
      height: 16px;
      min-width: 16px;
    }

    .add-btn {
      width: 34px;
      height: 34px;
    }

    .tasks {
      gap: 8px;
    }

    .empty {
      padding: 16px 12px;
      font-size: 0.85rem;
    }
  }

  @media (max-width: 375px) {
    h3 {
      font-size: 0.9rem;
    }

    .tooltip {
      display: none;
    }
  }
}
</style>