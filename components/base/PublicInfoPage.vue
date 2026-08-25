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
  font-weight: var(--weight-semibold);

  div {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--space-3);
    color: var(--dim);
  }

  a {
    @include inline-link;
    min-block-size: var(--touch-target);
    display: inline-flex;
    align-items: center;
    color: var(--color-text-secondary);
    font-size: var(--body-size);
    font-weight: var(--weight-medium);
    line-height: var(--body-leading);
  }

  a.active,
  a:hover {
    color: var(--color-text-primary);
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
    padding-block-end: clamp(var(--space-8), 5vw, var(--space-14));
    border-bottom: var(--ui-border);
  }

  :deep(h2) {
    @include heading-2;
    margin-block: var(--space-8) var(--space-3);
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
  }

  :deep(p),
  :deep(li) {
    color: var(--dim);
    font-size: var(--body-size);
    line-height: var(--leading-relaxed);
  }

  :deep(ul) {
    display: grid;
    gap: var(--space-2);
    padding-inline-start: var(--space-5);
  }

  :deep(a) {
    @include inline-link;
  }

  :deep(.document-note) {
    padding: var(--space-3) var(--space-4);
    border: var(--ui-border);
    border-radius: var(--border-radius-sm);
    background: color-mix(in srgb, var(--surface) 72%, transparent);
    color: var(--dim);
  }

  :deep(.document-actions) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-block-start: var(--space-4);
  }

  :deep(.document-actions a) {
    min-block-size: var(--touch-target);
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
  font-weight: var(--weight-bold);
  text-transform: uppercase;
}

h1 {
  max-width: 18ch;
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--heading-hero);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--heading-display-tracking);
  line-height: var(--heading-display-leading);
}

.lead {
  max-width: 58ch;
  margin-top: var(--space-5);
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
  @include meta-text;

  a {
    @include inline-link;
  }
}

@media (max-width: 640px) {
  .public-page {
    padding-inline: max(var(--space-3), env(safe-area-inset-left, 0px)) max(var(--space-3), env(safe-area-inset-right, 0px));
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
    padding-block: var(--space-8) var(--space-14);
  }

  footer {
    display: grid;
  }
}
</style>
