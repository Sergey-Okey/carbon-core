export type BranchId = 'FIN' | 'BODY' | 'MIND' | 'LDR' | string

export interface Milestone {
  id: string
  name: string
  requiredXP: number
  achieved: boolean
  reward?: {
    gold?: number
    hpBonus?: number
  }
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
}
