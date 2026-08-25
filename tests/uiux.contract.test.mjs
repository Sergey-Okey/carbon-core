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
  assert.match(mixins, /@mixin collapse-panel/)
  assert.match(mixins, /@mixin collapse-toggle/)
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

test('spacing and typography tokens keep a 4px scale and heading roles', async () => {
  const spacing = await read('assets/styles/tokens/_spacing.scss')
  const type = await read('assets/styles/tokens/_typography.scss')
  const mixins = await read('assets/styles/mixins.scss')
  const reset = await read('assets/styles/reset.scss')

  assert.match(spacing, /--space-1:\s*4px/)
  assert.match(spacing, /--space-16:\s*64px/)
  assert.match(spacing, /--touch-target:\s*var\(--space-11\)/)
  assert.match(type, /--heading-1-size:\s*var\(--text-2xl\)/)
  assert.match(type, /--heading-2-size:\s*var\(--text-xl\)/)
  assert.match(type, /--heading-3-size:\s*var\(--text-md\)/)
  assert.match(type, /--body-size:\s*var\(--text-sm\)/)
  assert.match(mixins, /@mixin heading-1/)
  assert.match(mixins, /@mixin heading-2/)
  assert.match(mixins, /@mixin heading-3/)
  assert.match(mixins, /@mixin meta-text/)
  assert.match(mixins, /@mixin inline-link/)
  assert.match(mixins, /@mixin form-control/)
  assert.match(spacing, /--control-height-lg:\s*var\(--space-14\)/)
  assert.match(reset, /font-size:\s*16px/)
  assert.match(reset, /font-size:\s*var\(--body-size\)/)
})

test('keyboard inset under islands is painted with the page background', async () => {
  const reset = await read('assets/styles/reset.scss')
  const global = await read('assets/styles/global.scss')
  const dock = await read('components/ai/BoardDock.vue')
  const nav = await read('components/base/TheNavbar.vue')

  assert.match(reset, /html\s*\{[\s\S]*background-color:\s*var\(--color-bg/)
  assert.match(global, /height:\s*calc\(100lvh \+ 40vh\)/)
  assert.doesNotMatch(dock, /keyboard-gap-fill/)
  assert.doesNotMatch(nav, /keyboard-gap-fill/)
})

test('header icons and AI hub stay readable in the light theme', async () => {
  const colors = await read('assets/styles/tokens/_colors.scss')
  const header = await read('components/base/TheHeader.vue')
  const actions = await read('components/base/header/HeaderQuickActions.vue')
  const hub = await read('components/ai/AiHub.vue')
  const glow = await read('components/ai/BoardAiGlow.vue')

  assert.match(header, /color:\s*var\(--color-text-primary\)|--header-icon/)
  assert.match(actions, /--header-icon|color-text-primary/)
  assert.match(hub, /\.ai-hub__kicker[\s\S]*color:\s*var\(--color-text-primary\)/)
  assert.match(hub, /--island-surface/)
  assert.match(colors, /\.light-theme[\s\S]*--island-surface:\s*color-mix\(in srgb, var\(--surface\) 90%/)
  assert.match(colors, /\.light-theme[\s\S]*--glass-strong-border:\s*rgba\(0, 0, 0/)
  assert.match(glow, /html\.light-theme/)
})

test('composer island and navbar wait for launch gate', async () => {
  const dock = await read('components/ai/BoardDock.vue')
  const nav = await read('components/base/TheNavbar.vue')
  const launch = await read('components/base/AppLaunchScreen.vue')
  const gate = await read('composables/useLaunchGate.ts')
  const index = await read('pages/index.vue')

  assert.match(gate, /cof:launch-complete/)
  assert.match(launch, /dataset\.launchComplete/)
  assert.match(dock, /v-if="launchReady"/)
  assert.match(nav, /v-if="launchReady"/)
  assert.match(index, /LazyBranchFlow|LazyAnalyticsPanel|LazySettingsPanel/)
})

test('select size modifiers do not inherit AppModal size-sm', async () => {
  const select = await read('components/ui/forms/AppSelect.vue')
  const search = await read('components/ui/forms/AppSearch.vue')

  assert.match(select, /\.app-select\.size-sm/)
  assert.doesNotMatch(select, /\n\s+\.size-sm\s+&/)
  assert.match(search, /\.app-search-root\.size-sm/)
  assert.doesNotMatch(search, /\n\s+\.size-sm\s+&/)
})
