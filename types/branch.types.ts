export type BranchId = 'FIN' | 'BODY' | 'MIND' | 'LDR' | (string & {})

export interface Milestone {
  id: string
  name: string
  description?: string
  icon?: string
  backgroundColor?: string
  requiredXP: number
  currentXP: number
  status: 'pending' | 'active' | 'completed'
  taskIds: string[]
  sourceTaskIds?: string[]
  position: { x: number; y: number }
  achieved?: boolean
}

export interface Branch {
  id: BranchId
  displayName: string
  icon: string
  description?: string
  backgroundColor?: string
  taskIds: string[]
  milestones: Milestone[]
  order: number
  totalXP?: number
  position?: { x: number; y: number }
}

export type BranchNodeData =
  | {
      type: 'branch'
      branchId: string
      milestone: null
      branchIcon?: string
      branchColor?: string
    }
  | {
      type: 'milestone'
      branchId: string
      milestone: Milestone
      branchIcon?: string
      branchColor?: string
    }
