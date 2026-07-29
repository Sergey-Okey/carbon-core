<template>
  <div class="empty-state" :class="[`size-${size}`]" role="status">
    <div v-if="$slots.icon || icon" class="empty-state__icon" aria-hidden="true">
      <slot name="icon">
        <component :is="icon" v-if="icon" :size="iconSize" />
      </slot>
    </div>
    <h3 v-if="title" class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    <div v-if="$slots.action" class="empty-state__action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    icon?: Component
    size?: 'sm' | 'md'
  }>(),
  {
    title: undefined,
    description: undefined,
    icon: undefined,
    size: 'md',
  }
)

const iconSize = computed(() => (props.size === 'sm' ? 18 : 22))
</script>

<style scoped lang="scss">
.empty-state {
  display: grid;
  justify-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-6) var(--space-4);
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-1);
  box-shadow: var(--shadow-xs);
  color: var(--color-text-secondary);
  text-align: center;
}

.size-sm {
  padding: var(--space-4) var(--space-3);
  gap: var(--space-2);
}

.empty-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.empty-state__title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
}

.empty-state__description {
  margin: 0;
  max-width: 36ch;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
}

.empty-state__action {
  margin-top: var(--space-2);
}
</style>
