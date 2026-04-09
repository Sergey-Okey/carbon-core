import type { BranchId } from './task.types'

export interface Tag {
  id: string
  name: string // отображаемое имя, например "#финансы"
  branchId: BranchId // к какой ветке относится
  color?: string // опциональный акцентный цвет (пока не используется)
  order: number
}
