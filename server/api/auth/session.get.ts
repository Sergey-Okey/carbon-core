import { clearOAuthSession, readOAuthSession, setOAuthSession } from '../../utils/oauth'
import { getAccountById } from '../../utils/authStorage'
import { getActiveSubscription } from '../../utils/subscriptionStorage'

export default defineEventHandler(async (event) => {
  const session = readOAuthSession(event)
  if (!session) return { user: null, subscription: { active: false, expiresAt: '' } }

  const user = await getAccountById(session.id).catch(() => null)
  if (!user) {
    clearOAuthSession(event)
    return { user: null, subscription: { active: false, expiresAt: '' } }
  }

  const paid = await getActiveSubscription(user.email)
  // Keep the session for authenticated accounts even without a paid plan.
  const subscription = { active: true, expiresAt: paid.expiresAt || '' }

  setOAuthSession(event, user)
  return { user, subscription }
})
