import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, TaskType } from '~/types/task.types'
import { v4 as uuidv4 } from 'uuid'
import { useUserStore } from './user.store'
import { useBranchesStore } from './branches.store'
import { useTagsStore } from './tags.store'
import { useRewardsStore } from './rewards.store'

export const useTasksStore = defineStore(
  'tasks',
  () => {
    const tasks = ref<Task[]>([])
    const completedTasksHistory = ref<{ date: string; count: number }[]>([])

    function getTodayDateString(): string {
      return new Date().toISOString().split('T')[0]
    }

    function addTask(
      taskData: Omit<Task, 'id' | 'createdAt' | 'done'> & { id?: string }
    ): Task | null {
      if (taskData.type.startsWith('TASK_')) {
        const activeCount = tasks.value.filter(
          (t) => t.type === taskData.type && !t.done
        ).length
        if (activeCount >= 3) return null
      }
      const newTask: Task = {
        id: taskData.id || uuidv4(),
        ...taskData,
        done: false,
        createdAt: taskData.createdAt || Date.now(),
      }
      tasks.value.push(newTask)
      return newTask
    }

    function completeTask(id: string) {
      const task = tasks.value.find((t) => t.id === id)
      if (!task) return

      const userStore = useUserStore()
      const branchesStore = useBranchesStore()
      const tagsStore = useTagsStore()
      const rewardsStore = useRewardsStore()

      if (task.type === 'HABIT') {
        task.lastCompletedAt = Date.now()
        const tags = tagsStore.getTagsByIds(task.tagIds)
        const xpPerTag = 50
        tags.forEach((tag) => {
          branchesStore.addXPToBranch(tag.branchId, xpPerTag)
        })
        userStore.addXP(xpPerTag * tags.length)
        userStore.incrementCompletedTasks()

        // Записать в историю
        const today = new Date().toISOString().split('T')[0]
        const existing = completedTasksHistory.value.find(
          (h) => h.date === today
        )
        if (existing) {
          existing.count += 1
        } else {
          completedTasksHistory.value.push({ date: today, count: 1 })
        }
        completedTasksHistory.value = completedTasksHistory.value.slice(-30)

        return
      }

      if (!task.done) {
        task.done = true
        task.completedAt = Date.now()

        const tags = tagsStore.getTagsByIds(task.tagIds)
        const baseXP = task.type === 'PURCHASE' ? 500 : 100
        tags.forEach((tag) => {
          branchesStore.addXPToBranch(tag.branchId, baseXP)
        })
        userStore.addXP(baseXP * tags.length)
        userStore.incrementCompletedTasks()

        // Записать в историю
        const today = new Date().toISOString().split('T')[0]
        const existing = completedTasksHistory.value.find(
          (h) => h.date === today
        )
        if (existing) {
          existing.count += 1
        } else {
          completedTasksHistory.value.push({ date: today, count: 1 })
        }
        completedTasksHistory.value = completedTasksHistory.value.slice(-30)

        if (task.type === 'PURCHASE' && task.purchaseRewardId) {
          rewardsStore.confirmPurchase(task.purchaseRewardId)
        }

        branchesStore.refreshMilestonesByTaskId(task.id)
      }
    }

    function deleteTask(id: string) {
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) tasks.value.splice(index, 1)
    }

    function updateTask(id: string, updates: Partial<Task>) {
      const task = tasks.value.find((t) => t.id === id)
      if (task) Object.assign(task, { ...updates, updatedAt: Date.now() })
    }

    function resetDailyTasks() {
      const today = getTodayDateString()
      const userStore = useUserStore()
      tasks.value.forEach((task) => {
        if (task.type === 'TASK_DAY') {
          if (task.targetDate && task.targetDate < today) {
            if (!task.done) userStore.reduceLeaguePoints(50)
            task.done = false
            task.targetDate = today
          } else if (!task.targetDate) {
            task.targetDate = today
          }
        }
      })
    }

    function getTasksByType(type: TaskType): Task[] {
      return tasks.value.filter((t) => t.type === type && !t.done)
    }

    function getHabits(): Task[] {
      const today = getTodayDateString()
      return tasks.value.filter(
        (t) =>
          t.type === 'HABIT' &&
          (!t.lastCompletedAt ||
            new Date(t.lastCompletedAt).toISOString().split('T')[0] !== today)
      )
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
      getHabits,
    }
  },
  {
    persist: { key: 'carbon-tasks', storage: localStorage },
  }
)
