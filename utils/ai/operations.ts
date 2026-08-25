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

/** Models name colours instead of writing hex, so the common names are mapped here. */
const COLOR_NAMES: Record<string, string> = {
  красный: '#ef4444',
  алый: '#ef4444',
  red: '#ef4444',
  оранжевый: '#f97316',
  orange: '#f97316',
  желтый: '#eab308',
  yellow: '#eab308',
  зеленый: '#22c55e',
  салатовый: '#22c55e',
  green: '#22c55e',
  бирюзовый: '#14b8a6',
  teal: '#14b8a6',
  голубой: '#06b6d4',
  cyan: '#06b6d4',
  синий: '#3b82f6',
  blue: '#3b82f6',
  фиолетовый: '#8b5cf6',
  сиреневый: '#8b5cf6',
  purple: '#8b5cf6',
  violet: '#8b5cf6',
  розовый: '#ec4899',
  pink: '#ec4899',
  серый: '#64748b',
  gray: '#64748b',
  grey: '#64748b',
}

const TASK_TYPE_ALIASES: Record<string, TaskType> = {
  habit: 'HABIT',
  привычка: 'HABIT',
  ежедневно: 'HABIT',
  day: 'TASK_DAY',
  daily: 'TASK_DAY',
  день: 'TASK_DAY',
  week: 'TASK_WEEK',
  weekly: 'TASK_WEEK',
  неделя: 'TASK_WEEK',
  month: 'TASK_MONTH',
  monthly: 'TASK_MONTH',
  месяц: 'TASK_MONTH',
  year: 'TASK_YEAR',
  yearly: 'TASK_YEAR',
  год: 'TASK_YEAR',
  purchase: 'PURCHASE',
  покупка: 'PURCHASE',
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

/** Picks the first field the model filled in, so synonyms do not lose the value. */
function firstOf(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value
  }
  return undefined
}

function asTaskType(value: unknown): TaskType | undefined {
  const exact = AI_TASK_TYPES.find((item) => item === value)
  if (exact) return exact
  const text = asTrimmed(value, 40).toLowerCase().replace(/ё/g, 'е').replace(/[\s-]+/g, '_')
  if (!text) return undefined
  const upper = text.toUpperCase()
  return (
    AI_TASK_TYPES.find((item) => item === upper) ||
    TASK_TYPE_ALIASES[text] ||
    TASK_TYPE_ALIASES[text.replace(/^task_/, '')]
  )
}

