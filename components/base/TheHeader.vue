<template>
  <header class="header">
    <div class="logo">CARBON CORE</div>
    <div class="user-stats">
      <div class="stat">
        <Zap :size="18" /> <span>Lv.{{ userStore.level }}</span>
      </div>
      <div class="stat">
        <Coins :size="18" /> <span>{{ userStore.gold }}</span>
      </div>
      <div class="stat hp">
        <Heart :size="18" /> <span>{{ userStore.hp }}/100</span>
      </div>
      <button class="settings-btn" @click="$emit('open-settings')">
        <Settings :size="20" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user.store'
import { Zap, Coins, Heart, Settings } from 'lucide-vue-next'

const userStore = useUserStore()
defineEmits<{ (e: 'open-settings'): void }>()
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  @include glass;
  border-bottom: 1px solid var(--border);
  border-radius: 0 0 24px 24px;
  margin-bottom: 4px;

  .logo {
    font-weight: 700;
    font-size: 1.4rem;
    letter-spacing: 1px;
    color: var(--accent);
  }

  .user-stats {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.9rem;
    color: var(--accent);
  }

  .settings-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
    transition: background var(--transition-standard);
    color: var(--dim);

    &:hover {
      background: var(--surface);
      color: var(--accent);
    }
  }
}
</style>
