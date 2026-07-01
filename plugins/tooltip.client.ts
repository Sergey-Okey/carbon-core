type TooltipTarget = HTMLElement & {
  dataset: DOMStringMap & {
    tooltip?: string
    tooltipPosition?: string
    nativeTitle?: string
  }
}

let tooltipEl: HTMLDivElement | null = null
let activeTarget: TooltipTarget | null = null
let hideTimer: number | null = null

function ensureTooltip() {
  if (tooltipEl) return tooltipEl

  tooltipEl = document.createElement('div')
  tooltipEl.className = 'app-tooltip'
  tooltipEl.setAttribute('role', 'tooltip')
  document.body.appendChild(tooltipEl)
  return tooltipEl
}

function getTooltipTarget(target: EventTarget | null): TooltipTarget | null {
  if (!(target instanceof Element)) return null
  return target.closest<HTMLElement>(
    '[data-tooltip], [title]'
  ) as TooltipTarget | null
}

function getTooltipText(target: TooltipTarget) {
  const title = target.getAttribute('title')
  if (title) {
    target.dataset.nativeTitle = title
    target.removeAttribute('title')
  }

  return target.dataset.tooltip || target.dataset.nativeTitle || ''
}

function placeTooltip(target: TooltipTarget, tooltip: HTMLDivElement) {
  const rect = target.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  const gap = 10
  const margin = 10
  const position = target.dataset.tooltipPosition || 'top'

  let left = rect.left + rect.width / 2 - tooltipRect.width / 2
  let top = rect.top - tooltipRect.height - gap

  if (position === 'bottom') {
    top = rect.bottom + gap
  } else if (position === 'right') {
    left = rect.right + gap
    top = rect.top + rect.height / 2 - tooltipRect.height / 2
  } else if (position === 'left') {
    left = rect.left - tooltipRect.width - gap
    top = rect.top + rect.height / 2 - tooltipRect.height / 2
  }

  left = Math.min(
    Math.max(margin, left),
    window.innerWidth - tooltipRect.width - margin
  )
  top = Math.min(
    Math.max(margin, top),
    window.innerHeight - tooltipRect.height - margin
  )

  tooltip.style.left = `${left}px`
  tooltip.style.top = `${top}px`
}

function showTooltip(target: TooltipTarget) {
  const text = getTooltipText(target).trim()
  if (!text) return

  if (hideTimer) {
    window.clearTimeout(hideTimer)
    hideTimer = null
  }

  activeTarget = target
  const tooltip = ensureTooltip()
  tooltip.textContent = text
  tooltip.style.display = 'block'
  tooltip.classList.remove('is-visible')
  requestAnimationFrame(() => {
    placeTooltip(target, tooltip)
    tooltip.classList.add('is-visible')
  })
}

function hideTooltip() {
  if (!tooltipEl) return

  tooltipEl.classList.remove('is-visible')
  tooltipEl.style.display = 'none'
  activeTarget = null
}

function restoreNativeTitle(target: TooltipTarget | null) {
  if (!target?.dataset.nativeTitle) return
  target.setAttribute('title', target.dataset.nativeTitle)
  delete target.dataset.nativeTitle
}

export default defineNuxtPlugin(() => {
  document.addEventListener(
    'pointerover',
    (event) => {
      const target = getTooltipTarget(event.target)
      if (target) showTooltip(target)
    },
    true
  )

  document.addEventListener(
    'pointerout',
    (event) => {
      const target = getTooltipTarget(event.target)
      if (!target) return
      if (
        event.relatedTarget instanceof Node &&
        target.contains(event.relatedTarget)
      )
        return
      restoreNativeTitle(target)
      hideTimer = window.setTimeout(hideTooltip, 80)
    },
    true
  )

  document.addEventListener(
    'focusin',
    (event) => {
      const target = getTooltipTarget(event.target)
      if (target) showTooltip(target)
    },
    true
  )

  document.addEventListener(
    'focusout',
    (event) => {
      const target = getTooltipTarget(event.target)
      restoreNativeTitle(target)
      hideTooltip()
    },
    true
  )

  window.addEventListener('scroll', () => activeTarget && hideTooltip(), true)
  window.addEventListener('resize', () => activeTarget && hideTooltip())
  document.addEventListener('pointerdown', () => hideTooltip())
})
