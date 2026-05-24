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
    const tasks = ref<Task[]>([
      // ---- ЗАДАЧИ ДЛЯ ЭТАПА "Идея и концепция" (выполнены) ----
      {
        id: 'task-ideation',
        title: 'Сформулировать миссию COF',
        description: 'Описать, какие ценности и цели несёт приложение',
        type: 'TASK_DAY',
        xpReward: 50,
        tagIds: ['tag-design', 'tag-management'],
        done: true,
        completedAt: Date.now() - 86400000,
        createdAt: Date.now() - 172800000,
        targetDate: new Date().toISOString().split('T')[0],
      },
      {
        id: 'task-research',
        title: 'Исследовать конкурентов',
        description: 'Проанализировать аналоги в области саморазвития',
        type: 'TASK_DAY',
        xpReward: 50,
        tagIds: ['tag-management'],
        done: true,
        completedAt: Date.now() - 43200000,
        createdAt: Date.now() - 129600000,
        targetDate: new Date().toISOString().split('T')[0],
      },
      // ---- ЗАДАЧИ ДЛЯ ЭТАПА "Дизайн интерфейса" (активные, часть выполнена) ----
      {
        id: 'task-design',
        title: 'Нарисовать макеты главного экрана',
        description: 'Figma, 5 экранов',
        type: 'TASK_DAY',
        xpReward: 80,
        tagIds: ['tag-design'],
        done: true,
        completedAt: Date.now() - 3600000,
        createdAt: Date.now() - 86400000,
        targetDate: new Date().toISOString().split('T')[0],
      },
      {
        id: 'task-prototype',
        title: 'Собрать кликабельный прототип',
        description: 'Взаимодействие между экранами',
        type: 'TASK_WEEK',
        xpReward: 150,
        tagIds: ['tag-design'],
        done: false,
        createdAt: Date.now() - 86400000,
        targetDate: new Date(Date.now() + 345600000).toISOString().split('T')[0], // через 4 дня
      },
      // ---- ЗАДАЧИ ДЛЯ ЭТАПА "Frontend" (активные, не выполнены) ----
      {
        id: 'task-frontend-base',
        title: 'Настроить Vite + Vue 3 проект',
        description: 'ESLint, Prettier, Pinia, Vue Router',
        type: 'TASK_DAY',
        xpReward: 60,
        tagIds: ['tag-frontend'],
        done: false,
        createdAt: Date.now() - 172800000,
        targetDate: new Date().toISOString().split('T')[0],
      },
      {
        id: 'task-state',
        title: 'Реализовать хранилище пользователя',
        description: 'Pinia store с авторизацией',
        type: 'TASK_WEEK',
        xpReward: 120,
        tagIds: ['tag-frontend', 'tag-backend'],
        done: false,
        createdAt: Date.now() - 86400000,
        targetDate: new Date(Date.now() + 259200000).toISOString().split('T')[0], // через 3 дня
      },
      // ---- ЗАДАЧИ ДЛЯ ЭТАПА "Backend" (pending) ----
      {
        id: 'task-backend-setup',
        title: 'Развернуть Node.js + Express',
        description: 'Базовая структура, маршруты',
        type: 'TASK_WEEK',
        xpReward: 100,
        tagIds: ['tag-backend'],
        done: false,
        createdAt: Date.now() - 43200000,
        targetDate: new Date(Date.now() + 604800000).toISOString().split('T')[0], // через неделю
      },
      {
        id: 'task-api',
        title: 'Создать API для задач и прогресса',
        description: 'REST endpoints',
        type: 'TASK_MONTH',
        xpReward: 200,
        tagIds: ['tag-backend', 'tag-database'],
        done: false,
        createdAt: Date.now() - 86400000,
        targetDate: new Date(Date.now() + 1209600000).toISOString().split('T')[0], // через 14 дней
      },
      // ---- ЗАДАЧИ ДЛЯ ЭТАПА "Тестирование" ----
      {
        id: 'task-testing',
        title: 'Написать unit-тесты для компонентов',
        description: 'Jest / Vitest',
        type: 'TASK_DAY',
        xpReward: 70,
        tagIds: ['tag-testing'],
        done: false,
        createdAt: Date.now() - 172800000,
        targetDate: new Date().toISOString().split('T')[0],
      },
      {
        id: 'task-fixes',
        title: 'Исправить критические баги',
        description: 'По результатам тестирования',
        type: 'TASK_DAY',
        xpReward: 90,
        tagIds: ['tag-testing', 'tag-frontend'],
        done: false,
        createdAt: Date.now() - 86400000,
        targetDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // завтра
      },
      // ---- ЗАДАЧИ ДЛЯ ЭТАПА "Деплой" ----
      {
        id: 'task-deploy',
        title: 'Настроить автоматический деплой на Netlify/Vercel',
        description: 'GitHub Actions, окружения',
        type: 'TASK_WEEK',
        xpReward: 130,
        tagIds: ['tag-devops'],
        done: false,
        createdAt: Date.now() - 43200000,
        targetDate: new Date(Date.now() + 604800000).toISOString().split('T')[0],
      },
      {
        id: 'task-monitor',
        title: 'Подключить Sentry для отслеживания ошибок',
        description: 'Мониторинг в production',
        type: 'TASK_DAY',
        xpReward: 60,
        tagIds: ['tag-devops'],
        done: false,
        createdAt: Date.now() - 86400000,
        targetDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      },
    ])

    const completedTasksHistory = ref<{ date: string; count: number }[]>([])

    function getTodayDateString(): string {
      return new Date().toISOString().split('T')[0]
    }

    function addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'done'> & { id?: string }): Task | null {
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

        const today = getTodayDateString()
        const existing = completedTasksHistory.value.find((h) => h.date === today)
        if (existing) existing.count += 1
        else completedTasksHistory.value.push({ date: today, count: 1 })
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

        const today = getTodayDateString()
        const existing = completedTasksHistory.value.find((h) => h.date === today)
        if (existing) existing.count += 1
        else completedTasksHistory.value.push({ date: today, count: 1 })
        completedTasksHistory.value = completedTasksHistory.value.slice(-30)

        if (task.type === 'PURCHASE' && task.purchaseRewardId) {
          rewardsStore.confirmPurchase(task.purchaseRewardId)
        }

        branchesStore.refreshMilestonesByTaskId(task.id)
      }
    }

    function deleteTask(id: string) {
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value.splice(index, 1)
        const branchesStore = useBranchesStore()
        branchesStore.removeTaskReferences(id)
      }
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
