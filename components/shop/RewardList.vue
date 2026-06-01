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
  display: grid;
  gap: 18px;

  .list-header {
    @include glass;
    padding: 18px 20px;
    border: var(--ui-border);
    border-radius: var(--border-radius-lg);

    h3 {
      margin: 0;
      font-weight: 600;
      font-size: 1.2rem;
      color: var(--accent);
    }
  }
  .rewards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 16px;
  }
}
</style>
