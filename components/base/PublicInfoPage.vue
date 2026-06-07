<template>
  <main class="public-page">
    <nav>
      <NuxtLink class="brand" to="/onboarding">COF</NuxtLink>
      <div aria-label="Публичные страницы">
        <NuxtLink to="/privacy" active-class="active">Конфиденциальность</NuxtLink>
        <NuxtLink to="/terms" active-class="active">Условия</NuxtLink>
        <NuxtLink to="/support" active-class="active">Поддержка</NuxtLink>
      </div>
    </nav>
    <article>
      <header>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p class="lead">{{ lead }}</p>
      </header>
      <div class="document-content">
        <slot />
      </div>
    </article>
    <footer>
      <span>Core of Life</span>
      <a href="mailto:sergeyborisov_1@vk.ru">sergeyborisov_1@vk.ru</a>
    </footer>
  </main>
</template>

<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; lead: string }>()
</script>

<style scoped lang="scss">
.public-page {
  position: fixed;
  inset: 0;
  z-index: 10;
  min-block-size: 100dvh;
  padding: clamp(16px, 4vw, 48px);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scrollbar-gutter: stable;
  background: var(--bg);
  color: var(--text);
}

nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 860px;
  margin-inline: auto;
  padding-block-end: 24px;
  border-bottom: var(--ui-border);
  font-size: 0.84rem;
  font-weight: 600;

  div {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 14px;
    color: var(--dim);
  }

  a {
    min-block-size: 44px;
    display: inline-flex;
    align-items: center;
    color: var(--dim);
    text-decoration: none;
  }

  a.active,
  a:hover {
    color: var(--text);
  }

  .brand {
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem;
  }
}

article {
  max-width: 820px;
  margin-inline: auto;
  padding-block: clamp(48px, 8vw, 92px);

  header {
    padding-block-end: clamp(30px, 5vw, 52px);
    border-bottom: var(--ui-border);
  }

  :deep(h2) {
    margin-block: 38px 12px;
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.15rem, 3vw, 1.35rem);
  }

  :deep(p),
  :deep(li) {
    color: var(--dim);
    line-height: 1.7;
  }

  :deep(ul) {
    display: grid;
    gap: 8px;
    padding-inline-start: 22px;
  }

  :deep(a) {
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  :deep(.document-note) {
    padding: 14px 16px;
    border: var(--ui-border);
    border-radius: var(--border-radius-sm);
    background: color-mix(in srgb, var(--surface) 72%, transparent);
    color: var(--dim);
  }

  :deep(.document-actions) {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-block-start: 18px;
  }

  :deep(.document-actions a) {
    min-block-size: 44px;
    display: inline-flex;
    align-items: center;
    padding-inline: 16px;
    border: var(--ui-border);
    border-radius: var(--border-radius-sm);
    background: color-mix(in srgb, var(--surface) 72%, transparent);
    text-decoration: none;
  }

  :deep(.document-actions a.primary) {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--bg);
  }
}

.document-content {
  padding-block-start: 10px;
}

.eyebrow {
  margin-bottom: 12px;
  color: var(--dim);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

h1 {
  max-width: 18ch;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.2rem, 7vw, 4.4rem);
  line-height: 1.05;
}

.lead {
  max-width: 58ch;
  margin-top: 22px;
  font-size: 1.05rem;
}

footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  max-width: 860px;
  margin-inline: auto;
  padding-block: 24px;
  border-top: var(--ui-border);
  color: var(--dim);
  font-size: 0.78rem;

  a {
    color: var(--text);
  }
}

@media (max-width: 640px) {
  .public-page {
    padding-inline: max(14px, env(safe-area-inset-left, 0px)) max(14px, env(safe-area-inset-right, 0px));
  }

  nav {
    display: grid;

    div {
      display: flex;
      justify-content: flex-start;
      gap: 12px;
      overflow-x: auto;
      white-space: nowrap;
    }
  }

  article {
    padding-block: 34px 54px;
  }

  footer {
    display: grid;
  }
}
</style>
