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
  padding: 16px;
  color: var(--accent);
  transition: opacity var(--transition-standard);
  &.purchased {
    opacity: 0.5;
  }
  h4 {
    margin-bottom: 4px;
  }
  p {
    font-size: 0.85rem;
    color: var(--dim);
    margin-bottom: 12px;
  }
  .price {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 12px;
  }
  .buy-btn {
    width: 100%;
    padding: 10px;
    background: var(--accent);
    color: var(--bg);
    border-radius: var(--border-radius-sm);
    font-weight: 600;
    transition: opacity var(--transition-standard);
    &:hover:not(:disabled) {
      opacity: 0.8;
    }
    &:disabled {
      background: var(--border);
      color: var(--dim);
      cursor: not-allowed;
    }
  }
}
</style>
