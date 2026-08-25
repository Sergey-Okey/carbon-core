import type { TaskType } from './task.types.ts'

export const AI_TASK_TYPES: TaskType[] = [
  'HABIT',
  'TASK_DAY',
  'TASK_WEEK',
  'TASK_MONTH',
  'TASK_YEAR',
  'PURCHASE',
]

export const AI_BOARD_ICONS = [
  'trending-up',
  'dumbbell',
  'brain',
  'users',
  'target',
  'briefcase',
  'heart',
  'book-open',
  'award',
  'code',
  'rocket',
  'flag',
  'compass',
  'map',
  'plane',
  'home',
  'graduation-cap',
  'lightbulb',
  'trophy',
  'wallet-cards',
  'folder-kanban',
  'calendar-days',
  'help-circle',
] as const

export const AI_SETTINGS_KEYS = [
  'themeMode',
  'accentColor',
  'uiDensity',
  'animationsEnabled',
  'soundEnabled',
  'hapticsEnabled',
  'notificationsEnabled',
  'showTopStats',
  'showSettingsStats',
  'boardLayoutDensity',
  'boardColumns',
  'boardShowNodeTypes',
] as const

export type AiBoardIcon = (typeof AI_BOARD_ICONS)[number]
export type AiSettingsKey = (typeof AI_SETTINGS_KEYS)[number]

export const AI_OP_TYPES = [
  'createTask',
  'updateTask',
  'completeTask',
  'reopenTask',
  'deleteTask',
  'restoreTask',
  'createBranch',
  'updateBranch',
  'deleteBranch',
  'createMilestone',
  'updateMilestone',
  'deleteMilestone',
  'connectNodes',
  'disconnectNodes',
  'linkTask',
  'unlinkTask',
  'createTag',
  'updateTag',
  'deleteTag',
  'createReward',
  'updateReward',
  'deleteReward',
  'updateSettings',
  'updateProfile',
] as const

export type AiOpType = (typeof AI_OP_TYPES)[number]

export type AiRef = string

export type AiOperation =
  | {
      op: 'createTask'
      ref?: AiRef
      title: string
      type: TaskType
      description?: string
      tagNames?: string[]
      targetDate?: string
      targetTime?: string
      branchId?: string
      milestoneId?: string
      purchaseRewardId?: string
    }
  | {
      op: 'updateTask'
      id: string
      title?: string
      description?: string
      type?: TaskType
      tagNames?: string[]
      targetDate?: string
      targetTime?: string
      done?: boolean
    }
  | { op: 'completeTask'; id: string }
  | { op: 'reopenTask'; id: string }
  | { op: 'deleteTask'; id: string }
  | { op: 'restoreTask'; id: string }
  | {
      op: 'createBranch'
      ref?: AiRef
      displayName: string
      description?: string
      icon?: string
      markerColor?: string
    }
  | {
      op: 'updateBranch'
      id: string
      displayName?: string
      description?: string
      icon?: string
      markerColor?: string
    }
  | { op: 'deleteBranch'; id: string }
  | {
      op: 'createMilestone'
      ref?: AiRef
      name: string
      description?: string
      branchId?: string
      sourceId?: string
      taskIds?: string[]
    }
  | {
      op: 'updateMilestone'
      id: string
      name?: string
      description?: string
      status?: 'pending' | 'active' | 'completed'
      taskIds?: string[]
    }
  | { op: 'deleteMilestone'; id: string }
  | { op: 'connectNodes'; sourceId: string; targetId: string }
  | { op: 'disconnectNodes'; edgeId?: string; sourceId?: string; targetId?: string }
  | { op: 'linkTask'; taskId: string; branchId?: string; milestoneId?: string }
  | { op: 'unlinkTask'; taskId: string; branchId?: string; milestoneId?: string }
  | {
      op: 'createTag'
      ref?: AiRef
      name: string
      color?: string
      branchId?: string
    }
  | { op: 'updateTag'; id: string; name?: string; color?: string; branchId?: string }
  | { op: 'deleteTag'; id: string }
  | {
      op: 'createReward'
      ref?: AiRef
      title: string
      description?: string
      leaguePoints?: number
    }
  | {
      op: 'updateReward'
      id: string
      title?: string
      description?: string
      leaguePoints?: number
    }
  | { op: 'deleteReward'; id: string }
  | { op: 'updateSettings'; values: Partial<Record<AiSettingsKey, string | number | boolean>> }
  | { op: 'updateProfile'; name?: string; bio?: string }

export type AiContextTask = {
  id: string
  title: string
  description?: string
  type: TaskType
  done: boolean
  tagNames: string[]
  targetDate?: string
  targetTime?: string
  lastCompletedAt?: string
}

export type AiContextMilestone = {
  id: string
  name: string
  description?: string
  status: 'pending' | 'active' | 'completed'
  taskIds: string[]
}

export type AiContextBranch = {
  id: string
  displayName: string
  description?: string
  icon: string
  directTaskIds: string[]
  milestones: AiContextMilestone[]
}

export type AiContext = {
  today: string
  slots: Record<TaskType, { active: number; remaining: number | null }>
  tasks: AiContextTask[]
  deletedTasks: { id: string; title: string; type: TaskType }[]
  branches: AiContextBranch[]
  edges: { id: string; source: string; target: string }[]
  tags: { id: string; name: string; branchId?: string }[]
  rewards: { id: string; title: string; purchased: boolean; completed: boolean }[]
  progress: {
    name: string
    bio: string
    level: number
    league: string
    leaguePoints: number
  }
  settings: Partial<Record<AiSettingsKey, string | number | boolean>>
  memory: { at: string; request: string; message: string; applied: string[] }[]
}

export type AiActRequest = {
  request: string
  context: AiContext
}

export type AiActResponse = {
  message: string
  operations: AiOperation[]
}

export type AiEntityKind = 'task' | 'branch' | 'milestone' | 'tag' | 'reward'

export type AiEntityRef = {
  kind: AiEntityKind
  id: string
  label: string
}

export type AiApplyResult = {
  op: AiOpType
  ok: boolean
  detail: string
  entity?: AiEntityRef
}

export type AiMemoryEntry = {
  at: number
  request: string
  message: string
  applied: string[]
  links?: AiEntityRef[]
}
