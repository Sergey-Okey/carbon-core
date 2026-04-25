import { ref } from 'vue'
import { useSettingsStore } from '~/stores/settings.store'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface NotificationAction {
  label: string
  handler: () => void
}

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
  action?: NotificationAction
}

const notifications = ref<Notification[]>([])

export function useNotification() {
  const settingsStore = useSettingsStore()

  function addNotification(notification: Omit<Notification, 'id'>) {
    if (!settingsStore.notificationsEnabled) return

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 4000,
    }
    notifications.value.push(newNotification)

    if (settingsStore.soundEnabled) {
      playNotificationSound(notification.type)
    }

    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index !== -1) notifications.value.splice(index, 1)
  }

  return {
    notifications,
    addNotification,
    removeNotification,
  }
}

function playNotificationSound(type: NotificationType) {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const freqs: Record<NotificationType, number> = {
      success: 880,
      error: 220,
      warning: 440,
      info: 660,
    }
    osc.frequency.value = freqs[type] || 660
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  } catch {
  }
}
