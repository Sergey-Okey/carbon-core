import { useTasksStore } from '~/stores/tasks.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useNotification } from '~/composables/useNotification'
import { useGuidedTourStore } from '~/stores/guidedTour.store'
import { useFeedback } from '~/composables/useFeedback'
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
  const guidedTour = useGuidedTourStore()
  const { success, warning } = useNotification()
  const { trigger } = useFeedback()

  function saveTask(taskData: TaskFormData, options: SaveTaskOptions = {}): boolean {
    const { createBranch, ...cleanTaskData } = taskData

    if (options.editingTask) {
      tasksStore.updateTask(options.editingTask.id, cleanTaskData)
      success('Задача обновлена')
      return true
    }

    const result = tasksStore.addTask({
      ...cleanTaskData,
      type: (cleanTaskData.type as TaskType) || options.fallbackType || 'TASK_DAY',
      tagIds: cleanTaskData.tagIds || [],
      tags: cleanTaskData.tags || [],
    } as Omit<Task, 'id' | 'createdAt' | 'done'>)

    if (!result) {
      warning('Лимит задач на этот период исчерпан')
      return false
    }

    if (createBranch && result.type !== 'HABIT') {
      branchesStore.addBranch(result.title, 'help-circle', result.description || '', [result.id])
      success(`Ветка «${result.title}» создана в доске`)
      return true
    }

    success(
      result.type === 'HABIT'
        ? `Привычка «${result.title}» добавлена`
        : `«${result.title}» добавлено`
    )
    return true
  }

  function toggleTask(taskId: string) {
    const taskBefore = tasksStore.tasks.find((task) => task.id === taskId)
    const wasDone = taskBefore?.done === true
    const wasHabit = taskBefore?.type === 'HABIT'
    const previousHabitCompletion = taskBefore?.lastCompletedAt

    tasksStore.completeTask(taskId)

    const taskAfter = tasksStore.tasks.find((task) => task.id === taskId)
    if (!wasHabit && !wasDone && taskAfter?.done) {
      guidedTour.handleAction('task-completed')
      void trigger('success')
    } else if (wasHabit && taskAfter?.lastCompletedAt !== previousHabitCompletion) {
      void trigger('success')
    }
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
