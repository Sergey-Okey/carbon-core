import { createError, getQuery } from 'h3'
import { isValidUserId, readSyncState } from '../utils/syncStorage'

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).userId
  if (!isValidUserId(userId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid userId' })
  }
  return readSyncState(userId)
})
