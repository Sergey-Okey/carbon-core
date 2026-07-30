import { createError, getQuery } from 'h3'
import { isValidUserId } from '../utils/syncPayload'
import { readSyncState } from '../utils/syncStorage'
import { isAuthDatabaseConfigured } from '../utils/authStorage'
import { readOAuthSession } from '../utils/oauth'

export default defineEventHandler(async (event) => {
  const session = readOAuthSession(event)
  if (isAuthDatabaseConfigured() && !session) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  const userId = session?.id || getQuery(event).userId
  if (!isValidUserId(userId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid userId' })
  }
  return readSyncState(userId)
})
