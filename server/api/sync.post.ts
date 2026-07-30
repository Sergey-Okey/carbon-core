import { createError, readBody } from 'h3'
import { parseSyncPayload } from '../utils/syncPayload'
import { writeSyncState } from '../utils/syncStorage'
import { isAuthDatabaseConfigured } from '../utils/authStorage'
import { readOAuthSession } from '../utils/oauth'

export default defineEventHandler(async (event) => {
  let payload
  try {
    payload = parseSyncPayload(await readBody(event))
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sync payload' })
  }
  const session = readOAuthSession(event)
  if (isAuthDatabaseConfigured() && !session) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  if (session) payload.userId = session.id
  return writeSyncState(payload)
})
