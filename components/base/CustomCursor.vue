<template>
  <Teleport to="body">
    <div
      ref="cursorRef"
      class="custom-cursor"
      aria-hidden="true"
      :class="{ visible: isVisible }"
    >
      <div
        class="cursor-visual"
        :class="{ pressed }"
        :data-state="cursorState"
      >
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
type CursorState =
  | 'default'
  | 'pointer'
  | 'text'
  | 'grab'
  | 'grabbing'
  | 'precision'
  | 'disabled'

const validStates = new Set<CursorState>([
  'default',
  'pointer',
  'text',
  'grab',
  'grabbing',
  'precision',
  'disabled',
])

const cursorRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const pressed = ref(false)
const cursorState = ref<CursorState>('default')

let x = 0
let y = 0
let pressedState: CursorState | null = null
let hoverEl: Element | null = null
let rafId = 0
let active = false

let scrollbarSession: {
  el: HTMLElement
  axis: 'x' | 'y'
  isViewport: boolean
} | null = null
let thumbRafId = 0
let mediaQuery: MediaQueryList | null = null

function finePointerOk() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function setEnabledClass(on: boolean) {
  document.documentElement.classList.toggle('custom-cursor-enabled', on)
}

function isScrollableY(node: HTMLElement) {
  const oy = getComputedStyle(node).overflowY
  return (
    node.scrollHeight > node.clientHeight + 1 &&
    (oy === 'auto' || oy === 'scroll' || oy === 'overlay')
  )
}

function isScrollableX(node: HTMLElement) {
  const ox = getComputedStyle(node).overflowX
  return (
    node.scrollWidth > node.clientWidth + 1 &&
    (ox === 'auto' || ox === 'scroll' || ox === 'overlay')
  )
}

function resolveScrollbarSession(
  event: PointerEvent | MouseEvent
): { el: HTMLElement; axis: 'x' | 'y'; isViewport: boolean } | null {
  const doc = document.documentElement
  const viewportY =
    doc.scrollHeight > window.innerHeight &&
    event.clientX >= doc.clientWidth
  const viewportX =
    doc.scrollWidth > window.innerWidth &&
    event.clientY >= doc.clientHeight

  if (viewportY) {
    return { el: doc, axis: 'y', isViewport: true }
  }
  if (viewportX) {
    return { el: doc, axis: 'x', isViewport: true }
  }

  let node: HTMLElement | null =
    event.target instanceof HTMLElement ? event.target : null

  while (node) {
    const rect = node.getBoundingClientRect()
    const localX = event.clientX - rect.left
    const localY = event.clientY - rect.top
    const scrollY = isScrollableY(node)
    const scrollX = isScrollableX(node)

    if (scrollY && localX >= node.clientWidth) {
      return { el: node, axis: 'y', isViewport: false }
    }
    if (scrollX && localY >= node.clientHeight) {
      return { el: node, axis: 'x', isViewport: false }
    }


    if (
      node === event.target &&
      (event.offsetX >= node.clientWidth || event.offsetY >= node.clientHeight)
    ) {
      if (scrollY && event.offsetX >= node.clientWidth) {
        return { el: node, axis: 'y', isViewport: false }
      }
      if (scrollX && event.offsetY >= node.clientHeight) {
        return { el: node, axis: 'x', isViewport: false }
      }
    }

    node = node.parentElement
  }

  return null
}


function thumbCenter(
  el: HTMLElement,
  axis: 'x' | 'y',
  isViewport: boolean
): { x: number; y: number } {
  if (isViewport) {
    if (axis === 'y') {
      const clientH = document.documentElement.clientHeight
      const scrollH = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const maxScroll = Math.max(1, scrollH - clientH)
      const track = clientH
      const thumb = Math.max(24, (clientH / scrollH) * track)
      const travel = Math.max(0, track - thumb)
      const sb = Math.max(8, window.innerWidth - document.documentElement.clientWidth)
      return {
        x: document.documentElement.clientWidth + sb / 2,
        y: (scrollTop / maxScroll) * travel + thumb / 2,
      }
    }
    const clientW = document.documentElement.clientWidth
    const scrollW = document.documentElement.scrollWidth
    const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft
    const maxScroll = Math.max(1, scrollW - clientW)
    const track = clientW
    const thumb = Math.max(24, (clientW / scrollW) * track)
    const travel = Math.max(0, track - thumb)
    const sb = Math.max(8, window.innerHeight - document.documentElement.clientHeight)
    return {
      x: (scrollLeft / maxScroll) * travel + thumb / 2,
      y: document.documentElement.clientHeight + sb / 2,
    }
  }

  const rect = el.getBoundingClientRect()
  if (axis === 'y') {
    const maxScroll = Math.max(1, el.scrollHeight - el.clientHeight)
    const track = el.clientHeight
    const thumb = Math.max(24, (el.clientHeight / el.scrollHeight) * track)
    const travel = Math.max(0, track - thumb)
    const sb = Math.max(8, el.offsetWidth - el.clientWidth)
    return {
      x: rect.left + el.clientWidth + sb / 2,
      y: rect.top + (el.scrollTop / maxScroll) * travel + thumb / 2,
    }
  }

  const maxScroll = Math.max(1, el.scrollWidth - el.clientWidth)
  const track = el.clientWidth
  const thumb = Math.max(24, (el.clientWidth / el.scrollWidth) * track)
  const travel = Math.max(0, track - thumb)
  const sb = Math.max(8, el.offsetHeight - el.clientHeight)
  return {
    x: rect.left + (el.scrollLeft / maxScroll) * travel + thumb / 2,
    y: rect.top + el.clientHeight + sb / 2,
  }
}

