<template>
  <GlassCard class="reward-card" :class="{ purchased: reward.purchased }">
    <h4>{{ reward.title }}</h4>
    <p v-if="reward.description">{{ reward.description }}</p>
    <div class="price"><Coins :size="16" /> {{ reward.price }}</div>
    <button
      class="buy-btn"
      :disabled="reward.purchased || userStore.coins < reward.price"
      @click="purchase"
    >
      {{ reward.purchased ? 'Куплено' : 'Купить' }}
    </button>
  </GlassCard>
</template>

<script setup lang="ts">
import { useRewardsStore } from '~/stores/rewards.store'
import { useUserStore } from '~/stores/user.store'
import GlassCard from '~/components/base/GlassCard.vue'
import { Coins } from 'lucide-vue-next'

const props = defineProps<{ reward: any }>()
const rewardsStore = useRewardsStore()
const userStore = useUserStore()

function purchase() {
  rewardsStore.purchaseReward(props.reward.id)
}
</script>

<style scoped lang="scss">
.reward-card {
  display: flex;
  flex-direction: column;
  min-height: 180px;
  padding: 18px;
  border: var(--ui-border);
  color: var(--accent);
  transition:
    opacity var(--transition-standard),
    background var(--transition-standard);

  &.purchased {
    opacity: 0.5;
  }

  h4 {
    color: var(--accent);
    margin-bottom: 4px;
  }

  p {
    font-size: 0.85rem;
    color: var(--dim);
    margin-bottom: 12px;
    line-height: 1.45;
  }

  .price {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: auto;
    margin-bottom: 12px;
    color: var(--accent);
  }

  .buy-btn {
    width: 100%;
    min-height: var(--control-height-md);
    padding: 0 14px;
    border: none;
    background: var(--accent);
    color: var(--bg);
    border-radius: var(--border-radius-pill);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition:
      opacity var(--transition-standard),
      transform var(--transition-standard);

    &:hover:not(:disabled) {
      opacity: 0.92;
    }

    &:active:not(:disabled) {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
    }

    &:disabled {
      background: var(--ui-border-color);
      color: var(--dim);
      cursor: not-allowed;
    }
  }
}
</style>
