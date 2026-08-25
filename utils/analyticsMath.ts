export type TrendDir = 'up' | 'down' | 'flat'

export type ActivityTrend = {
  dir: TrendDir
  label: string
  pct: number
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function computeActivityTrend(counts: number[]): ActivityTrend {
  if (counts.length < 4) {
    return { dir: 'flat', label: 'Мало данных для тренда', pct: 0 }
  }

  const mid = Math.floor(counts.length / 2)
  const firstAvg = counts.slice(0, mid).reduce((sum, value) => sum + value, 0) / Math.max(mid, 1)
  const secondAvg =
    counts.slice(mid).reduce((sum, value) => sum + value, 0) / Math.max(counts.length - mid, 1)

  if (firstAvg <= 0 && secondAvg <= 0) {
    return { dir: 'flat', label: 'Без изменений', pct: 0 }
  }
  if (firstAvg <= 0) {
    return { dir: 'up', label: 'Рост к концу периода', pct: 100 }
  }

  const pct = Math.round(((secondAvg - firstAvg) / firstAvg) * 100)
  if (pct > 3) return { dir: 'up', label: `Рост на ${pct}%`, pct }
  if (pct < -3) return { dir: 'down', label: `Снижение на ${Math.abs(pct)}%`, pct }
  return { dir: 'flat', label: 'Стабильный темп', pct }
}

export function milestoneProgressWeight(input: {
  linkedDone: number
  linkedTotal: number
  status?: string
  achieved?: boolean
}): number {
  if (input.linkedTotal > 0) return input.linkedDone / input.linkedTotal
  if (input.status === 'completed' || input.achieved) return 1
  if (input.status === 'active') return 0.5
  return 0
}

export function branchProgressPercent(weights: number[]): number {
  if (!weights.length) return 0
  const sum = weights.reduce((total, value) => total + value, 0)
  return Math.round((sum / weights.length) * 100)
}

export function weightedBranchesScore(
  branches: { progress: number; total: number }[]
): number {
  const withMilestones = branches.filter((branch) => branch.total > 0)
  if (!withMilestones.length) return 0
  const totalWeight = withMilestones.reduce((sum, branch) => sum + branch.total, 0)
  if (!totalWeight) return 0
  const weighted = withMilestones.reduce(
    (sum, branch) => sum + branch.progress * branch.total,
    0
  )
  return Math.round(weighted / totalWeight)
}

export function computeStreak(
  history: Map<string, number>,
  todayKey: string
): { current: number; longest: number } {
  let current = 0
  const cursor = new Date(`${todayKey}T12:00:00`)
  const todayCount = history.get(todayKey) ?? 0
  if (todayCount > 0) current += 1
  cursor.setDate(cursor.getDate() - 1)
  while (true) {
    const key = getLocalDateKey(cursor)
    const count = history.get(key)
    if (count === undefined || count <= 0) break
    current += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  const sortedDates = [...history.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  let longest = 0
  let run = 0
  let prevDate: string | null = null
  for (const [date, count] of sortedDates) {
    if (count > 0) {
      if (prevDate) {
        const prev = new Date(`${prevDate}T12:00:00`)
        prev.setDate(prev.getDate() + 1)
        run = getLocalDateKey(prev) === date ? run + 1 : 1
      } else {
        run = 1
      }
      longest = Math.max(longest, run)
      prevDate = date
    } else {
      run = 0
      prevDate = null
    }
  }

  return { current, longest: Math.max(longest, current) }
}

export type AnalyticsHistoryEntry = { date: string; count: number }

export type AnalyticsLogLike = {
  at: number
  taskId: string
  type?: string
  title?: string
}

export type AnalyticsTaskLike = {
  id: string
  title?: string
  type?: string
  done?: boolean
  completedAt?: number
  lastCompletedAt?: number
}

export type AnalyticsCompletionEvent = {
  at: number
  taskId: string
  type: string
  title: string
}

function isPurchase(type?: string) {
  return type === 'PURCHASE'
}

function bumpCount(map: Map<string, number>, date: string, delta = 1) {
  if (!date || !delta) return
  map.set(date, (map.get(date) || 0) + delta)
}

export function collectTaskCompletionEvents(
  tasks: AnalyticsTaskLike[]
): AnalyticsCompletionEvent[] {
  const events: AnalyticsCompletionEvent[] = []
  const seen = new Set<string>()

  function push(task: AnalyticsTaskLike, at: number | undefined) {
    if (!task.id || !at) return
    const key = `${task.id}:${at}`
    if (seen.has(key)) return
    seen.add(key)
    events.push({
      at,
      taskId: task.id,
      type: task.type || 'TASK_DAY',
      title: task.title || 'Задача',
    })
  }

  for (const task of tasks) {
    if (isPurchase(task.type)) continue
    if (task.done && task.completedAt) push(task, task.completedAt)
    if (task.type === 'HABIT' && task.lastCompletedAt) push(task, task.lastCompletedAt)
  }

  return events
}

/** Take the richest daily count from history, the event log, and task timestamps. */
export function mergeActivityCounts(input: {
  history?: AnalyticsHistoryEntry[]
  log?: AnalyticsLogLike[]
  tasks?: AnalyticsTaskLike[]
}): Map<string, number> {
  const historyMap = new Map<string, number>()
  for (const item of input.history || []) {
    if (!item?.date) continue
    historyMap.set(item.date, Math.max(historyMap.get(item.date) || 0, item.count || 0))
  }

  const logMap = new Map<string, number>()
  for (const entry of input.log || []) {
    if (!entry?.at) continue
    bumpCount(logMap, getLocalDateKey(new Date(entry.at)))
  }

  const taskMap = new Map<string, number>()
  for (const event of collectTaskCompletionEvents(input.tasks || [])) {
    bumpCount(taskMap, getLocalDateKey(new Date(event.at)))
  }

  const merged = new Map<string, number>()
  const dates = new Set([...historyMap.keys(), ...logMap.keys(), ...taskMap.keys()])
  for (const date of dates) {
    merged.set(
      date,
      Math.max(historyMap.get(date) || 0, logMap.get(date) || 0, taskMap.get(date) || 0)
    )
  }
  return merged
}

export function mergeCompletionEvents(input: {
  log?: AnalyticsLogLike[]
  tasks?: AnalyticsTaskLike[]
}): AnalyticsCompletionEvent[] {
  const fromLog: AnalyticsCompletionEvent[] = []
  const seen = new Set<string>()
  for (const entry of input.log || []) {
    if (!entry?.at || !entry.taskId) continue
    const key = `${entry.taskId}:${entry.at}`
    if (seen.has(key)) continue
    seen.add(key)
    fromLog.push({
      at: entry.at,
      taskId: entry.taskId,
      type: entry.type || 'TASK_DAY',
      title: entry.title || 'Задача',
    })
  }

  const extra = collectTaskCompletionEvents(input.tasks || []).filter(
    (event) => !seen.has(`${event.taskId}:${event.at}`)
  )
  return [...fromLog, ...extra].sort((a, b) => b.at - a.at)
}
