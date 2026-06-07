import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { neon } from '@neondatabase/serverless'
import type { OAuthProfile } from './oauth'

export type AccountProfile = OAuthProfile & {
  createdAt: string
}

function getDatabase() {
  const databaseUrl = useRuntimeConfig().databaseUrl.trim()
  return databaseUrl && !databaseUrl.includes('user:password@host/database') ? neon(databaseUrl) : null
}

export function isAuthDatabaseConfigured() {
  return Boolean(getDatabase())
}

async function ensureUsersTable(sql: NonNullable<ReturnType<typeof getDatabase>>) {
  await sql`
    CREATE TABLE IF NOT EXISTS cof_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL DEFAULT '',
      provider TEXT NOT NULL,
      provider_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS cof_users_provider_identity
    ON cof_users(provider, provider_id)
    WHERE provider_id IS NOT NULL
  `
}

export async function registerAccount(email: string, password: string, name: string) {
  const sql = getDatabase()
  if (!sql) throw createError({ statusCode: 503, statusMessage: 'Account database is not configured' })
  await ensureUsersTable(sql)

  const normalizedEmail = email.trim().toLowerCase()
  const existing = await sql`SELECT id FROM cof_users WHERE email = ${normalizedEmail} LIMIT 1`
  if (existing.length) throw createError({ statusCode: 409, statusMessage: 'Email is already registered' })

  const id = `local:${randomBytes(16).toString('hex')}`
  const rows = await sql`
    INSERT INTO cof_users (id, email, password_hash, name, provider)
    VALUES (${id}, ${normalizedEmail}, ${hashPassword(password)}, ${name.trim()}, 'local')
    RETURNING id, email, name, avatar, provider, created_at
  `
  return mapAccount(rows[0])
}

export async function loginAccount(email: string, password: string) {
  const sql = getDatabase()
  if (!sql) throw createError({ statusCode: 503, statusMessage: 'Account database is not configured' })
  await ensureUsersTable(sql)

  const rows = await sql`
    SELECT id, email, password_hash, name, avatar, provider, created_at
    FROM cof_users
    WHERE email = ${email.trim().toLowerCase()}
    LIMIT 1
  `
  const row = rows[0] as Record<string, unknown> | undefined
  if (!row?.password_hash || !verifyPassword(password, String(row.password_hash))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }
  return mapAccount(row)
}

export async function upsertOAuthAccount(profile: OAuthProfile) {
  const sql = getDatabase()
  if (!sql) return { ...profile, createdAt: new Date().toISOString() } satisfies AccountProfile
  await ensureUsersTable(sql)

  const providerId = profile.id.slice(profile.provider.length + 1)
  const rows = await sql`
    INSERT INTO cof_users (id, email, name, avatar, provider, provider_id)
    VALUES (${profile.id}, ${profile.email.toLowerCase()}, ${profile.name}, ${profile.avatar}, ${profile.provider}, ${providerId})
    ON CONFLICT (id)
    DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      avatar = EXCLUDED.avatar,
      updated_at = NOW()
    RETURNING id, email, name, avatar, provider, created_at
  `
  return mapAccount(rows[0])
}

function hashPassword(password: string) {
  const salt = randomBytes(16)
  const derived = scryptSync(password, salt, 64)
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`
}

function verifyPassword(password: string, stored: string) {
  const [algorithm, saltHex, hashHex] = stored.split(':')
  if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function mapAccount(row: Record<string, unknown>): AccountProfile {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    avatar: String(row.avatar || ''),
    provider: String(row.provider) as AccountProfile['provider'],
    createdAt: new Date(String(row.created_at)).toISOString(),
  }
}
