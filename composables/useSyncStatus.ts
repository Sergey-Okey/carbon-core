import { computed, ref } from 'vue'

export type SyncState = 'local' | 'syncing' | 'synced' | 'offline' | 'error'

const state = ref<SyncState>('local')
const lastSyncedAt = ref<string | null>(null)
const retryHandler = ref<(() => void) | null>(null)

export function useSyncStatus() {
  const label = computed(() => ({
    local: 'Только на устройстве',
    syncing: 'Синхронизация',
    synced: 'Синхронизировано',
    offline: 'Нет сети',
    error: 'Ошибка синхронизации',
  })[state.value])

  function setState(nextState: SyncState) {
    state.value = nextState
    if (nextState === 'synced') lastSyncedAt.value = new Date().toISOString()
  }

  function setRetry(handler: () => void) {
    retryHandler.value = handler
  }

  function retry() {
    retryHandler.value?.()
  }

  return { state, label, lastSyncedAt, setState, setRetry, retry }
}
