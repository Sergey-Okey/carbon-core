<template>
  <div class="settings-panel">
    <ThemeSwitcher />
    <DataManager />
  </div>
</template>

<script setup lang="ts">
import ThemeSwitcher from './ThemeSwitcher.vue'
import DataManager from './DataManager.vue'
</script>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
