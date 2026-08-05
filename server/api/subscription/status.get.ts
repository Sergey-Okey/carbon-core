import { getQuery } from 'h3'
import { getActiveSubscription } from '../../utils/subscriptionStorage'
import { enforceRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'subscription-status', 30, 15 * 60 * 1000)
  const query = getQuery(event)
  const email = typeof query.email === 'string' ? query.email : ''
  if (!email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  return getActiveSubscription(email)
})
