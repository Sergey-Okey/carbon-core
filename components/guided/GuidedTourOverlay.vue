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
        :class="{ 'is-centered': !targetRect || tour.isFinishStep }"
        :style="cardStyle"
      >
        <span class="guided-tour__step">
          {{ currentNumber }} / {{ totalSteps }}
        </span>
        <h3>{{ tour.currentStep.title }}</h3>
        <p>{{ tour.currentStep.text }}</p>

        <div class="guided-tour__actions">
          <button type="button" class="guided-tour__ghost" @click="tour.skip">
            Пропустить
          </button>
          <button
            v-if="tour.isFinishStep"
            type="button"
            class="guided-tour__primary"
            @click="tour.finish"
          >
            Готово
          </button>
        </div>
      </article>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useGuidedTourStore } from '~/stores/guidedTour.store'

const tour = useGuidedTourStore()
const targetRect = ref<DOMRect | null>(null)
const isMobile = ref(false)
let activeTarget: HTMLElement | null = null
let frameId: number | null = null

const currentNumber = computed(() =>
  Math.min(tour.currentStepIndex + 1, tour.steps.length)
)
const totalSteps = computed(() => tour.steps.length)

const spotStyle = computed(() => {
  if (!targetRect.value) return {}

  return {
    width: `${targetRect.value.width + 14}px`,
    height: `${targetRect.value.height + 14}px`,
    transform: `translate(${targetRect.value.left - 7}px, ${targetRect.value.top - 7}px)`,
  }
})

const cardStyle = computed(() => {
  if (!targetRect.value || tour.isFinishStep || isMobile.value) return {}

  const gap = 16
  const width = 320
  const left = Math.min(
    window.innerWidth - width - 16,
    Math.max(16, targetRect.value.right + gap)
  )
  const top = Math.min(
    window.innerHeight - 220,
    Math.max(16, targetRect.value.top - 10)
  )

  return {
    width: `${width}px`,
    transform: `translate(${left}px, ${top}px)`,
  }
})

function clearTargetClass() {
  if (!activeTarget) return
  activeTarget.classList.remove('tour-target-active')
  activeTarget = null
}

function updateTarget() {
  if (!import.meta.client || !tour.isActive) return

  clearTargetClass()
  isMobile.value = window.innerWidth < 768

  const target = tour.currentStep.target
    ? document.querySelector<HTMLElement>(`[data-tour="${tour.currentStep.target}"]`)
    : null

  if (!target || tour.isFinishStep) {
    targetRect.value = null
    return
  }

  activeTarget = target
  activeTarget.classList.add('tour-target-active')
  targetRect.value = target.getBoundingClientRect()
}

function scheduleUpdate() {
  if (frameId) window.cancelAnimationFrame(frameId)
  frameId = window.requestAnimationFrame(updateTarget)
}

watch(
  () => [tour.isActive, tour.currentStepIndex],
  async () => {
    await nextTick()
    scheduleUpdate()
  }
)

onMounted(() => {
  tour.startIfNeeded()
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
    0 0 0 9999px color-mix(in srgb, var(--bg) 42%, transparent),
    0 0 28px color-mix(in srgb, var(--accent) 24%, transparent);
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
  padding: 16px;
  border-radius: var(--border-radius-lg);
  color: var(--text);
  pointer-events: auto;
  animation: tour-card-in 260ms var(--ease-standard, ease) both;

  &.is-centered {
    top: 50%;
    left: 50%;
    width: min(340px, calc(100vw - 32px));
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
    line-height: 1.45;
  }
}

.guided-tour__step {
  justify-self: start;
  border-radius: var(--border-radius-pill);
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
}

.guided-tour__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 2px;
}

.guided-tour__ghost,
.guided-tour__primary {
  min-height: 38px;
  border: 0;
  border-radius: var(--border-radius-pill);
  padding: 0 14px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition:
    background-color var(--transition-standard),
    color var(--transition-standard);
}

.guided-tour__ghost {
  background: transparent;
  color: var(--dim);

  &:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--text) 8%, transparent);
  }
}

.guided-tour__primary {
  background: var(--accent);
  color: var(--bg);
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
  .guided-tour__card.is-centered {
    top: auto;
    right: 12px;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 92px);
    left: 12px;
    width: auto;
    transform: none;
    padding: 14px;
  }

  .guided-tour__ghost,
  .guided-tour__primary {
    min-height: 44px;
  }
}
</style>
