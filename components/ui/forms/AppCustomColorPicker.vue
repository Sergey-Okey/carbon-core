<template>
  <div class="custom-color-picker">
    <button type="button" class="color-trigger" :class="{ active: isCustomActive }" @click="open">
      <span class="color-preview" :style="{ '--custom-color': modelValue }">
        <Pipette :size="14" :stroke-width="2.4" />
      </span>
      <span class="color-trigger__copy">
        <strong>{{ label }}</strong>
        <em>{{ modelValue }}</em>
      </span>
    </button>

    <AppModal
      v-if="isOpen"
      title="Свой цвет"
      size="sm"
      @close="close"
    >
      <div class="color-modal">
        <div class="palette-row">
          <button
            ref="paletteRef"
            type="button"
            class="palette-wheel"
            data-cursor="precision"
            :style="{ '--custom-color': safeDraftColor }"
            aria-label="Выбрать цвет из палитры"
            @pointerdown="pickFromPalette"
            @pointermove="pickFromPalette"
          >
            <span class="palette-core" :style="{ '--custom-color': safeDraftColor }" />
            <span class="palette-cursor" :style="paletteCursorStyle" />
          </button>

          <div class="color-preview-panel">
            <div class="color-large-preview" :style="{ '--custom-color': draftColor }">
              <span>{{ safeDraftColor }}</span>
            </div>
            <AppButton type="button" variant="secondary" @click="resetToCurrentColor">
              Текущий
            </AppButton>
          </div>
        </div>

        <AppFormField label="HEX">
          <AppInput
            v-model="draftColor"
            placeholder="#d6d6d6"
            maxlength="7"
            :invalid="!isValidColor"
          />
        </AppFormField>

        <label class="brightness-control">
          <span>Яркость</span>
          <input
            v-model.number="brightness"
            type="range"
            min="0"
            max="100"
            :style="{ '--custom-color': safeDraftColor }"
            @input="setBrightness"
          />
        </label>

        <div class="color-swatches" aria-label="Быстрый выбор цвета">
          <button
            v-for="color in swatches"
            :key="color"
            type="button"
            :style="{ '--custom-color': color }"
            :class="{ active: normalizeColor(draftColor) === normalizeColor(color) }"
            :aria-label="color"
            @click="draftColor = color"
          />
        </div>
      </div>

      <template #footer>
        <div class="modal-actions">
          <AppButton type="button" variant="secondary" @click="close">Отмена</AppButton>
          <AppButton type="button" variant="primary" :disabled="!isValidColor" @click="apply">
            Применить
          </AppButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { Pipette } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    swatches?: string[]
    active?: boolean
  }>(),
  {
    label: 'Свой',
    swatches: () => ['#2b2b2b', '#2563EB', '#16A34A', '#EA580C', '#7C3AED', '#DC2626', '#0D9488'],
    active: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const draftColor = ref(props.modelValue)
const brightness = ref(100)
const paletteRef = ref<HTMLButtonElement | null>(null)
const isValidColor = computed(() => /^#[0-9a-fA-F]{6}$/.test(draftColor.value))
const safeDraftColor = computed(() => (isValidColor.value ? draftColor.value : '#d6d6d6'))
const isCustomActive = computed(() => props.active)
const paletteCursorStyle = computed(() => {
  const hsv = hexToHsv(safeDraftColor.value)
  const angle = (hsv.h - 90) * (Math.PI / 180)
  const radius = 42 * hsv.s
  const x = 50 + Math.cos(angle) * radius
  const y = 50 + Math.sin(angle) * radius

  return {
    left: `${x}%`,
    top: `${y}%`,
  }
})

watch(
  () => props.modelValue,
  (value) => {
    draftColor.value = value
    syncBrightness(value)
  }
)

function normalizeColor(color: string) {
  return color.toLowerCase()
}

function open() {
  draftColor.value = props.modelValue
  syncBrightness(props.modelValue)
  isOpen.value = true
}

function close() {
  draftColor.value = props.modelValue
  syncBrightness(props.modelValue)
  isOpen.value = false
}

function resetToCurrentColor() {
  draftColor.value = props.modelValue
  syncBrightness(props.modelValue)
}

function pickFromPalette(event: PointerEvent) {
  if (event.type === 'pointermove' && event.buttons === 0) return
  const target = paletteRef.value
  if (!target) return

  const rect = target.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const dx = event.clientX - centerX
  const dy = event.clientY - centerY
  const radius = Math.min(rect.width, rect.height) / 2
  const distance = Math.min(Math.hypot(dx, dy), radius)
  const hue = (Math.atan2(dy, dx) * 180) / Math.PI + 90
  const saturation = distance / radius

  draftColor.value = hsvToHex((hue + 360) % 360, saturation, brightness.value / 100)
}

function setBrightness() {
  if (!isValidColor.value) return
  const hsv = hexToHsv(draftColor.value)
  draftColor.value = hsvToHex(hsv.h, hsv.s, brightness.value / 100)
}

function syncBrightness(color: string) {
  brightness.value = Math.round(hexToHsv(isValidHex(color) ? color : '#d6d6d6').v * 100)
}

function isValidHex(color: string) {
  return /^#[0-9a-fA-F]{6}$/.test(color)
}

function hsvToHex(h: number, s: number, v: number) {
  const chroma = v * s
  const hueSector = h / 60
  const x = chroma * (1 - Math.abs((hueSector % 2) - 1))
  const m = v - chroma
  const [r, g, b] =
    hueSector < 1
      ? [chroma, x, 0]
      : hueSector < 2
        ? [x, chroma, 0]
        : hueSector < 3
          ? [0, chroma, x]
          : hueSector < 4
            ? [0, x, chroma]
            : hueSector < 5
              ? [x, 0, chroma]
              : [chroma, 0, x]

  return rgbToHex(r + m, g + m, b + m)
}

function rgbToHex(r: number, g: number, b: number) {
  return [r, g, b]
    .map((channel) => Math.round(channel * 255).toString(16).padStart(2, '0'))
    .join('')
    .replace(/^/, '#')
}

function hexToHsv(hex: string) {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16) / 255
  const g = parseInt(value.slice(2, 4), 16) / 255
  const b = parseInt(value.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const saturation = max === 0 ? 0 : delta / max
  let hue = 0

  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6
    if (max === g) hue = (b - r) / delta + 2
    if (max === b) hue = (r - g) / delta + 4
    hue *= 60
    if (hue < 0) hue += 360
  }

  return { h: hue, s: saturation, v: max }
}

function apply() {
  if (!isValidColor.value) return
  emit('update:modelValue', draftColor.value)
  isOpen.value = false
}
</script>

<style scoped lang="scss">
.custom-color-picker {
  display: inline-flex;
  min-width: 0;
}

.color-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  width: max-content;
  max-width: 100%;
  min-height: var(--space-11);
  margin: 0;
  padding: var(--space-1) var(--space-3) var(--space-1) var(--space-1);
  border: var(--ui-border);
  border-radius: 14px;
  background: var(--color-surface-1);
  color: var(--color-text-primary);
  cursor: pointer;
  font: inherit;
  box-sizing: border-box;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    transform 180ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-1px);
      background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface-1));
    }
  }

  &.active {
    border-color: color-mix(in srgb, var(--color-accent) 45%, var(--ui-border-color));
  }
}

