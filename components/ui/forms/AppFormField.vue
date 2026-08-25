<template>
  <div class="app-form-field" :data-invalid="error ? '' : undefined">
    <label v-if="label" class="field-label" :for="forId">{{ label }}</label>
    <div class="field-control">
      <slot />
    </div>
    <p
      v-if="error"
      class="field-message is-error"
      role="alert"
    >
      {{ error }}
    </p>
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
  gap: var(--space-3);
  min-width: 0;
}

.field-label {
  color: var(--color-text-secondary);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.field-control {
  min-width: 0;
}

.field-message {
  @include meta-text;
  color: var(--color-text-muted);

  &.is-error {
    color: var(--color-error);
  }
}

.app-form-field[data-invalid] .field-label {
  color: var(--color-error);
}
</style>
