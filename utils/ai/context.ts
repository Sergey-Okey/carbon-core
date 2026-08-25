import type { TaskType } from '../../types/task.types.ts'
import {
  AI_SETTINGS_KEYS,
  AI_TASK_TYPES,
  type AiContext,
  type AiContextBranch,
  type AiContextMilestone,
  type AiContextTask,
} from '../../types/ai.types.ts'
import { isSecretKey } from './secrets.ts'

const TASK_SLOT_LIMIT: Partial<Record<TaskType, number>> = {
  TASK_DAY: 3,
  TASK_WEEK: 3,
  TASK_MONTH: 3,
  TASK_YEAR: 3,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown, max = 2000) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function asBoolean(value: unknown) {
  return value === true
}

function asStringArray(value: unknown, maxItems = 24, maxLen = 80) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .slice(0, maxItems)
    .map((item) => item.trim().slice(0, maxLen))
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

function pickTask(raw: unknown): AiContextTask | null {
  if (!isRecord(raw)) return null
  const type = AI_TASK_TYPES.find((item) => item === raw.type)
  const id = asString(raw.id, 80)
  const title = asString(raw.title, 160)
  if (!type || !id || !title) return null
  const tagNames = asStringArray(raw.tagNames)
  const embeddedTags = Array.isArray(raw.tags)
    ? raw.tags
        .map((tag) => (isRecord(tag) ? asString(tag.name, 80) : ''))
        .filter(Boolean)
    : []
  return {
    id,
    title,
    description: asString(raw.description, 400) || undefined,
    type,
    done: asBoolean(raw.done),
    tagNames: tagNames.length ? tagNames : embeddedTags,
    targetDate: asString(raw.targetDate, 32) || undefined,
    targetTime: asString(raw.targetTime, 16) || undefined,
    lastCompletedAt:
      typeof raw.lastCompletedAt === 'number'
        ? new Date(raw.lastCompletedAt).toISOString()
        : undefined,
  }
}

function pickBranch(raw: unknown): AiContextBranch | null {
  if (!isRecord(raw)) return null
  const id = asString(raw.id, 80)
  const displayName = asString(raw.displayName, 120)
  if (!id || !displayName) return null
  const milestones = Array.isArray(raw.milestones)
    ? raw.milestones
        .map((item) => {
          if (!isRecord(item)) return null
          const milestoneId = asString(item.id, 80)
          const name = asString(item.name, 120)
          if (!milestoneId || !name) return null
          const status: AiContextMilestone['status'] =
            item.status === 'active' || item.status === 'completed' || item.status === 'pending'
              ? item.status
              : 'pending'
          return {
            id: milestoneId,
            name,
            description: asString(item.description, 400) || undefined,
            status,
            taskIds: asStringArray(item.taskIds, 40, 80),
          }
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    : []
  return {
    id,
    displayName,
    description: asString(raw.description, 400) || undefined,
    icon: asString(raw.icon, 40) || 'target',
    directTaskIds: asStringArray(raw.directTaskIds ?? raw.taskIds, 40, 80),
    milestones,
  }
}

function pickSettings(raw: unknown): AiContext['settings'] {
  if (!isRecord(raw)) return {}
  const settings: AiContext['settings'] = {}
  for (const key of AI_SETTINGS_KEYS) {
    const value = raw[key]
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      settings[key] = typeof value === 'string' ? value.slice(0, 64) : value
    }
  }
  return settings
}

function pickMemory(raw: unknown): AiContext['memory'] {
  if (!Array.isArray(raw)) return []
  return raw
    .slice(0, 8)
    .map((item) => {
      if (!isRecord(item)) return null
      const request = asString(item.request, 280)
      const message = asString(item.message, 400)
      if (!request) return null
      const at =
        typeof item.at === 'number' ? new Date(item.at).toISOString() : asString(item.at, 40)
      return {
        at: at || new Date().toISOString(),
        request,
        message,
        applied: asStringArray(item.applied, 20, 80),
      }
    })
    .filter((item): item is AiContext['memory'][number] => Boolean(item))
}

export function assertNoSecrets(value: unknown, path = 'root') {
  if (value == null) return
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSecrets(item, `${path}[${index}]`))
    return
  }
  if (!isRecord(value)) return
  for (const [key, nested] of Object.entries(value)) {
    if (isSecretKey(key)) {
      throw new Error(`Refused confidential field: ${path}.${key}`)
    }
    assertNoSecrets(nested, `${path}.${key}`)
  }
}

