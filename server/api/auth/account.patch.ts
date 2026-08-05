import { readBody } from 'h3'
import { updateAccount } from '../../utils/authStorage'
import { readOAuthSession, setOAuthSession } from '../../utils/oauth'
import { getActiveSubscription } from '../../utils/subscriptionStorage'

export default defineEventHandler(async (event) => {
  const session = readOAuthSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  const body = await readBody<Record<string, unknown>>(event)
  const nextEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const user = await updateAccount(session.id, {
    name: typeof body?.name === 'string' ? body.name : undefined,
    email: nextEmail || undefined,
    avatar: typeof body?.avatar === 'string' ? body.avatar : undefined,
    bio: typeof body?.bio === 'string' ? body.bio : undefined,
  })
  setOAuthSession(event, user)
  return { user, subscription: await getActiveSubscription(user.email) }
})
