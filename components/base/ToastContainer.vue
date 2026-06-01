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
  top: calc(env(safe-area-inset-top, 0px) + 72px);
  right: 16px;
  left: auto;
  align-items: flex-end;
  width: min(360px, calc(100vw - 32px));

  @include mobile {
    top: calc(env(safe-area-inset-top, 0px) + 66px);
    bottom: auto;
    left: 12px;
    right: 12px;
    align-items: center;
    width: auto;
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
  min-width: 168px;
  max-width: 100%;
  min-height: 34px;
  padding: 8px 10px 8px 12px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--glass-border);
  background: var(--glass-surface);
  color: var(--accent);
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color var(--transition-standard);
  touch-action: pan-y;

  &:active {
    transform: scale(0.98);
  }

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
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
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
