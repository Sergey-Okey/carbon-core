import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => readFile(join(root, relativePath), 'utf8')

test('analytics panel wires metrics composable and range control', async () => {
  const panel = await read('components/analytics/AnalyticsPanel.vue')
  const metrics = await read('composables/useAnalyticsMetrics.ts')
  const uiStore = await read('stores/ui.store.ts')

  assert.match(panel, /useAnalyticsMetrics/)
  assert.match(panel, /analyticsRangeDays/)
  assert.match(metrics, /completionLog/)
  assert.match(metrics, /branchesProgressScore/)
  assert.match(uiStore, /analyticsRangeDays/)
})

test('task store persists completion log and history', async () => {
  const tasksStore = await read('stores/tasks.store.ts')

  assert.match(tasksStore, /completionLog/)
  assert.match(tasksStore, /completedTasksHistory/)
  assert.match(tasksStore, /decrementCompletedTasks/)
  assert.match(tasksStore, /pruneCompletionLog|completionLog\.value =/)
})
