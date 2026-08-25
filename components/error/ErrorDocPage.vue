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
  padding: clamp(var(--space-4), 3vw, var(--space-7));
  background: var(--bg);
  color: var(--text);
}

.error-shell {
  @include surface-panel;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: calc(100vh - clamp(32px, 6vw, 56px));
  min-height: calc(100dvh - clamp(32px, 6vw, 56px));
  padding: clamp(var(--space-5), 4vw, var(--space-9));
  border: var(--ui-border);
  border-radius: var(--border-radius-xl);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  width: fit-content;
  color: var(--text);
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-md);
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
  gap: var(--space-3);
  width: min(100%, 720px);
  margin: 0 auto;
}

.eyebrow {
  color: var(--dim);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.error-code {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(var(--text-8xl), 18vw, calc(var(--text-8xl) * 2));
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.08em;
  color: color-mix(in srgb, var(--text) 18%, transparent);
  user-select: none;
}

h1 {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(var(--text-3xl), 5vw, var(--text-5xl));
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
  font-size: clamp(var(--text-sm), 1.7vw, var(--text-md));
}

.joke {
  color: var(--text);
  font-size: var(--text-sm);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.footer-note {
  color: var(--dim);
  font-size: var(--text-xs);
  text-align: center;
}

@media (max-width: 640px) {
  .error-shell {
    min-height: calc(100vh - 32px);
    min-height: calc(100dvh - 32px);
    padding: var(--space-5);
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