.color-trigger__copy {
  display: grid;
  gap: 1px;
  min-width: 0;
  text-align: left;

  strong {
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    line-height: var(--leading-tight);
  }

  em {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-style: normal;
    font-variant-numeric: tabular-nums;
    line-height: var(--leading-tight);
  }
}

.color-preview {
  display: inline-grid;
  place-items: center;
  width: var(--space-8);
  height: var(--space-8);
  border-radius: 11px;
  background: var(--custom-color);
  color: #fff;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-text-primary) 12%, transparent);
}

.color-modal {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
}

.palette-row {
  display: grid;
  grid-template-columns: auto minmax(120px, 1fr);
  align-items: stretch;
  gap: var(--space-4);
  min-width: 0;
}

.palette-wheel {
  position: relative;
  display: inline-flex;
  width: 148px;
  height: 148px;
  border: none;
  border-radius: 50%;
  cursor: crosshair;
  background:
    radial-gradient(circle closest-side, #fff 0%, transparent 68%),
    conic-gradient(from -90deg, #ff0040, #ffbf00, #80ff00, #00ffbf, #0040ff, #bf00ff, #ff0040);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--color-text-primary) 10%, transparent),
    0 10px 24px color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  overflow: hidden;
  touch-action: none;
}

.palette-core {
  position: absolute;
  inset: 46px;
  border-radius: 50%;
  background: var(--custom-color);
  box-shadow:
    0 0 0 6px var(--color-surface-1),
    inset 0 0 0 1px color-mix(in srgb, var(--color-text-primary) 10%, transparent);
  pointer-events: none;
}

.palette-cursor {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-radius: var(--radius-full);
  box-shadow:
    0 0 0 1px color-mix(in srgb, #000 35%, transparent),
    0 2px 6px color-mix(in srgb, #000 25%, transparent);
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.color-preview-panel {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: var(--space-3);
  min-width: 0;

  :deep(.app-button) {
    width: 100%;
    min-height: var(--space-11);
  }
}

.color-large-preview {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  min-height: var(--space-16);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  background: var(--custom-color);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-text-primary) 10%, transparent);

  span {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    background: color-mix(in srgb, var(--color-bg) 72%, transparent);
    color: var(--color-text-primary);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    font-variant-numeric: tabular-nums;
    backdrop-filter: blur(8px);
  }
}

.brightness-control {
  display: grid;
  gap: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);

  input {
    width: 100%;
    height: 10px;
    appearance: none;
    border-radius: var(--radius-full);
    background: linear-gradient(
      90deg,
      #000 0%,
      var(--custom-color) 100%
    );
    cursor: pointer;

    &::-webkit-slider-thumb {
      appearance: none;
      width: var(--control-glyph);
      height: var(--control-glyph);
      border: 2px solid #fff;
      border-radius: var(--radius-full);
      background: var(--custom-color);
      box-shadow: 0 1px 4px color-mix(in srgb, #000 28%, transparent);
    }

    &::-moz-range-thumb {
      width: var(--control-glyph);
      height: var(--control-glyph);
      border: 2px solid #fff;
      border-radius: var(--radius-full);
      background: var(--custom-color);
      box-shadow: 0 1px 4px color-mix(in srgb, #000 28%, transparent);
    }
  }
}

.color-swatches {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--space-2);
}

.color-swatches button {
  aspect-ratio: 1;
  border: none;
  border-radius: 12px;
  background: var(--custom-color);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-text-primary) 10%, transparent);
  cursor: pointer;
  transition:
    transform 160ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow var(--transition-standard);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-1px) scale(1.04);
    }
  }

  &.active {
    box-shadow:
      0 0 0 2px var(--color-surface-1),
      0 0 0 4px var(--custom-color);
  }
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
  width: 100%;

  :deep(.app-button) {
    min-width: 112px;
    min-height: var(--space-11);
  }
}

@include mobile {
  .color-trigger {
    width: 100%;
    min-height: var(--space-12);
  }

  .palette-row {
    grid-template-columns: 1fr;
  }

  .palette-wheel {
    justify-self: center;
    width: 156px;
    height: 156px;
  }

  .modal-actions {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
