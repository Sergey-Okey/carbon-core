import { useTasksStore } from '~/stores/tasks.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useNotification } from '~/composables/useNotification'
import type { Task, TaskType } from '~/types/task.types'

type TaskFormData = Partial<Task> & {
  createBranch?: boolean
}

type SaveTaskOptions = {
  editingTask?: Task
  fallbackType?: TaskType
}

export function useTaskActions() {
  const tasksStore = useTasksStore()
  const branchesStore = useBranchesStore()
  const { addNotification } = useNotification()

  function saveTask(taskData: TaskFormData, options: SaveTaskOptions = {}): boolean {
    const { createBranch, ...cleanTaskData } = taskData

    if (options.editingTask) {
      tasksStore.updateTask(options.editingTask.id, cleanTaskData)
      addNotification({ type: 'success', message: 'Задача обновлена' })
      return true
    }

    const result = tasksStore.addTask({
      ...cleanTaskData,
      type: (cleanTaskData.type as TaskType) || options.fallbackType || 'TASK_DAY',
      tagIds: cleanTaskData.tagIds || [],
    } as Omit<Task, 'id' | 'createdAt' | 'done'>)

    if (!result) {
      addNotification({ type: 'warning', message: 'Лимит задач на этот период исчерпан' })
      return false
    }

    if (createBranch && result.type !== 'HABIT') {
      branchesStore.addBranch(result.title, 'help-circle', result.description || '', [result.id])
      addNotification({
        type: 'success',
        message: `Ветка «${result.title}» создана в доске`,
      })
      return true
    }

    addNotification({
      type: 'success',
      message:
        result.type === 'HABIT'
          ? `Привычка «${result.title}» добавлена`
          : `«${result.title}» добавлено`,
    })
    return true
  }

  function toggleTask(taskId: string) {
    tasksStore.completeTask(taskId)
  }

  function removeTask(taskId: string) {
    tasksStore.deleteTask(taskId)
  }

  return {
    saveTask,
    toggleTask,
    removeTask,
  }
}