export function compactAiContext(
  context: AiContext,
  limits: { tasks?: number; branches?: number; memory?: number } = {}
): Record<string, unknown> {
  const taskLimit = limits.tasks ?? 36
  const branchLimit = limits.branches ?? 16
  const memoryLimit = limits.memory ?? 4
  return {
    today: context.today,
    slots: context.slots,
    progress: {
      name: context.progress.name,
      bio: context.progress.bio.slice(0, 120),
      level: context.progress.level,
      league: context.progress.league,
      leaguePoints: context.progress.leaguePoints,
    },
    settings: context.settings,
    memory: context.memory.slice(-memoryLimit).map((item) => ({
      request: item.request.slice(0, 160),
      message: item.message.slice(0, 160),
    })),
    tags: context.tags.slice(0, 30).map((tag) => ({ id: tag.id, name: tag.name })),
    rewards: context.rewards.slice(0, 16).map((reward) => ({
      id: reward.id,
      title: reward.title,
    })),
    tasks: context.tasks.slice(0, taskLimit).map((task) => ({
      id: task.id,
      title: task.title,
      type: task.type,
      done: task.done,
      ...(task.targetDate ? { targetDate: task.targetDate } : {}),
    })),
    branches: context.branches.slice(0, branchLimit).map((branch) => ({
      id: branch.id,
      displayName: branch.displayName,
      milestones: branch.milestones.slice(0, 6).map((milestone) => ({
        id: milestone.id,
        name: milestone.name,
        status: milestone.status,
      })),
    })),
  }
}

export function buildAiContext(raw: unknown): AiContext {
  assertNoSecrets(raw)
  const source = isRecord(raw) ? raw : {}
  const tasks = Array.isArray(source.tasks)
    ? source.tasks.map(pickTask).filter((item): item is AiContextTask => Boolean(item))
    : []
  const slots = Object.fromEntries(
    AI_TASK_TYPES.map((type) => {
      const active = tasks.filter((task) => task.type === type && !task.done).length
      const limit = TASK_SLOT_LIMIT[type]
      return [
        type,
        {
          active,
          remaining: typeof limit === 'number' ? Math.max(0, limit - active) : null,
        },
      ]
    })
  ) as AiContext['slots']

  const progressSource = isRecord(source.progress) ? source.progress : {}
  const deletedTasks = Array.isArray(source.deletedTasks)
    ? source.deletedTasks
        .map((item) => {
          if (!isRecord(item)) return null
          const type = AI_TASK_TYPES.find((entry) => entry === item.type)
          const id = asString(item.id, 80)
          const title = asString(item.title, 160)
          if (!type || !id || !title) return null
          return { id, title, type }
        })
        .filter((item): item is { id: string; title: string; type: TaskType } => Boolean(item))
        .slice(0, 20)
    : []

  return {
    today: asString(source.today, 10) || getLocalDateKey(),
    slots,
    tasks: tasks.slice(0, 120),
    deletedTasks,
    branches: Array.isArray(source.branches)
      ? source.branches
          .map(pickBranch)
          .filter((item): item is AiContextBranch => Boolean(item))
          .slice(0, 40)
      : [],
    edges: Array.isArray(source.edges)
      ? source.edges
          .map((item) => {
            if (!isRecord(item)) return null
            const id = asString(item.id, 80)
            const sourceId = asString(item.source, 80)
            const targetId = asString(item.target, 80)
            if (!id || !sourceId || !targetId) return null
            return { id, source: sourceId, target: targetId }
          })
          .filter((item): item is AiContext['edges'][number] => Boolean(item))
          .slice(0, 80)
      : [],
    tags: Array.isArray(source.tags)
      ? source.tags
          .map((item) => {
            if (!isRecord(item)) return null
            const id = asString(item.id, 80)
            const name = asString(item.name, 80)
            if (!id || !name) return null
            return {
              id,
              name,
              ...(asString(item.branchId, 80)
                ? { branchId: asString(item.branchId, 80) }
                : {}),
            }
          })
          .filter((item): item is AiContext['tags'][number] => Boolean(item))
          .slice(0, 60)
      : [],
    rewards: Array.isArray(source.rewards)
      ? source.rewards
          .map((item) => {
            if (!isRecord(item)) return null
            const id = asString(item.id, 80)
            const title = asString(item.title, 120)
            if (!id || !title) return null
            return {
              id,
              title,
              purchased: asBoolean(item.purchased),
              completed: asBoolean(item.completed),
            }
          })
          .filter((item): item is AiContext['rewards'][number] => Boolean(item))
          .slice(0, 40)
      : [],
    progress: {
      name: asString(progressSource.name, 80),
      bio: asString(progressSource.bio, 280),
      level: Number(progressSource.level) || 1,
      league: asString(progressSource.league, 40) || 'Бронза',
      leaguePoints: Number(progressSource.leaguePoints) || 0,
    },
    settings: pickSettings(source.settings),
    memory: pickMemory(source.memory),
  }
}
