import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Reward } from '~/types/reward.types'
import { v4 as uuidv4 } from 'uuid'
import { useUserStore } from './user.store'

export const useRewardsStore = defineStore(
  'rewards',
  () => {
    const rewards = ref<Reward[]>([
      {
        id: uuidv4(),
        title: 'Новая одежда',
        description: 'Обнови гардероб',
        price: 3000,
        purchased: false,
        effect: { hp: 10 },
      },
      {
        id: uuidv4(),
        title: 'Книга по инвестициям',
        price: 1500,
        purchased: false,
        effect: { xp: 200 },
      },
    ])

    function purchaseReward(id: string) {
      const userStore = useUserStore()
      const reward = rewards.value.find((r) => r.id === id)
      if (!reward || reward.purchased) return
      if (userStore.gold < reward.price) return

      userStore.addGold(-reward.price)
      reward.purchased = true
      reward.purchasedAt = Date.now()

      if (reward.effect) {
        if (reward.effect.hp) userStore.restoreHP(reward.effect.hp)
        if (reward.effect.xp) userStore.addXP(reward.effect.xp)
      }
    }

    return { rewards, purchaseReward }
  },
  {
    persist: { key: 'carbon-rewards', storage: localStorage },
  }
)
