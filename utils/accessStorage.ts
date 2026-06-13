export type AccessMode = 'guest' | 'demo' | 'subscribed'
export type AccessState = { mode: AccessMode; activatedAt: string }

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

const defaultAccessState: AccessState = {
  mode: 'guest',
  activatedAt: '',
}

let runtimeAccessState: AccessState = { ...defaultAccessState }
let runtimeInitialized = false

function createMemoryStorage(): Storage {
  const data = new Map<string, string>()

  return {
    get length() {
      return data.size
    },
    clear() {
      data.clear()
    },
    getItem(key: string) {
      return data.has(key) ? data.get(key)! : null
    },
    key(index: number) {
      return Array.from(data.keys())[index] ?? null
    },
    removeItem(key: string) {
      data.delete(key)
    },
    setItem(key: string, value: string) {
      data.set(key, value)
    },
  }
}

const demoMemoryStorage = createMemoryStorage()

function parsePersistedAccessState(raw: string | null): AccessState {
  if (!raw) return { ...defaultAccessState }

  try {
    const parsed = JSON.parse(raw) as Partial<AccessState>
    if (parsed.mode === 'subscribed') {
      return {
        mode: 'subscribed',
        activatedAt: typeof parsed.activatedAt === 'string' ? parsed.activatedAt : '',
      }
    }
  } catch {
    return { ...defaultAccessState }
  }

  return { ...defaultAccessState }
}

function ensureRuntimeAccessState() {
  if (!import.meta.client || runtimeInitialized) return

  runtimeAccessState = parsePersistedAccessState(localStorage.getItem(ACCESS_STORAGE_KEY))
  runtimeInitialized = true
}

export function readAccessState(): AccessState {
  if (!import.meta.client) return { ...defaultAccessState }

  ensureRuntimeAccessState()
  return { ...runtimeAccessState }
}

export function writeAccessState(state: AccessState) {
  runtimeAccessState = { ...state }
  runtimeInitialized = true

  if (!import.meta.client) return

  if (state.mode === 'subscribed') {
    localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(runtimeAccessState))
    return
  }

  localStorage.removeItem(ACCESS_STORAGE_KEY)
}

export function readAccessMode(): AccessMode {
  return readAccessState().mode
}

export function resetDemoData() {
  demoMemoryStorage.clear()
}

function activeStorage(): Storage {
  return readAccessMode() === 'demo' ? demoMemoryStorage : localStorage
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
    const value = demoMemoryStorage.getItem(key)
    if (value !== null) localStorage.setItem(key, value)
  }
}
