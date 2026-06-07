import { readBody } from 'h3'
import { updateAccount } from '../../utils/authStorage'
import { readOAuthSession, setOAuthSession } from '../../utils/oauth'

export default defineEventHandler(async (event) => {
  const session = readOAuthSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  const body = await readBody<Record<string, unknown>>(event)
  const user = await updateAccount(session.id, {
    name: typeof body?.name === 'string' ? body.name : undefined,
    email: typeof body?.email === 'string' ? body.email : undefined,
    avatar: typeof body?.avatar === 'string' ? body.avatar : undefined,
  })
  setOAuthSession(event, user)
  return { user }
})