function syncCursorToThumb() {
  if (!scrollbarSession || !active) return
  const point = thumbCenter(
    scrollbarSession.el,
    scrollbarSession.axis,
    scrollbarSession.isViewport
  )
  x = point.x
  y = point.y
  isVisible.value = true
  scheduleRender()
}

function startThumbLoop() {
  stopThumbLoop()
  const tick = () => {
    if (!scrollbarSession) {
      thumbRafId = 0
      return
    }
    syncCursorToThumb()
    thumbRafId = window.requestAnimationFrame(tick)
  }
  thumbRafId = window.requestAnimationFrame(tick)
}

function stopThumbLoop() {
  if (thumbRafId) {
    window.cancelAnimationFrame(thumbRafId)
    thumbRafId = 0
  }
}

function stateFor(element: Element | null): CursorState {
  if (scrollbarSession) return 'grabbing'
  if (pressedState) return pressedState === 'grab' ? 'grabbing' : pressedState
  if (!element) return 'default'

  const explicit = element.closest<HTMLElement>('[data-cursor]')?.dataset
    .cursor as CursorState | undefined
  if (explicit && validStates.has(explicit)) {
    return pressed.value && explicit === 'grab' ? 'grabbing' : explicit
  }
  if (element.closest(':disabled, [aria-disabled="true"]')) return 'disabled'
  if (
    element.closest(
      'textarea, [contenteditable="true"], input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"])'
    )
  ) {
    return 'text'
  }
  if (element.closest('.vue-flow__handle, .palette-wheel')) return 'precision'
  if (
    element.closest(
      'button, a, summary, label, select, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="option"], [role="switch"]'
    )
  ) {
    return 'pointer'
  }
  if (element.closest('.vue-flow__node, .vue-flow__pane')) {
    return pressed.value ? 'grabbing' : 'grab'
  }
  return 'default'
}

