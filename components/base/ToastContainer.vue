<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="toast"
        @click="removeNotification(notif.id)"
      >
        <span class="indicator" :class="notif.type"></span>
        <span class="message">{{ notif.message }}</span>
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
  top: 80px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  @include glass;
  color: var(--accent);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
  max-width: 320px;

  &:hover {
    background: var(--surface);
  }

  .indicator {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    flex-shrink: 0;

    &.success {
      background: var(--success);
      box-shadow: 0 0 8px var(--success);
    }
    &.warning {
      background: #f59e0b;
      box-shadow: 0 0 8px #f59e0b;
    }
    &.error {
      background: var(--error);
      box-shadow: 0 0 8px var(--error);
    }
    &.info {
      background: var(--accent);
      box-shadow: 0 0 8px var(--accent);
    }
  }

  .message {
    font-size: 0.9rem;
    line-height: 1.4;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
