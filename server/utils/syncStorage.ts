import { getDatabase } from './database'
import { parseSyncPayload, type SyncPayload } from './syncPayload'

export type StoredSyncState = Omit<SyncPayload, 'userId'>

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
