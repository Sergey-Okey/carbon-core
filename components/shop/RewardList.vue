<template>
  <div class="reward-list">
    <div class="list-header"><h3>Магазин наград</h3></div>
    <div class="rewards-grid">
      <RewardCard
        v-for="reward in rewardsStore.rewards"
        :key="reward.id"
        :reward="reward"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRewardsStore } from '~/stores/rewards.store'
import RewardCard from './RewardCard.vue'
const rewardsStore = useRewardsStore()
</script>

<style scoped lang="scss">
.reward-list {
  .list-header {
    margin-bottom: 16px;
    h3 {
      font-weight: 600;
      font-size: 1.2rem;
      color: var(--accent);
    }
  }
  .rewards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }
}
</style>
