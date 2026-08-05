<template>
  <aside class="brand-stage">
    <div class="brand-stage__copy">
      <p class="brand-stage__mark">COF</p>
      <p class="brand-stage__slogan">
        <span>{{ typedSlogan }}</span
        ><span class="brand-stage__caret" :class="{ idle: typeDone }" />
      </p>
    </div>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{
  slogan: string
}>()

const typedSlogan = ref('')
const typeDone = ref(false)

let typeTimer = 0
let typewriterCancelled = false
let reducedMotion = false

async function sleep(ms: number) {
  await new Promise((resolve) => {
    typeTimer = window.setTimeout(resolve, ms)
  })
}

async function typeText(text: string, speed = 42) {
  for (let i = 1; i <= text.length; i += 1) {
    typedSlogan.value = text.slice(0, i)
    await sleep(speed)
  }
}

async function deleteText(speed = 28) {
  while (typedSlogan.value.length > 0) {
    typedSlogan.value = typedSlogan.value.slice(0, -1)
    await sleep(speed)
  }
}

async function runTypewriter() {
  if (reducedMotion) {
    typedSlogan.value = props.slogan
    typeDone.value = true
    return
  }

  while (!typewriterCancelled) {
    typedSlogan.value = ''
    typeDone.value = false
    await sleep(280)
    if (typewriterCancelled) break
    await typeText('В хаосе…', 50)
    await sleep(420)
    if (typewriterCancelled) break
    await deleteText(24)
    await sleep(180)
    if (typewriterCancelled) break
    await typeText(props.slogan, 38)
    typeDone.value = true
    await sleep(2200)
  }
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  void runTypewriter()
})

onBeforeUnmount(() => {
  typewriterCancelled = true
  if (typeTimer) window.clearTimeout(typeTimer)
})
</script>

<style scoped lang="scss">
.brand-stage {
  --brand-ink: #f2f2f2;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
  padding: var(--space-4);
  padding-left: max(var(--space-4), env(safe-area-inset-left, 0px));
  padding-bottom: max(var(--space-4), env(safe-area-inset-bottom, 0px));
  background: transparent;
  color: var(--brand-ink);
}

:global(.light-theme) .brand-stage {
  --brand-ink: var(--color-text-primary);
}

.brand-stage__copy {
  display: grid;
  justify-items: start;
  gap: var(--space-2);
  width: min(100%, 42ch);
  max-width: 100%;
  text-align: left;
}

.brand-stage__mark {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(5.2rem, 11vw, 8.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 0.96;
  color: var(--brand-ink);
  text-align: left;
  -webkit-text-stroke: 0.05em currentColor;
  paint-order: stroke fill;
}

.brand-stage__slogan {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-end;
  min-height: 1.35em;
  min-width: 0;
  width: 100%;
  font-family: 'Manrope', var(--font-sans);
  font-size: 14px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.01em;
  line-height: var(--leading-normal);
  color: color-mix(in srgb, var(--brand-ink) 72%, transparent);
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: normal;
  hyphens: none;
}

.brand-stage__caret {
  display: inline-block;
  width: 0.08em;
  height: 1em;
  margin-left: 0.08em;
  background: var(--brand-ink);
  animation: caret-blink 1s steps(1) infinite;

  &.idle {
    opacity: 0;
    animation: none;
  }
}

@keyframes caret-blink {
  0%,
  45% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

@media (max-width: 900px) {
  .brand-stage {
    padding: var(--space-3);
    padding-top: calc(var(--space-3) + var(--control-icon-size) + var(--space-2));
    padding-left: max(var(--space-3), env(safe-area-inset-left, 0px));
    padding-bottom: var(--space-3);
  }

  .brand-stage__mark {
    font-size: clamp(4.4rem, 22vw, 6.5rem);
    -webkit-text-stroke: 0.055em currentColor;
  }

  .brand-stage__slogan {
    font-size: var(--text-md);
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-stage__caret {
    display: none;
  }
}
</style>
