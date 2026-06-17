import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, TaskTag, TaskType } from '~/types/task.types'
import { v4 as uuidv4 } from 'uuid'
import { useUserStore } from './user.store'
import { useBranchesStore } from './branches.store'
import { useTagsStore } from './tags.store'
import { useRewardsStore } from './rewards.store'
import { accessAwareStorage } from '~/utils/accessStorage'

type NewTaskData = Omit<Task, 'id' | 'createdAt' | 'done'> & {
  id?: string
  createdAt?: number
}
export type DeletedTask = Task & { deletedAt: number }

export const useTasksStore = defineStore(
  'tasks',
  () => {
    const tasks = ref<Task[]>([])
    const deletedTasks = ref<DeletedTask[]>([])
    const completedTasksHistory = ref<{ date: string; count: number }[]>([])

    function getTodayDateString(): string {
      return getLocalDateKey(new Date())
    }

    function getLocalDateKey(date: Date): string {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    function getActiveTasksByType(type: TaskType): Task[] {
      return tasks.value.filter((task) => task.type === type && !task.done)
    }

    function canAddTask(type: TaskType): boolean {
      if (!type.startsWith('TASK_')) return true
      return getActiveTasksByType(type).length < 3
    }

    function addTask(taskData: NewTaskData): Task | null {
      if (!canAddTask(taskData.type)) return null

      const newTask: Task = {
        id: taskData.id || uuidv4(),
        ...taskData,
        done: false,
        createdAt: taskData.createdAt || Date.now(),
      }

      tasks.value.push(newTask)
      return newTask
    }

    function recordCompletion() {
      const userStore = useUserStore()
      const today = getTodayDateString()
      const existing = completedTasksHistory.value.find((item) => item.date === today)

      userStore.incrementCompletedTasks()
      if (existing) existing.count += 1
      else completedTasksHistory.value.push({ date: today, count: 1 })

      completedTasksHistory.value = completedTasksHistory.value.slice(-30)
    }

    function completeTask(id: string) {
      const task = tasks.value.find((item) => item.id === id)
      if (!task) return

      const userStore = useUserStore()
      const branchesStore = useBranchesStore()
      const rewardsStore = useRewardsStore()
      const tags = getTaskTags(task)

      if (task.type === 'HABIT') {
        task.lastCompletedAt = Date.now()

        const xpPerTag = 50
        tags.forEach((tag) => {
          if (tag.branchId) branchesStore.addXPToBranch(tag.branchId, xpPerTag)
        })
        userStore.addXP(xpPerTag * tags.length)
        recordCompletion()
        branchesStore.refreshMilestonesByTaskId(task.id)
        return
      }

      if (task.done) return

      task.done = true
      task.completedAt = Date.now()

      const baseXP = task.type === 'PURCHASE' ? 500 : 100
      tags.forEach((tag) => {
        if (tag.branchId) branchesStore.addXPToBranch(tag.branchId, baseXP)
      })
      userStore.addXP(baseXP * tags.length)
      if (task.type !== 'PURCHASE') recordCompletion()

      if (task.type === 'PURCHASE' && task.purchaseRewardId) {
        rewardsStore.confirmPurchase(task.purchaseRewardId)
      }

      branchesStore.refreshMilestonesByTaskId(task.id)
    }

    function deleteTask(id: string) {
      const index = tasks.value.findIndex((task) => task.id === id)
      if (index === -1) return

      const [deletedTask] = tasks.value.splice(index, 1)
      deletedTasks.value.unshift({
        ...deletedTask,
        deletedAt: Date.now(),
      })
      deletedTasks.value = deletedTasks.value.slice(0, 30)
      const branchesStore = useBranchesStore()
      branchesStore.removeTaskFromMilestones(id)
    }

    function restoreTask(id: string): Task | null {
      const index = deletedTasks.value.findIndex((task) => task.id === id)
      if (index === -1) return null

      const task = deletedTasks.value[index]
      if (!canAddTask(task.type)) return null

      deletedTasks.value.splice(index, 1)
      const restoredTask: Task = {
        ...task,
        updatedAt: Date.now(),
      }
      delete (restoredTask as Partial<DeletedTask>).deletedAt
      tasks.value.push(restoredTask)
      return restoredTask
    }

    function reopenTask(id: string): Task | null {
      const task = tasks.value.find((item) => item.id === id)
      if (!task || !task.done) return null
      if (!canAddTask(task.type)) return null

      task.done = false
      delete task.completedAt
      task.updatedAt = Date.now()

      const branchesStore = useBranchesStore()
      branchesStore.refreshMilestonesByTaskId(id)
      return task
    }

    function clearDeletedTasks() {
      deletedTasks.value = []
    }

    function updateTask(id: string, updates: Partial<Task>) {
      const task = tasks.value.find((item) => item.id === id)
      if (!task) return

      Object.assign(task, { ...updates, updatedAt: Date.now() })
      const branchesStore = useBranchesStore()
      branchesStore.refreshMilestonesByTaskId(id)
    }

    function resetDailyTasks() {
      const today = getTodayDateString()
      const userStore = useUserStore()

      tasks.value.forEach((task) => {
        if (task.type !== 'TASK_DAY') return

        if (task.targetDate && task.targetDate < today) {
          if (!task.done) userStore.reduceLeaguePoints(50)
          task.done = false
          task.targetDate = today
        } else if (!task.targetDate) {
          task.targetDate = today
        }
      })
    }

    function getTasksByType(type: TaskType): Task[] {
      return getActiveTasksByType(type)
    }

    function getCompletedTasks(): Task[] {
      return tasks.value.filter((task) => task.done)
    }

    function getHabits(): Task[] {
      return tasks.value.filter((task) => task.type === 'HABIT')
    }

    function getTaskTags(task: Task): TaskTag[] {
      if (task.tags?.length) return task.tags

      const tagsStore = useTagsStore()
      return tagsStore.getTagsByIds(task.tagIds)
    }

    return {
      tasks,
      deletedTasks,
      completedTasksHistory,
      addTask,
      completeTask,
      deleteTask,
      restoreTask,
      reopenTask,
      clearDeletedTasks,
      updateTask,
      resetDailyTasks,
      getTasksByType,
      getCompletedTasks,
      getHabits,
      canAddTask,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-tasks', storage: accessAwareStorage }
      : undefined,
  }
)
