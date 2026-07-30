import assert from 'node:assert/strict'
import test from 'node:test'
import { isValidUserId, parseSyncPayload } from '../server/utils/syncPayload.ts'

test('isValidUserId enforces length bounds', () => {
  assert.equal(isValidUserId('short'), false)
  assert.equal(isValidUserId(123), false)
  assert.equal(isValidUserId(null), false)
  assert.equal(isValidUserId('a'.repeat(15)), false)
  assert.equal(isValidUserId('a'.repeat(16)), true)
  assert.equal(isValidUserId('a'.repeat(128)), true)
  assert.equal(isValidUserId('a'.repeat(129)), false)
})

test('parseSyncPayload accepts known store keys only', () => {
  const userId = 'user-123456789012'
  const payload = parseSyncPayload({
    userId,
    tasks: { items: [] },
    mystery: { hack: true },
  })

  assert.equal(payload.userId, userId)
  assert.deepEqual(payload.tasks, { items: [] })
  assert.equal('mystery' in payload, false)
})

test('parseSyncPayload rejects invalid bodies', () => {
  assert.throws(() => parseSyncPayload(null), /Invalid sync payload/)
  assert.throws(() => parseSyncPayload({ userId: 'short' }), /Invalid sync payload/)
  assert.throws(
    () => parseSyncPayload({ userId: 'user-123456789012', tasks: ['bad'] }),
    /Invalid tasks state/
  )
})
