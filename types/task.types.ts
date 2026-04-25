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
  tagIds: string[]
  done: boolean
  completedAt?: number
  targetDate?: string
  lastCompletedAt?: number
  purchaseRewardId?: string
  createdAt: number
  updatedAt?: number
}