function render() {
  if (!active) return
  const cursor = cursorRef.value
  if (!cursor) return

  cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`

  if (scrollbarSession) {
    cursorState.value = 'grabbing'
    return
  }

  const el =
    hoverEl && document.contains(hoverEl)
      ? hoverEl
      : document.elementFromPoint(x, y)
  cursorState.value = stateFor(el)
}

function scheduleRender() {
  if (rafId) return
  rafId = window.requestAnimationFrame(() => {
    rafId = 0
    render()
  })
}

function showAt(clientX: number, clientY: number, target?: EventTarget | null) {
  if (!active) return

  if (scrollbarSession) return
  x = clientX
  y = clientY
  if (target instanceof Element) hoverEl = target
  isVisible.value = true
  scheduleRender()
}

function onPointerMove(event: PointerEvent) {
  if (!active || event.pointerType !== 'mouse') return
  showAt(event.clientX, event.clientY, event.target)
}

function onMouseMove(event: MouseEvent) {
  if (!active) return
  showAt(event.clientX, event.clientY, event.target)
}

function onPointerDown(event: PointerEvent) {
  if (!active || event.pointerType !== 'mouse') return

  const session = resolveScrollbarSession(event)
  if (session) {
    scrollbarSession = session
    pressed.value = true
    pressedState = 'grab'

    x = event.clientX
    y = event.clientY
    isVisible.value = true
    scheduleRender()
    startThumbLoop()
    return
  }

  showAt(event.clientX, event.clientY, event.target)
  pressedState = stateFor(
    event.target instanceof Element ? event.target : document.elementFromPoint(x, y)
  )
  pressed.value = true
  scheduleRender()
}

function endScrollbarSession() {
  scrollbarSession = null
  stopThumbLoop()
}

function onPointerUp(event?: PointerEvent | MouseEvent) {
  if (event && 'pointerType' in event && event.pointerType && event.pointerType !== 'mouse') {
    return
  }

  const wasScrollbar = !!scrollbarSession
  endScrollbarSession()
  pressed.value = false
  pressedState = null

  if (!active) return
  if (event && !wasScrollbar) {
    showAt(event.clientX, event.clientY, event.target)
  } else if (event && wasScrollbar) {

    x = event.clientX
    y = event.clientY
    isVisible.value = true
    scheduleRender()
  } else {
    scheduleRender()
  }
}

function onScroll() {
  if (!active) return
  if (scrollbarSession) {
    syncCursorToThumb()
    return
  }
  hoverEl = document.elementFromPoint(x, y)
  scheduleRender()
}

function hideCursor() {
  if (scrollbarSession) return
  pressed.value = false
  pressedState = null
  isVisible.value = false
}

function onBlur() {
  endScrollbarSession()
  pressed.value = false
  pressedState = null
  isVisible.value = false
}

function attach() {
  if (active) return
  active = true
  setEnabledClass(true)

  document.addEventListener('pointermove', onPointerMove, {
    capture: true,
    passive: true,
  })
  document.addEventListener('mousemove', onMouseMove, {
    capture: true,
    passive: true,
  })
  document.addEventListener('pointerdown', onPointerDown, {
    capture: true,
    passive: true,
  })
  document.addEventListener('pointerup', onPointerUp, {
    capture: true,
    passive: true,
  })
  document.addEventListener('pointercancel', onPointerUp, {
    capture: true,
    passive: true,
  })
  document.addEventListener('mouseup', onPointerUp, {
    capture: true,
    passive: true,
  })
  document.addEventListener('scroll', onScroll, { capture: true, passive: true })
  document.addEventListener('contextmenu', onPointerUp, { capture: true })
  document.documentElement.addEventListener('mouseleave', hideCursor)
  window.addEventListener('blur', onBlur)
  window.addEventListener('dragend', onPointerUp as EventListener)
}

function detach() {
  active = false
  endScrollbarSession()
  pressed.value = false
  pressedState = null
  isVisible.value = false
  setEnabledClass(false)

  document.removeEventListener('pointermove', onPointerMove, { capture: true })
  document.removeEventListener('mousemove', onMouseMove, { capture: true })
  document.removeEventListener('pointerdown', onPointerDown, { capture: true })
  document.removeEventListener('pointerup', onPointerUp, { capture: true })
  document.removeEventListener('pointercancel', onPointerUp, { capture: true })
  document.removeEventListener('mouseup', onPointerUp, { capture: true })
  document.removeEventListener('scroll', onScroll, { capture: true })
  document.removeEventListener('contextmenu', onPointerUp, { capture: true })
  document.documentElement.removeEventListener('mouseleave', hideCursor)
  window.removeEventListener('blur', onBlur)
  window.removeEventListener('dragend', onPointerUp as EventListener)

  if (rafId) {
    window.cancelAnimationFrame(rafId)
    rafId = 0
  }
}

function syncEnabled() {
  if (finePointerOk()) attach()
  else detach()
}

onMounted(() => {
  mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
  mediaQuery.addEventListener('change', syncEnabled)
  syncEnabled()
})

onUnmounted(() => {
  mediaQuery?.removeEventListener('change', syncEnabled)
  detach()
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
  will-change: transform, opacity;
  transition: opacity 0.12s ease;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.2));
  backface-visibility: hidden;

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
  transform-origin: 8px 7px;
  transition:
    opacity 0.12s ease,
    transform 0.12s ease,
    inline-size 0.12s ease,
    block-size 0.12s ease;
  backface-visibility: hidden;

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

  &[data-state='grab'] {
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

  &[data-state='grabbing'] {
    inline-size: 13px;
    block-size: 13px;
    border: 1.5px solid var(--text);
    border-radius: 50%;
    background: var(--bg);
    transform: translate(-6.5px, -6.5px) scale(0.82);

    path {
      opacity: 0;
    }
  }

  &.pressed[data-state='pointer'] {
    transform: scale(0.82);
  }

  &.pressed[data-state='grab'] {
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

@media (prefers-reduced-motion: reduce) {
  .custom-cursor,
  .cursor-visual,
  .cursor-visual path {
    transition: none !important;
  }
}
</style>
