import { computed, ref, type Ref } from 'vue'
import { useBranchesStore } from '~/stores/branches.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useTagsStore } from '~/stores/tags.store'
import { useUserStore } from '~/stores/user.store'
import type { TaskType } from '~/types/task.types'
import {
  branchProgressPercent,
  computeActivityTrend,
  computeStreak,
  getLocalDateKey,
  milestoneProgressWeight,
  weightedBranchesScore,
} from '~/utils/analyticsMath'

export type AnalyticsRangeDays = 7 | 14 | 30

export type ActivityDayPoint = {
  date: string
  label: string
  shortLabel: string
  count: number
  isToday: boolean
}

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  HABIT: 'Привычки',
  TASK_DAY: 'День',
  TASK_WEEK: 'Неделя',
  TASK_MONTH: 'Месяц',
  TASK_YEAR: 'Год',
  PURCHASE: 'Покупки',
}

const ANALYTICS_TASK_TYPES: TaskType[] = [
  'HABIT',
  'TASK_DAY',
  'TASK_WEEK',
  'TASK_MONTH',
  'TASK_YEAR',
]

function createDateRange(daysCount: number) {
  const today = new Date()
  return Array.from({ length: daysCount }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (daysCount - 1 - index))
    return {
      key: getLocalDateKey(date),
      label: date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        weekday: 'short',
      }),
      shortLabel: date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
    }
  })
}

function isSameLocalDay(timestamp: number | undefined, todayKey: string) {
  return !!timestamp && getLocalDateKey(new Date(timestamp)) === todayKey
}

