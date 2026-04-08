<template>
  <GlassCard class="theme-switcher">
    <h4>Тема оформления</h4>
    <div class="theme-options">
      <button
        class="theme-option"
        :class="{ active: currentTheme === 'dark' }"
        @click="setTheme('dark')"
      >
        <Moon :size="20" />
        <span>Тёмная</span>
      </button>
      <button
        class="theme-option"
        :class="{ active: currentTheme === 'light' }"
        @click="setTheme('light')"
      >
        <Sun :size="20" />
        <span>Светлая</span>
      </button>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import GlassCard from '~/components/base/GlassCard.vue'
import { Moon, Sun } from 'lucide-vue-next'

const currentTheme = ref<'dark' | 'light'>('dark')

onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem('carbon-theme')
    if (saved === 'light' || saved === 'dark') {
      currentTheme.value = saved
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      currentTheme.value = prefersDark ? 'dark' : 'light'
    }
    applyTheme(currentTheme.value)
  }
})

function applyTheme(theme: 'dark' | 'light') {
  if (theme === 'light') {
    document.documentElement.classList.add('light-theme')
  } else {
    document.documentElement.classList.remove('light-theme')
  }
  localStorage.setItem('carbon-theme', theme)
}

function setTheme(theme: 'dark' | 'light') {
  currentTheme.value = theme
  applyTheme(theme)
}
</script>

<style scoped lang="scss">
.theme-switcher {
  h4 {
    margin-bottom: 16px;
    font-weight: 500;
    color: var(--accent);
  }
  .theme-options {
    display: flex;
    gap: 12px;
  }
  .theme-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-md);
    color: var(--dim);
    transition: all var(--transition-standard);
    &:hover {
      background: var(--border);
      color: var(--accent);
    }
    &.active {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--bg);
    }
  }
}
</style>
