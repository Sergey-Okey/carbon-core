<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="toast"
        :class="notif.type"
        @click="removeNotification(notif.id)"
      >
        <span class="indicator"></span>
        <span class="message">{{ notif.message }}</span>
        <button
          v-if="notif.action"
          class="toast-action"
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
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
  inset-block-start: calc(env(safe-area-inset-top, 0px) + 72px);
  inset-inline-end: max(16px, env(safe-area-inset-right, 0px));
  align-items: flex-end;
  inline-size: min(360px, calc(100dvw - 32px));

  @include mobile {
    inset-block-start: calc(env(safe-area-inset-top, 0px) + 66px);
    inset-inline-start: max(12px, env(safe-area-inset-left, 0px));
    inset-inline-end: max(12px, env(safe-area-inset-right, 0px));
    align-items: center;
    inline-size: auto;
  }
}

.toast {
  @include glass;
  pointer-events: auto;
  display: grid;
  grid-template-columns: 6px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  align-self: flex-end;
  width: fit-content;
  min-inline-size: 168px;
  max-inline-size: 100%;
  min-height: 34px;
  padding: 8px 10px 8px 12px;
  border-radius: var(--border-radius-lg);
  border: var(--ui-border);
  background: var(--glass-surface);
  color: var(--text);
  cursor: pointer;
  transition:
    transform var(--transition-standard),
    border-color var(--transition-standard);
  touch-action: pan-y;

  .indicator {
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }

  &.success .indicator {
    background: var(--success);
  }
  &.warning .indicator {
    background: var(--warning);
  }
  &.error .indicator {
    background: var(--error);
  }
  &.info .indicator {
    background: var(--accent);
  }

  .message {
    min-width: 0;
    font-size: 0.84rem;
    line-height: 1.3;
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  .toast-action {
    background: var(--accent);
    color: var(--bg);
    border: none;
    padding: 3px 8px;
    border-radius: var(--border-radius-sm);
    font-size: 0.78rem;
    font-weight: 600;
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
    min-height: 44px;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.3s cubic-bezier(0.2, 0, 0, 1),
    transform 0.3s cubic-bezier(0.2, 0, 0, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(18px);
  @include mobile {
    transform: translateY(-10px);
  }

  @include mobile {
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
