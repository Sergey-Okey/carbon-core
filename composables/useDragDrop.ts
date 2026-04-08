import { ref, onUnmounted } from 'vue'

export function useDragDrop(
  onDrag: (dx: number, dy: number) => void,
  onDragStart?: () => void,
  onDragEnd?: () => void
) {
  const isDragging = ref(false)
  let lastX = 0
  let lastY = 0

  function handlePointerDown(e: PointerEvent) {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    lastX = e.clientX
    lastY = e.clientY
    isDragging.value = true
    onDragStart?.()

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging.value) return
    e.preventDefault()
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY
    onDrag(dx, dy)
  }

  function handlePointerUp() {
    if (isDragging.value) {
      isDragging.value = false
      onDragEnd?.()
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }

  onUnmounted(() => {
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  })

  return { isDragging, handlePointerDown }
}
