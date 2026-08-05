import { getQuery } from 'h3'
import { getActiveSubscription } from '../../utils/subscriptionStorage'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const email = typeof query.email === 'string' ? query.email : ''
  return getActiveSubscription(email)
})
