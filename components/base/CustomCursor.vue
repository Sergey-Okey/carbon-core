<template>
  <Teleport to="body">
    <div ref="cursorRef" class="custom-cursor" data-state="default" aria-hidden="true">
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
let isPressed = false

type CursorState = 'default' | 'pointer' | 'text' | 'grab' | 'grabbing' | 'precision' | 'disabled'

function getCursorState(target: EventTarget | null): CursorState {
  if (!(target instanceof Element)) return 'default'
  const interactive = target.closest(
    'button, a, summary, label, select, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [data-cursor]'
  )
  const disabled = target.closest(':disabled, [aria-disabled="true"]')
  const text = target.closest('input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]), textarea, [contenteditable="true"]')
  const computedCursor = getComputedStyle(target).cursor

  if (disabled || computedCursor === 'not-allowed') return 'disabled'
  if (isPressed && (computedCursor === 'grab' || computedCursor === 'grabbing')) return 'grabbing'
  if (computedCursor === 'grab' || computedCursor === 'grabbing') return 'grab'
  if (text || computedCursor === 'text' || computedCursor === 'vertical-text') return 'text'
  if (computedCursor === 'crosshair' || computedCursor === 'cell') return 'precision'
  if (interactive || computedCursor === 'pointer' || computedCursor === 'help') return 'pointer'
  return 'default'
}

// Direct coordinates keep the visual tip aligned with the browser hit target.
function handleMouseMove(event: MouseEvent) {
  const cursor = cursorRef.value
  if (!cursor) return

  cursor.style.left = `${event.clientX}px`
  cursor.style.top = `${event.clientY}px`
  cursor.dataset.state = getCursorState(event.target)

  if (!hasPosition) {
    hasPosition = true
    cursor.classList.add('visible')
    document.documentElement.classList.add('custom-cursor-enabled')
  }
}

function handleMouseDown(event: MouseEvent) {
  isPressed = true
  const cursor = cursorRef.value
  if (!cursor) return
  cursor.classList.add('pressed')
  cursor.dataset.state = getCursorState(event.target)
}

function handleMouseUp(event: MouseEvent) {
  isPressed = false
  const cursor = cursorRef.value
  if (!cursor) return
  cursor.classList.remove('pressed')
  cursor.dataset.state = getCursorState(event.target)
}

function handlePointerLeave() {
  cursorRef.value?.classList.remove('visible')
  hasPosition = false
}

function handleWindowBlur() {
  handlePointerLeave()
  isPressed = false
  cursorRef.value?.classList.remove('pressed')
}

onMounted(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  if (!finePointer.matches) return

  document.documentElement.classList.add('custom-cursor-enabled')
  document.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true })
  document.addEventListener('mousedown', handleMouseDown, { capture: true, passive: true })
  document.addEventListener('mouseup', handleMouseUp, { capture: true, passive: true })
  document.documentElement.addEventListener('mouseleave', handlePointerLeave)
  window.addEventListener('blur', handleWindowBlur)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove, { capture: true })
  document.removeEventListener('mousedown', handleMouseDown, { capture: true })
  document.removeEventListener('mouseup', handleMouseUp, { capture: true })
  document.documentElement.removeEventListener('mouseleave', handlePointerLeave)
  window.removeEventListener('blur', handleWindowBlur)
  document.documentElement.classList.remove('custom-cursor-enabled')
})
</script>

<style scoped lang="scss">
.custom-cursor {
  position: fixed;
  inset-block-start: 0;
  inset-inline-start: 0;
  z-index: 2147483647;
  inline-size: 15px;
  block-size: 18px;
  border-radius: 30px;
  opacity: 0;
  pointer-events: none;
  translate: -1px -2px;
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
    stroke-width: 2.4;
    transition:
      fill var(--transition-standard),
      stroke var(--transition-standard),
      opacity var(--transition-standard),
      transform var(--transition-standard);
    transform-origin: 8px 7px;
  }

  &::before,
  &::after {
    position: absolute;
    pointer-events: none;
    content: '';
  }

  &[data-state='pointer'] path {
    fill: var(--accent);
    stroke: var(--bg);
    transform: scale(0.9);
  }

  &[data-state='text'] {
    inline-size: 10px;
    block-size: 20px;
    translate: -5px -10px;

    path {
      opacity: 0;
    }

    &::before {
      inset-block: 2px;
      inset-inline-start: 4px;
      inline-size: 1.5px;
      border-radius: var(--border-radius-pill);
      background: var(--text);
      box-shadow:
        -3px 0 0 -1px var(--text),
        3px 0 0 -1px var(--text);
    }
  }

  &[data-state='grab'],
  &[data-state='grabbing'] {
    inline-size: 13px;
    block-size: 13px;
    border: 1.5px solid var(--text);
    border-radius: 50%;
    background: var(--bg);
    translate: -6.5px -6.5px;

    path {
      opacity: 0;
    }
  }

  &[data-state='grabbing'],
  &.pressed[data-state='pointer'] {
    scale: 0.82;
  }

  &[data-state='precision'] {
    inline-size: 15px;
    block-size: 15px;
    border: 1px solid var(--text);
    border-radius: 50%;
    translate: -7.5px -7.5px;

    path {
      opacity: 0;
    }

    &::before {
      inset: 6px;
      border-radius: 50%;
      background: var(--text);
    }
  }

  &[data-state='disabled'] {
    inline-size: 15px;
    block-size: 15px;
    border: 1.5px solid var(--error);
    border-radius: 50%;
    translate: -7.5px -7.5px;

    path {
      opacity: 0;
    }

    &::after {
      inset-block-start: 6px;
      inset-inline-start: 1px;
      inline-size: 10px;
      block-size: 1.5px;
      border-radius: var(--border-radius-pill);
      background: var(--error);
      rotate: -45deg;
    }
  }
}

@media (hover: hover) and (pointer: fine) {
  :global(html.custom-cursor-enabled),
  :global(html.custom-cursor-enabled *) {
    cursor: none !important;
  }
}
</style>
