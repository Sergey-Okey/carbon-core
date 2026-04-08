export type QuestType = 'DAILY' | 'HABIT' | 'EPIC'
export type BranchId = 'FIN' | 'BODY' | 'MIND' | 'LDR'

export interface Quest {
  id: string
  title: string
  description?: string
  type: QuestType
  branchId: BranchId
  xpReward: number
  goldReward?: number
  done: boolean
  createdAt: number
  completedAt?: number
  lastResetDate?: string
}
