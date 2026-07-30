const storeKeys = [
  'user',
  'tasks',
  'branches',
  'rewards',
  'tags',
  'ui',
  'settings',
] as const

type StoreKey = (typeof storeKeys)[number]
type StoreState = Record<string, unknown>
export type SyncPayload = { userId: string } & Partial<Record<StoreKey, StoreState>>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isValidUserId(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 16 && value.length <= 128
}

export function parseSyncPayload(value: unknown): SyncPayload {
  if (!isRecord(value) || !isValidUserId(value.userId)) {
    throw new TypeError('Invalid sync payload')
  }

  const payload: SyncPayload = { userId: value.userId }
  storeKeys.forEach((key) => {
    const state = value[key]
    if (state !== undefined) {
      if (!isRecord(state)) throw new TypeError(`Invalid ${key} state`)
      payload[key] = state
    }
  })

  return payload
}
