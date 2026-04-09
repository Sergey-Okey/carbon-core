import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tag } from '~/types/tag.types'
import { v4 as uuidv4 } from 'uuid'

// Предустановленные теги
const DEFAULT_TAGS: Omit<Tag, 'id'>[] = [
  { name: '#финансы', branchId: 'FIN', order: 1 },
  { name: '#тело', branchId: 'BODY', order: 2 },
  { name: '#интеллект', branchId: 'MIND', order: 3 },
  { name: '#лидерство', branchId: 'LDR', order: 4 },
  { name: '#работа', branchId: 'FIN', order: 5 },
  { name: '#спорт', branchId: 'BODY', order: 6 },
  { name: '#учёба', branchId: 'MIND', order: 7 },
  { name: '#нетворкинг', branchId: 'LDR', order: 8 },
]

export const useTagsStore = defineStore(
  'tags',
  () => {
    const tags = ref<Tag[]>([])

    function initTags() {
      if (tags.value.length === 0) {
        tags.value = DEFAULT_TAGS.map((tag) => ({ ...tag, id: uuidv4() }))
      }
    }

    function getTagById(id: string): Tag | undefined {
      return tags.value.find((t) => t.id === id)
    }

    function getTagsByIds(ids: string[]): Tag[] {
      return tags.value.filter((t) => ids.includes(t.id))
    }

    function addTag(tagData: Omit<Tag, 'id'>) {
      const newTag: Tag = { ...tagData, id: uuidv4() }
      tags.value.push(newTag)
      return newTag
    }

    function deleteTag(id: string) {
      const index = tags.value.findIndex((t) => t.id === id)
      if (index !== -1) tags.value.splice(index, 1)
    }

    // Инициализация при первом обращении
    initTags()

    return {
      tags,
      getTagById,
      getTagsByIds,
      addTag,
      deleteTag,
    }
  },
  {
    persist: { key: 'carbon-tags', storage: localStorage },
  }
)
