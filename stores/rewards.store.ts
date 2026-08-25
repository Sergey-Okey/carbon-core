import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Reward } from '~/types/reward.types'
import { v4 as uuidv4 } from 'uuid'
import { useUserStore } from './user.store'
import { DEMO_REWARDS_INIT_KEY, accessAwareStorage } from '~/utils/accessStorage'

export const useRewardsStore = defineStore(
  'rewards',
  () => {
    const rewards = ref<Reward[]>([])

    async function initDemoRewardsAfterHydration() {
      const accessStore = useAccessStore()
      if (!accessStore.isDemo) return

      const store = useRewardsStore()
      if (store.$persistedState) await store.$persistedState.isReady
      if (!accessStore.isDemo) return
      if (rewards.value.length === 0 && !accessAwareStorage.getItem(DEMO_REWARDS_INIT_KEY)) {
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
        accessAwareStorage.setItem(DEMO_REWARDS_INIT_KEY, 'true')
      }
    }

    function addReward(input: {
      title: string
      description?: string
      effect?: Reward['effect']
    }) {
      const reward: Reward = {
        id: uuidv4(),
        title: input.title,
        description: input.description,
        purchased: false,
        completed: false,
        effect: input.effect,
      }
      rewards.value = [...rewards.value, reward]
      return reward
    }

    function updateReward(id: string, updates: Partial<Omit<Reward, 'id'>>) {
      const reward = rewards.value.find((item) => item.id === id)
      if (!reward) return null
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) Object.assign(reward, { [key]: value })
      }
      return reward
    }

    function deleteReward(id: string) {
      const next = rewards.value.filter((item) => item.id !== id)
      if (next.length === rewards.value.length) return false
      rewards.value = next
      return true
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

    return {
      rewards,
      addReward,
      updateReward,
      deleteReward,
      purchaseReward,
      confirmPurchase,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-rewards', storage: accessAwareStorage }
      : undefined,
  }
)
