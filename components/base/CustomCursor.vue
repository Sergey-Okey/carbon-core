<template>
  <Teleport to="body">
    <div ref="cursorRef" class="custom-cursor" aria-hidden="true">
      <svg viewBox="0 0 32 38" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5.6 4.8C4.35 3.95 2.8 5 3.1 6.45L7.65 31.9C7.95 33.55 10.1 33.9 10.95 32.45L16.95 23.2C17.55 22.3 18.5 21.8 19.6 21.75L27.65 21.6C29.35 21.55 29.9 19.35 28.5 18.4L5.6 4.8Z"
        />
      </svg>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const cursorRef = ref<HTMLElement | null>(null)

let hasPosition = false

function handleMouseMove(event: MouseEvent) {
  const cursor = cursorRef.value
  if (!cursor) return

  cursor.style.left = `${event.clientX}px`
  cursor.style.top = `${event.clientY}px`

  if (!hasPosition) {
    hasPosition = true
    cursor.classList.add('visible')
    document.documentElement.classList.add('custom-cursor-enabled')
  }
}

function handlePointerLeave() {
  cursorRef.value?.classList.remove('visible')
  hasPosition = false
}

onMounted(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  if (!finePointer.matches) return

  document.documentElement.classList.add('custom-cursor-enabled')
  document.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true })
  document.documentElement.addEventListener('mouseleave', handlePointerLeave)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove, { capture: true })
  document.documentElement.removeEventListener('mouseleave', handlePointerLeave)
  document.documentElement.classList.remove('custom-cursor-enabled')
})
</script>

<style scoped lang="scss">
.custom-cursor {
  position: fixed;
  inset-block-start: 0;
  inset-inline-start: 0;
  z-index: 2147483647;
  inline-size: 18px;
  block-size: 22px;
  border-radius: 30px;
  opacity: 0;
  pointer-events: none;
  translate: -2px -3px;
  will-change: left, top;
  transition: opacity var(--transition-standard);

  &.visible {
    opacity: 1;
  }

  svg {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    overflow: visible;
  }

  path {
    fill: var(--bg);
    stroke: var(--text);
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 3.4;
  }
}

@media (hover: hover) and (pointer: fine) {
  :global(html.custom-cursor-enabled),
  :global(html.custom-cursor-enabled *) {
    cursor: none !important;
  }
}
</style>
