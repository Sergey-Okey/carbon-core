import { defineStore } from 'pinia'
import { ref } from 'vue'
import { accessAwareStorage } from '~/utils/accessStorage'
import type { AiMemoryEntry } from '~/types/ai.types'

const MEMORY_MAX = 20

export const useAiStore = defineStore(
  'ai',
  () => {
    const memory = ref<AiMemoryEntry[]>([])
    const lastMessage = ref('')
    const pending = ref(false)

    function remember(entry: AiMemoryEntry) {
      memory.value = [entry, ...memory.value].slice(0, MEMORY_MAX)
      lastMessage.value = entry.message
    }

    function setPending(value: boolean) {
      pending.value = value
    }

    return { memory, lastMessage, pending, remember, setPending }
  },
  {
    persist: import.meta.client
      ? {
          key: 'carbon-ai',
          storage: accessAwareStorage,
          omit: ['pending'],
        }
      : undefined,
  }
)
