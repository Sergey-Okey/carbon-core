<template>
  <Teleport to="body">
    <div v-if="tour.isActive" class="guided-tour" aria-live="polite">
      <div
        v-if="targetRect && !tour.isFinishStep"
        class="guided-tour__spot"
        :style="spotStyle"
      />

      <article
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
            @click="tour.skip"
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useGuidedTourStore } from '~/stores/guidedTour.store'

const tour = useGuidedTourStore()
const targetRect = ref<DOMRect | null>(null)
const isMobile = ref(false)
const isTargetMissing = ref(false)
const cardPlacement = ref<'top' | 'right' | 'bottom' | 'left' | 'center'>('right')
let activeTarget: HTMLElement | null = null
let frameId: number | null = null
let stepChangeUpdate = false

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
  if (!targetRect.value || tour.isFinishStep || isMobile.value) return {}

  const width = 330
  const height = 210
  const gap = 14
  const rect = targetRect.value
  const options = [
    {
      placement: 'right' as const,
      left: rect.right + gap,
      top: rect.top + rect.height / 2 - height / 2,
      fits: rect.right + gap + width <= window.innerWidth - 12,
    },
    {
      placement: 'left' as const,
      left: rect.left - width - gap,
      top: rect.top + rect.height / 2 - height / 2,
      fits: rect.left - width - gap >= 12,
    },
    {
      placement: 'bottom' as const,
      left: rect.left + rect.width / 2 - width / 2,
      top: rect.bottom + gap,
      fits: rect.bottom + gap + height <= window.innerHeight - 12,
    },
    {
      placement: 'top' as const,
      left: rect.left + rect.width / 2 - width / 2,
      top: rect.top - height - gap,
      fits: rect.top - height - gap >= 12,
    },
  ]
  const best = options.find((option) => option.fits) || options[2]
  cardPlacement.value = best.placement

  return {
    width: `${width}px`,
    transform: `translate(${clamp(best.left, 12, window.innerWidth - width - 12)}px, ${clamp(best.top, 12, window.innerHeight - height - 12)}px)`,
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
  return tour.currentStep.target
    ? document.querySelector<HTMLElement>(`[data-tour="${tour.currentStep.target}"]`)
    : null
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

  if (isMobile.value) {
    cardPlacement.value = rect.top > window.innerHeight / 2 ? 'top' : 'bottom'
  }

  if (stepChangeUpdate) {
    stepChangeUpdate = false
    focusTarget()
  }

  targetRect.value = rect
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

onMounted(() => {
  stepChangeUpdate = true
  nextTick(scheduleUpdate)
  window.addEventListener('resize', scheduleUpdate)
  window.addEventListener('scroll', scheduleUpdate, true)
})

onBeforeUnmount(() => {
  clearTargetClass()
  if (frameId) window.cancelAnimationFrame(frameId)
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
  gap: 10px;
  min-height: 0;
  padding: 14px;
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
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: 13px;
    line-height: 1.4;
  }
}

.guided-tour__head,
.guided-tour__actions {
  display: flex;
  align-items: center;
  gap: 8px;
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
  font-size: 11px;
  font-weight: 700;
}

.guided-tour__hint {
  color: var(--text);
  opacity: 0.78;
}

.guided-tour__progress {
  display: grid;
  gap: 6px;

  span {
    color: var(--accent);
    font-size: 12px;
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
  padding: 0 13px;
  font-size: 13px;
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

  .guided-tour__card,
  .guided-tour__card.is-centered,
  .guided-tour__card.is-missing {
    top: auto;
    right: 10px;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 86px);
    left: 10px;
    width: auto;
    max-height: min(44vh, 360px);
    overflow: auto;
    transform: none;
    padding: 13px;
  }

  .guided-tour__card.is-top:not(.is-centered):not(.is-missing) {
    top: calc(env(safe-area-inset-top, 0px) + 12px);
    bottom: auto;
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
