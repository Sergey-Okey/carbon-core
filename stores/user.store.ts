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
    const coins = ref<number>(100)
    const leaguePoints = ref<number>(0)

    const profile = ref({
      name: '',
      bio: '',
      email: '',
      avatar: '',
    })

    const level = computed(() => calculateLevel(totalXP.value))
    const displayName = computed(
      () => profile.value.name || profile.value.email || 'COF User'
    )
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
      coins.value += amount
    }

    function reduceLeaguePoints(amount: number) {
      leaguePoints.value = Math.max(0, leaguePoints.value - amount)
    }

    function updateProfile(newProfile: Partial<typeof profile.value>) {
      profile.value = { ...profile.value, ...newProfile }
    }

    function setProfileFromAuth(authProfile: Partial<typeof profile.value>) {
      profile.value = {
        ...profile.value,
        name: authProfile.name ?? profile.value.name,
        bio: authProfile.bio ?? profile.value.bio,
        email: authProfile.email ?? profile.value.email,
        avatar: authProfile.avatar ?? profile.value.avatar,
      }
    }

    function resetProfile() {
      profile.value = {
        name: '',
        bio: '',
        email: '',
        avatar: '',
      }
    }

    return {
      totalXP,
      coins,
      leaguePoints,
      profile,
      displayName,
      level,
      currentXP,
      neededXPForNextLevel,
      levelProgressPercent,
      league,
      addXP,
      addCoins,
      reduceLeaguePoints,
      updateProfile,
      setProfileFromAuth,
      resetProfile,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-user', storage: localStorage }
      : undefined,
  }
)
