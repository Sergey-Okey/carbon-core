<template>
  <div class="header-quick-actions">
    <slot name="leading" />

    <button
      v-if="isDemo"
      class="demo-access"
      type="button"
      aria-label="Открыть подписку"
      data-tooltip="Демо: данные не сохраняются"
      data-tooltip-position="bottom"
      @click="emit('demo')"
    >
      Демо
    </button>

    <button
      :class="['action-btn', { 'is-guided-prompt': highlightGuide }]"
      type="button"
      aria-label="Открыть обучение"
      data-tooltip="Обучение"
      data-tooltip-position="bottom"
      @click="emit('guide')"
    >
      <HelpCircle :size="20" />
    </button>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { HelpCircle } from 'lucide-vue-next'

defineProps<{
  isDemo?: boolean
  highlightGuide?: boolean
}>()

const emit = defineEmits<{
  (e: 'demo'): void
  (e: 'guide'): void
}>()
</script>

<style scoped lang="scss">
.header-quick-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  min-width: 0;

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
  border: 1px solid color-mix(in srgb, var(--color-accent) 22%, transparent);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
  color: var(--color-accent);
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
      background: color-mix(in srgb, var(--color-accent) 24%, transparent);
    }
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 2px;
  }

  @include mobile {
    min-height: var(--space-8);
    padding-inline: var(--space-2);
  }
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: color-mix(in srgb, var(--color-accent) 8%, transparent);
      color: var(--color-text-primary);
    }
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 2px;
  }

  @include mobile {
    width: var(--space-11);
    height: var(--space-11);
  }
}

.action-btn.is-guided-prompt {
  color: var(--color-text-primary);
  animation: help-icon-pulse 1.4s ease-in-out infinite;
}

.action-btn.is-guided-prompt svg {
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--color-accent) 26%, transparent));
}

.header-quick-actions :deep(.notification-trigger) {
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  min-height: var(--control-icon-size);
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);

  &:hover,
  &:focus-visible {
    background: color-mix(in srgb, var(--color-accent) 8%, transparent);
    color: var(--color-text-primary);
  }

  @include mobile {
    width: var(--space-11);
    height: var(--space-11);
    min-height: var(--space-11);
  }
}

@keyframes help-icon-pulse {
  0%,
  100% {
    background: transparent;
    transform: scale(1);
  }
  40% {
    background: color-mix(in srgb, var(--color-accent) 12%, transparent);
    transform: scale(1.06);
  }
}
</style>
