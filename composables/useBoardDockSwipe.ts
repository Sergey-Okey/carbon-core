export function useBoardDockSwipe() {
  const uiStore = useUIStore()
  const startX = ref(0)
  const startY = ref(0)
  const tracking = ref(false)
  const didSwipe = ref(false)

  function onPointerDown(event: PointerEvent) {
    tracking.value = true
    didSwipe.value = false
    startX.value = event.clientX
    startY.value = event.clientY
    const target = event.target as HTMLElement | null
    if (target?.closest('input, textarea, select')) return
    try {
      ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
    } catch {
      /* Safari can throw if capture is unsupported */
    }
  }

  function onPointerUp(event: PointerEvent) {
    if (!tracking.value) return
    tracking.value = false
    const dy = startY.value - event.clientY
    const dx = event.clientX - startX.value
    if (Math.abs(dy) < 28 || Math.abs(dy) <= Math.abs(dx) * 1.2) return
    didSwipe.value = true
    if (dy > 0) uiStore.setBoardDock('nav')
    else uiStore.setBoardDock('composer')
  }

  function consumeSwipe() {
    if (!didSwipe.value) return false
    didSwipe.value = false
    return true
  }

  return { onPointerDown, onPointerUp, consumeSwipe }
}
