<template>
  <article
    class="widget-shell"
    :class="[
      !fluid && span ? `span-${span}` : null,
      enter ? `enter-${enter}` : null,
      {
        'is-dragging': dragging,
        'is-drop-target': dropTarget,
        'is-fluid': fluid,
      },
    ]"
    @dragover.prevent="$emit('dragover')"
    @dragenter.prevent="$emit('dragenter')"
    @dragleave="$emit('dragleave', $event)"
    @drop.prevent="$emit('drop')"
  >
    <header class="widget-shell__head">
      <div class="widget-shell__title">
        <span v-if="icon" class="widget-shell__icon" aria-hidden="true">
          <component :is="icon" :size="16" />
        </span>
        <div class="widget-shell__copy">
          <h2>{{ title }}</h2>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <div class="widget-shell__meta">
        <div v-if="$slots.aside || aside" class="widget-shell__aside">
          <slot name="aside">{{ aside }}</slot>
        </div>
        <button
          v-if="draggable"
          type="button"
          class="widget-shell__drag"
          draggable="true"
          :aria-label="dragLabel"
          title="Перетащить"
          @dragstart="$emit('dragstart', $event)"
          @dragend="$emit('dragend')"
        >
          <GripVertical :size="16" aria-hidden="true" />
        </button>
      </div>
    </header>

    <div class="widget-shell__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="widget-shell__foot">
      <slot name="footer" />
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { GripVertical } from 'lucide-vue-next'

export type WidgetEnterMotion =
  | 'fade-up'
  | 'slide-left'
  | 'scale-pop'
  | 'spin-soft'
  | 'expand-blur'
  | 'bounce-in'
  | 'wipe-up'
  | 'slide-right'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    aside?: string
    icon?: Component
    draggable?: boolean
    dragLabel?: string
    dragging?: boolean
    dropTarget?: boolean
    span?: 4 | 6 | 8 | 12 | 1
    enter?: WidgetEnterMotion
    fluid?: boolean
  }>(),
  {
    subtitle: undefined,
    aside: undefined,
    icon: undefined,
    draggable: true,
    dragLabel: 'Перетащить виджет',
    dragging: false,
    dropTarget: false,
    span: 6,
    enter: undefined,
    fluid: false,
  }
)

defineEmits<{
  dragstart: [event: DragEvent]
  dragend: []
  dragover: []
  dragenter: []
  dragleave: [event: DragEvent]
  drop: []
}>()
</script>

<style scoped lang="scss">
.widget-shell {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  box-sizing: border-box;
  min-width: 0;
  height: var(--tile-h, 320px);
  padding: var(--space-5);
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-1);
  box-shadow: var(--shadow-xs);
  color: var(--color-text-primary);
  transition:
    outline-color var(--transition-standard),
    box-shadow var(--transition-standard),
    opacity var(--transition-standard),
    border-color var(--transition-standard);

  &.span-12 {
    grid-column: span 12;
  }

  &.span-8 {
    grid-column: span 8;
  }

  &.span-6 {
    grid-column: span 6;
  }

  &.span-4 {
    grid-column: span 4;
  }

  &.is-dragging {
    opacity: 0.45;
  }

  &.is-drop-target {
    outline: 2px solid color-mix(in srgb, var(--accent) 55%, transparent);
  }

  &.is-fluid {
    height: auto;
    flex: 1 1 0;
    min-height: 0;
  }

  &.enter-fade-up {
    animation: widget-fade-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  &.enter-slide-left {
    animation: widget-slide-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  &.enter-scale-pop {
    animation: widget-scale-pop 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) both;
  }

  &.enter-spin-soft {
    animation: widget-spin-soft 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  &.enter-expand-blur {
    animation: widget-expand-blur 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  &.enter-bounce-in {
    animation: widget-bounce-in 0.7s cubic-bezier(0.34, 1.45, 0.64, 1) both;
  }

  &.enter-wipe-up {
    animation: widget-wipe-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  &.enter-slide-right {
    animation: widget-slide-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
}

@keyframes widget-fade-up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes widget-slide-left {
  from {
    opacity: 0;
    transform: translateX(28px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes widget-scale-pop {
  from {
    opacity: 0;
    transform: scale(0.88);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes widget-spin-soft {
  from {
    opacity: 0;
    transform: rotate(-4deg) scale(0.92);
  }
  to {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
}

@keyframes widget-expand-blur {
  from {
    opacity: 0;
    filter: blur(8px);
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform: scale(1);
  }
}

@keyframes widget-bounce-in {
  0% {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
  }
  60% {
    opacity: 1;
    transform: translateY(-4px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes widget-wipe-up {
  from {
    opacity: 0;
    clip-path: inset(18% 0 0 0);
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    clip-path: inset(0 0 0 0);
    transform: translateY(0);
  }
}

@keyframes widget-slide-right {
  from {
    opacity: 0;
    transform: translateX(-28px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.widget-shell__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex: 0 0 auto;
  min-width: 0;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid color-mix(in srgb, var(--color-text-primary) 8%, transparent);
}

.widget-shell__title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.widget-shell__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 0 0 auto;
}

.widget-shell__drag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  margin: 0;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: grab;
  touch-action: none;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:active {
    cursor: grabbing;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: color-mix(in srgb, var(--color-accent) 8%, transparent);
      color: var(--color-text-primary);
    }
  }
}

.widget-shell__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: var(--space-8);
  height: var(--space-8);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
  color: var(--color-text-primary);
}

.widget-shell__copy {
  min-width: 0;

  h2 {
    margin: 0;
    overflow: hidden;
    color: var(--color-text-primary);
    font-size: var(--text-md);
    font-weight: var(--weight-semibold);
    line-height: var(--leading-tight);
    letter-spacing: -0.02em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    margin: 2px 0 0;
    overflow: hidden;
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    line-height: var(--leading-tight);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.widget-shell__aside {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  white-space: nowrap;
}

.widget-shell__body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.widget-shell__foot {
  display: grid;
  gap: var(--space-1);
  margin-top: auto;
  padding-top: var(--space-3);
  border-top: 1px solid color-mix(in srgb, var(--color-text-primary) 6%, transparent);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

@media (max-width: 1100px) {
  .widget-shell.span-12 {
    grid-column: span 6;
  }

  .widget-shell.span-8 {
    grid-column: span 6;
  }

  .widget-shell.span-6,
  .widget-shell.span-4 {
    grid-column: span 3;
  }

  .widget-shell:not(.is-fluid) {
    height: 380px;
  }
}

@media (max-width: 767px) {
  .widget-shell,
  .widget-shell.span-12,
  .widget-shell.span-8,
  .widget-shell.span-6,
  .widget-shell.span-4 {
    grid-column: span 1;
    height: auto;
    min-height: 280px;
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .widget-shell.is-fluid {
    min-height: 220px;
  }

  .widget-shell__head {
    gap: var(--space-2);
    padding-bottom: var(--space-2);
  }

  .widget-shell__title {
    gap: var(--space-2);
  }

  .widget-shell__icon {
    width: var(--space-7);
    height: var(--space-7);
  }

  .widget-shell__copy h2 {
    font-size: var(--text-sm);
  }

  .widget-shell__drag {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 420px) {
  .widget-shell,
  .widget-shell.span-12,
  .widget-shell.span-8,
  .widget-shell.span-6,
  .widget-shell.span-4 {
    min-height: 240px;
    padding: var(--space-3);
  }

  .widget-shell__copy p {
    display: none;
  }
}
</style>