function asColor(...values: unknown[]) {
  for (const value of values) {
    const text = asTrimmed(value, 40).toLowerCase().replace(/ё/g, 'е')
    if (!text) continue
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(text)) return text
    const named = COLOR_NAMES[text]
    if (named) return named
  }
  return undefined
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
      const title = asTrimmed(firstOf(raw.title, raw.name), 160)
      const type = asTaskType(raw.type) || 'TASK_DAY'
      if (!title) return null
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
      const id = asId(firstOf(raw.id, raw.taskId))
      if (!id) return null
      return {
        op,
        id,
        title: asOptionalString(firstOf(raw.title, raw.name), 160),
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
      const id = asId(firstOf(raw.id, raw.taskId))
      return id ? { op, id } : null
    }
    case 'createBranch': {
      const displayName = asTrimmed(firstOf(raw.displayName, raw.name, raw.title), 120)
      if (!displayName) return null
      return {
        op,
        ref: asRef(raw.ref),
        displayName,
        description: asOptionalString(raw.description, 800),
        icon: asIcon(raw.icon) || 'target',
        markerColor: asColor(raw.markerColor, raw.color, raw.backgroundColor),
      }
    }
    case 'updateBranch': {
      const id = asId(firstOf(raw.id, raw.branchId))
      if (!id) return null
      return {
        op,
        id,
        displayName: asOptionalString(firstOf(raw.displayName, raw.name, raw.title), 120),
        description: asOptionalString(raw.description, 800),
        icon: asIcon(raw.icon),
        markerColor: asColor(raw.markerColor, raw.color, raw.backgroundColor),
      }
    }
    case 'deleteBranch': {
      const id = asId(firstOf(raw.id, raw.branchId))
      return id ? { op, id } : null
    }
    case 'createMilestone': {
      const name = asTrimmed(firstOf(raw.name, raw.title), 120)
      if (!name) return null
      return {
        op,
        ref: asRef(raw.ref),
        name,
        description: asOptionalString(raw.description, 800),
        branchId: asOptionalString(raw.branchId, 80),
        sourceId: asOptionalString(firstOf(raw.sourceId, raw.source, raw.fromId), 80),
        taskIds: asStringArray(raw.taskIds, 20, 80),
      }
    }
    case 'updateMilestone': {
      const id = asId(firstOf(raw.id, raw.milestoneId))
      if (!id) return null
      const status =
        raw.status === 'pending' || raw.status === 'active' || raw.status === 'completed'
          ? raw.status
          : undefined
      return {
        op,
        id,
        name: asOptionalString(firstOf(raw.name, raw.title), 120),
        description: asOptionalString(raw.description, 800),
        status,
        taskIds: asStringArray(raw.taskIds, 20, 80),
      }
    }
    case 'deleteMilestone': {
      const id = asId(firstOf(raw.id, raw.milestoneId))
      return id ? { op, id } : null
    }
    case 'connectNodes': {
      const sourceId = asId(firstOf(raw.sourceId, raw.source, raw.fromId))
      const targetId = asId(firstOf(raw.targetId, raw.target, raw.toId))
      return sourceId && targetId ? { op, sourceId, targetId } : null
    }
    case 'disconnectNodes': {
      const edgeId = asOptionalString(firstOf(raw.edgeId, raw.id), 80)
      const sourceId = asOptionalString(firstOf(raw.sourceId, raw.source, raw.fromId), 80)
      const targetId = asOptionalString(firstOf(raw.targetId, raw.target, raw.toId), 80)
      if (!edgeId && !(sourceId && targetId)) return null
      return { op, edgeId, sourceId, targetId }
    }
    case 'linkTask':
    case 'unlinkTask': {
      const taskId = asId(firstOf(raw.taskId, raw.id))
      const branchId = asOptionalString(raw.branchId, 80)
      const milestoneId = asOptionalString(raw.milestoneId, 80)
      if (!taskId || (!branchId && !milestoneId)) return null
      return { op, taskId, branchId, milestoneId }
    }
    case 'createTag': {
      const name = asTrimmed(firstOf(raw.name, raw.title), 80)
      if (!name) return null
      return {
        op,
        ref: asRef(raw.ref),
        name,
        color: asColor(raw.color, raw.markerColor),
        branchId: asOptionalString(raw.branchId, 80),
      }
    }
    case 'updateTag': {
      const id = asId(firstOf(raw.id, raw.tagId))
      if (!id) return null
      return {
        op,
        id,
        name: asOptionalString(firstOf(raw.name, raw.title), 80),
        color: asColor(raw.color, raw.markerColor),
        branchId: asOptionalString(raw.branchId, 80),
      }
    }
    case 'deleteTag': {
      const id = asId(firstOf(raw.id, raw.tagId))
      return id ? { op, id } : null
    }
    case 'createReward': {
      const title = asTrimmed(firstOf(raw.title, raw.name), 120)
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
      const id = asId(firstOf(raw.id, raw.rewardId))
      if (!id) return null
      return {
        op,
        id,
        title: asOptionalString(firstOf(raw.title, raw.name), 120),
        description: asOptionalString(raw.description, 400),
        leaguePoints:
          typeof raw.leaguePoints === 'number'
            ? Math.max(0, Math.min(5000, Math.round(raw.leaguePoints)))
            : undefined,
      }
    }
    case 'deleteReward': {
      const id = asId(firstOf(raw.id, raw.rewardId))
      return id ? { op, id } : null
    }
    case 'updateSettings': {
      const source = isRecord(raw.values) ? raw.values : raw
      const values: Record<string, string | number | boolean> = {}
      for (const key of AI_SETTINGS_KEYS) {
        const value = source[key]
        if (key === 'accentColor') {
          const color = asColor(value)
          if (color) values[key] = color
          continue
        }
        if (typeof value === 'string') values[key] = value.slice(0, 64)
        else if (typeof value === 'number' || typeof value === 'boolean') values[key] = value
      }
      if (!Object.keys(values).length) return null
      return { op, values }
    }
    case 'updateProfile': {
      const name = asOptionalString(raw.name, 80)
      const bio = asOptionalString(firstOf(raw.bio, raw.about), 280)
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
