import { Pool } from 'pg'

type SqlValue = unknown
export type SqlClient = (
  strings: TemplateStringsArray,
  ...values: SqlValue[]
) => Promise<Record<string, unknown>[]>

let pool: Pool | null = null
let poolUrl = ''

function getDatabaseUrl() {
  const databaseUrl = useRuntimeConfig().databaseUrl.trim()
  return databaseUrl && !databaseUrl.includes('user:password@host/database') ? databaseUrl : ''
}

export function isDatabaseConfigured() {
  return Boolean(getDatabaseUrl())
}

export function getDatabase(): SqlClient | null {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) return null

  if (!pool || poolUrl !== databaseUrl) {
    void pool?.end()
    pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
    poolUrl = databaseUrl
  }

  return async (strings, ...values) => {
    const text = strings.reduce(
      (query, part, index) => query + part + (index < values.length ? `$${index + 1}` : ''),
      ''
    )
    const result = await pool!.query(text, values)
    return result.rows as Record<string, unknown>[]
  }
}
