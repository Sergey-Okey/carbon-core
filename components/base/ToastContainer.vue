<template>
  <div class="toast-container" ref="containerRef">
    <TransitionGroup name="toast">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="toast"
        :class="notif.type"
        @click="removeNotification(notif.id)"
        @pointerdown="startSwipe($event, notif.id)"
      >
        <span class="indicator"></span>
        <span class="message">{{ notif.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSwipe } from '@vueuse/core'
import { useNotification } from '~/composables/useNotification'

const { notifications, removeNotification } = useNotification()
const containerRef = ref<HTMLElement>()

function startSwipe(event: PointerEvent, id: string) {
  const target = event.currentTarget as HTMLElement
  if (!target) return

  const { isSwiping } = useSwipe(target, {
    threshold: 30,
    onSwipeEnd() {
      if (isSwiping.value) {
        removeNotification(id)
      }
    },
  })
}
</script>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;

  // Отступ сверху равен высоте хедера + отступы
  top: calc(80px + 16px);
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
  padding: 12px 18px;
  border-radius: var(--border-radius-lg);
  @include glass;
  border: 1px solid var(--border);
  color: var(--accent);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  cursor: grab;
  transition: all 0.2s ease;
  width: fit-content;
  backdrop-filter: blur(12px);
  touch-action: pan-y; // улучшает свайп

  &:active {
    cursor: grabbing;
  }

  &:hover {
    background: var(--surface);
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
    background: #f59e0b;
    box-shadow: 0 0 10px #f59e0b;
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
}

// Анимации
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
