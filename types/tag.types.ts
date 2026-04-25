import type { BranchId } from './task.types'

export interface Tag {
  id: string
  name: string
  branchId: BranchId
  color?: string
  order: number
}
