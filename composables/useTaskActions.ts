import { useTasksStore } from '~/stores/tasks.store'

export function useTaskActions() {
  const tasksStore = useTasksStore()

  function toggleTask(taskId: string) {
    tasksStore.completeTask(taskId)
  }

  function removeTask(taskId: string) {
    tasksStore.deleteTask(taskId)
  }

  return {
    toggleTask,
    removeTask,
  }
}
