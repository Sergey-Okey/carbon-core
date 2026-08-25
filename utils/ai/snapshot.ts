import type { AiContext, AiMemoryEntry } from '../../types/ai.types.ts'
import { buildAiContext } from './context.ts'

function tagNamesFor(task: { tagIds?: string[]; tags?: { name?: string }[] }, tags: { id: string; name: string }[]) {
  if (task.tags?.length) {
    return task.tags.map((tag) => tag.name).filter((name): name is string => Boolean(name))
  }
  const byId = new Map(tags.map((tag) => [tag.id, tag.name]))
  return (task.tagIds || []).map((id) => byId.get(id)).filter((name): name is string => Boolean(name))
}

export function buildClientAiSnapshot(input: {
  today?: string
  tasks: Array<Record<string, unknown>>
  deletedTasks?: Array<Record<string, unknown>>
  branches: Array<Record<string, unknown>>
  edges: Array<Record<string, unknown>>
  tags: Array<Record<string, unknown>>
  rewards: Array<Record<string, unknown>>
  progress: Record<string, unknown>
  settings: Record<string, unknown>
  memory: AiMemoryEntry[]
}): AiContext {
  const tags = input.tags.map((tag) => ({
    id: String(tag.id || ''),
    name: String(tag.name || ''),
  }))
  return buildAiContext({
    today: input.today,
    tasks: input.tasks.map((task) => ({
      ...task,
      tagNames: tagNamesFor(
        task as { tagIds?: string[]; tags?: { name?: string }[] },
        tags
      ),
    })),
    deletedTasks: input.deletedTasks,
    branches: input.branches,
    edges: input.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    })),
    tags: input.tags,
    rewards: input.rewards,
    progress: input.progress,
    settings: input.settings,
    memory: input.memory,
  })
}
