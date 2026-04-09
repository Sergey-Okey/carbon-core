export type TaskType =
  | 'HABIT'
  | 'TASK_DAY'
  | 'TASK_WEEK'
  | 'TASK_MONTH'
  | 'TASK_YEAR'
  | 'PURCHASE'
export type BranchId = 'FIN' | 'BODY' | 'MIND' | 'LDR'

export interface Task {
  id: string
  title: string
  description?: string
  type: TaskType
  tagIds: string[] // ID тегов из tags.store
  done: boolean
  completedAt?: number
  // Для задач с горизонтом
  targetDate?: string // YYYY-MM-DD, для TASK_DAY, WEEK, MONTH, YEAR
  // Для привычек (HABIT) – можно выполнять многократно, done сбрасывается автоматически
  lastCompletedAt?: number
  // Для PURCHASE – создаётся при покупке награды
  purchaseRewardId?: string
  // Системные
  createdAt: number
  updatedAt?: number
}
