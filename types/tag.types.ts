import type { BranchId } from './task.types'

export type TagScope = 'habit' | 'task'

export interface Tag {
  id: string
  name: string
  branchId?: BranchId | ''
  color?: string
  scope?: TagScope
  order: number
}
