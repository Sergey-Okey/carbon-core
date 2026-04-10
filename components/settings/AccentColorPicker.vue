<template>
  <GlassCard class="accent-picker">
    <h4>Акцентный цвет</h4>
    <div class="color-grid">
      <button
        v-for="color in ACCENT_COLORS"
        :key="color.value"
        class="color-btn"
        :style="{ backgroundColor: color.value }"
        :class="{ active: settingsStore.accentColor === color.value }"
        @click="settingsStore.setAccentColor(color.value)"
        :title="color.name"
      >
        <Check v-if="settingsStore.accentColor === color.value" :size="16" />
      </button>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { ACCENT_COLORS, useSettingsStore } from '~/stores/settings.store'
import GlassCard from '~/components/base/GlassCard.vue'
import { Check } from 'lucide-vue-next'

const settingsStore = useSettingsStore()
</script>

<style scoped lang="scss">
.accent-picker {
  margin-top: 16px;

  h4 {
    margin-bottom: 16px;
    font-weight: 500;
    color: var(--accent);
  }

  .color-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .color-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);

    &:hover {
      transform: scale(1.1);
    }

    &.active {
      border-color: var(--bg);
      box-shadow: 0 0 0 2px var(--accent);
    }

    svg {
      filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
    }
  }
}
</style>
