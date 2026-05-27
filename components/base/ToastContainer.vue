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
.toast-container {
  position: fixed;
  z-index: 2500;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  top: calc(env(safe-area-inset-top, 0px) + 92px);
  right: 20px;
  left: auto;
  align-items: flex-end;
  max-width: min(400px, calc(100vw - 32px));

  @include mobile {
    top: calc(80px + 12px);
    left: 0;
    right: 0;
    align-items: center;
    margin: 0 auto;
  }
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: var(--border-radius-lg);
  @include glass;
  border: 1px solid var(--glass-border);
  color: var(--accent);
  cursor: pointer;
  transition: all 0.1s ease;
  width: fit-content;
  touch-action: pan-y;

  &:active {
    cursor: grabbing;
  }

  &:hover {
    transform: scale(1.02);
  }

  .indicator {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
    transition: box-shadow 0.2s;
  }

  &.success .indicator {
    background: var(--success);
    box-shadow: 0 0 10px var(--success);
  }
  &.warning .indicator {
    background: var(--warning);
    box-shadow: 0 0 10px var(--warning);
  }
  &.error .indicator {
    background: var(--error);
    box-shadow: 0 0 10px var(--error);
  }
  &.info .indicator {
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
  }

  .message {
    font-size: 0.95rem;
    line-height: 1.4;
    font-weight: 450;
  }

  .toast-action {
    background: var(--accent);
    color: var(--bg);
    border: none;
    padding: 4px 10px;
    border-radius: var(--border-radius-sm);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    margin-left: 4px;
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
  transform: translateX(30px) scale(0.9);
  @include mobile {
    transform: translateY(-20px) scale(0.9);
  }
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
  @include mobile {
    transform: translateY(-20px) scale(0.9);
  }
}
</style>
