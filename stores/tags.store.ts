import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Task } from '~/types/task.types'
import type { Tag, TagScope } from '~/types/tag.types'
import { v4 as uuidv4 } from 'uuid'

type InternalTag = Tag & { isSystem?: boolean }

const TAG_COLORS = [
  'var(--success)',
  'var(--warning)',
  'var(--error)',
  'var(--gold)',
  'var(--accent)',
]

export const useTagsStore = defineStore(
  'tags',
  () => {
    const tags = ref<InternalTag[]>([])

    normalizeTags()

    async function initTagsAfterHydration() {
      const store = useTagsStore()
      if (store.$persistedState) {
        await store.$persistedState.isReady
      }
      normalizeTags()
    }

    function normalizeTags(tasks?: Task[]) {
      const userTags = tags.value.filter((tag) => !tag.isSystem)
      if (userTags.length !== tags.value.length) {
        tags.value = userTags
      }

      if (tasks) {
        splitLegacyTagsByScope(tasks)
      }

      tags.value.forEach((tag, index) => {
        if (!tag.color) tag.color = TAG_COLORS[index % TAG_COLORS.length]
      })
    }

    function splitLegacyTagsByScope(tasks: Task[]) {
      const nextTags: InternalTag[] = []
      const replacements = new Map<string, Partial<Record<TagScope, string>>>()

      tags.value.forEach((tag) => {
        if (tag.scope) {
          nextTags.push(tag)
          return
        }

        const scopes = getScopesUsingTag(tag.id, tasks)
        const targetScopes = scopes.length ? scopes : ['task']

        targetScopes.forEach((scope, index) => {
          const scopedTag: InternalTag = {
            ...tag,
            id: index === 0 ? tag.id : uuidv4(),
            scope,
            isSystem: false,
          }
          nextTags.push(scopedTag)
          replacements.set(tag.id, {
            ...replacements.get(tag.id),
            [scope]: scopedTag.id,
          })
        })
      })

      if (replacements.size === 0) return

      tags.value = nextTags
      tasks.forEach((task) => {
        const scope = getScopeForTask(task)
        task.tagIds = task.tagIds
          .map((tagId) => replacements.get(tagId)?.[scope] || tagId)
          .filter((tagId, index, ids) => ids.indexOf(tagId) === index)
      })
    }

    function getScopesUsingTag(tagId: string, tasks: Task[]): TagScope[] {
      const scopes = new Set<TagScope>()
      tasks.forEach((task) => {
        if (task.tagIds.includes(tagId)) scopes.add(getScopeForTask(task))
      })
      return [...scopes]
    }

    function getScopeForTask(task: Pick<Task, 'type'>): TagScope {
      return task.type === 'HABIT' ? 'habit' : 'task'
    }

    function getTagById(id: string): InternalTag | undefined {
      return tags.value.find((t) => t.id === id)
    }

    function getTagsByIds(ids: string[]): InternalTag[] {
      return tags.value.filter((t) => ids.includes(t.id))
    }

    function getTagsByScope(scope: TagScope): InternalTag[] {
      return tags.value.filter((tag) => tag.scope === scope)
    }

    function addTag(tagData: Omit<Tag, 'id'>) {
      const newTag: InternalTag = { ...tagData, id: uuidv4(), isSystem: false }
      tags.value.push(newTag)
      return newTag
    }

    function deleteTag(id: string): boolean {
      const index = tags.value.findIndex((t) => t.id === id)
      if (index === -1) return false
      tags.value.splice(index, 1)
      return true
    }

    watch(
      tags,
      () => {
        normalizeTags()
      },
      { deep: true }
    )

    return {
      tags,
      initTagsAfterHydration,
      normalizeTags,
      getTagById,
      getTagsByIds,
      getTagsByScope,
      addTag,
      deleteTag,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-tags', storage: localStorage }
      : undefined,
  }
)
