<template>
  <Teleport to="body">
    <div v-if="tour.isActive" class="guided-tour" aria-live="polite">
      <div
        v-if="targetRect && !tour.isFinishStep"
        class="guided-tour__spot"
        :style="spotStyle"
      />

      <article
        ref="cardRef"
        class="guided-tour__card"
        :class="[
          `is-${cardPlacement}`,
          {
            'is-centered': !targetRect || tour.isFinishStep,
            'is-missing': isTargetMissing,
          },
        ]"
        :style="cardStyle"
      >
        <div class="guided-tour__head">
          <span class="guided-tour__step">{{ currentNumber }} / {{ totalSteps }}</span>
          <button
            type="button"
            class="guided-tour__close"
            aria-label="Закрыть обучение"
            @click="tour.pause"
          >
            <X :size="14" />
          </button>
        </div>

        <h3>{{ tour.currentStep.title }}</h3>
        <p>{{ visibleText }}</p>
        <div v-if="tour.hasProgress" class="guided-tour__progress">
          <span>{{ tour.currentProgress }} / {{ tour.currentRequired }}</span>
          <div>
            <i
              :style="{ width: `${Math.min(100, (tour.currentProgress / tour.currentRequired) * 100)}%` }"
            />
          </div>
        </div>
        <p v-if="tour.currentStep.hint && !isTargetMissing" class="guided-tour__hint">
          {{ tour.currentStep.hint }}
        </p>

        <div class="guided-tour__actions">
          <button
            type="button"
            class="guided-tour__ghost"
            :disabled="!tour.canGoBack"
            @click="tour.back"
          >
            Назад
          </button>
          <button
            v-if="targetRect && !tour.isFinishStep"
            type="button"
            class="guided-tour__ghost"
            @click="focusTarget"
          >
            Показать
          </button>
          <button
            v-if="tour.currentStep.optional"
            type="button"
            class="guided-tour__primary"
            @click="tour.next"
          >
            Далее
          </button>
          <button
            v-if="tour.isFinishStep"
            type="button"
            class="guided-tour__primary"
            @click="tour.finish"
          >
            Завершить
          </button>
        </div>
      </article>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

const tour = useGuidedTourStore()
const cardRef = ref<HTMLElement | null>(null)
const targetRect = ref<DOMRect | null>(null)
const isMobile = ref(false)
const isTargetMissing = ref(false)
const cardPlacement = ref<'top' | 'right' | 'bottom' | 'left' | 'center'>('right')
const cardSize = ref({ width: 330, height: 240 })
const viewportSize = ref({ width: 0, height: 0 })
let activeTarget: HTMLElement | null = null
let frameId: number | null = null
let stepChangeUpdate = false
let cardResizeObserver: ResizeObserver | null = null

const currentNumber = computed(() =>
  Math.min(tour.currentStepIndex + 1, tour.steps.length)
)
const totalSteps = computed(() => tour.steps.length)
const visibleText = computed(() =>
  isTargetMissing.value
    ? tour.currentStep.recoveryText || 'Похоже, нужный элемент сейчас закрыт. Вернитесь на шаг назад или откройте его снова.'
    : tour.currentStep.text
)

const spotStyle = computed(() => {
  if (!targetRect.value) return {}

  return {
    width: `${targetRect.value.width + 12}px`,
    height: `${targetRect.value.height + 12}px`,
    transform: `translate(${targetRect.value.left - 6}px, ${targetRect.value.top - 6}px)`,
  }
})

