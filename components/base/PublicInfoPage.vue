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
  padding: clamp(var(--space-4), 4vw, var(--space-12));
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
  gap: var(--space-4);
  max-width: 860px;
  margin-inline: auto;
  padding-block-end: var(--space-6);
  border-bottom: var(--ui-border);
  font-size: var(--text-sm);
  font-weight: 600;

  div {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--space-4);
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
    font-size: var(--text-md);
  }
}

article {
  max-width: 820px;
  margin-inline: auto;
  padding-block: clamp(var(--space-12), 8vw, var(--space-16));

  header {
    padding-block-end: clamp(var(--space-8), 5vw, calc(var(--space-12) + var(--space-1)));
    border-bottom: var(--ui-border);
  }

  :deep(h2) {
    margin-block: var(--space-10) var(--space-3);
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(var(--text-lg), 3vw, var(--text-xl));
  }

  :deep(p),
  :deep(li) {
    color: var(--dim);
    line-height: 1.7;
  }

  :deep(ul) {
    display: grid;
    gap: var(--space-2);
    padding-inline-start: var(--space-6);
  }

  :deep(a) {
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  :deep(.document-note) {
    padding: var(--space-4) var(--space-4);
    border: var(--ui-border);
    border-radius: var(--border-radius-sm);
    background: color-mix(in srgb, var(--surface) 72%, transparent);
    color: var(--dim);
  }

  :deep(.document-actions) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-block-start: var(--space-5);
  }

  :deep(.document-actions a) {
    min-block-size: 44px;
    display: inline-flex;
    align-items: center;
    padding-inline: var(--space-4);
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
  padding-block-start: var(--space-3);
}

.eyebrow {
  margin-bottom: var(--space-3);
  color: var(--dim);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
}

h1 {
  max-width: 18ch;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(var(--text-3xl), 7vw, var(--text-7xl));
  line-height: 1.05;
}

.lead {
  max-width: 58ch;
  margin-top: var(--space-6);
  font-size: var(--text-md);
}

footer {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  max-width: 860px;
  margin-inline: auto;
  padding-block: var(--space-6);
  border-top: var(--ui-border);
  color: var(--dim);
  font-size: var(--text-xs);

  a {
    color: var(--text);
  }
}

@media (max-width: 640px) {
  .public-page {
    padding-inline: max(var(--space-4), env(safe-area-inset-left, 0px)) max(var(--space-4), env(safe-area-inset-right, 0px));
  }

  nav {
    display: grid;

    div {
      display: flex;
      justify-content: flex-start;
      gap: var(--space-3);
      overflow-x: auto;
      white-space: nowrap;
    }
  }

  article {
    padding-block: var(--space-9) var(--space-14);
  }

  footer {
    display: grid;
  }
}
</style>
