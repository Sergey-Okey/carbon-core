import { useUserStore } from '~/stores/user.store'
import { computed } from 'vue'

export function useLevel() {
  const userStore = useUserStore()
  const level = computed(() => userStore.level)
  const progressPercent = computed(() => userStore.levelProgressPercent)
  return { level, progressPercent }
}
