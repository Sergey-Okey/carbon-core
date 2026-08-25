<template>
  <div class="header-quick-actions">
    <slot name="leading" />

    <button
      v-if="isDemo"
      class="demo-access"
      type="button"
      aria-label="Открыть подписку"
      @click="emit('demo')"
    >
      Демо
    </button>

    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isDemo?: boolean
}>()

const emit = defineEmits<{
  (e: 'demo'): void
}>()
</script>

<style scoped lang="scss">
.header-quick-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  justify-self: end;
  gap: var(--space-2);
  min-width: 0;
  min-height: var(--space-9);
  flex-wrap: nowrap;
  color: var(--header-icon, var(--color-text-primary));

  @include mobile {
    gap: var(--space-1);
  }
}

.demo-access {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--space-9);
  padding-inline: var(--space-2);
  border: 1px solid color-mix(in srgb, var(--color-error) 45%, transparent);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-error) 16%, transparent);
  color: var(--color-error);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: 0.01em;
  cursor: pointer;
  transition:
    background var(--transition-standard),
    box-shadow var(--transition-standard),
    transform var(--transition-standard);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: color-mix(in srgb, var(--color-error) 24%, transparent);
    }
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-error) 45%, transparent);
    outline-offset: 2px;
  }

  @include mobile {
    min-height: var(--space-8);
    padding-inline: var(--space-2);
  }
}

.header-quick-actions :deep(.notification-trigger),
.header-quick-actions :deep(.header-agent-trigger),
.header-quick-actions :deep(.profile-btn) {
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  min-height: var(--control-icon-size);
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;

  &:hover,
  &:focus-visible {
    background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  }

  @include mobile {
    width: var(--space-11);
    height: var(--space-11);
    min-height: var(--space-11);
  }
}

.header-quick-actions :deep(.notification-trigger),
.header-quick-actions :deep(.notification-trigger.variant-ghost),
.header-quick-actions :deep(.profile-btn) {
  color: var(--header-icon, var(--color-text-primary));

  &:hover,
  &:focus-visible {
    color: var(--header-icon, var(--color-text-primary));
  }
}
</style>
