import { defineStore } from 'pinia'
import { ref } from 'vue'

export const ACCENT_COLORS = [
  { name: 'Графит', value: '#d6d6d6' },
  { name: 'Синий', value: '#3584e4' },
  { name: 'Зелёный', value: '#33d17a' },
  { name: 'Оранжевый', value: '#ff7800' },
  { name: 'Фиолетовый', value: '#9141ac' },
  { name: 'Красный', value: '#e01b24' },
  { name: 'Бирюзовый', value: '#1c71d8' },
]

function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  )
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

function resolveAccentColor(color: string, isLightTheme: boolean): string {
  const lum = getLuminance(color)
  if (isLightTheme && lum > 0.5) return '#2b2b2b'
  return color
}

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const theme = ref<'dark' | 'light'>('dark')
    const accentColor = ref<string>(ACCENT_COLORS[0].value)
    const animationsEnabled = ref<boolean>(true)
    const animationSpeed = ref<number>(1) // multiplier, 0.5 = slower, 2 = faster
    const soundEnabled = ref<boolean>(false)
    const notificationsEnabled = ref<boolean>(true)
    const toastDuration = ref<number>(4)
    const showSettingsStats = ref<boolean>(false)
    const confirmDangerActions = ref<boolean>(true)
    const autoBackup = ref<boolean>(true)
    const lastBackupDate = ref<string | null>(null)

    const ready = ref(false)

    function isLight(): boolean {
      if (!import.meta.client) return false
      return document.documentElement.classList.contains('light-theme')
    }

    function applyTheme(newTheme: 'dark' | 'light') {
      if (import.meta.client) {
        document.documentElement.classList.toggle(
          'light-theme',
          newTheme === 'light'
        )
        applyAccentColor(accentColor.value)
      }
    }

    function setTheme(newTheme: 'dark' | 'light') {
      theme.value = newTheme
      applyTheme(newTheme)
    }

    function applyAccentColor(color: string) {
      if (import.meta.client) {
        const finalColor = resolveAccentColor(color, isLight())
        document.documentElement.style.setProperty('--accent', finalColor)
        const r = parseInt(finalColor.slice(1, 3), 16)
        const g = parseInt(finalColor.slice(3, 5), 16)
        const b = parseInt(finalColor.slice(5, 7), 16)
        document.documentElement.style.setProperty(
          '--accent-rgb',
          `${r}, ${g}, ${b}`
        )
      }
    }

    function setAccentColor(color: string) {
      accentColor.value = color
      applyAccentColor(color)
    }

    function applyAnimations(enabled: boolean) {
      if (import.meta.client) {
        const baseDuration = 0.1 // base duration in seconds
        const duration = enabled ? baseDuration / animationSpeed.value : 0
        document.documentElement.classList.toggle('no-animations', !enabled)
        document.documentElement.style.setProperty(
          '--transition-standard',
          enabled ? `${duration}s cubic-bezier(0.2, 0, 0, 1)` : '0s linear'
        )
      }
    }

    function setAnimationsEnabled(val: boolean) {
      animationsEnabled.value = val
      applyAnimations(val)
    }

    function setAnimationSpeed(val: number) {
      animationSpeed.value = val
      applyAnimations(animationsEnabled.value)
    }

    function setSoundEnabled(val: boolean) {
      soundEnabled.value = val
    }
    function setNotificationsEnabled(val: boolean) {
      notificationsEnabled.value = val
    }
    function setToastDuration(val: number) {
      toastDuration.value = Math.min(8, Math.max(2, val))
    }
    function setShowSettingsStats(val: boolean) {
      showSettingsStats.value = val
    }
    function setConfirmDangerActions(val: boolean) {
      confirmDangerActions.value = val
    }
    function setAutoBackup(val: boolean) {
      autoBackup.value = val
    }
    function recordBackup() {
      lastBackupDate.value = new Date().toISOString()
    }

    async function init() {
      if (!import.meta.client) return
      const store = useSettingsStore()
      if (store.$persistedState) {
        await store.$persistedState.isReady
      }
      applyTheme(theme.value)
      applyAccentColor(accentColor.value)
      applyAnimations(animationsEnabled.value)
      ready.value = true
    }

    init()

    return {
      theme,
      accentColor,
      animationsEnabled,
      animationSpeed,
      soundEnabled,
      notificationsEnabled,
      toastDuration,
      showSettingsStats,
      confirmDangerActions,
      autoBackup,
      lastBackupDate,
      ready,
      setTheme,
      setAccentColor,
      setAnimationsEnabled,
      setAnimationSpeed,
      setSoundEnabled,
      setNotificationsEnabled,
      setToastDuration,
      setShowSettingsStats,
      setConfirmDangerActions,
      setAutoBackup,
      recordBackup,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-settings', storage: localStorage }
      : undefined,
  }
)
