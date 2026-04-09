import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Reward } from '~/types/reward.types'
import { v4 as uuidv4 } from 'uuid'
import { useUserStore } from './user.store'

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
            price: 3000,
            purchased: false,
            completed: false,
            effect: { leaguePoints: 200, xp: 500 },
          },
          {
            id: uuidv4(),
            title: 'Книга по инвестициям',
            price: 1500,
            purchased: false,
            completed: false,
            effect: { xp: 300, gold: 200 },
          },
        ]
        localStorage.setItem(DEMO_KEY, 'true')
      }
    }

    function purchaseReward(id: string) {
      const userStore = useUserStore()
      const reward = rewards.value.find((r) => r.id === id)
      if (!reward || reward.purchased) return
      if (userStore.gold < reward.price) return

      userStore.addGold(-reward.price)
      reward.purchased = true
      reward.purchasedAt = Date.now()
    }

    function confirmPurchase(rewardId: string) {
      const userStore = useUserStore()
      const reward = rewards.value.find((r) => r.id === rewardId)
      if (!reward || reward.completed) return

      reward.completed = true
      reward.completedAt = Date.now()

      if (reward.effect) {
        if (reward.effect.xp) userStore.addXP(reward.effect.xp)
        if (reward.effect.gold) userStore.addGold(reward.effect.gold)
        if (reward.effect.leaguePoints)
          userStore.leaguePoints += reward.effect.leaguePoints
      }
    }

    if (import.meta.client) {
      initDemoRewardsAfterHydration()
    }

    return { rewards, purchaseReward, confirmPurchase }
  },
  { persist: { key: 'carbon-rewards', storage: localStorage } }
)
