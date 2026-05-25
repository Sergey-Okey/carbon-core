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
    const themeMode = ref<'dark' | 'light' | 'system' | 'schedule'>('dark')
    const lightThemeFrom = ref<string>('08:00')
    const darkThemeFrom = ref<string>('20:00')
    const accentColor = ref<string>(ACCENT_COLORS[0].value)
    const uiDensity = ref<'comfortable' | 'compact'>('comfortable')
    const appBackgroundMode = ref<'default' | 'glass' | 'image'>('default')
    const customBackgroundImage = ref<string>('')
    const backgroundIntensity = ref<'soft' | 'normal' | 'contrast'>('normal')
    const animationsEnabled = ref<boolean>(true)
    const animationSpeed = ref<number>(1) // multiplier, 0.5 = slower, 2 = faster
    const soundEnabled = ref<boolean>(false)
    const notificationsEnabled = ref<boolean>(true)
    const toastDuration = ref<number>(4)
    const showSettingsStats = ref<boolean>(false)
    const showTopStats = ref<boolean>(true)
    const confirmDangerActions = ref<boolean>(true)
    const autoBackup = ref<boolean>(true)
    const lastBackupDate = ref<string | null>(null)
    const boardAutoFocus = ref<boolean>(true)
    const boardFocusAfterAction = ref<boolean>(true)
    const boardConfirmEdgeDelete = ref<boolean>(true)
    const boardConfirmBranchDelete = ref<boolean>(true)
    const boardLayoutDensity = ref<'compact' | 'normal' | 'wide'>('normal')
    const boardColumns = ref<number>(4)
    const boardShowNodeTypes = ref<boolean>(true)

    const ready = ref(false)

    function isLight(): boolean {
      if (!import.meta.client) return false
      return document.documentElement.classList.contains('light-theme')
    }

    function resolveTheme(mode = themeMode.value): 'dark' | 'light' {
      if (!import.meta.client) return theme.value
      if (mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
      }
      if (mode === 'schedule') {
        return isInLightSchedule() ? 'light' : 'dark'
      }
      return mode
    }

    function minutesFromTime(value: string): number {
      const [hours = '0', minutes = '0'] = value.split(':')
      return Number(hours) * 60 + Number(minutes)
    }

    function isInLightSchedule(): boolean {
      const now = new Date()
      const current = now.getHours() * 60 + now.getMinutes()
      const light = minutesFromTime(lightThemeFrom.value)
      const dark = minutesFromTime(darkThemeFrom.value)
      if (light === dark) return true
      if (light < dark) return current >= light && current < dark
      return current >= light || current < dark
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
      themeMode.value = newTheme
      theme.value = newTheme
      applyTheme(newTheme)
    }

    function setThemeMode(mode: 'dark' | 'light' | 'system' | 'schedule') {
      themeMode.value = mode
      const resolved = resolveTheme(mode)
      theme.value = resolved
      applyTheme(resolved)
    }

    function setThemeSchedule(lightFrom: string, darkFrom: string) {
      lightThemeFrom.value = lightFrom
      darkThemeFrom.value = darkFrom
      if (themeMode.value === 'schedule') setThemeMode('schedule')
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
    function setShowTopStats(val: boolean) {
      showTopStats.value = val
      applyUiPreferences()
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
    function setUiDensity(val: 'comfortable' | 'compact') {
      uiDensity.value = val
      applyUiPreferences()
    }
    function setAppBackgroundMode(val: 'default' | 'glass' | 'image') {
      appBackgroundMode.value = val
      applyUiPreferences()
    }
    function setCustomBackgroundImage(val: string) {
      customBackgroundImage.value = val
      applyUiPreferences()
    }
    function setBackgroundIntensity(val: 'soft' | 'normal' | 'contrast') {
      backgroundIntensity.value = val
      applyUiPreferences()
    }
    function setBoardAutoFocus(val: boolean) {
      boardAutoFocus.value = val
    }
    function setBoardFocusAfterAction(val: boolean) {
      boardFocusAfterAction.value = val
    }
    function setBoardConfirmEdgeDelete(val: boolean) {
      boardConfirmEdgeDelete.value = val
    }
    function setBoardConfirmBranchDelete(val: boolean) {
      boardConfirmBranchDelete.value = val
    }
    function setBoardLayoutDensity(val: 'compact' | 'normal' | 'wide') {
      boardLayoutDensity.value = val
    }
    function setBoardColumns(val: number) {
      boardColumns.value = Math.min(5, Math.max(3, Math.round(val)))
    }
    function setBoardShowNodeTypes(val: boolean) {
      boardShowNodeTypes.value = val
    }

    function applyUiPreferences() {
      if (!import.meta.client) return
      const root = document.documentElement
      root.classList.toggle('compact-ui', uiDensity.value === 'compact')
      root.classList.toggle('hide-top-stats', !showTopStats.value)
      root.dataset.backgroundMode = appBackgroundMode.value
      root.dataset.backgroundIntensity = backgroundIntensity.value
      if (appBackgroundMode.value === 'image' && customBackgroundImage.value) {
        root.style.setProperty('--custom-bg-image', `url("${customBackgroundImage.value}")`)
      } else {
        root.style.removeProperty('--custom-bg-image')
      }
    }

    function hydratePersistedSettings() {
      if (!import.meta.client) return
      try {
        const raw = localStorage.getItem('carbon-settings')
        if (!raw) return
        const saved = JSON.parse(raw)
        if (saved.theme === 'dark' || saved.theme === 'light') theme.value = saved.theme
        if (['dark', 'light', 'system', 'schedule'].includes(saved.themeMode)) {
          themeMode.value = saved.themeMode
        }
        if (typeof saved.lightThemeFrom === 'string') lightThemeFrom.value = saved.lightThemeFrom
        if (typeof saved.darkThemeFrom === 'string') darkThemeFrom.value = saved.darkThemeFrom
        if (typeof saved.accentColor === 'string') accentColor.value = saved.accentColor
        if (saved.uiDensity === 'comfortable' || saved.uiDensity === 'compact') uiDensity.value = saved.uiDensity
        if (['default', 'glass', 'image'].includes(saved.appBackgroundMode)) appBackgroundMode.value = saved.appBackgroundMode
        if (typeof saved.customBackgroundImage === 'string') customBackgroundImage.value = saved.customBackgroundImage
        if (['soft', 'normal', 'contrast'].includes(saved.backgroundIntensity)) {
          backgroundIntensity.value = saved.backgroundIntensity
        }
      } catch (error) {
        console.error('Failed to restore settings', error)
      }
    }

    function applyRuntimeSettings() {
      const resolved = resolveTheme(themeMode.value)
      theme.value = resolved
      applyTheme(resolved)
      applyAccentColor(accentColor.value)
      applyAnimations(animationsEnabled.value)
      applyUiPreferences()
    }

    async function init() {
      if (!import.meta.client) return
      const store = useSettingsStore()
      if (store.$persistedState) {
        await store.$persistedState.isReady
      }
      hydratePersistedSettings()
      applyRuntimeSettings()
      ready.value = true
    }

    init()

    return {
      theme,
      themeMode,
      lightThemeFrom,
      darkThemeFrom,
      accentColor,
      uiDensity,
      appBackgroundMode,
      customBackgroundImage,
      backgroundIntensity,
      animationsEnabled,
      animationSpeed,
      soundEnabled,
      notificationsEnabled,
      toastDuration,
      showSettingsStats,
      showTopStats,
      confirmDangerActions,
      autoBackup,
      lastBackupDate,
      boardAutoFocus,
      boardFocusAfterAction,
      boardConfirmEdgeDelete,
      boardConfirmBranchDelete,
      boardLayoutDensity,
      boardColumns,
      boardShowNodeTypes,
      ready,
      setTheme,
      setThemeMode,
      setThemeSchedule,
      setAccentColor,
      setAnimationsEnabled,
      setAnimationSpeed,
      setSoundEnabled,
      setNotificationsEnabled,
      setToastDuration,
      setShowSettingsStats,
      setShowTopStats,
      setConfirmDangerActions,
      setAutoBackup,
      recordBackup,
      setUiDensity,
      setAppBackgroundMode,
      setCustomBackgroundImage,
      setBackgroundIntensity,
      setBoardAutoFocus,
      setBoardFocusAfterAction,
      setBoardConfirmEdgeDelete,
      setBoardConfirmBranchDelete,
      setBoardLayoutDensity,
      setBoardColumns,
      setBoardShowNodeTypes,
      applyRuntimeSettings,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-settings', storage: localStorage }
      : undefined,
  }
)
