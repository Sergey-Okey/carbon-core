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
    const coins = ref<number>(100) // ← переименовано
    const leaguePoints = ref<number>(0)

    const profile = ref({
      name: '',
      bio: '',
      email: '',
      avatar: '',
    })

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

    const league = computed(() => {
      if (leaguePoints.value < 1000) return 'Бронза'
      if (leaguePoints.value < 3000) return 'Серебро'
      if (leaguePoints.value < 6000) return 'Золото'
      return 'Платина'
    })

    function addXP(amount: number) {
      totalXP.value += amount
      leaguePoints.value += amount * 0.5
    }

    function addCoins(amount: number) {
      // ← переименовано
      coins.value += amount
    }

    function reduceLeaguePoints(amount: number) {
      leaguePoints.value = Math.max(0, leaguePoints.value - amount)
    }

    function updateProfile(newProfile: Partial<typeof profile.value>) {
      profile.value = { ...profile.value, ...newProfile }
    }

    return {
      totalXP,
      coins,
      leaguePoints,
      profile,
      level,
      currentXP,
      neededXPForNextLevel,
      levelProgressPercent,
      league,
      addXP,
      addCoins,
      reduceLeaguePoints,
      updateProfile,
    }
  },
  {
    persist: { key: 'carbon-user', storage: localStorage },
  }
)
