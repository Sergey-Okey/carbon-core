<template>
  <div class="task-list">
    <div class="list-header">
      <div class="title-wrapper">
        <h3>{{ title }}</h3>
        <div v-if="taskType !== 'HABITS'" class="info-badge" :title="ruleHint">
          <Info :size="14" />
          <span class="tooltip">{{ ruleHint }}</span>
        </div>
      </div>
      <button class="add-btn" @click="handleAddClick">
        <Plus :size="20" />
      </button>
    </div>
    <!-- ✅ ДОБАВЛЕНЫ АНИМАЦИИ: TransitionGroup для плавного появления/удаления -->
    <TransitionGroup name="task-list" class="tasks" tag="div">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="handleToggle"
        @delete="handleDelete"
        @edit="handleEdit"
      />
      <p v-if="tasks.length === 0" key="empty-state" class="empty">
        {{ emptyMessage }}
      </p>
    </TransitionGroup>
    <Teleport to="body">
      <TaskForm
        v-if="showForm"
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
}>()

const tasksStore = useTasksStore()
const branchesStore = useBranchesStore()
const { addNotification } = useNotification()
const showForm = ref(false)
const editingTask = ref<Task | undefined>(undefined)

const tasks = computed(() => {
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
  if (props.taskType === 'HABITS') {
    showForm.value = true
    return
  }

  const type = props.defaultType || (props.taskType as TaskType)
  const activeCount = tasksStore.getTasksByType(type).length
  if (activeCount >= 3) {
    addNotification({
      type: 'warning',
      message: `Достигнут лимит: 3 активные задачи на ${props.title.toLowerCase()}. Завершите что-то, чтобы добавить новое.`,
      duration: 5000,
    })
    return
  }
  showForm.value = true
}

function handleEdit(task: Task) {
  editingTask.value = task
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingTask.value = undefined
}

function handleToggle(taskId: string) {
  tasksStore.completeTask(taskId)
}

function handleDelete(taskId: string) {
  tasksStore.deleteTask(taskId)
}

function handleSave(taskData: any) {
  if (editingTask.value) {
    tasksStore.updateTask(editingTask.value.id, taskData)
    addNotification({
      type: 'success',
      message: 'Задача обновлена',
    })
    closeForm()
  } else {
    const { createBranch, ...newTaskData } = taskData
    const result = tasksStore.addTask({
      ...newTaskData,
      type: props.defaultType || (props.taskType as TaskType),
    })
    if (result) {
      if (createBranch) {
        branchesStore.addBranch(
          result.title,
          'help-circle',
          result.description || '',
          [result.id]
        )
      }
      addNotification({
        type: 'success',
        message: `«${result.title}» добавлено`,
      })
      closeForm()
    } else {
      addNotification({
        type: 'error',
        message: 'Не удалось добавить задачу',
      })
    }
  }
}
</script>

<style scoped lang="scss">
.task-list {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
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
    }
  }

  .tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface);
    color: var(--accent);
    padding: 6px 10px;
    border-radius: var(--border-radius-sm);
    font-size: 0.75rem;
    white-space: nowrap;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-md);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s;
    pointer-events: none;
    z-index: 10;
  }

  .add-btn {
    @include glass;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    &:hover {
      background: var(--surface);
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
    padding: 16px;
    font-size: 0.9rem;
  }

  /* ✅ АНИМАЦИИ ДЛЯ СПИСКА ЗАДАЧ */
  .task-list-enter-active,
  .task-list-leave-active {
    transition: all 0.15s cubic-bezier(0.2, 0, 0, 1);
  }

  .task-list-enter-from {
    opacity: 0;
    transform: translateX(-20px);
  }

  .task-list-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }

  .task-list-move {
    transition: transform 0.15s cubic-bezier(0.2, 0, 0, 1);
  }

  /* ✅ АДАПТИВНОСТЬ ДЛЯ ПЛАНШЕТОВ И МОБИЛЬНЫХ */
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
      flex-shrink: 0;
    }

    .tasks {
      gap: 10px;
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
      font-weight: 600;
    }

    .info-badge {
      width: 16px;
      height: 16px;
      min-width: 16px;
    }

    .add-btn {
      width: 32px;
      height: 32px;
      min-width: 32px;
      flex-shrink: 0;
    }

    .tasks {
      gap: 8px;
    }

    .empty {
      padding: 12px;
      font-size: 0.85rem;
    }
  }

  @media (max-width: 375px) {
    h3 {
      font-size: 0.9rem;
    }

    .info-badge {
      display: none;
    }

    .tasks {
      gap: 6px;
    }
  }
}
</style>
