export type BranchId = string

export interface Milestone {
  id: string
  name: string
  description?: string
  requiredXP: number
  achieved: boolean
  sourceTaskIds: string[] // ID задач, которые привели к этапу
  icon?: string
  position?: { x: number; y: number }
}

export interface Branch {
  id: BranchId
  displayName: string
  icon: string
  totalXP: number
  milestones: Milestone[]
  position: { x: number; y: number }
  scale?: number
  order: number
  isSystem?: boolean // защита от удаления
  createdAt?: number
}

export interface BranchEdge {
  id: string
  source: string // ID узла (branchId-milestoneId)
  target: string
  sourceHandle?: string
  targetHandle?: string
  type?: string
  animated?: boolean
  label?: string
  style?: Record<string, any>
}
