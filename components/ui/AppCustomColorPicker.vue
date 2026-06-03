<template>
  <div class="custom-color-picker">
    <button type="button" class="color-trigger" @click="open">
      <span class="color-preview" :style="{ '--custom-color': modelValue }" />
      <span>{{ label }}</span>
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
            :style="{ '--custom-color': safeDraftColor }"
            aria-label="Выбрать цвет из палитры"
            @pointerdown="pickFromPalette"
            @pointermove="pickFromPalette"
          >
            <span class="palette-core" />
            <span class="palette-cursor" :style="paletteCursorStyle" />
          </button>

          <div class="color-preview-panel">
            <span class="color-large-preview" :style="{ '--custom-color': draftColor }" />
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
import { computed, ref, watch } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppFormField from '~/components/ui/AppFormField.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppModal from '~/components/ui/AppModal.vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    swatches?: string[]
  }>(),
  {
    label: 'Свой',
    swatches: () => ['#d6d6d6', '#7aa2ff', '#74d6a0', '#e5b45a', '#b49cff', '#ff8a7a', '#6fd8d2'],
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
.color-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: max-content;
  max-width: 100%;
  min-height: var(--control-height-md);
  padding: 4px 10px;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.1;
  white-space: nowrap;
  box-sizing: border-box;
  transition:
    background var(--transition-standard),
    color var(--transition-standard),
    border-color var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }
}

.color-preview,
.color-large-preview,
.color-swatches button {
  background: var(--custom-color);
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: var(--border-radius-pill);
  outline: 1px solid color-mix(in srgb, var(--text) 16%, transparent);
  outline-offset: 2px;
}

.color-modal {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.palette-row {
  display: grid;
  grid-template-columns: auto minmax(112px, 1fr);
  align-items: stretch;
  gap: 16px;
  min-width: 0;
}

.palette-wheel {
  position: relative;
  display: inline-flex;
  width: 132px;
  height: 132px;
  border: var(--ui-border);
  border-radius: 50%;
  cursor: crosshair;
  background:
    radial-gradient(circle at 50% 50%, #fff 0 7%, transparent 43%),
    conic-gradient(red, #ff0, lime, cyan, blue, magenta, red);
  box-shadow: none;
  overflow: hidden;
  touch-action: none;
}

.palette-core {
  position: absolute;
  inset: 43px;
  border-radius: 50%;
  background: var(--custom-color);
  outline: 5px solid color-mix(in srgb, var(--bg) 48%, transparent);
  pointer-events: none;
}

.palette-cursor {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid var(--text-inverse);
  border-radius: 50%;
  outline: 1px solid var(--text);
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.color-preview-panel {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 10px;
  min-width: 0;

  :deep(.app-button) {
    width: 100%;
  }
}

.color-large-preview {
  min-height: 74px;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
}

.brightness-control {
  display: grid;
  gap: 8px;
  color: var(--dim);
  font-size: 0.78rem;
  font-weight: 600;

  input {
    width: 100%;
    accent-color: var(--custom-color);
    cursor: pointer;
  }
}

.color-swatches {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 7px;
}

.color-swatches button {
  aspect-ratio: 1;
  border: none;
  border-radius: var(--border-radius-pill);
  background: var(--custom-color);
  cursor: pointer;
  transition:
    outline-color var(--transition-standard),
    outline-offset var(--transition-standard),
    opacity var(--transition-standard);

  &:hover {
    opacity: 0.84;
  }

  &.active {
    outline: 2px solid color-mix(in srgb, var(--custom-color) 62%, var(--text) 38%);
    outline-offset: 3px;
  }
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;

  :deep(.app-button) {
    min-width: 112px;
  }
}

@include mobile {
  .color-trigger {
    width: 100%;
    min-height: 44px;
  }

  .palette-row {
    grid-template-columns: 1fr;
  }

  .palette-wheel {
    justify-self: center;
    width: 124px;
    height: 124px;
  }

  .modal-actions {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
