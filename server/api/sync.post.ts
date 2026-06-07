import { createError, readBody } from 'h3'
import { parseSyncPayload, writeSyncState } from '../utils/syncStorage'

export default defineEventHandler(async (event) => {
  let payload
  try {
    payload = parseSyncPayload(await readBody(event))
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sync payload' })
  }
  return writeSyncState(payload)
})
