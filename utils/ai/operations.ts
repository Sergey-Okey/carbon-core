import {
  AI_BOARD_ICONS,
  AI_OP_TYPES,
  AI_SETTINGS_KEYS,
  AI_TASK_TYPES,
  type AiContext,
  type AiOpType,
  type AiOperation,
} from '../../types/ai.types.ts'
import { omitSecretFields } from './secrets.ts'
import type { TaskType } from '../../types/task.types.ts'

export const AI_MAX_OPERATIONS = 40
export const AI_MAX_MESSAGE_LENGTH = 2000
const REF_PATTERN = /^\$[A-Za-z0-9_-]{1,32}$/

const OP_ORDER: Record<AiOpType, number> = {
  createTag: 0,
  createBranch: 1,
  createReward: 2,
  createMilestone: 3,
  createTask: 4,
  updateTag: 5,
  updateBranch: 5,
  updateMilestone: 5,
  updateTask: 5,
  updateReward: 5,
  updateSettings: 5,
  updateProfile: 5,
  linkTask: 6,
  unlinkTask: 6,
  connectNodes: 6,
  disconnectNodes: 6,
  completeTask: 7,
  reopenTask: 7,
  restoreTask: 7,
  deleteTask: 8,
  deleteTag: 9,
  deleteReward: 9,
  deleteMilestone: 10,
  deleteBranch: 11,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asTrimmed(value: unknown, max: number) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function asOptionalString(value: unknown, max: number) {
  const text = asTrimmed(value, max)
  return text || undefined
}

function asStringArray(value: unknown, maxItems = 12, maxLen = 80) {
  if (!Array.isArray(value)) return undefined
  const items = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems)
  return items.length ? items : undefined
}

function asRef(value: unknown) {
  const text = asTrimmed(value, 40)
  return REF_PATTERN.test(text) ? text : undefined
}

function asId(value: unknown) {
  const text = asTrimmed(value, 80)
  if (!text) return ''
  if (text.startsWith('$') && !REF_PATTERN.test(text)) return ''
  return text
}

function asTaskType(value: unknown): TaskType | undefined {
  return AI_TASK_TYPES.find((item) => item === value)
}

function asIcon(value: unknown) {
  const icon = asTrimmed(value, 40)
  return AI_BOARD_ICONS.includes(icon as (typeof AI_BOARD_ICONS)[number])
    ? icon
    : undefined
}

