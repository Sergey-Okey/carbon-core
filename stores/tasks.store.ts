import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Task, TaskTag, TaskType } from '~/types/task.types'
import { accessAwareStorage } from '~/utils/accessStorage'
import {
  getLocalDateKey,
  mergeActivityCounts,
  mergeCompletionEvents,
} from '~/utils/analyticsMath'
import { useBranchesStore } from './branches.store'
import { useRewardsStore } from './rewards.store'
import { useTagsStore } from './tags.store'
import { useUserStore } from './user.store'

type NewTaskData = Omit<Task, 'id' | 'createdAt' | 'done'> & {
  id?: string
  createdAt?: number
}
export type DeletedTask = Task & { deletedAt: number }

export type CompletionLogEntry = {
  id: string
  at: number
  taskId: string
  type: TaskType
  title: string
}

const COMPLETION_LOG_MAX_DAYS = 90
const COMPLETION_LOG_MAX = 3000
const HISTORY_MAX_DAYS = 90

export const useTasksStore = defineStore(
  'tasks',
  () => {
    const tasks = ref<Task[]>([])
    const deletedTasks = ref<DeletedTask[]>([])
    const completedTasksHistory = ref<{ date: string; count: number }[]>([])

    const completionLog = ref<CompletionLogEntry[]>([])

    function getTodayDateString(): string {
      return getLocalDateKey(new Date())
    }

    function getActiveTasksByType(type: TaskType): Task[] {
      return tasks.value.filter((task) => task.type === type && !task.done)
    }

    function canAddTask(type: TaskType): boolean {
      if (!type.startsWith('TASK_')) return true
      return getActiveTasksByType(type).length < 3
    }

    function pruneHistory() {
      const cutoff = new Date()
      cutoff.setHours(0, 0, 0, 0)
      cutoff.setDate(cutoff.getDate() - (HISTORY_MAX_DAYS - 1))
      const cutoffKey = getLocalDateKey(cutoff)
      completedTasksHistory.value = completedTasksHistory.value
        .filter((entry) => entry.date >= cutoffKey)
        .sort((a, b) => a.date.localeCompare(b.date))
    }

    function pruneCompletionLog() {
      const cutoff = Date.now() - COMPLETION_LOG_MAX_DAYS * 24 * 60 * 60 * 1000
      completionLog.value = completionLog.value
        .filter((entry) => entry.at >= cutoff)
        .slice(-COMPLETION_LOG_MAX)
    }

    function bumpHistory(dateKey: string, delta: number) {
      if (!delta) return
      const existing = completedTasksHistory.value.find((item) => item.date === dateKey)
      if (existing) {
        existing.count = Math.max(0, existing.count + delta)
        if (existing.count === 0) {
          completedTasksHistory.value = completedTasksHistory.value.filter(
            (item) => item.date !== dateKey
          )
        }
      } else if (delta > 0) {
        completedTasksHistory.value.push({ date: dateKey, count: delta })
      }
      pruneHistory()
    }

    function appendCompletionLog(entry: Omit<CompletionLogEntry, 'id'> & { id?: string }) {
      completionLog.value.push({
        id: entry.id || uuidv4(),
        at: entry.at,
        taskId: entry.taskId,
        type: entry.type,
        title: entry.title,
      })
      pruneCompletionLog()
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

    function recordCompletion(task: Task, at = Date.now()) {
      const userStore = useUserStore()
      const dateKey = getLocalDateKey(new Date(at))

      userStore.incrementCompletedTasks()
      bumpHistory(dateKey, 1)
      appendCompletionLog({
        at,
        taskId: task.id,
        type: task.type,
        title: task.title,
      })
    }

    function completeTask(id: string) {
      const task = tasks.value.find((item) => item.id === id)
      if (!task) return

      const userStore = useUserStore()
      const branchesStore = useBranchesStore()
      const rewardsStore = useRewardsStore()
      const tags = getTaskTags(task)
      const at = Date.now()

      if (task.type === 'HABIT') {
        task.lastCompletedAt = at
        userStore.addLeaguePoints(25 * Math.max(1, tags.length))
        recordCompletion(task, at)
        branchesStore.refreshMilestonesByTaskId(task.id)
        return
      }

      if (task.done) return

      task.done = true
      task.completedAt = at

      const leagueGain = task.type === 'PURCHASE' ? 250 : 50
      userStore.addLeaguePoints(leagueGain * Math.max(1, tags.length))
      if (task.type !== 'PURCHASE') recordCompletion(task, at)

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

      const completedAt = task.completedAt
      task.done = false
      delete task.completedAt
      task.updatedAt = Date.now()

      if (completedAt) {
        const userStore = useUserStore()
        const dateKey = getLocalDateKey(new Date(completedAt))
        bumpHistory(dateKey, -1)
        userStore.decrementCompletedTasks(1)

        const logIndex = [...completionLog.value]
          .reverse()
          .findIndex((entry) => entry.taskId === id && entry.at === completedAt)
        if (logIndex !== -1) {
          const realIndex = completionLog.value.length - 1 - logIndex
          completionLog.value.splice(realIndex, 1)
        }
      }

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

    function replaceCompletionLog(entries: CompletionLogEntry[]) {
      completionLog.value = entries
      pruneCompletionLog()
    }

    function isTaskType(value: string): value is TaskType {
      return (
        value === 'HABIT' ||
        value === 'TASK_DAY' ||
        value === 'TASK_WEEK' ||
        value === 'TASK_MONTH' ||
        value === 'TASK_YEAR' ||
        value === 'PURCHASE'
      )
    }

    function reconcileCompletionStats() {
      const merged = mergeActivityCounts({
        history: completedTasksHistory.value,
        log: completionLog.value,
        tasks: tasks.value,
      })
      const nextHistory = [...merged.entries()]
        .filter(([, count]) => count > 0)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
      const historyChanged =
        nextHistory.length !== completedTasksHistory.value.length ||
        nextHistory.some(
          (item, index) =>
            item.date !== completedTasksHistory.value[index]?.date ||
            item.count !== completedTasksHistory.value[index]?.count
        )
      if (historyChanged) {
        completedTasksHistory.value = nextHistory
        pruneHistory()
      }

      const seen = new Set(
        completionLog.value.map((entry) => `${entry.taskId}:${entry.at}`)
      )
      for (const event of mergeCompletionEvents({
        log: completionLog.value,
        tasks: tasks.value,
      })) {
        if (seen.has(`${event.taskId}:${event.at}`)) continue
        seen.add(`${event.taskId}:${event.at}`)
        appendCompletionLog({
          at: event.at,
          taskId: event.taskId,
          type: isTaskType(event.type) ? event.type : 'TASK_DAY',
          title: event.title,
        })
      }

      const reconstructed = (historyChanged ? completedTasksHistory.value : nextHistory).reduce(
        (sum, item) => sum + item.count,
        0
      )
      const userStore = useUserStore()
      if (reconstructed > userStore.completedTasksCount) {
        userStore.incrementCompletedTasks(reconstructed - userStore.completedTasksCount)
      }
    }

    return {
      tasks,
      deletedTasks,
      completedTasksHistory,
      completionLog,
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
      replaceCompletionLog,
      appendCompletionLog,
      reconcileCompletionStats,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-tasks', storage: accessAwareStorage }
      : undefined,
  }
)
