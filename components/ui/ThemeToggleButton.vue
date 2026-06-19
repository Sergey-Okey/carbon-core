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
  settingsStore.theme === 'dark' ? '???????? ??????? ????' : '???????? ?????? ????'
)

function toggleTheme() {
  settingsStore.setTheme(settingsStore.theme === 'dark' ? 'light' : 'dark')
}
</script>

<style scoped lang="scss">
.theme-toggle-button {
  @include glass;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: var(--border-radius-pill);
  color: var(--text);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard),
    border-color var(--transition-standard),
    transform var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--accent) 8%, var(--glass-surface));
    color: var(--text);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
