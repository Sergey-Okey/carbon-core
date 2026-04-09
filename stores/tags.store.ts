import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tag } from '~/types/tag.types'
import { v4 as uuidv4 } from 'uuid'

type InternalTag = Tag & { isSystem?: boolean }

const DEFAULT_TAGS: (Omit<Tag, 'id'> & { isSystem: boolean })[] = [
  { name: '#финансы', branchId: 'FIN', order: 1, isSystem: true },
  { name: '#тело', branchId: 'BODY', order: 2, isSystem: true },
  { name: '#интеллект', branchId: 'MIND', order: 3, isSystem: true },
  { name: '#лидерство', branchId: 'LDR', order: 4, isSystem: true },
  { name: '#работа', branchId: 'FIN', order: 5, isSystem: true },
  { name: '#спорт', branchId: 'BODY', order: 6, isSystem: true },
  { name: '#учёба', branchId: 'MIND', order: 7, isSystem: true },
  { name: '#нетворкинг', branchId: 'LDR', order: 8, isSystem: true },
]

export const useTagsStore = defineStore(
  'tags',
  () => {
    const tags = ref<InternalTag[]>([])

    async function initTagsAfterHydration() {
      const DEMO_KEY = 'carbon-tags-demo-initialized'
      const store = useTagsStore()
      if (store.$persistedState) await store.$persistedState.isReady
      if (tags.value.length === 0 && !localStorage.getItem(DEMO_KEY)) {
        tags.value = DEFAULT_TAGS.map((tag) => ({ ...tag, id: uuidv4() }))
        localStorage.setItem(DEMO_KEY, 'true')
      }
    }

    function getTagById(id: string): InternalTag | undefined {
      return tags.value.find((t) => t.id === id)
    }

    function getTagsByIds(ids: string[]): InternalTag[] {
      return tags.value.filter((t) => ids.includes(t.id))
    }

    function addTag(tagData: Omit<Tag, 'id'>) {
      const newTag: InternalTag = { ...tagData, id: uuidv4(), isSystem: false }
      tags.value.push(newTag)
      return newTag
    }

    function deleteTag(id: string): boolean {
      const index = tags.value.findIndex((t) => t.id === id)
      if (index === -1) return false
      if (tags.value[index].isSystem) return false
      tags.value.splice(index, 1)
      return true
    }

    if (import.meta.client) {
      initTagsAfterHydration()
    }

    return { tags, getTagById, getTagsByIds, addTag, deleteTag }
  },
  { persist: { key: 'carbon-tags', storage: localStorage } }
)
