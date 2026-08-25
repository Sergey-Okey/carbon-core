import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => readFile(join(root, relativePath), 'utf8')

test('workspace wipe clears branches in memory before persist', async () => {
  const emptyWorkspace = await read('utils/emptyWorkspace.ts')
  const accessStore = await read('stores/access.store.ts')

  assert.match(emptyWorkspace, /branchesStore\.\$patch\(\{\s*branches:\s*\[\]\s*\}\)/)
  assert.match(emptyWorkspace, /branchesStore\.replaceEdges\(\[\]\)/)
  assert.match(accessStore, /emptyWorkspaceStores/)
  assert.match(accessStore, /persistWorkspaceStores/)
  assert.match(accessStore, /discardDemoWorkspace/)
})

test('settings reset wipes demo storage instead of sessionStorage', async () => {
  const settings = await read('components/settings/SettingsPanel.vue')
  const demoSeed = await read('utils/demoSeed.ts')

  assert.match(settings, /wipeLocalWorkspace\(\{\s*markFresh:\s*false,\s*includePrefs:\s*true\s*\}\)/)
  assert.match(settings, /markDemoWorkspaceCleared/)
  assert.match(settings, /cof-workspace-reset/)
  assert.doesNotMatch(settings, /sessionStorage\.clear\(\)/)
  assert.match(demoSeed, /DEMO_CLEARED_KEY/)
  assert.match(demoSeed, /if \(!branchesStore\.branches\.length\) return/)
})

test('fresh accounts do not hydrate a default COF demo tree', async () => {
  const branches = await read('stores/branches.store.ts')
  assert.match(branches, /const branches = ref<Branch\[\]>\(\[\]\)/)
  assert.match(branches, /const edges = shallowRef<Edge\[\]>\(\[\]\)/)
  assert.doesNotMatch(branches, /id: 'COF'/)
})
