import { createHash, timingSafeEqual } from 'node:crypto'
import { getDatabase } from './database'

type PaymentPayload = {
  email: string
  invoiceId: string
  outSum: string
  subscriptionId?: string
  paymentMethod?: string
  raw: Record<string, unknown>
}

async function ensureSubscriptionsTable(sql: NonNullable<ReturnType<typeof getDatabase>>) {
  await sql`
    CREATE TABLE IF NOT EXISTS cof_subscriptions (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      invoice_id TEXT UNIQUE NOT NULL,
      subscription_id TEXT,
      amount NUMERIC(12, 6),
      payment_method TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      raw JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS cof_subscriptions_email_idx ON cof_subscriptions(email)`
  await sql`CREATE INDEX IF NOT EXISTS cof_subscriptions_active_idx ON cof_subscriptions(email, expires_at) WHERE status = 'active'`
}

export function normalizeSubscriptionEmail(email: string) {
  return email.trim().toLowerCase()
}

export function isSubscriptionDatabaseConfigured() {
  return Boolean(getDatabase())
}

export async function getActiveSubscription(email: string) {
  const sql = getDatabase()
  if (!sql) return { active: false, expiresAt: '' }
  await ensureSubscriptionsTable(sql)

  const normalizedEmail = normalizeSubscriptionEmail(email)
  if (!normalizedEmail.includes('@')) return { active: false, expiresAt: '' }

  const rows = await sql`
    SELECT expires_at
    FROM cof_subscriptions
    WHERE email = ${normalizedEmail}
      AND status = 'active'
      AND expires_at > NOW()
    ORDER BY expires_at DESC
    LIMIT 1
  `

  const row = rows[0] as Record<string, unknown> | undefined
  return row
    ? { active: true, expiresAt: new Date(String(row.expires_at)).toISOString() }
    : { active: false, expiresAt: '' }
}

export async function hasActiveSubscription(email: string) {
  return (await getActiveSubscription(email)).active
}

export async function recordRobokassaPayment(payload: PaymentPayload) {
  const sql = getDatabase()
  if (!sql) throw createError({ statusCode: 503, statusMessage: 'Subscription database is not configured' })
  await ensureSubscriptionsTable(sql)

  const config = useRuntimeConfig() as unknown as { subscriptionDays?: number }
  const days = Math.max(1, Number(config.subscriptionDays) || 31)
  const normalizedEmail = normalizeSubscriptionEmail(payload.email)
  if (!normalizedEmail.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Payment email is required' })
  }

  await sql`
    INSERT INTO cof_subscriptions (
      email, invoice_id, subscription_id, amount, payment_method, status, paid_at, expires_at, raw
    )
    VALUES (
      ${normalizedEmail},
      ${payload.invoiceId},
      ${payload.subscriptionId || null},
      ${payload.outSum || null},
      ${payload.paymentMethod || null},
      'active',
      NOW(),
      NOW() + (${days} || ' days')::interval,
      ${payload.raw}
    )
    ON CONFLICT (invoice_id)
    DO UPDATE SET
      email = EXCLUDED.email,
      subscription_id = EXCLUDED.subscription_id,
      amount = EXCLUDED.amount,
      payment_method = EXCLUDED.payment_method,
      status = 'active',
      paid_at = NOW(),
      expires_at = GREATEST(cof_subscriptions.expires_at, EXCLUDED.expires_at),
      raw = EXCLUDED.raw,
      updated_at = NOW()
  `
}

export function verifyRobokassaSignature(params: Record<string, string>) {
  const config = useRuntimeConfig() as unknown as {
    robokassaPassword2?: string
    robokassaHashAlgorithm?: string
  }
  const password2 = String(config.robokassaPassword2 || '').trim()
  if (!password2) throw createError({ statusCode: 503, statusMessage: 'Robokassa password #2 is not configured' })

  const outSum = params.OutSum || params.outsum || ''
  const invoiceId = params.InvId || params.InvID || params.InvoiceID || params.invoiceId || ''
  const signature = params.SignatureValue || params.signaturevalue || ''
  if (!outSum || !invoiceId || !signature) return false

  const shpParams = Object.entries(params)
    .filter(([key]) => key.toLowerCase().startsWith('shp_'))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)

  const base = [outSum, invoiceId, password2, ...shpParams].join(':')
  const algorithm = String(config.robokassaHashAlgorithm || 'md5').toLowerCase()
  const expected = createHash(algorithm).update(base).digest('hex')

  const expectedBuffer = Buffer.from(expected.toLowerCase())
  const actualBuffer = Buffer.from(signature.toLowerCase())
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer)
}
