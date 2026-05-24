import { ref } from 'vue'
import { useSettingsStore } from '~/stores/settings.store'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationCategory = 'system' | 'user'

export interface NotificationAction {
  label: string
  handler: () => void
}

export interface Notification {
  id: string
  type: NotificationType
  category: NotificationCategory
  message: string
  duration?: number
  action?: NotificationAction
  createdAt?: string
}

const notifications = ref<Notification[]>([])
const notificationHistory = ref<Notification[]>([])

export function useNotification() {
  const settingsStore = useSettingsStore()

  function addNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'category'> & {
      category?: NotificationCategory
      silent?: boolean
      history?: boolean
    }
  ) {
    if (!settingsStore.notificationsEnabled) return

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5)
    const newNotification: Notification = {
      ...notification,
      id,
      category: notification.category ?? 'system',
      createdAt: new Date().toISOString(),
      duration: notification.duration ?? settingsStore.toastDuration * 1000,
    }

    const shouldSaveToHistory =
      notification.history ?? ['warning', 'error'].includes(notification.type)

    if (shouldSaveToHistory) {
      notificationHistory.value.unshift(newNotification)
      notificationHistory.value = notificationHistory.value.slice(0, 30)
    }

    if (!notification.silent) {
      notifications.value.push(newNotification)
    }

    const shouldPlaySound =
      !notification.silent &&
      settingsStore.soundEnabled &&
      ['warning', 'error'].includes(notification.type)

    if (shouldPlaySound) {
      playNotificationSound(
        notification.type,
        settingsStore.soundVolume,
        settingsStore.soundTone
      )
    }

    if (!notification.silent && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index !== -1) notifications.value.splice(index, 1)
  }

  function removeHistoryItem(id: string) {
    const index = notificationHistory.value.findIndex((n) => n.id === id)
    if (index !== -1) notificationHistory.value.splice(index, 1)
  }

  function clearNotificationHistory() {
    notificationHistory.value = []
  }

  return {
    notifications,
    notificationHistory,
    addNotification,
    removeNotification,
    removeHistoryItem,
    clearNotificationHistory,
  }
}

function playNotificationSound(
  type: NotificationType,
  volume: number,
  tone: 'soft' | 'bright'
) {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const freqs: Record<NotificationType, number> =
      tone === 'soft'
        ? {
            success: 620,
            error: 180,
            warning: 330,
            info: 480,
          }
        : {
            success: 880,
            error: 220,
            warning: 440,
            info: 660,
          }
    osc.frequency.value = freqs[type] || 660
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  } catch {
  }
}
