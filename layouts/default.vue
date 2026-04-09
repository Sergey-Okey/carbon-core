<template>
  <div class="layout">
    <TheHeader />
    <div class="layout-content">
      <TheNavbar class="navbar" />
      <main class="main">
        <slot />
      </main>
    </div>
    <TheFooter />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import TheHeader from '~/components/base/TheHeader.vue'
import TheNavbar from '~/components/base/TheNavbar.vue'
import TheFooter from '~/components/base/TheFooter.vue'
import ToastContainer from '~/components/base/ToastContainer.vue'
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

.navbar {
  @include desktop {
    width: 80px;
  }
}

.main {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  @include desktop {
    padding: 24px;
  }
}
</style>
