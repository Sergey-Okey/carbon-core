import type { AiApplyResult, AiEntityRef } from '../../types/ai.types.ts'

const FALLBACK_NOTICE = /^Публичная модель недоступна, сработал встроенный агент\.\s*/u

export function stripPublicFallbackNotice(message: string) {
  return message.replace(FALLBACK_NOTICE, '').trim()
}

export function linksFromApplyResults(results: AiApplyResult[]): AiEntityRef[] {
  const seen = new Set<string>()
  const links: AiEntityRef[] = []
  for (const item of results) {
    if (!item.ok || !item.entity?.id) continue
    const key = `${item.entity.kind}:${item.entity.id}`
    if (seen.has(key)) continue
    seen.add(key)
    links.push(item.entity)
  }
  return links
}

export function linksFromQuotedTitles(
  message: string,
  catalog: {
    tasks: Array<{ id: string; title: string }>
    branches: Array<{
      id: string
      displayName: string
      milestones: Array<{ id: string; name: string }>
    }>
  }
): AiEntityRef[] {
  const names = [...message.matchAll(/«([^»]{1,80})»/g)].map((match) => match[1]?.trim() || '')
  if (!names.length) return []
  const seen = new Set<string>()
  const links: AiEntityRef[] = []

  function push(link: AiEntityRef) {
    const key = `${link.kind}:${link.id}`
    if (seen.has(key)) return
    seen.add(key)
    links.push(link)
  }

  for (const name of names) {
    const needle = name.toLowerCase()
    const task = catalog.tasks.find((item) => item.title.toLowerCase() === needle)
    if (task) {
      push({ kind: 'task', id: task.id, label: task.title })
      continue
    }
    const branch = catalog.branches.find((item) => item.displayName.toLowerCase() === needle)
    if (branch) {
      push({ kind: 'branch', id: branch.id, label: branch.displayName })
      continue
    }
    for (const item of catalog.branches) {
      const milestone = item.milestones.find((entry) => entry.name.toLowerCase() === needle)
      if (milestone) {
        push({ kind: 'milestone', id: milestone.id, label: milestone.name })
        break
      }
    }
  }
  return links
}

export function mergeAiLinks(...groups: AiEntityRef[][]) {
  const seen = new Set<string>()
  const links: AiEntityRef[] = []
  for (const group of groups) {
    for (const link of group) {
      const key = `${link.kind}:${link.id}`
      if (seen.has(key)) continue
      seen.add(key)
      links.push(link)
    }
  }
  return links
}
