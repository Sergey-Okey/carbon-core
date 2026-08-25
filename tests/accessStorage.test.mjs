import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ACCESS_DATA_KEYS,
  ACCESS_STORAGE_KEY,
  DEMO_CLEARED_KEY,
  DEMO_REWARDS_INIT_KEY,
  DEMO_SEED_KEY,
  DEMO_STORAGE_KEY,
  DEMO_TTL_MS,
} from '../utils/accessStorage.ts'

test('demo access TTL is three hours', () => {
  assert.equal(DEMO_TTL_MS, 3 * 60 * 60 * 1000)
})

test('access storage keys stay stable for demo/migrate flows', () => {
  assert.equal(ACCESS_STORAGE_KEY, 'carbon-access')
  assert.equal(DEMO_STORAGE_KEY, 'carbon-demo-storage')
  assert.deepEqual([...ACCESS_DATA_KEYS], [
    'carbon-user',
    'carbon-tasks',
    'carbon-branches',
    'carbon-rewards',
    'carbon-tags',
    'carbon-ui',
    'carbon-settings',
    'carbon-ai',
    'carbon-notifications',
  ])
})

test('demo seed keys stay stable for wipe/reset flows', () => {
  assert.equal(DEMO_SEED_KEY, 'carbon-demo-workspace-seeded-v11')
  assert.equal(DEMO_REWARDS_INIT_KEY, 'carbon-rewards-demo-initialized')
  assert.equal(DEMO_CLEARED_KEY, 'carbon-demo-workspace-cleared')
})
