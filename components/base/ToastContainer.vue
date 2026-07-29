<template>
  <div class="toast-container" aria-live="polite" aria-relevant="additions">
    <TransitionGroup name="toast">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="toast"
        :class="notif.type"
        role="status"
        @click="removeNotification(notif.id)"
      >
        <span class="indicator" aria-hidden="true"></span>
        <span class="message">{{ notif.message }}</span>
        <button
          v-if="notif.action"
          class="toast-action"
          type="button"
          @click.stop="notif.action.handler"
        >
          {{ notif.action.label }}
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/useNotification'

const { notifications, removeNotification } = useNotification()
</script>

<style scoped lang="scss">
.toast-container.toast-container {
  position: fixed;
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  pointer-events: none;
  inset-block-start: calc(env(safe-area-inset-top, 0px) + 72px);
  inset-inline-end: max(var(--space-4), env(safe-area-inset-right, 0px));
  align-items: flex-end;
  inline-size: min(360px, calc(100dvw - var(--space-8)));

  @include mobile {
    inset-block-start: calc(env(safe-area-inset-top, 0px) + 66px);
    inset-inline-start: max(var(--space-3), env(safe-area-inset-left, 0px));
    inset-inline-end: max(var(--space-3), env(safe-area-inset-right, 0px));
    align-items: center;
    inline-size: auto;
  }
}

.toast {
  @include surface-panel;
  pointer-events: auto;
  display: grid;
  grid-template-columns: var(--space-1) minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-2);
  align-self: flex-end;
  width: fit-content;
  min-inline-size: 168px;
  max-inline-size: 100%;
  min-height: var(--control-height-sm);
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition:
    transform var(--transition-standard),
    border-color var(--transition-standard);
  touch-action: pan-y;

  .indicator {
    width: 5px;
    height: 5px;
    border-radius: var(--radius-full);
  }

  &.success .indicator {
    background: var(--color-success);
  }
  &.warning .indicator {
    background: var(--color-warning);
  }
  &.error .indicator {
    background: var(--color-error);
  }
  &.info .indicator {
    background: var(--color-accent);
  }

  .message {
    min-width: 0;
    font-size: var(--text-sm);
    line-height: var(--leading-tight);
    font-weight: var(--weight-medium);
    overflow-wrap: anywhere;
  }

  .toast-action {
    background: var(--color-accent);
    color: var(--color-bg);
    border: none;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    cursor: pointer;
    transition: opacity var(--transition-standard);

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        opacity: 0.8;
      }
    }
  }
}

@media (pointer: coarse), (max-width: 767px) {
  .toast,
  .toast-action {
    min-height: var(--space-11);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity var(--duration-normal) var(--ease-standard),
    transform var(--duration-normal) var(--ease-standard);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(18px);
  @include mobile {
    transform: translateY(-10px);
    align-self: center;
  }
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(18px);
  @include mobile {
    transform: translateY(-10px);
  }
}
</style>
