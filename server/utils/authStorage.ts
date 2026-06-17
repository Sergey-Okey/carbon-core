import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { OAuthProfile } from './oauth'
import { getDatabase } from './database'
import { hasActiveSubscription } from './subscriptionStorage'

export type AccountProfile = OAuthProfile & {
  createdAt: string
}

export function isAuthDatabaseConfigured() {
  return Boolean(getDatabase()) && useRuntimeConfig().authSessionSecret.trim().length >= 32
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
      terms_accepted_at TIMESTAMPTZ,
      terms_version TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`ALTER TABLE cof_users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ`
  await sql`ALTER TABLE cof_users ADD COLUMN IF NOT EXISTS terms_version TEXT`
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS cof_users_provider_identity
    ON cof_users(provider, provider_id)
    WHERE provider_id IS NOT NULL
  `
}

export async function registerAccount(email: string, password: string, name: string, termsVersion: string) {
  const sql = getDatabase()
  if (!sql) throw createError({ statusCode: 503, statusMessage: 'Account database is not configured' })
  await ensureUsersTable(sql)

  const normalizedEmail = email.trim().toLowerCase()
  const existing = await sql`SELECT id FROM cof_users WHERE email = ${normalizedEmail} LIMIT 1`
  if (existing.length) throw createError({ statusCode: 409, statusMessage: 'Email is already registered' })

  const id = `local:${randomBytes(16).toString('hex')}`
  const rows = await sql`
    INSERT INTO cof_users (id, email, password_hash, name, provider, terms_accepted_at, terms_version)
    VALUES (${id}, ${normalizedEmail}, ${hashPassword(password)}, ${name.trim()}, 'local', NOW(), ${termsVersion})
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

export async function upsertOAuthAccount(profile: OAuthProfile, termsVersion = '') {
  if (!(await hasActiveSubscription(profile.email))) {
    throw createError({ statusCode: 402, statusMessage: 'Active subscription is required' })
  }

  const sql = getDatabase()
  if (!sql) return { ...profile, createdAt: new Date().toISOString() } satisfies AccountProfile
  await ensureUsersTable(sql)

  const providerId = profile.id.slice(profile.provider.length + 1)
  const existing = await sql`SELECT id FROM cof_users WHERE id = ${profile.id} LIMIT 1`
  if (!existing.length && termsVersion !== '2026-06-07') {
    throw createError({ statusCode: 403, statusMessage: 'Terms consent is required' })
  }
  const rows = await sql`
    INSERT INTO cof_users (
      id, email, name, avatar, provider, provider_id, terms_accepted_at, terms_version
    )
    VALUES (
      ${profile.id}, ${profile.email.toLowerCase()}, ${profile.name}, ${profile.avatar},
      ${profile.provider}, ${providerId}, NOW(), ${termsVersion}
    )
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

export async function updateAccount(
  id: string,
  updates: { name?: string; email?: string; avatar?: string }
) {
  const sql = getDatabase()
  if (!sql) throw createError({ statusCode: 503, statusMessage: 'Account database is not configured' })
  await ensureUsersTable(sql)
  const currentRows = await sql`
    SELECT id, email, name, avatar, provider, created_at FROM cof_users WHERE id = ${id} LIMIT 1
  `
  const current = currentRows[0] as Record<string, unknown> | undefined
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Account not found' })

  const email = updates.email?.trim().toLowerCase() || String(current.email)
  const name = updates.name?.trim() || String(current.name)
  const avatar = updates.avatar ?? String(current.avatar || '')
  try {
    const rows = await sql`
      UPDATE cof_users
      SET email = ${email}, name = ${name}, avatar = ${avatar}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, name, avatar, provider, created_at
    `
    return mapAccount(rows[0])
  } catch {
    throw createError({ statusCode: 409, statusMessage: 'Email is already in use' })
  }
}

export async function deleteAccount(id: string) {
  const sql = getDatabase()
  if (!sql) throw createError({ statusCode: 503, statusMessage: 'Account database is not configured' })
  await ensureUsersTable(sql)
  await sql`
    CREATE TABLE IF NOT EXISTS cof_sync_state (
      user_id TEXT PRIMARY KEY,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`DELETE FROM cof_sync_state WHERE user_id = ${id}`
  await sql`DELETE FROM cof_users WHERE id = ${id}`
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
