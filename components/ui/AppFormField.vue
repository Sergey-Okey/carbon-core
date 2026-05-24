<template>
  <div class="app-form-field">
    <label v-if="label" class="field-label" :for="forId">{{ label }}</label>
    <slot />
    <p v-if="error" class="field-message error">{{ error }}</p>
    <p v-else-if="hint" class="field-message">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  forId?: string
  hint?: string
  error?: string
}>()
</script>

<style scoped lang="scss">
.app-form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.field-label {
  color: var(--dim);
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.field-message {
  margin: 0;
  color: var(--dim);
  font-size: 0.78rem;
  line-height: 1.35;

  &.error {
    color: var(--error);
  }
}
</style>
