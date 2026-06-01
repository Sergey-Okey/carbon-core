<template>
  <div class="custom-color-picker">
    <button type="button" class="color-trigger" @click="isOpen = true">
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
        <div class="color-large-preview" :style="{ '--custom-color': draftColor }" />

        <AppFormField label="HEX">
          <AppInput
            v-model="draftColor"
            placeholder="#d6d6d6"
            maxlength="7"
            :invalid="!isValidColor"
          />
        </AppFormField>

        <div class="color-swatches" aria-label="Быстрый выбор цвета">
          <button
            v-for="color in swatches"
            :key="color"
            type="button"
            :style="{ '--custom-color': color }"
            :class="{ active: normalizeColor(draftColor) === normalizeColor(color) }"
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
    swatches: () => ['#d6d6d6', '#3584e4', '#33d17a', '#ff7800', '#9141ac', '#e01b24', '#1c71d8'],
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const draftColor = ref(props.modelValue)
const isValidColor = computed(() => /^#[0-9a-fA-F]{6}$/.test(draftColor.value))

watch(
  () => props.modelValue,
  (value) => {
    draftColor.value = value
  }
)

function normalizeColor(color: string) {
  return color.toLowerCase()
}

function close() {
  draftColor.value = props.modelValue
  isOpen.value = false
}

function apply() {
  if (!isValidColor.value) return
  emit('update:modelValue', draftColor.value)
  isOpen.value = false
}
</script>

<style scoped lang="scss">
.color-trigger {
  @include glass;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 4px 8px 4px 12px;
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
  color: var(--dim);
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
}

.color-preview,
.color-large-preview,
.color-swatches button {
  background: var(--custom-color);
}

.color-preview {
  width: 24px;
  height: 24px;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
}

.color-modal {
  display: grid;
  gap: 16px;
}

.color-large-preview {
  height: 64px;
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
}

.color-swatches {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.color-swatches button {
  aspect-ratio: 1;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
  cursor: pointer;

  &.active {
    box-shadow: 0 0 0 2px var(--accent);
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}
</style>
