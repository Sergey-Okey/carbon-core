import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => readFile(join(root, relativePath), 'utf8')

test('launch and toast surfaces expose polite live regions', async () => {
  const launch = await read('components/base/AppLaunchScreen.vue')
  const toast = await read('components/base/ToastContainer.vue')
  const pageLoading = await read('components/base/PageLoadingOverlay.vue')

  for (const source of [launch, toast, pageLoading]) {
    assert.match(source, /aria-live="polite"/)
    assert.match(source, /role="status"/)
  }
})

test('segmented control and color picker keep radiogroup semantics', async () => {
  const segmented = await read('components/ui/navigation/AppSegmentedControl.vue')
  const colorPicker = await read('components/ui/forms/AppColorPicker.vue')

  assert.match(segmented, /role="radiogroup"/)
  assert.match(segmented, /aria-checked/)
  assert.match(colorPicker, /role="radiogroup"/)
  assert.match(colorPicker, /:aria-label="label"/)
})

test('analytics widgets expose img roles and panel labeling', async () => {
  const panel = await read('components/analytics/AnalyticsPanel.vue')
  const radar = await read('components/analytics/widgets/AnalyticsRadarChart.vue')
  const heatmap = await read('components/analytics/widgets/AnalyticsHeatmap.vue')
  const hourBars = await read('components/analytics/widgets/AnalyticsHourBarChart.vue')
  const line = await read('components/analytics/widgets/AnalyticsLineChart.vue')

  assert.match(panel, /aria-label="Аналитика"/)
  for (const source of [radar, heatmap, hourBars, line]) {
    assert.match(source, /role="img"/)
    assert.match(source, /aria-label/)
  }
})

test('nested radius tokens and mixins stay concentric', async () => {
  const radius = await read('assets/styles/tokens/_radius.scss')
  const mixins = await read('assets/styles/mixins.scss')

  assert.match(radius, /--radius-nested:\s*max\(0px,\s*calc\(var\(--nest-radius\) - var\(--nest-pad\)\)\)/)
  assert.match(mixins, /@mixin nest-shell/)
  assert.match(mixins, /@mixin nest-item/)
  assert.match(mixins, /border-radius:\s*var\(--radius-nested\)/)
  assert.match(mixins, /@mixin tablet/)
  assert.match(mixins, /@mixin narrow/)
  assert.match(mixins, /min-width:\s*768px/)
  assert.match(mixins, /max-width:\s*767px/)
})

test('board nodes keep equal padding via shared --node-pad', async () => {
  const branch = await read('components/branch/BranchNode.vue')
  const milestone = await read('components/branch/MilestoneNode.vue')

  for (const source of [branch, milestone]) {
    assert.match(source, /--node-pad:/)
    assert.match(source, /padding:\s*var\(--node-pad\)/)
    assert.match(source, /margin-top:\s*auto/)
  }
})

test('form shells reuse nest-shell for nested corners', async () => {
  for (const path of [
    'components/ui/navigation/AppSegmentedControl.vue',
    'components/ui/forms/AppSelect.vue',
    'components/ui/forms/AppTimePicker.vue',
    'components/ui/forms/AppDatePicker.vue',
  ]) {
    const source = await read(path)
    assert.match(source, /@include nest-shell/, `${path} should use nest-shell`)
  }
})

test('GlassCard no-padding remains an explicit opt-in', async () => {
  const glass = await read('components/base/GlassCard.vue')
  assert.match(glass, /noPadding/)
  assert.match(glass, /&\.no-padding/)
})
