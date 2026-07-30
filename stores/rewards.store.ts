import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Reward } from '~/types/reward.types'
import { v4 as uuidv4 } from 'uuid'
import { useUserStore } from './user.store'
import { accessAwareStorage } from '~/utils/accessStorage'

export const useRewardsStore = defineStore(
  'rewards',
  () => {
    const rewards = ref<Reward[]>([])

    async function initDemoRewardsAfterHydration() {
      const DEMO_KEY = 'carbon-rewards-demo-initialized'
      const store = useRewardsStore()
      if (store.$persistedState) await store.$persistedState.isReady
      if (rewards.value.length === 0 && !localStorage.getItem(DEMO_KEY)) {
        rewards.value = [
          {
            id: uuidv4(),
            title: 'Новая одежда',
            description: 'Обнови гардероб',
            purchased: false,
            completed: false,
            effect: { leaguePoints: 450 },
          },
          {
            id: uuidv4(),
            title: 'Книга по инвестициям',
            purchased: false,
            completed: false,
            effect: { leaguePoints: 150 },
          },
        ]
        localStorage.setItem(DEMO_KEY, 'true')
      }
    }

    function purchaseReward(id: string) {
      const reward = rewards.value.find((r) => r.id === id)
      if (!reward || reward.purchased) return

      reward.purchased = true
      reward.purchasedAt = Date.now()
    }

    function confirmPurchase(rewardId: string) {
      const userStore = useUserStore()
      const reward = rewards.value.find((r) => r.id === rewardId)
      if (!reward || reward.completed) return

      reward.completed = true
      reward.completedAt = Date.now()

      if (reward.effect?.leaguePoints) {
        userStore.addLeaguePoints(reward.effect.leaguePoints)
      }
    }

    if (import.meta.client) {
      initDemoRewardsAfterHydration()
    }

    return { rewards, purchaseReward, confirmPurchase }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-rewards', storage: accessAwareStorage }
      : undefined,
  }
)
