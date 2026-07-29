<template>
  <button
    class="theme-toggle-button"
    type="button"
    :aria-label="label"
    :data-tooltip="label"
    @click="toggleTheme"
  >
    <Sun v-if="settingsStore.theme === 'dark'" :size="17" />
    <Moon v-else :size="17" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Moon, Sun } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings.store'

const settingsStore = useSettingsStore()

const label = computed(() =>
  settingsStore.theme === 'dark'
    ? 'Переключить на светлую тему'
    : 'Переключить на тёмную тему'
)

function toggleTheme() {
  settingsStore.setTheme(settingsStore.theme === 'dark' ? 'light' : 'dark')
}
</script>

<style scoped lang="scss">
.theme-toggle-button {
  @include surface-panel;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: var(--radius-full);
  color: var(--color-text-primary);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard),
    border-color var(--transition-standard),
    transform var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--color-accent) 8%, var(--color-surface-1));
    color: var(--color-text-primary);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
