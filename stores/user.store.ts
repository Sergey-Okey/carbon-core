import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  calculateLevel,
  calculateTasksForNextLevel,
} from '~/utils/levelCalculator'

export const useUserStore = defineStore(
  'user',
  () => {
    const totalXP = ref<number>(0)
    const coins = ref<number>(100)
    const leaguePoints = ref<number>(0)
    const completedTasksCount = ref<number>(0)
    const xpHistory = ref<{ date: string; xp: number }[]>([])
    const coinsHistory = ref<{ date: string; coins: number }[]>([])

    const profile = ref({
      name: '',
      bio: '',
      email: '',
      avatar: '',
    })

    const level = computed(() => calculateLevel(completedTasksCount.value))
    const displayName = computed(
      () => profile.value.name || profile.value.email || 'COF User'
    )
    const tasksForNextLevel = computed(() =>
      calculateTasksForNextLevel(level.value, league.value)
    )
    const currentProgress = computed(() => {
      // Сколько задач выполнено на текущем уровне
      const tasksInCurrentLevel =
        completedTasksCount.value % tasksForNextLevel.value
      return tasksInCurrentLevel
    })
    const levelProgressPercent = computed(() => {
      const tasksInCurrentLevel =
        completedTasksCount.value % tasksForNextLevel.value
      return (tasksInCurrentLevel / tasksForNextLevel.value) * 100
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

      // Записать в историю
      const today = new Date().toISOString().split('T')[0]
      const existing = xpHistory.value.find((h) => h.date === today)
      if (existing) {
        existing.xp += amount
      } else {
        xpHistory.value.push({ date: today, xp: amount })
      }
      // Ограничить историю последними 30 днями
      xpHistory.value = xpHistory.value.slice(-30)
    }

    function incrementCompletedTasks(amount: number = 1) {
      completedTasksCount.value += amount
    }

    function getMilestoneBonus(requiredXP: number): number {
      // Бонус за завершение узла - возвращается как дополнительный XP
      return Math.floor(requiredXP * 0.5)
    }

    function addCoins(amount: number) {
      coins.value += amount

      // Записать в историю
      const today = new Date().toISOString().split('T')[0]
      const existing = coinsHistory.value.find((h) => h.date === today)
      if (existing) {
        existing.coins += amount
      } else {
        coinsHistory.value.push({ date: today, coins: amount })
      }
      coinsHistory.value = coinsHistory.value.slice(-30)
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
      completedTasksCount,
      xpHistory,
      coinsHistory,
      profile,
      displayName,
      level,
      currentProgress,
      tasksForNextLevel,
      levelProgressPercent,
      league,
      addXP,
      addCoins,
      incrementCompletedTasks,
      getMilestoneBonus,
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
