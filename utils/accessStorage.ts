export type AccessMode = 'guest' | 'demo' | 'subscribed'

export const ACCESS_STORAGE_KEY = 'carbon-access'
export const ACCESS_DATA_KEYS = [
  'carbon-user',
  'carbon-tasks',
  'carbon-branches',
  'carbon-rewards',
  'carbon-tags',
  'carbon-ui',
  'carbon-settings',
] as const

export function readAccessMode(): AccessMode {
  if (!import.meta.client) return 'guest'

  try {
    const raw = localStorage.getItem(ACCESS_STORAGE_KEY)
    if (!raw) return 'guest'
    const parsed = JSON.parse(raw) as { mode?: AccessMode }
    return parsed.mode === 'demo' || parsed.mode === 'subscribed' ? parsed.mode : 'guest'
  } catch {
    return 'guest'
  }
}

function activeStorage(): Storage {
  return readAccessMode() === 'demo' ? sessionStorage : localStorage
}

export const accessAwareStorage: Storage = {
  get length() {
    return activeStorage().length
  },
  clear() {
    activeStorage().clear()
  },
  getItem(key: string) {
    return activeStorage().getItem(key)
  },
  key(index: number) {
    return activeStorage().key(index)
  },
  removeItem(key: string) {
    activeStorage().removeItem(key)
  },
  setItem(key: string, value: string) {
    activeStorage().setItem(key, value)
  },
}

export function promoteDemoData() {
  if (!import.meta.client) return

  for (const key of ACCESS_DATA_KEYS) {
    const value = sessionStorage.getItem(key)
    if (value !== null) localStorage.setItem(key, value)
  }
}
