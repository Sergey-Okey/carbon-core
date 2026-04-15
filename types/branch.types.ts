export type BranchId = 'FIN' | 'BODY' | 'MIND' | 'LDR' | (string & {})

export interface Milestone {
  id: string
  name: string
  description?: string
  requiredXP: number
  currentXP: number
  status: 'pending' | 'active' | 'completed'
  taskIds: string[]
  position: { x: number; y: number }
}

export interface Branch {
  id: BranchId
  displayName: string
  icon: string
  description?: string
  taskIds: string[]
  milestones: Milestone[]
  order: number
}
