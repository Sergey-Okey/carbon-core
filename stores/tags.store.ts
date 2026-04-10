import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
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

    // 🔥 Восстановление системных тегов при старте (после гидратации)
    async function initTagsAfterHydration() {
      const store = useTagsStore()
      if (store.$persistedState) {
        await store.$persistedState.isReady
      }
      ensureSystemTags()
    }

    // Гарантирует наличие всех системных тегов
    function ensureSystemTags() {
      const systemNames = DEFAULT_TAGS.map((t) => t.name)
      const existingNames = tags.value.map((t) => t.name)
      const missing = systemNames.filter(
        (name) => !existingNames.includes(name)
      )

      if (missing.length > 0) {
        const restored = DEFAULT_TAGS.filter((t) =>
          missing.includes(t.name)
        ).map((t) => ({
          ...t,
          id: uuidv4(),
        }))
        tags.value.push(...restored)
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

    // Автоматическое восстановление при любых изменениях (на случай удаления через другие вкладки)
    watch(
      tags,
      () => {
        ensureSystemTags()
      },
      { deep: true }
    )

    return {
      tags,
      initTagsAfterHydration,
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
