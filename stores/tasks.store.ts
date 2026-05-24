import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, TaskTag, TaskType } from '~/types/task.types'
import { v4 as uuidv4 } from 'uuid'
import { useUserStore } from './user.store'
import { useBranchesStore } from './branches.store'
import { useTagsStore } from './tags.store'
import { useRewardsStore } from './rewards.store'

type NewTaskData = Omit<Task, 'id' | 'createdAt' | 'done'> & {
  id?: string
  createdAt?: number
}

export const useTasksStore = defineStore(
  'tasks',
  () => {
    const tasks = ref<Task[]>([])
    const completedTasksHistory = ref<{ date: string; count: number }[]>([])

    function getTodayDateString(): string {
      return new Date().toISOString().split('T')[0]
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
        if (task.lastCompletedAt) {
          const lastCompletedDate = new Date(task.lastCompletedAt).toISOString().split('T')[0]
          if (lastCompletedDate === getTodayDateString()) return
        }

        task.lastCompletedAt = Date.now()

        const xpPerTag = 50
        tags.forEach((tag) => branchesStore.addXPToBranch(tag.branchId, xpPerTag))
        userStore.addXP(xpPerTag * tags.length)
        recordCompletion()
        branchesStore.refreshMilestonesByTaskId(task.id)
        return
      }

      if (task.done) return

      task.done = true
      task.completedAt = Date.now()

      const baseXP = task.type === 'PURCHASE' ? 500 : 100
      tags.forEach((tag) => branchesStore.addXPToBranch(tag.branchId, baseXP))
      userStore.addXP(baseXP * tags.length)
      recordCompletion()

      if (task.type === 'PURCHASE' && task.purchaseRewardId) {
        rewardsStore.confirmPurchase(task.purchaseRewardId)
      }

      branchesStore.refreshMilestonesByTaskId(task.id)
    }

    function deleteTask(id: string) {
      const index = tasks.value.findIndex((task) => task.id === id)
      if (index === -1) return

      tasks.value.splice(index, 1)
      const branchesStore = useBranchesStore()
      branchesStore.removeTaskFromMilestones(id)
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
      completedTasksHistory,
      addTask,
      completeTask,
      deleteTask,
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
      ? { key: 'carbon-tasks', storage: localStorage }
      : undefined,
  }
)
