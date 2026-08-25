<template>
  <Teleport v-if="launchReady" to="body">
    <div
      class="board-dock"
      :class="{
        'is-nav': uiStore.boardDock === 'nav',
        'is-swipe-hint': showSwipeHint,
      }"
    >
      <div
        class="board-dock__stage"
        :class="{ 'is-waiting': aiStore.pending }"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <slot />
      </div>
      <button
        type="button"
        class="board-dock__swap"
        :aria-label="swapLabel"
        :aria-pressed="uiStore.boardDock === 'nav'"
        @click="uiStore.toggleBoardDock()"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const uiStore = useUIStore()
const aiStore = useAiStore()
const { launchReady } = useLaunchGate()
const { onPointerDown, onPointerUp } = useBoardDockSwipe()
const showSwipeHint = ref(true)
let hintTimer = 0

const swapLabel = computed(() =>
  uiStore.boardDock === 'composer' ? 'Показать навигацию жестом вверх' : 'Показать ввод жестом вниз'
)

onMounted(() => {
  if (
    import.meta.client &&
    (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.classList.contains('no-animations'))
  ) {
    showSwipeHint.value = false
    return
  }
  hintTimer = window.setTimeout(() => {
    showSwipeHint.value = false
  }, 4200)
})

onUnmounted(() => {
  if (hintTimer) window.clearTimeout(hintTimer)
})
</script>

<style scoped lang="scss">
.board-dock {
  --board-island-width: min(
    calc(5 * var(--space-12) + 4 * var(--space-2) + 2 * var(--space-3)),
    calc(100dvw - 2 * var(--space-8))
  );
  --board-island-height: calc(var(--space-12) + 2 * var(--space-2));
  --board-dock-end: max(var(--space-3), env(safe-area-inset-bottom, 0px));
  @include keyboard-gap-fill;
  position: fixed;
  z-index: calc(var(--z-sticky) + 40);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  inset-inline-start: 50%;
  inset-inline-end: auto;
  inset-block-end: var(--board-dock-end);
  width: var(--board-island-width);
  overflow: visible;
  transform: translateX(-50%);
  animation: board-dock-in var(--duration-emphasized) var(--ease-emphasized) both;
  animation-delay: calc(var(--duration-normal) + var(--duration-fast));
}

.board-dock__stage {
  @include neon-wait-edge;
  min-width: 0;
  width: 100%;
  height: var(--board-island-height);
  min-height: var(--board-island-height);
  border-radius: var(--radius-full);
  transform: translateY(0) scale(1);
  transform-origin: 50% 100%;
  touch-action: pan-y;
  transition:
    opacity var(--duration-fast) var(--ease-emphasized),
    transform var(--duration-emphasized) var(--ease-emphasized);

  .board-dock.is-swipe-hint:not(.is-nav) & {
    animation: island-swipe-hint 2.2s var(--ease-emphasized) 1.05s both;
  }

  .board-dock.is-nav & {
    opacity: 0;
    pointer-events: none;
    animation: none;
    transform: translateY(calc(100% + var(--space-5))) scale(0.96);
  }
}

.board-dock.is-nav {
  pointer-events: none;
}

.board-dock__swap {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .board-dock {
    animation: none;
  }

  .board-dock__stage {
    animation: none;
    transition: none;
  }
}

@keyframes board-dock-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(var(--space-8));
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes island-swipe-hint {
  0%,
  18%,
  100% {
    transform: translateY(0) scale(1);
  }

  34% {
    transform: translateY(-12px) scale(1);
  }

  50% {
    transform: translateY(0) scale(1);
  }

  66% {
    transform: translateY(-8px) scale(1);
  }

  82% {
    transform: translateY(0) scale(1);
  }
}
</style>
