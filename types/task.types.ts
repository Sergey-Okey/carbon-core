import type { BranchId } from './branch.types'

export type TaskType =
  | 'HABIT'
  | 'TASK_DAY'
  | 'TASK_WEEK'
  | 'TASK_MONTH'
  | 'TASK_YEAR'
  | 'PURCHASE'
export type { BranchId }

export interface TaskTag {
  id: string
  name: string
  branchId?: BranchId | ''
  color?: string
  order: number
}

export interface Task {
  id: string
  title: string
  description?: string
  type: TaskType
  tagIds: string[]
  tags?: TaskTag[]
  done: boolean
  completedAt?: number
  targetDate?: string
  lastCompletedAt?: number
  purchaseRewardId?: string
  xpReward?: number
  createdAt: number
  updatedAt?: number
}
