import { ref } from 'vue'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

const notifications = ref<Notification[]>([])

export function useNotification() {
  function addNotification(notification: Omit<Notification, 'id'>) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 4000,
    }
    notifications.value.push(newNotification)

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
