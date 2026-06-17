import { readBody } from 'h3'
import { isAuthDatabaseConfigured, resetAccountPassword } from '../../../utils/authStorage'
import { enforceRateLimit } from '../../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'password-reset-confirm', 8, 15 * 60 * 1000)
  if (!isAuthDatabaseConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Cloud accounts are not configured' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  const token = typeof body?.token === 'string' ? body.token.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!token || password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid reset data' })
  }

  await resetAccountPassword(token, password)
  return { ok: true }
})
