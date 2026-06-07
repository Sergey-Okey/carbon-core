<template>
  <main class="public-page">
    <nav>
      <NuxtLink to="/onboarding">COF</NuxtLink>
      <div>
        <NuxtLink to="/privacy">Конфиденциальность</NuxtLink>
        <NuxtLink to="/terms">Условия</NuxtLink>
        <NuxtLink to="/support">Поддержка</NuxtLink>
      </div>
    </nav>
    <article>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p class="lead">{{ lead }}</p>
      <slot />
    </article>
  </main>
</template>

<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; lead: string }>()
</script>

<style scoped lang="scss">
.public-page {
  min-block-size: 100dvh;
  padding: clamp(16px, 4vw, 48px);
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
}

article {
  max-width: 760px;
  margin-inline: auto;
  padding-block: clamp(48px, 8vw, 92px);

  :deep(h2) {
    margin-block: 34px 10px;
    font-size: 1.2rem;
  }

  :deep(p),
  :deep(li) {
    color: var(--dim);
    line-height: 1.7;
  }

  :deep(ul) {
    padding-inline-start: 20px;
  }

  :deep(a) {
    color: var(--text);
    text-decoration: underline;
  }
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

@media (max-width: 640px) {
  nav {
    align-items: flex-start;

    div {
      display: grid;
      gap: 6px;
      text-align: end;
    }
  }
}
</style>
