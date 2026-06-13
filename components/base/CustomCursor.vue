<template>
  <Teleport to="body">
    <div ref="cursorRef" class="custom-cursor" aria-hidden="true">
      <div ref="visualRef" class="cursor-visual" data-state="default">
        <svg viewBox="0 0 32 38" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5.6 4.8C4.35 3.95 2.8 5 3.1 6.45L7.65 31.9C7.95 33.55 10.1 33.9 10.95 32.45L16.95 23.2C17.55 22.3 18.5 21.8 19.6 21.75L27.65 21.6C29.35 21.55 29.9 19.35 28.5 18.4L5.6 4.8Z"
          />
        </svg>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const cursorRef = ref<HTMLElement | null>(null)
const visualRef = ref<HTMLElement | null>(null)

type CursorState = 'default' | 'pointer' | 'text' | 'grab' | 'grabbing' | 'precision' | 'disabled'
const validStates = new Set<CursorState>([
  'default',
  'pointer',
  'text',
  'grab',
  'grabbing',
  'precision',
  'disabled',
])

let x = 0
let y = 0
let pressed = false
let pressedState: CursorState | null = null

function elementAtPointer() {
  return document.elementFromPoint(x, y)
}

function stateFor(element: Element | null): CursorState {
  if (pressedState) return pressedState === 'grab' ? 'grabbing' : pressedState
  if (!element) return 'default'

  const explicit = element.closest<HTMLElement>('[data-cursor]')?.dataset.cursor as CursorState
  if (validStates.has(explicit)) return pressed && explicit === 'grab' ? 'grabbing' : explicit
  if (element.closest(':disabled, [aria-disabled="true"]')) return 'disabled'
  if (element.closest('textarea, [contenteditable="true"], input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"])')) return 'text'
  if (element.closest('.vue-flow__handle, .palette-wheel')) return 'precision'
  if (element.closest('button, a, summary, label, select, [role="button"], [role="link"], [role="tab"], [role="menuitem"]')) return 'pointer'
  if (element.closest('.vue-flow__node, .vue-flow__pane')) return pressed ? 'grabbing' : 'grab'
  return 'default'
}

function render() {
  const cursor = cursorRef.value
  const visual = visualRef.value
  if (!cursor || !visual) return
  cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
  visual.dataset.state = stateFor(elementAtPointer())
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  x = event.clientX
  y = event.clientY
  cursorRef.value?.classList.add('visible')
  render()
}

function onPointerDown(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  x = event.clientX
  y = event.clientY
  pressedState = stateFor(elementAtPointer())
  pressed = true
  visualRef.value?.classList.add('pressed')
  render()
}

function releasePointer(event?: PointerEvent) {
  if (event?.pointerType && event.pointerType !== 'mouse') return
  if (event) {
    x = event.clientX
    y = event.clientY
  }
  pressed = false
  pressedState = null
  visualRef.value?.classList.remove('pressed')
  render()
}

function releaseDrag() {
  releasePointer()
}

function hideCursor() {
  pressed = false
  pressedState = null
  cursorRef.value?.classList.remove('visible')
  visualRef.value?.classList.remove('pressed')
}

function releaseWithoutMoving() {
  releasePointer()
}

onMounted(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  document.documentElement.classList.add('custom-cursor-enabled')
  document.addEventListener('pointermove', onPointerMove, { capture: true, passive: true })
  document.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true })
  document.addEventListener('pointerup', releasePointer, { capture: true, passive: true })
  document.addEventListener('pointercancel', releasePointer, { capture: true, passive: true })
  document.addEventListener('scroll', render, { capture: true, passive: true })
  document.addEventListener('contextmenu', releaseWithoutMoving, { capture: true })
  document.documentElement.addEventListener('mouseleave', hideCursor)
  window.addEventListener('blur', releaseWithoutMoving)
  window.addEventListener('dragend', releaseDrag)
})

onUnmounted(() => {
  document.removeEventListener('pointermove', onPointerMove, { capture: true })
  document.removeEventListener('pointerdown', onPointerDown, { capture: true })
  document.removeEventListener('pointerup', releasePointer, { capture: true })
  document.removeEventListener('pointercancel', releasePointer, { capture: true })
  document.removeEventListener('scroll', render, { capture: true })
  document.removeEventListener('contextmenu', releaseWithoutMoving, { capture: true })
  document.documentElement.removeEventListener('mouseleave', hideCursor)
  window.removeEventListener('blur', releaseWithoutMoving)
  window.removeEventListener('dragend', releaseDrag)
  document.documentElement.classList.remove('custom-cursor-enabled')
})
</script>

<style scoped lang="scss">
.custom-cursor {
  position: fixed;
  inset-block-start: 0;
  inset-inline-start: 0;
  z-index: 2147483647;
  inline-size: 1px;
  block-size: 1px;
  opacity: 0;
  pointer-events: none;
  will-change: transform;
  transition: opacity 0.12s ease;

  &.visible {
    opacity: 1;
  }
}

.cursor-visual {
  position: absolute;
  inset-block-start: -2px;
  inset-inline-start: -1px;
  inline-size: 15px;
  block-size: 18px;
  border-radius: 30px;
  transform-origin: 1px 2px;
  transition:
    opacity 0.12s ease,
    transform 0.12s ease,
    inline-size 0.12s ease,
    block-size 0.12s ease;

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
    transform: translate(-5px, -10px);

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
    transform: translate(-6.5px, -6.5px);

    path {
      opacity: 0;
    }
  }

  &[data-state='grabbing'],
  &.pressed[data-state='pointer'] {
    transform: scale(0.82);
  }

  &.pressed[data-state='grab'],
  &[data-state='grabbing'] {
    transform: translate(-6.5px, -6.5px) scale(0.82);
  }

  &[data-state='precision'] {
    inline-size: 15px;
    block-size: 15px;
    border: 1px solid var(--text);
    border-radius: 50%;
    transform: translate(-7.5px, -7.5px);

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
    transform: translate(-7.5px, -7.5px);

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
