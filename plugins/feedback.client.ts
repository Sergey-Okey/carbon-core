import { useFeedback } from '~/composables/useFeedback'

const interactiveSelector = [
  'button:not(:disabled)',
  'a[href]',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="switch"]:not([aria-disabled="true"])',
  '[role="tab"]:not([aria-disabled="true"])',
].join(',')

export default defineNuxtPlugin(() => {
  const { trigger } = useFeedback()
  let lastTarget: Element | null = null
  let lastTriggeredAt = 0

  const handlePointerUp = (event: PointerEvent) => {
    const target = event.target instanceof Element ? event.target.closest(interactiveSelector) : null
    if (!target) return

    const now = performance.now()
    if (target === lastTarget && now - lastTriggeredAt < 120) return

    lastTarget = target
    lastTriggeredAt = now
    void trigger('selection')
  }

  document.addEventListener('pointerup', handlePointerUp, { passive: true })
})