export function useAnalyticsMetrics(rangeDays?: Ref<AnalyticsRangeDays>) {
  const tasksStore = useTasksStore()
  const branchesStore = useBranchesStore()
  const tagsStore = useTagsStore()
  const userStore = useUserStore()

  const internalRange = ref<AnalyticsRangeDays>(14)
  const days = rangeDays ?? internalRange

  const todayKey = computed(() => getLocalDateKey(new Date()))

  const analyticsTasks = computed(() =>
    tasksStore.tasks.filter((task) => task.type !== 'PURCHASE')
  )

  const habitsCount = computed(
    () => analyticsTasks.value.filter((task) => task.type === 'HABIT').length
  )

  const activitySeries = computed<ActivityDayPoint[]>(() => {
    const range = createDateRange(days.value)
    return range.map((date) => {
      const item = tasksStore.completedTasksHistory.find((history) => history.date === date.key)
      return {
        date: date.key,
        label: date.label,
        shortLabel: date.shortLabel,
        count: item?.count ?? 0,
        isToday: date.key === todayKey.value,
      }
    })
  })

  const periodTotal = computed(() =>
    activitySeries.value.reduce((sum, day) => sum + day.count, 0)
  )

  const periodAverage = computed(() => {
    if (!activitySeries.value.length) return '0'
    return (periodTotal.value / activitySeries.value.length).toFixed(1)
  })

  const activityTrend = computed(() =>
    computeActivityTrend(activitySeries.value.map((day) => day.count))
  )

  const hasActivityData = computed(() => periodTotal.value > 0)

  const heatmapDays = computed<ActivityDayPoint[]>(() => {
    const range = createDateRange(30)
    return range.map((date) => {
      const item = tasksStore.completedTasksHistory.find((history) => history.date === date.key)
      return {
        date: date.key,
        label: date.label,
        shortLabel: date.shortLabel,
        count: item?.count ?? 0,
        isToday: date.key === todayKey.value,
      }
    })
  })

  const historyByDate = computed(
    () => new Map(tasksStore.completedTasksHistory.map((entry) => [entry.date, entry.count]))
  )

  const streakInfo = computed(() => computeStreak(historyByDate.value, todayKey.value))

  const currentStreak = computed(() => streakInfo.value.current)
  const longestStreak = computed(() => streakInfo.value.longest)

  const level = computed(() => userStore.level)
  const league = computed(() => userStore.league)
  const leaguePoints = computed(() => userStore.leaguePoints)
  const levelProgressPercent = computed(() => Math.round(userStore.levelProgressPercent))
  const currentLevelProgress = computed(() => userStore.currentProgress)
  const tasksForNextLevel = computed(() => userStore.tasksForNextLevel)

  const completionEvents = computed(() => {
    const cutoff = Date.now() - days.value * 24 * 60 * 60 * 1000
    const titles = new Map(analyticsTasks.value.map((task) => [task.id, task.title]))

    if (tasksStore.completionLog.length) {
      return tasksStore.completionLog
        .filter((entry) => entry.at >= cutoff)
        .map((entry) => ({
          at: entry.at,
          title: entry.title || titles.get(entry.taskId) || 'Задача',
          type: entry.type,
          taskId: entry.taskId,
        }))
        .sort((a, b) => b.at - a.at)
    }

    // Fallback for older saves without completionLog
    return analyticsTasks.value
      .flatMap((task) => {
        const events: { at: number; title: string; type: TaskType; taskId: string }[] = []
        if (task.done && task.completedAt) {
          events.push({
            at: task.completedAt,
            title: task.title,
            type: task.type,
            taskId: task.id,
          })
        }
        if (task.type === 'HABIT' && task.lastCompletedAt) {
          events.push({
            at: task.lastCompletedAt,
            title: task.title,
            type: task.type,
            taskId: task.id,
          })
        }
        return events
      })
      .filter((event) => event.at >= cutoff)
      .sort((a, b) => b.at - a.at)
  })

  const productiveHourSeries = computed(() => {
    const hours = Array.from({ length: 24 }, (_, hour) => ({
      key: `${hour}`,
      label: `${String(hour).padStart(2, '0')}:00`,
      value: 0,
    }))
    completionEvents.value.forEach((event) => {
      hours[new Date(event.at).getHours()].value += 1
    })
    return hours
  })

  const topProductiveHourLabel = computed(() => {
    const top = productiveHourSeries.value.reduce((best, item) =>
      item.value > best.value ? item : best
    )
    return top.value > 0 ? top.label : 'нет данных'
  })

  const hourBarStats = computed(() => {
    const max = Math.max(...productiveHourSeries.value.map((item) => item.value), 1)
    return productiveHourSeries.value
      .filter((hour) => hour.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
      .map((hour) => ({
        key: hour.key,
        label: hour.label,
        value: hour.value,
        percent: Math.round((hour.value / max) * 100),
      }))
  })

  const taskTypeStats = computed(() => {
    const total = Math.max(analyticsTasks.value.length, 1)
    return ANALYTICS_TASK_TYPES.map((type) => {
      const count = analyticsTasks.value.filter((task) => task.type === type).length
      return {
        key: type,
        label: TASK_TYPE_LABELS[type],
        count,
        percent: Math.round((count / total) * 100),
      }
    })
  })

  const branchStats = computed(() =>
    branchesStore.branches.map((branch) => {
      const milestones = branch.milestones ?? []
      const total = milestones.length

      const weights = milestones.map((milestone) => {
        const linked = (milestone.taskIds ?? [])
          .map((id) => tasksStore.tasks.find((task) => task.id === id))
          .filter(Boolean)
        return milestoneProgressWeight({
          linkedDone: linked.filter((task) => task?.done).length,
          linkedTotal: linked.length,
          status: milestone.status,
          achieved: milestone.achieved,
        })
      })

      const done = weights.filter((value) => value >= 1).length
      const progress = branchProgressPercent(weights)

      return {
        id: branch.id,
        name: branch.displayName,
        color: branch.markerColor || 'var(--accent)',
        total,
        done,
        progress,
      }
    })
  )

  const branchesProgressScore = computed(() => weightedBranchesScore(branchStats.value))

  const topBranchStats = computed(() =>
    [...branchStats.value]
      .filter((branch) => branch.total > 0)
      .sort((a, b) => b.progress - a.progress || b.done - a.done || b.total - a.total)
      .slice(0, 6)
  )

  const habitStats = computed(() =>
    analyticsTasks.value
      .filter((task) => task.type === 'HABIT')
      .map((habit) => ({
        id: habit.id,
        title: habit.title,
        activeToday: isSameLocalDay(habit.lastCompletedAt, todayKey.value),
        label: isSameLocalDay(habit.lastCompletedAt, todayKey.value) ? 'сегодня' : 'ожидает',
      }))
  )

  const activeHabitsToday = computed(
    () => habitStats.value.filter((habit) => habit.activeToday).length
  )

  const focusMetrics = computed(() => {
    const nonHabits = analyticsTasks.value.filter((task) => task.type !== 'HABIT')
    const tasksTotal = nonHabits.length
    const tasksDone = nonHabits.filter((task) => task.done).length
    const tasksRate = tasksTotal ? Math.round((tasksDone / tasksTotal) * 100) : 0

    const habitsRate = habitsCount.value
      ? Math.round((activeHabitsToday.value / habitsCount.value) * 100)
      : 0

    const branchProgress = branchStats.value.length
      ? Math.round(
          branchStats.value.reduce((sum, branch) => sum + branch.progress, 0) /
            branchStats.value.length
        )
      : 0

    const milestoneTotal = branchStats.value.reduce((sum, branch) => sum + branch.total, 0)
    const milestoneDone = branchStats.value.reduce((sum, branch) => sum + branch.done, 0)
    const milestonesRate = milestoneTotal
      ? Math.round((milestoneDone / milestoneTotal) * 100)
      : 0

    const productiveDays = activitySeries.value.filter((day) => day.count > 0).length
    const paceRate = days.value ? Math.round((productiveDays / days.value) * 100) : 0

    const maxDaily = Math.max(...activitySeries.value.map((day) => day.count), 1)
    const avgDaily = activitySeries.value.length
      ? periodTotal.value / activitySeries.value.length
      : 0
    const activityRate = Math.min(100, Math.round((avgDaily / maxDaily) * 100))

    return [
      { key: 'activity', label: 'Активность', value: activityRate },
      { key: 'tasks', label: 'Задачи', value: tasksRate },
      { key: 'habits', label: 'Привычки', value: habitsRate },
      { key: 'branches', label: 'Ветки', value: branchProgress },
      { key: 'milestones', label: 'Этапы', value: milestonesRate },
      { key: 'pace', label: 'Темп', value: paceRate },
    ]
  })

  const focusScore = computed(() => {
    if (!focusMetrics.value.length) return 0
    return Math.round(
      focusMetrics.value.reduce((sum, metric) => sum + metric.value, 0) /
        focusMetrics.value.length
    )
  })

  const focusTone = computed(() => {
    if (focusScore.value >= 75) return 'высокий'
    if (focusScore.value >= 45) return 'средний'
    return 'низкий'
  })

  const focusSummary = computed(() => {
    if (focusScore.value >= 75) return 'Сильный фокус'
    if (focusScore.value >= 45) return 'Стабильный фокус'
    if (focusScore.value > 0) return 'Фокус проседает'
    return 'Пока мало данных'
  })

  const focusDetail = computed(() => {
    const weakest = [...focusMetrics.value].sort((a, b) => a.value - b.value)[0]
    const strongest = [...focusMetrics.value].sort((a, b) => b.value - a.value)[0]
    if (!weakest || !strongest) return 'Добавьте задачи и привычки, чтобы увидеть баланс.'
    if (focusScore.value === 0)
      return 'Закройте задачи или отметьте привычки — индекс появится здесь.'
    return `Сильнее всего: ${strongest.label.toLowerCase()}. Слабее: ${weakest.label.toLowerCase()}.`
  })

  const tagStats = computed(() => {
    const tagged = tagsStore.tags
      .map((tag) => {
        const tasks = analyticsTasks.value.filter((task) => task.tagIds.includes(tag.id))
        const total = tasks.length
        const done = tasks.filter(
          (task) =>
            task.done ||
            (task.type === 'HABIT' && isSameLocalDay(task.lastCompletedAt, todayKey.value))
        ).length
        const percent = total ? Math.round((done / total) * 100) : 0
        return {
          id: tag.id,
          name: tag.name,
          color: tag.color || 'var(--accent)',
          total,
          done,
          percent,
        }
      })
      .filter((tag) => tag.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)

    const taggedTotal = Math.max(
      tagged.reduce((sum, tag) => sum + tag.total, 0),
      1
    )

    return tagged.map((tag) => ({
      ...tag,
      share: Math.round((tag.total / taggedTotal) * 100),
    }))
  })

  const activityFeed = computed(() =>
    completionEvents.value.slice(0, 8).map((event) => ({
      key: `${event.at}-${event.taskId}`,
      title: event.title,
      meta: new Date(event.at).toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      badge: TASK_TYPE_LABELS[event.type],
      targetId: event.taskId,
      kind: 'task' as const,
    }))
  )

  const branchFeed = computed(() =>
    topBranchStats.value.map((branch) => ({
      key: branch.id,
      title: branch.name,
      meta: `${branch.done}/${branch.total} этапов`,
      value: `${branch.progress}%`,
      progress: branch.progress,
      targetId: branch.id,
      kind: 'branch' as const,
    }))
  )

  const milestoneFeed = computed(() =>
    branchesStore.branches
      .flatMap((branch) =>
        (branch.milestones ?? [])
          .filter((milestone) => milestone.status === 'completed')
          .map((milestone) => ({
            key: milestone.id,
            title: milestone.name,
            meta: branch.displayName,
            badge: 'Этап',
            value: '100%',
            progress: 100,
            targetId: milestone.id,
            kind: 'milestone' as const,
          }))
      )
      .slice(0, 6)
  )

  function setRangeDays(next: AnalyticsRangeDays) {
    days.value = next
  }

  return {
    rangeDays: days,
    setRangeDays,
    activitySeries,
    heatmapDays,
    periodTotal,
    periodAverage,
    activityTrend,
    hasActivityData,
    currentStreak,
    longestStreak,
    level,
    league,
    leaguePoints,
    levelProgressPercent,
    currentLevelProgress,
    tasksForNextLevel,
    productiveHourSeries,
    topProductiveHourLabel,
    hourBarStats,
    taskTypeStats,
    branchStats,
    topBranchStats,
    habitsCount,
    habitStats,
    activeHabitsToday,
    focusMetrics,
    focusScore,
    branchesProgressScore,
    focusTone,
    focusSummary,
    focusDetail,
    tagStats,
    activityFeed,
    branchFeed,
    milestoneFeed,
    analyticsTasks,
  }
}
