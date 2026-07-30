import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => readFile(join(root, relativePath), 'utf8')

test('completion log prune limits remain in place', async () => {
  const tasksStore = await read('stores/tasks.store.ts')
  assert.match(tasksStore, /COMPLETION_LOG_MAX_DAYS = 90/)
  assert.match(tasksStore, /COMPLETION_LOG_MAX = 3000/)
  assert.match(tasksStore, /HISTORY_MAX_DAYS = 90/)
  assert.match(tasksStore, /pruneCompletionLog/)
  assert.match(tasksStore, /pruneHistory/)
})

test('analytics metrics keep completionLog fallback and range union', async () => {
  const metrics = await read('composables/useAnalyticsMetrics.ts')
  assert.match(metrics, /AnalyticsRangeDays = 7 \| 14 \| 30/)
  assert.match(metrics, /completionLog\.length/)
  assert.match(metrics, /Fallback for older saves without completionLog/)
  assert.match(metrics, /branchesProgressScore/)
  assert.match(metrics, /productiveHourSeries/)
  assert.match(metrics, /from '~\/utils\/analyticsMath'/)
})

test('reopening a task rolls back history, log, and user counters', async () => {
  const tasksStore = await read('stores/tasks.store.ts')
  assert.match(tasksStore, /decrementCompletedTasks/)
  assert.match(tasksStore, /completionLog\.value\.splice/)
  assert.match(tasksStore, /bumpHistory\([^,]+,\s*-1\)|bumpHistory\(.*-1/)
})
