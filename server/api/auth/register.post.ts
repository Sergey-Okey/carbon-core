import { readBody } from 'h3'
import { isAuthDatabaseConfigured, registerAccount } from '../../utils/authStorage'
import { setOAuthSession } from '../../utils/oauth'
import { enforceRateLimit } from '../../utils/rateLimit'
import { hasActiveSubscription } from '../../utils/subscriptionStorage'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'register', 5, 15 * 60 * 1000)
  if (!isAuthDatabaseConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Cloud accounts are not configured' })
  }
  const body = await readBody<Record<string, unknown>>(event)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const acceptedTerms = body?.acceptedTerms === true
  const termsVersion = body?.termsVersion === '2026-06-07' ? body.termsVersion : ''
  if (!email.includes('@') || password.length < 8 || name.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid registration data' })
  }
  if (!acceptedTerms || !termsVersion) {
    throw createError({ statusCode: 400, statusMessage: 'Terms consent is required' })
  }
  if (!(await hasActiveSubscription(email))) {
    throw createError({ statusCode: 402, statusMessage: 'Active subscription is required' })
  }

  let user
  try {
    user = await registerAccount(email, password, name, termsVersion)
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    throw createError({ statusCode: 503, statusMessage: 'Account database is unavailable' })
  }
  setOAuthSession(event, user)
  return { user }
})
