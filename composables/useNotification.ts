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
  source?: 'platform' | 'app'
  message: string
  duration?: number
  action?: NotificationAction
  createdAt?: string
}

const notifications = ref<Notification[]>([])
const notificationHistory = ref<Notification[]>([])

export function useNotification() {
  const settingsStore = useSettingsStore()
  const { trigger } = useFeedback()

  function addNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'category'> & {
      category?: NotificationCategory
      silent?: boolean
      history?: boolean
      important?: boolean
      source?: 'platform' | 'app'
    }
  ) {
    if (!settingsStore.notificationsEnabled) return

    const isImportant =
      notification.important ?? ['warning', 'error'].includes(notification.type)

    const category = notification.category ?? 'system'
    const isRecentDuplicate = notificationHistory.value.some(
      (item) =>
        item.message === notification.message &&
        item.category === category &&
        item.createdAt &&
        Date.now() - new Date(item.createdAt).getTime() < 5000
    )

    if (isRecentDuplicate) return

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5)
    const newNotification: Notification = {
      ...notification,
      id,
      category,
      createdAt: new Date().toISOString(),
      duration: notification.duration ?? settingsStore.toastDuration * 1000,
    }

    const shouldSaveToHistory =
      notification.source === 'platform' && (notification.history ?? isImportant)

    if (shouldSaveToHistory) {
      notificationHistory.value.unshift(newNotification)
      notificationHistory.value = notificationHistory.value.slice(0, 30)
    }

    if (!notification.silent) {
      notifications.value.push(newNotification)
    }

    if (!notification.silent && ['warning', 'error'].includes(notification.type)) {
      void trigger(notification.type === 'error' ? 'error' : 'warning')
    }

    if (!notification.silent && (newNotification.duration ?? 0) > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration ?? 0)
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
