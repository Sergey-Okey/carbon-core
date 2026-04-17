import { defineStore } from 'pinia'
import { ref } from 'vue'

export const ACCENT_COLORS = [
  { name: 'Графит', value: '#f0f0f0' },
  { name: 'Синий', value: '#3584e4' },
  { name: 'Зелёный', value: '#33d17a' },
  { name: 'Оранжевый', value: '#ff7800' },
  { name: 'Фиолетовый', value: '#9141ac' },
  { name: 'Красный', value: '#e01b24' },
  { name: 'Бирюзовый', value: '#1c71d8' },
]

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const theme = ref<'dark' | 'light'>('dark')
    const accentColor = ref<string>(ACCENT_COLORS[0].value)
    const animationsEnabled = ref<boolean>(true)
    const soundEnabled = ref<boolean>(false)
    const notificationsEnabled = ref<boolean>(true)
    const autoBackup = ref<boolean>(true)
    const lastBackupDate = ref<string | null>(null)

    const ready = ref(false)

    function applyTheme(newTheme: 'dark' | 'light') {
      if (import.meta.client) {
        document.documentElement.classList.toggle(
          'light-theme',
          newTheme === 'light'
        )
      }
    }

    function setTheme(newTheme: 'dark' | 'light') {
      theme.value = newTheme
      applyTheme(newTheme)
    }

    function applyAccentColor(color: string) {
      if (import.meta.client) {
        document.documentElement.style.setProperty('--accent', color)
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)
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
        document.documentElement.style.setProperty(
          '--transition-standard',
          enabled ? '0.3s cubic-bezier(0.2, 0, 0, 1)' : '0s'
        )
      }
    }

    function setAnimationsEnabled(val: boolean) {
      animationsEnabled.value = val
      applyAnimations(val)
    }

    function setSoundEnabled(val: boolean) {
      soundEnabled.value = val
    }
    function setNotificationsEnabled(val: boolean) {
      notificationsEnabled.value = val
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
      soundEnabled,
      notificationsEnabled,
      autoBackup,
      lastBackupDate,
      ready,
      setTheme,
      setAccentColor,
      setAnimationsEnabled,
      setSoundEnabled,
      setNotificationsEnabled,
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
