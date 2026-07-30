<template>
  <main class="error-page">
    <div class="error-shell">
      <NuxtLink class="brand" to="/" @click.prevent="goHome">
        <img src="/favicon.svg" alt="" aria-hidden="true" />
        <span>COF</span>
      </NuxtLink>

      <section class="error-center">
        <span class="eyebrow">{{ eyebrow }}</span>
        <div class="error-code">{{ code }}</div>
        <h1>{{ title }}</h1>
        <p class="description">{{ description }}</p>
        <p class="joke">{{ joke }}</p>

        <div class="actions">
          <AppButton variant="primary" @click="handlePrimaryAction">
            <RefreshCw v-if="primaryAction === 'reload'" :size="17" />
            <Home v-else :size="17" />
            {{ primaryLabel }}
          </AppButton>
          <AppButton variant="secondary" @click="goHome">На главную</AppButton>
        </div>
      </section>

      <div class="footer-note">Код ошибки: {{ code }}</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { Home, RefreshCw } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    code: number | string
    eyebrow: string
    title: string
    description: string
    joke: string
    primaryLabel?: string
    primaryAction?: 'home' | 'reload'
  }>(),
  {
    primaryLabel: 'На главную',
    primaryAction: 'home',
  }
)

function goHome() {
  if (typeof window === 'undefined') return
  window.location.assign('/')
}

function handlePrimaryAction() {
  if (props.primaryAction === 'reload') {
    window.location.reload()
    return
  }

  goHome()
}
</script>

<style scoped lang="scss">
.error-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(16px, 3vw, 28px);
  background: var(--bg);
  color: var(--text);
}

.error-shell {
  @include surface-panel;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: calc(100vh - clamp(32px, 6vw, 56px));
  min-height: calc(100dvh - clamp(32px, 6vw, 56px));
  padding: clamp(20px, 4vw, 34px);
  border: var(--ui-border);
  border-radius: var(--border-radius-xl);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  color: var(--text);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;

  img {
    width: 30px;
    height: 30px;
  }
}

.error-center {
  display: grid;
  align-content: center;
  justify-items: center;
  text-align: center;
  gap: 12px;
  width: min(100%, 720px);
  margin: 0 auto;
}

.eyebrow {
  color: var(--dim);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.error-code {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(7rem, 18vw, 14rem);
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.08em;
  color: color-mix(in srgb, var(--text) 18%, transparent);
  user-select: none;
}

h1 {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 5vw, 3.8rem);
  font-weight: 700;
  line-height: 0.98;
  letter-spacing: -0.05em;
}

.description,
.joke {
  margin: 0;
  max-width: 48ch;
  line-height: 1.6;
}

.description {
  color: var(--dim);
  font-size: clamp(0.94rem, 1.7vw, 1.05rem);
}

.joke {
  color: var(--text);
  font-size: 0.92rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
}

.footer-note {
  color: var(--dim);
  font-size: 0.76rem;
  text-align: center;
}

@media (max-width: 640px) {
  .error-shell {
    min-height: calc(100vh - 32px);
    min-height: calc(100dvh - 32px);
    padding: 18px;
  }

  .actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;

    :deep(.app-button) {
      width: 100%;
    }
  }
}
</style>