const cardStyle = computed(() => {
  if (!targetRect.value || tour.isFinishStep || isTargetMissing.value) return {}

  const edge = isMobile.value ? 10 : 12
  const gap = isMobile.value ? 12 : 14
  const safeTop = edge
  const safeBottom = isMobile.value ? 86 : edge
  const viewportWidth = viewportSize.value.width || window.innerWidth
  const viewportHeight = viewportSize.value.height || window.innerHeight
  const width = isMobile.value
    ? Math.min(cardSize.value.width, viewportWidth - edge * 2)
    : cardSize.value.width
  const height = Math.min(cardSize.value.height, viewportHeight - safeTop - safeBottom)
  const rect = targetRect.value
  const spaces = {
    right: viewportWidth - edge - rect.right - gap,
    left: rect.left - edge - gap,
    bottom: viewportHeight - safeBottom - rect.bottom - gap,
    top: rect.top - safeTop - gap,
  }
  const options = [
    {
      placement: 'right' as const,
      left: rect.right + gap,
      top: rect.top + rect.height / 2 - height / 2,
      available: spaces.right,
      needed: width,
    },
    {
      placement: 'left' as const,
      left: rect.left - width - gap,
      top: rect.top + rect.height / 2 - height / 2,
      available: spaces.left,
      needed: width,
    },
    {
      placement: 'bottom' as const,
      left: rect.left + rect.width / 2 - width / 2,
      top: rect.bottom + gap,
      available: spaces.bottom,
      needed: height,
    },
    {
      placement: 'top' as const,
      left: rect.left + rect.width / 2 - width / 2,
      top: rect.top - height - gap,
      available: spaces.top,
      needed: height,
    },
  ]
  const fitting = options
    .filter((option) => option.available >= option.needed)
    .sort((a, b) => b.available - a.available)
  const best =
    fitting[0] ||
    [...options].sort(
      (a, b) => b.available / Math.max(1, b.needed) - a.available / Math.max(1, a.needed)
    )[0]
  cardPlacement.value = best.placement

  return {
    width: `${width}px`,
    maxHeight: `${Math.max(180, viewportHeight - safeTop - safeBottom)}px`,
    transform: `translate(${clamp(best.left, edge, viewportWidth - width - edge)}px, ${clamp(best.top, safeTop, viewportHeight - height - safeBottom)}px)`,
  }
})

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function clearTargetClass() {
  if (!activeTarget) return
  activeTarget.classList.remove('tour-target-active')
  activeTarget = null
}

function findTarget() {
  if (!tour.currentStep.target) return null

  return (
    Array.from(
      document.querySelectorAll<HTMLElement>(`[data-tour="${tour.currentStep.target}"]`)
    ).find((element) => {
      const rect = element.getBoundingClientRect()
      const style = window.getComputedStyle(element)
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden'
      )
    }) || null
  )
}

function focusTarget() {
  const target = findTarget()
  if (!target) {
    isTargetMissing.value = true
    return
  }

  target.scrollIntoView({
    block: isMobile.value ? 'center' : 'nearest',
    inline: 'center',
    behavior: 'smooth',
  })
  window.setTimeout(scheduleUpdate, 260)
}

function updateTarget() {
  if (!import.meta.client || !tour.isActive) return

  clearTargetClass()
  isMobile.value = window.innerWidth < 768
  viewportSize.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  const target = findTarget()

  if (!target || tour.isFinishStep) {
    isTargetMissing.value = !!tour.currentStep.target && !tour.isFinishStep
    targetRect.value = null
    cardPlacement.value = 'center'
    return
  }

  isTargetMissing.value = false
  activeTarget = target
  activeTarget.classList.add('tour-target-active')
  const rect = target.getBoundingClientRect()

  if (stepChangeUpdate) {
    stepChangeUpdate = false
    focusTarget()
  }

  targetRect.value = rect
  nextTick(measureCard)
}

function measureCard() {
  const card = cardRef.value
  if (!card) return
  const rect = card.getBoundingClientRect()
  const nextSize = {
    width: isMobile.value ? Math.min(360, window.innerWidth - 20) : rect.width,
    height: rect.height,
  }
  if (
    Math.abs(nextSize.width - cardSize.value.width) > 1 ||
    Math.abs(nextSize.height - cardSize.value.height) > 1
  ) {
    cardSize.value = nextSize
  }
}

function scheduleUpdate() {
  if (frameId) window.cancelAnimationFrame(frameId)
  frameId = window.requestAnimationFrame(updateTarget)
}

watch(
  () => [tour.isActive, tour.currentStepIndex, tour.currentProgress],
  async () => {
    stepChangeUpdate = true
    await nextTick()
    scheduleUpdate()
  }
)

watch(cardRef, (card, previousCard) => {
  if (previousCard) cardResizeObserver?.unobserve(previousCard)
  if (card) {
    cardResizeObserver?.observe(card)
    nextTick(measureCard)
  }
})

onMounted(() => {
  tour.hydrate()
  stepChangeUpdate = true
  nextTick(scheduleUpdate)
  cardResizeObserver = new ResizeObserver(measureCard)
  if (cardRef.value) cardResizeObserver.observe(cardRef.value)
  window.addEventListener('resize', scheduleUpdate)
  window.addEventListener('scroll', scheduleUpdate, true)
})

