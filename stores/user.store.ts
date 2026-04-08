import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  calculateLevel,
  calculateCurrentXP,
  calculateNeededXPForNextLevel,
} from '~/utils/levelCalculator'

export const useUserStore = defineStore(
  'user',
  () => {
    const totalXP = ref<number>(0)
    const gold = ref<number>(100)
    const hp = ref<number>(100)

    const level = computed(() => calculateLevel(totalXP.value))
    const currentXP = computed(() =>
      calculateCurrentXP(totalXP.value, level.value)
    )
    const neededXPForNextLevel = computed(() =>
      calculateNeededXPForNextLevel(level.value)
    )
    const levelProgressPercent = computed(() => {
      if (neededXPForNextLevel.value === 0) return 100
      return (currentXP.value / neededXPForNextLevel.value) * 100
    })

    function addXP(amount: number) {
      totalXP.value += amount
    }
    function addGold(amount: number) {
      gold.value += amount
    }
    function reduceHP(amount: number) {
      hp.value = Math.max(0, hp.value - amount)
    }
    function restoreHP(amount: number) {
      hp.value = Math.min(100, hp.value + amount)
    }

    return {
      totalXP,
      gold,
      hp,
      level,
      currentXP,
      neededXPForNextLevel,
      levelProgressPercent,
      addXP,
      addGold,
      reduceHP,
      restoreHP,
    }
  },
  {
    persist: { key: 'carbon-user', storage: localStorage },
  }
)
