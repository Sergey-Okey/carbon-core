export type AccessMode = 'guest' | 'demo' | 'subscribed'
export type AccessState = { mode: AccessMode; activatedAt: string; expiresAt?: string }

export const ACCESS_STORAGE_KEY = 'carbon-access'
export const DEMO_STORAGE_KEY = 'carbon-demo-storage'
export const DEMO_TTL_MS = 3 * 60 * 60 * 1000
export const ACCESS_DATA_KEYS = [
  'carbon-user',
  'carbon-tasks',
  'carbon-branches',
  'carbon-rewards',
  'carbon-tags',
  'carbon-ui',
  'carbon-settings',
  'carbon-notifications',
] as const

const defaultAccessState: AccessState = {
  mode: 'guest',
  activatedAt: '',
}

type DemoStoragePayload = {
  expiresAt: string
  values: Record<string, string>
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

function isFuture(value?: string) {
  return Boolean(value && new Date(value).getTime() > Date.now())
}

function clearPersistedDemo() {
  if (!import.meta.client) return
  localStorage.removeItem(DEMO_STORAGE_KEY)
}

function readDemoPayload(): DemoStoragePayload {
  if (!import.meta.client) {
    return { expiresAt: '', values: {} }
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || 'null') as
      | Partial<DemoStoragePayload>
      | null
    if (!parsed?.expiresAt || !isFuture(parsed.expiresAt)) {
      clearPersistedDemo()
      return { expiresAt: '', values: {} }
    }
    return {
      expiresAt: parsed.expiresAt,
      values: parsed.values && typeof parsed.values === 'object' ? parsed.values : {},
    }
  } catch {
    clearPersistedDemo()
    return { expiresAt: '', values: {} }
  }
}

function writeDemoPayload(payload: DemoStoragePayload) {
  if (!import.meta.client) return
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(payload))
}

function getDemoExpiresAt() {
  if (isFuture(runtimeAccessState.expiresAt)) return runtimeAccessState.expiresAt!
  return new Date(Date.now() + DEMO_TTL_MS).toISOString()
}

const demoPersistentStorage: Storage = {
  get length() {
    return Object.keys(readDemoPayload().values).length
  },
  clear() {
    writeDemoPayload({ expiresAt: getDemoExpiresAt(), values: {} })
  },
  getItem(key: string) {
    const payload = readDemoPayload()
    return Object.prototype.hasOwnProperty.call(payload.values, key) ? payload.values[key] : null
  },
  key(index: number) {
    return Object.keys(readDemoPayload().values)[index] ?? null
  },
  removeItem(key: string) {
    const payload = readDemoPayload()
    delete payload.values[key]
    writeDemoPayload({ ...payload, expiresAt: getDemoExpiresAt() })
  },
  setItem(key: string, value: string) {
    const payload = readDemoPayload()
    payload.values[key] = value
    writeDemoPayload({ ...payload, expiresAt: getDemoExpiresAt() })
  },
}

function parsePersistedAccessState(raw: string | null): AccessState {
  if (!raw) return { ...defaultAccessState }

  try {
    const parsed = JSON.parse(raw) as Partial<AccessState>
    if (parsed.mode === 'subscribed') {
      if (parsed.expiresAt && !isFuture(parsed.expiresAt)) return { ...defaultAccessState }
      return {
        mode: 'subscribed',
        activatedAt: typeof parsed.activatedAt === 'string' ? parsed.activatedAt : '',
        expiresAt: typeof parsed.expiresAt === 'string' ? parsed.expiresAt : '',
      }
    }
    if (parsed.mode === 'demo' && isFuture(parsed.expiresAt)) {
      return {
        mode: 'demo',
        activatedAt: typeof parsed.activatedAt === 'string' ? parsed.activatedAt : '',
        expiresAt: parsed.expiresAt,
      }
    }
  } catch {
    return { ...defaultAccessState }
  }

  clearPersistedDemo()
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

  if (state.mode === 'demo' && isFuture(state.expiresAt)) {
    localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(runtimeAccessState))
    const payload = readDemoPayload()
    writeDemoPayload({ expiresAt: state.expiresAt!, values: payload.values })
    return
  }

  localStorage.removeItem(ACCESS_STORAGE_KEY)
  clearPersistedDemo()
}

export function readAccessMode(): AccessMode {
  return readAccessState().mode
}

export function resetDemoData() {
  demoMemoryStorage.clear()
  clearPersistedDemo()
}

/** Drop demo workspace instead of copying it into a real account. */
export function discardDemoWorkspace() {
  if (!import.meta.client) return

  resetDemoData()
  for (const key of ACCESS_DATA_KEYS) {
    localStorage.removeItem(key)
  }
  localStorage.removeItem('carbon-rewards-demo-initialized')
}

function activeStorage(): Storage {
  return readAccessMode() === 'demo' ? demoPersistentStorage : localStorage
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
    const value = demoPersistentStorage.getItem(key)
    if (value !== null) localStorage.setItem(key, value)
  }
  clearPersistedDemo()
}
