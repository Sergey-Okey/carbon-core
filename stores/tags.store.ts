import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { accessAwareStorage } from '~/utils/accessStorage'
import type { Tag, TagScope } from '~/types/tag.types'
import type { Task, TaskTag } from '~/types/task.types'

type InternalTag = Tag & { isSystem?: boolean }

const TAG_COLORS = [
  'var(--success)',
  'var(--warning)',
  'var(--error)',
  'var(--gold)',
  'var(--accent)',
]

function normalizeTagName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

function getTagIdentity(tag: Pick<Tag, 'name' | 'branchId'>): string {
  return `${tag.branchId || ''}:${normalizeTagName(tag.name).toLocaleLowerCase()}`
}

function syncEmbeddedTag(task: Task, tag: Tag) {
  const embedded = task.tags?.find((item) => item.id === tag.id)
  if (!embedded) return

  embedded.name = tag.name
  embedded.branchId = tag.branchId
  embedded.color = tag.color
}

function replaceTagReference(task: Task, sourceId: string, target: Tag) {
  if (!task.tagIds.includes(sourceId)) return

  task.tagIds = task.tagIds
    .map((id) => (id === sourceId ? target.id : id))
    .filter((id, index, ids) => ids.indexOf(id) === index)

  if (!task.tags?.length) return

  const sourceOrder = task.tags.find((tag) => tag.id === sourceId)?.order ?? task.tags.length
  task.tags = task.tags.filter((tag) => tag.id !== sourceId && tag.id !== target.id)
  task.tags.push({
    id: target.id,
    name: target.name,
    branchId: target.branchId,
    color: target.color,
    order: sourceOrder,
  })
  task.tags.sort((a, b) => a.order - b.order)
}

export const useTagsStore = defineStore(
  'tags',
  () => {
    const tags = ref<InternalTag[]>([])

    async function initTagsAfterHydration() {
      const store = useTagsStore()
      if (store.$persistedState) {
        await store.$persistedState.isReady
      }
      normalizeTags()
    }

    function normalizeTags(tasks: Task[] = []) {
      const canonicalByIdentity = new Map<string, InternalTag>()
      const replacements = new Map<string, InternalTag>()
      const normalized: InternalTag[] = []

      tags.value
        .filter((tag) => !tag.isSystem)
        .forEach((tag) => {
          const cleanTag: InternalTag = {
            ...tag,
            name: normalizeTagName(tag.name),
            scope: undefined,
            isSystem: false,
          }
          const identity = getTagIdentity(cleanTag)
          const canonical = canonicalByIdentity.get(identity)

          if (canonical) {
            replacements.set(cleanTag.id, canonical)
            return
          }

          cleanTag.color ||= TAG_COLORS[normalized.length % TAG_COLORS.length]
          cleanTag.order = normalized.length
          canonicalByIdentity.set(identity, cleanTag)
          normalized.push(cleanTag)
        })

      tags.value = normalized
      if (!tasks.length) return

      replacements.forEach((target, sourceId) => {
        tasks.forEach((task) => replaceTagReference(task, sourceId, target))
      })

      tasks.forEach((task) => {
        task.tagIds = task.tagIds.filter((id, index, ids) => {
          return tags.value.some((tag) => tag.id === id) && ids.indexOf(id) === index
        })
        const embeddedTags: TaskTag[] = []
        task.tagIds.forEach((id, order) => {
          const tag = getTagById(id)
          if (!tag) return
          embeddedTags.push({
            id: tag.id,
            name: tag.name,
            branchId: tag.branchId,
            color: tag.color,
            order,
          })
        })
        task.tags = embeddedTags
      })
    }

    function getTagById(id: string): InternalTag | undefined {
      return tags.value.find((tag) => tag.id === id)
    }

    function getTagsByIds(ids: string[]): InternalTag[] {
      const order = new Map(ids.map((id, index) => [id, index]))
      return tags.value
        .filter((tag) => order.has(tag.id))
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    }

    function getTagsByScope(_scope: TagScope): InternalTag[] {
      return [...tags.value]
    }

    function findTagByName(name: string, branchId: Tag['branchId'] = '') {
      const identity = getTagIdentity({ name, branchId })
      return tags.value.find((tag) => getTagIdentity(tag) === identity)
    }

    function addTag(tagData: Omit<Tag, 'id'>) {
      const existing = findTagByName(tagData.name, tagData.branchId)
      if (existing) return existing

      const newTag: InternalTag = {
        ...tagData,
        id: uuidv4(),
        name: normalizeTagName(tagData.name),
        scope: undefined,
        order: tags.value.length,
        color: tagData.color || TAG_COLORS[tags.value.length % TAG_COLORS.length],
        isSystem: false,
      }
      tags.value.push(newTag)
      return newTag
    }

    function updateTag(id: string, updates: Partial<Omit<Tag, 'id'>>, tasks: Task[] = []) {
      const tag = getTagById(id)
      if (!tag) return null

      const nextName = updates.name === undefined ? tag.name : normalizeTagName(updates.name)
      const nextBranchId = updates.branchId === undefined ? tag.branchId : updates.branchId
      const duplicate = findTagByName(nextName, nextBranchId)

      if (duplicate && duplicate.id !== id) {
        mergeTags(id, duplicate.id, tasks)
        return duplicate
      }

      Object.assign(tag, updates, {
        name: nextName,
        branchId: nextBranchId,
        scope: undefined,
      })
      tasks.forEach((task) => syncEmbeddedTag(task, tag))
      return tag
    }

    function deleteTag(id: string, tasks: Task[] = []): boolean {
      const index = tags.value.findIndex((tag) => tag.id === id)
      if (index === -1) return false

      tags.value.splice(index, 1)
      tags.value.forEach((tag, order) => {
        tag.order = order
      })
      tasks.forEach((task) => {
        task.tagIds = task.tagIds.filter((tagId) => tagId !== id)
        task.tags = task.tags?.filter((tag) => tag.id !== id)
      })
      return true
    }

    function mergeTags(sourceId: string, targetId: string, tasks: Task[] = []): boolean {
      if (sourceId === targetId) return false
      const source = getTagById(sourceId)
      const target = getTagById(targetId)
      if (!source || !target) return false

      tasks.forEach((task) => replaceTagReference(task, sourceId, target))
      return deleteTag(sourceId)
    }

    return {
      tags,
      initTagsAfterHydration,
      normalizeTags,
      getTagById,
      getTagsByIds,
      getTagsByScope,
      findTagByName,
      addTag,
      updateTag,
      deleteTag,
      mergeTags,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-tags', storage: accessAwareStorage }
      : undefined,
  }
)
