import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto'
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
      email_verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`ALTER TABLE cof_users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ`
  await sql`ALTER TABLE cof_users ADD COLUMN IF NOT EXISTS terms_version TEXT`
  await sql`ALTER TABLE cof_users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ`
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS cof_users_provider_identity
    ON cof_users(provider, provider_id)
    WHERE provider_id IS NOT NULL
  `
}

async function ensureEmailVerificationTable(sql: NonNullable<ReturnType<typeof getDatabase>>) {
  await ensureUsersTable(sql)
  await sql`
    CREATE TABLE IF NOT EXISTS cof_email_verification_codes (
      user_id TEXT PRIMARY KEY REFERENCES cof_users(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS cof_email_verification_expires_idx
    ON cof_email_verification_codes(expires_at)
  `
}

async function ensurePasswordResetTable(sql: NonNullable<ReturnType<typeof getDatabase>>) {
  await ensureUsersTable(sql)
  await sql`
    CREATE TABLE IF NOT EXISTS cof_password_reset_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES cof_users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS cof_password_reset_user_idx
    ON cof_password_reset_tokens(user_id, expires_at)
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
    SELECT id, email, password_hash, name, avatar, provider, email_verified_at, created_at
    FROM cof_users
    WHERE email = ${email.trim().toLowerCase()}
    LIMIT 1
  `
  const row = rows[0] as Record<string, unknown> | undefined
  if (!row?.password_hash || !verifyPassword(password, String(row.password_hash))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }
  if (!row.email_verified_at) {
    throw createError({ statusCode: 403, statusMessage: 'Email verification is required' })
  }
  return mapAccount(row)
}

export async function createEmailVerificationCode(email: string) {
  const sql = getDatabase()
  if (!sql) throw createError({ statusCode: 503, statusMessage: 'Account database is not configured' })
  await ensureEmailVerificationTable(sql)

  const normalizedEmail = email.trim().toLowerCase()
  const users = await sql`
    SELECT id, email, name, provider, email_verified_at
    FROM cof_users
    WHERE email = ${normalizedEmail}
    LIMIT 1
  `
  const user = users[0] as Record<string, unknown> | undefined
  if (!user || String(user.provider) !== 'local' || user.email_verified_at) return null

  const code = String(randomInt(100000, 1000000))
  const codeHash = hashToken(`${String(user.id)}:${code}`)
  await sql`
    INSERT INTO cof_email_verification_codes (user_id, code_hash, attempts, expires_at)
    VALUES (${String(user.id)}, ${codeHash}, 0, NOW() + INTERVAL '15 minutes')
    ON CONFLICT (user_id)
    DO UPDATE SET
      code_hash = EXCLUDED.code_hash,
      attempts = 0,
      expires_at = EXCLUDED.expires_at,
      created_at = NOW()
  `

  return {
    code,
    email: String(user.email),
    name: String(user.name),
  }
}

export async function verifyEmailCode(email: string, code: string) {
  const sql = getDatabase()
  if (!sql) throw createError({ statusCode: 503, statusMessage: 'Account database is not configured' })
  await ensureEmailVerificationTable(sql)

  const normalizedEmail = email.trim().toLowerCase()
  const users = await sql`
    SELECT id, email, name, avatar, provider, created_at, email_verified_at
    FROM cof_users
    WHERE email = ${normalizedEmail}
    LIMIT 1
  `
  const user = users[0] as Record<string, unknown> | undefined
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  if (user.email_verified_at) return mapAccount(user)

  const rows = await sql`
    SELECT code_hash, attempts, expires_at
    FROM cof_email_verification_codes
    WHERE user_id = ${String(user.id)}
    LIMIT 1
  `
  const row = rows[0] as Record<string, unknown> | undefined
  if (!row || new Date(String(row.expires_at)).getTime() <= Date.now()) {
    throw createError({ statusCode: 400, statusMessage: 'Verification code is expired' })
  }
  if (Number(row.attempts || 0) >= 5) {
    throw createError({ statusCode: 429, statusMessage: 'Too many verification attempts' })
  }

  const expected = String(row.code_hash)
  const actual = hashToken(`${String(user.id)}:${code.trim()}`)
  if (expected !== actual) {
    await sql`
      UPDATE cof_email_verification_codes
      SET attempts = attempts + 1
      WHERE user_id = ${String(user.id)}
    `
    throw createError({ statusCode: 400, statusMessage: 'Verification code is invalid' })
  }

  const verified = await sql`
    UPDATE cof_users
    SET email_verified_at = NOW(), updated_at = NOW()
    WHERE id = ${String(user.id)}
    RETURNING id, email, name, avatar, provider, created_at
  `
  await sql`DELETE FROM cof_email_verification_codes WHERE user_id = ${String(user.id)}`
  return mapAccount(verified[0])
}

export async function createPasswordResetToken(email: string) {
  const sql = getDatabase()
  if (!sql) throw createError({ statusCode: 503, statusMessage: 'Account database is not configured' })
  await ensurePasswordResetTable(sql)

  const normalizedEmail = email.trim().toLowerCase()
  const users = await sql`
    SELECT id, email, name, provider
    FROM cof_users
    WHERE email = ${normalizedEmail}
    LIMIT 1
  `
  const user = users[0] as Record<string, unknown> | undefined
  if (!user || String(user.provider) !== 'local') return null

  const token = randomBytes(32).toString('base64url')
  const tokenHash = hashToken(token)
  await sql`
    UPDATE cof_password_reset_tokens
    SET used_at = NOW()
    WHERE user_id = ${String(user.id)} AND used_at IS NULL
  `
  await sql`
    INSERT INTO cof_password_reset_tokens (token_hash, user_id, expires_at)
    VALUES (${tokenHash}, ${String(user.id)}, NOW() + INTERVAL '30 minutes')
  `
  return {
    token,
    email: String(user.email),
    name: String(user.name),
  }
}

export async function resetAccountPassword(token: string, password: string) {
  const sql = getDatabase()
  if (!sql) throw createError({ statusCode: 503, statusMessage: 'Account database is not configured' })
  await ensurePasswordResetTable(sql)

  const tokenHash = hashToken(token)
  const rows = await sql`
    SELECT token_hash, user_id
    FROM cof_password_reset_tokens
    WHERE token_hash = ${tokenHash}
      AND used_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
  `
  const row = rows[0] as Record<string, unknown> | undefined
  if (!row) throw createError({ statusCode: 400, statusMessage: 'Password reset link is invalid or expired' })

  await sql`
    UPDATE cof_users
    SET password_hash = ${hashPassword(password)}, provider = 'local', updated_at = NOW()
    WHERE id = ${String(row.user_id)}
  `
  await sql`
    UPDATE cof_password_reset_tokens
    SET used_at = NOW()
    WHERE token_hash = ${tokenHash}
  `
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
      id, email, name, avatar, provider, provider_id, terms_accepted_at, terms_version, email_verified_at
    )
    VALUES (
      ${profile.id}, ${profile.email.toLowerCase()}, ${profile.name}, ${profile.avatar},
      ${profile.provider}, ${providerId}, NOW(), ${termsVersion}, NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      avatar = EXCLUDED.avatar,
      email_verified_at = COALESCE(cof_users.email_verified_at, NOW()),
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

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
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
