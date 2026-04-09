<template>
  <div class="task-list">
    <div class="list-header">
      <h3>{{ title }}</h3>
      <button class="add-btn" @click="handleAddClick">
        <Plus :size="20" />
      </button>
    </div>
    <div class="tasks">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="tasksStore.completeTask"
        @delete="tasksStore.deleteTask"
        @edit="handleEdit"
      />
      <p v-if="tasks.length === 0" class="empty">Нет активных задач</p>
    </div>
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
import { useNotification } from '~/composables/useNotification'
import TaskCard from './TaskCard.vue'
import TaskForm from './TaskForm.vue'
import { Plus } from 'lucide-vue-next'
import type { Task, TaskType } from '~/types/task.types'

const props = defineProps<{
  taskType: TaskType | 'HABITS'
  title: string
  defaultType?: TaskType
}>()

const tasksStore = useTasksStore()
const { addNotification } = useNotification()
const showForm = ref(false)
const editingTask = ref<Task | undefined>(undefined)

const tasks = computed(() => {
  if (props.taskType === 'HABITS') {
    return tasksStore.getHabits()
  }
  return tasksStore.getTasksByType(props.taskType)
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
      message: `Достигнут лимит: 3 задачи на ${props.title.toLowerCase()}. Сосредоточьтесь на главном.`,
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

function handleSave(taskData: any) {
  if (editingTask.value) {
    tasksStore.updateTask(editingTask.value.id, taskData)
    addNotification({
      type: 'success',
      message: 'Задача обновлена',
    })
    closeForm()
  } else {
    const result = tasksStore.addTask({
      ...taskData,
      type: props.defaultType || (props.taskType as TaskType),
    })
    if (result) {
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
    h3 {
      font-weight: 600;
      font-size: 1.1rem;
      color: var(--accent);
    }
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
  }
}
</style>