onBeforeUnmount(() => {
  clearTargetClass()
  if (frameId) window.cancelAnimationFrame(frameId)
  cardResizeObserver?.disconnect()
  window.removeEventListener('resize', scheduleUpdate)
  window.removeEventListener('scroll', scheduleUpdate, true)
})
</script>

<style scoped lang="scss">
.guided-tour {
  position: fixed;
  inset: 0;
  z-index: 6000;
  pointer-events: none;
}

.guided-tour__spot {
  position: fixed;
  top: 0;
  left: 0;
  border-radius: var(--border-radius-lg);
  border: var(--ui-border);
  border-color: color-mix(in srgb, var(--accent) 72%, transparent);
  box-shadow:
    0 0 0 9999px color-mix(in srgb, var(--bg) 32%, transparent),
    0 0 30px color-mix(in srgb, var(--accent) 26%, transparent);
  transition:
    transform var(--transition-standard),
    width var(--transition-standard),
    height var(--transition-standard);
}

.guided-tour__card {
  @include glass;
  position: fixed;
  top: 0;
  left: 0;
  display: grid;
  gap: var(--space-3);
  min-height: 0;
  padding: var(--space-4);
  border-radius: var(--border-radius-lg);
  color: var(--text);
  pointer-events: auto;
  animation: tour-card-in 260ms var(--ease-standard, ease) both;

  &.is-centered,
  &.is-missing {
    top: 50%;
    left: 50%;
    width: min(360px, calc(100vw - 32px));
    transform: translate(-50%, -50%);
  }

  h3 {
    margin: 0;
    font-size: var(--text-md);
    font-weight: 700;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: var(--text-xs);
    line-height: 1.4;
  }
}

.guided-tour__head,
.guided-tour__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.guided-tour__head {
  justify-content: space-between;
}

.guided-tour__actions {
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 2px;
}

.guided-tour__step {
  color: var(--accent);
  font-size: var(--text-2xs);
  font-weight: 700;
}

.guided-tour__hint {
  color: var(--text);
  opacity: 0.78;
}

.guided-tour__progress {
  display: grid;
  gap: var(--space-2);

  span {
    color: var(--accent);
    font-size: var(--text-xs);
    font-weight: 700;
  }

  div {
    overflow: hidden;
    height: 4px;
    border-radius: var(--border-radius-pill);
    background: color-mix(in srgb, var(--text) 10%, transparent);
  }

  i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--accent);
    transition: width var(--transition-standard);
  }
}

.guided-tour__close,
.guided-tour__ghost,
.guided-tour__primary {
  border: 0;
  border-radius: var(--border-radius-pill);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  font: inherit;
  transition:
    background-color var(--transition-standard),
    color var(--transition-standard),
    opacity var(--transition-standard);

  &:hover:not(:disabled) {
    color: var(--text);
    background: color-mix(in srgb, var(--text) 8%, transparent);
  }

  &:disabled {
    opacity: 0.38;
    cursor: default;
  }
}

.guided-tour__close {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
}

.guided-tour__ghost,
.guided-tour__primary {
  min-height: 38px;
  padding: 0 var(--space-3);
  font-size: var(--text-xs);
}

@media (pointer: coarse), (max-width: 767px) {
  .guided-tour__ghost,
  .guided-tour__primary {
    min-height: 44px;
  }
}

.guided-tour__primary {
  background: var(--accent);
  color: var(--bg);

  &:hover:not(:disabled) {
    background: var(--accent);
    color: var(--bg);
  }
}

:global(.tour-target-active) {
  position: relative;
  z-index: 6100 !important;
}

@keyframes tour-card-in {
  from {
    opacity: 0;
    filter: blur(8px);
  }

  to {
    opacity: 1;
    filter: blur(0);
  }
}

@include mobile {
  .guided-tour__spot {
    border-radius: var(--border-radius-md);
  }

  .guided-tour__card {
    max-width: calc(100dvw - 20px);
    overflow: auto;
    padding: var(--space-3);
  }

  .guided-tour__card.is-centered,
  .guided-tour__card.is-missing {
    width: min(360px, calc(100dvw - 20px));
  }

  .guided-tour__actions {
    justify-content: space-between;
  }

  .guided-tour__ghost,
  .guided-tour__primary {
    min-height: 44px;
  }
}
</style>