function parseOperation(raw: unknown): AiOperation | null {
  if (!isRecord(raw)) return null
  const op = AI_OP_TYPES.find((item) => item === raw.op)
  if (!op) return null

  switch (op) {
    case 'createTask': {
      const title = asTrimmed(raw.title, 160)
      const type = asTaskType(raw.type)
      if (!title || !type) return null
      return {
        op,
        ref: asRef(raw.ref),
        title,
        type,
        description: asOptionalString(raw.description, 800),
        tagNames: asStringArray(raw.tagNames),
        targetDate: asOptionalString(raw.targetDate, 32),
        targetTime: asOptionalString(raw.targetTime, 16),
        branchId: asOptionalString(raw.branchId, 80),
        milestoneId: asOptionalString(raw.milestoneId, 80),
        purchaseRewardId: asOptionalString(raw.purchaseRewardId, 80),
      }
    }
    case 'updateTask': {
      const id = asId(raw.id)
      if (!id) return null
      return {
        op,
        id,
        title: asOptionalString(raw.title, 160),
        description: asOptionalString(raw.description, 800),
        type: asTaskType(raw.type),
        tagNames: asStringArray(raw.tagNames),
        targetDate: asOptionalString(raw.targetDate, 32),
        targetTime: asOptionalString(raw.targetTime, 16),
        done: typeof raw.done === 'boolean' ? raw.done : undefined,
      }
    }
    case 'completeTask':
    case 'reopenTask':
    case 'deleteTask':
    case 'restoreTask': {
      const id = asId(raw.id)
      return id ? { op, id } : null
    }
    case 'createBranch': {
      const displayName = asTrimmed(raw.displayName, 120)
      if (!displayName) return null
      return {
        op,
        ref: asRef(raw.ref),
        displayName,
        description: asOptionalString(raw.description, 800),
        icon: asIcon(raw.icon) || 'target',
        markerColor: asOptionalString(raw.markerColor, 20),
      }
    }
    case 'updateBranch': {
      const id = asId(raw.id)
      if (!id) return null
      return {
        op,
        id,
        displayName: asOptionalString(raw.displayName, 120),
        description: asOptionalString(raw.description, 800),
        icon: asIcon(raw.icon),
        markerColor: asOptionalString(raw.markerColor, 20),
      }
    }
    case 'deleteBranch': {
      const id = asId(raw.id)
      return id ? { op, id } : null
    }
    case 'createMilestone': {
      const name = asTrimmed(raw.name, 120)
      if (!name) return null
      return {
        op,
        ref: asRef(raw.ref),
        name,
        description: asOptionalString(raw.description, 800),
        branchId: asOptionalString(raw.branchId, 80),
        sourceId: asOptionalString(raw.sourceId, 80),
        taskIds: asStringArray(raw.taskIds, 20, 80),
      }
    }
    case 'updateMilestone': {
      const id = asId(raw.id)
      if (!id) return null
      const status =
        raw.status === 'pending' || raw.status === 'active' || raw.status === 'completed'
          ? raw.status
          : undefined
      return {
        op,
        id,
        name: asOptionalString(raw.name, 120),
        description: asOptionalString(raw.description, 800),
        status,
        taskIds: asStringArray(raw.taskIds, 20, 80),
      }
    }
    case 'deleteMilestone': {
      const id = asId(raw.id)
      return id ? { op, id } : null
    }
    case 'connectNodes': {
      const sourceId = asId(raw.sourceId)
      const targetId = asId(raw.targetId)
      return sourceId && targetId ? { op, sourceId, targetId } : null
    }
    case 'disconnectNodes': {
      const edgeId = asOptionalString(raw.edgeId, 80)
      const sourceId = asOptionalString(raw.sourceId, 80)
      const targetId = asOptionalString(raw.targetId, 80)
      if (!edgeId && !(sourceId && targetId)) return null
      return { op, edgeId, sourceId, targetId }
    }
    case 'linkTask':
    case 'unlinkTask': {
      const taskId = asId(raw.taskId)
      const branchId = asOptionalString(raw.branchId, 80)
      const milestoneId = asOptionalString(raw.milestoneId, 80)
      if (!taskId || (!branchId && !milestoneId)) return null
      return { op, taskId, branchId, milestoneId }
    }
    case 'createTag': {
      const name = asTrimmed(raw.name, 80)
      if (!name) return null
      return {
        op,
        ref: asRef(raw.ref),
        name,
        color: asOptionalString(raw.color, 40),
        branchId: asOptionalString(raw.branchId, 80),
      }
    }
    case 'updateTag': {
      const id = asId(raw.id)
      if (!id) return null
      return {
        op,
        id,
        name: asOptionalString(raw.name, 80),
        color: asOptionalString(raw.color, 40),
        branchId: asOptionalString(raw.branchId, 80),
      }
    }
    case 'deleteTag': {
      const id = asId(raw.id)
      return id ? { op, id } : null
    }
    case 'createReward': {
      const title = asTrimmed(raw.title, 120)
      if (!title) return null
      return {
        op,
        ref: asRef(raw.ref),
        title,
        description: asOptionalString(raw.description, 400),
        leaguePoints:
          typeof raw.leaguePoints === 'number'
            ? Math.max(0, Math.min(5000, Math.round(raw.leaguePoints)))
            : undefined,
      }
    }
    case 'updateReward': {
      const id = asId(raw.id)
      if (!id) return null
      return {
        op,
        id,
        title: asOptionalString(raw.title, 120),
        description: asOptionalString(raw.description, 400),
        leaguePoints:
          typeof raw.leaguePoints === 'number'
            ? Math.max(0, Math.min(5000, Math.round(raw.leaguePoints)))
            : undefined,
      }
    }
    case 'deleteReward': {
      const id = asId(raw.id)
      return id ? { op, id } : null
    }
    case 'updateSettings': {
      if (!isRecord(raw.values)) return null
      const values: Record<string, string | number | boolean> = {}
      for (const key of AI_SETTINGS_KEYS) {
        const value = raw.values[key]
        if (typeof value === 'string') values[key] = value.slice(0, 64)
        else if (typeof value === 'number' || typeof value === 'boolean') values[key] = value
      }
      if (!Object.keys(values).length) return null
      return { op, values }
    }
    case 'updateProfile': {
      const name = asOptionalString(raw.name, 80)
      const bio = asOptionalString(raw.bio, 280)
      if (!name && !bio) return null
      return { op, name, bio }
    }
    default:
      return null
  }
}

export function sortAiOperations(operations: AiOperation[]) {
  return [...operations].sort((left, right) => OP_ORDER[left.op] - OP_ORDER[right.op])
}

export function extractJsonObject(text: string): unknown | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = (fenced?.[1] || trimmed).trim()
  const attempts = [candidate]
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start >= 0 && end > start) attempts.push(candidate.slice(start, end + 1))
  for (const attempt of attempts) {
    try {
      const parsed = JSON.parse(attempt)
      if (isRecord(parsed) || Array.isArray(parsed)) return parsed
    } catch {
      // try the next candidate
    }
  }
  return null
}

export function parseAiResponse(raw: unknown): { message: string; operations: AiOperation[] } {
  const cleaned = omitSecretFields(raw)
  const source = isRecord(cleaned) ? cleaned : {}
  const operations = Array.isArray(source.operations)
    ? source.operations.map(parseOperation).filter((item): item is AiOperation => Boolean(item))
    : []
  return {
    message: asTrimmed(source.message, AI_MAX_MESSAGE_LENGTH) || 'Готово.',
    operations: sortAiOperations(operations).slice(0, AI_MAX_OPERATIONS),
  }
}

export function parseAiTextResponse(text: string): { message: string; operations: AiOperation[] } {
  const parsed = extractJsonObject(text)
  if (parsed == null) {
    return {
      message: asTrimmed(text, AI_MAX_MESSAGE_LENGTH) || 'Готово.',
      operations: [],
    }
  }
  return parseAiResponse(parsed)
}

export function countNewPeriodTasks(operations: AiOperation[], type: TaskType) {
  return operations.filter((item) => item.op === 'createTask' && item.type === type).length
}

export function remainingSlots(context: AiContext, type: TaskType) {
  return context.slots[type]?.remaining
}
