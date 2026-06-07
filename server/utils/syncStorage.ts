import { neon } from '@neondatabase/serverless'

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
export type StoredSyncState = Omit<SyncPayload, 'userId'>

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

function getDatabase() {
  const databaseUrl = useRuntimeConfig().databaseUrl.trim()
  return databaseUrl && !databaseUrl.includes('user:password@host/database') ? neon(databaseUrl) : null
}

async function ensureSyncTable(sql: NonNullable<ReturnType<typeof getDatabase>>) {
  await sql`
    CREATE TABLE IF NOT EXISTS cof_sync_state (
      user_id TEXT PRIMARY KEY,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

export async function readSyncState(userId: string): Promise<StoredSyncState> {
  try {
    const sql = getDatabase()
    if (!sql) return {}

    await ensureSyncTable(sql)
    const rows = await sql`
      SELECT payload
      FROM cof_sync_state
      WHERE user_id = ${userId}
      LIMIT 1
    `

    return (rows[0]?.payload as StoredSyncState | undefined) ?? {}
  } catch {
    return {}
  }
}

export async function writeSyncState(payload: SyncPayload) {
  try {
    const sql = getDatabase()
    if (!sql) return { persisted: false as const, mode: 'local' as const }

    const { userId, ...state } = payload
    await ensureSyncTable(sql)
    await sql`
      INSERT INTO cof_sync_state (user_id, payload, updated_at)
      VALUES (${userId}, ${JSON.stringify(state)}::jsonb, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    `

    return { persisted: true as const, mode: 'database' as const }
  } catch {
    return { persisted: false as const, mode: 'local' as const }
  }
}

export async function getDatabaseHealth() {
  const sql = getDatabase()
  if (!sql) return { configured: false as const, reachable: false as const }

  await sql`SELECT 1`
  return { configured: true as const, reachable: true as const }
}
