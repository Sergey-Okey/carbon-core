import { clearOAuthSession, readOAuthSession } from '../../utils/oauth'
import { deleteAccount } from '../../utils/authStorage'

export default defineEventHandler(async (event) => {
  const session = readOAuthSession(event)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  await deleteAccount(session.id)
  clearOAuthSession(event)
  return { success: true }
})
