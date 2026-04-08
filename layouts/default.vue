<template>
  <div class="layout">
    <TheHeader />
    <div class="layout-content">
      <TheNavbar />
      <main class="main">
        <slot />
      </main>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheHeader from '~/components/base/TheHeader.vue'
import TheNavbar from '~/components/base/TheNavbar.vue'
import TheFooter from '~/components/base/TheFooter.vue'
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
  color: var(--accent);
}

.layout-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  @include desktop {
    flex-direction: row;
  }
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden; // чтобы доска не выходила за пределы
  @include desktop {
    padding: 24px;
  }
}
</style>
