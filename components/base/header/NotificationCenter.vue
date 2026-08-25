<template>
  <div ref="root" class="notification-center">
    <AppButton
      class="notification-trigger"
      variant="ghost"
      icon-only
      :aria-label="triggerTitle"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      @click.stop="togglePanel"
    >
      <Bell :size="20" />
      <span v-if="unreadCount" class="badge" aria-hidden="true">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </AppButton>

    <Teleport to="body">
      <Transition name="sheet-backdrop">
        <button
          v-if="isOpen"
          type="button"
          class="sheet-backdrop"
          aria-label="Закрыть уведомления"
          @click="closePanel"
        />
      </Transition>

      <Transition name="notification-panel">
        <section
          v-if="isOpen"
          ref="panel"
          class="notification-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Уведомления"
          @click.stop
          @keydown.esc.prevent="closePanel"
        >
          <div class="sheet-handle" aria-hidden="true" />

          <div v-if="totalCount" class="panel-toolbar">
            <AppButton
              variant="ghost"
              size="sm"
              @click="clearNotificationHistory"
            >
              Очистить всё
            </AppButton>
          </div>

          <div v-if="totalCount" class="history-list" role="list">
            <article
              v-for="item in notificationHistory"
              :key="item.id"
              class="history-item"
              :class="[item.type, { unread: item.read === false }]"
              role="listitem"
            >
              <span class="indicator" aria-hidden="true" />
              <div class="history-copy">
                <div class="history-meta">
                  <span class="type-label">{{ typeLabel(item.type) }}</span>
                  <span class="meta-dot" aria-hidden="true">·</span>
                  <span class="category-label">{{ categoryLabel(item.category) }}</span>
                </div>
                <p v-if="item.title" class="history-title">{{ item.title }}</p>
                <p class="history-message">{{ item.message }}</p>
                <time class="history-time" :datetime="item.createdAt">
                  {{ formatRelativeRu(item.createdAt) }}
                </time>
              </div>
              <AppButton
                variant="ghost"
                icon-only
                aria-label="Удалить уведомление"
                @click="removeHistoryItem(item.id)"
              >
                <Trash2 :size="16" />
              </AppButton>
            </article>
          </div>

          <EmptyState
            v-else
            size="sm"
            :icon="BellOff"
            description="Пока нет уведомлений"
          />
        </section>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Bell, BellOff, Trash2 } from 'lucide-vue-next'
import {
  useNotification,
  type NotificationCategory,
  type NotificationType,
} from '~/composables/useNotification'
import { formatNotificationCountRu } from '~/utils/pluralRu'

const {
  notificationHistory,
  unreadCount,
  removeHistoryItem,
  clearNotificationHistory,
  markAllRead,
} = useNotification()

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})
const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)

const totalCount = computed(() => notificationHistory.value.length)

const triggerTitle = computed(() => {
  if (!unreadCount.value) {
    return totalCount.value
      ? `Уведомления · ${formatNotificationCountRu(totalCount.value)}`
      : 'Уведомления'
  }
  return `Уведомления · ${formatNotificationCountRu(unreadCount.value)} непрочит.`
})

function typeLabel(type: NotificationType) {
  switch (type) {
    case 'success':
      return 'Успех'
    case 'warning':
      return 'Внимание'
    case 'error':
      return 'Ошибка'
    default:
      return 'Инфо'
  }
}

function categoryLabel(category: NotificationCategory) {
  return category === 'user' ? 'Личные' : 'Система'
}

function formatRelativeRu(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 45) return 'только что'
  if (diffMin < 60) {
    return `${diffMin} ${pluralMin(diffMin)} назад`
  }

  const time = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startThat = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayDiff = Math.round((startToday.getTime() - startThat.getTime()) / 86400000)

  if (dayDiff === 0) return `сегодня ${time}`
  if (dayDiff === 1) return `вчера ${time}`
  if (diffHour < 48) return `${dayDiff} дн. назад`

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function pluralMin(n: number) {
  const abs = Math.abs(n) % 100
  const n1 = abs % 10
  if (abs > 10 && abs < 20) return 'мин.'
  if (n1 === 1) return 'минуту'
  if (n1 > 1 && n1 < 5) return 'минуты'
  return 'минут'
}

function isMobileViewport() {
  return import.meta.client && window.matchMedia('(max-width: 767px)').matches
}

function syncBodyLock(locked: boolean) {
  if (!import.meta.client) return
  document.body.style.overflow = locked && isMobileViewport() ? 'hidden' : ''
}

function togglePanel() {
  const next = !isOpen.value
  isOpen.value = next
  if (next) markAllRead()
}

function closePanel() {
  isOpen.value = false
}

function handleDocumentClick(event: MouseEvent) {
  if (!isOpen.value || isMobileViewport()) return
  const target = event.target as Node
  if (!root.value?.contains(target) && !panel.value?.contains(target)) {
    closePanel()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) closePanel()
}

watch(isOpen, (open) => {
  syncBodyLock(open)
})

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  syncBodyLock(false)
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.notification-center {
  position: relative;
  display: inline-flex;
}

.notification-trigger {
  position: relative;
}

.badge {
  position: absolute;
  inset-block-start: -2px;
  inset-inline-end: -2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 16px;
  block-size: 16px;
  padding-inline: 4px;
  border: var(--ui-border);
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: var(--color-bg, var(--bg));
  font-size: 0.64rem;
  font-weight: var(--weight-bold);
  line-height: 1;
}

.sheet-backdrop {
  display: none;
}

.sheet-handle {
  display: none;
}

.notification-panel {
  @include glass;
  position: fixed;
  inset-block-start: calc(72px + env(safe-area-inset-top, 0px));
  inset-inline-end: max(var(--space-3), env(safe-area-inset-right, 0px));
  z-index: var(--z-dropdown);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  inline-size: min(360px, calc(100dvw - var(--space-6) - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)));
  max-block-size: min(520px, calc(100dvh - 88px - env(safe-area-inset-bottom, 0px)));
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-text-primary);
  box-shadow: none;
}

.panel-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: var(--space-2) var(--space-3) 0;
}

.history-list {
  display: grid;
  align-content: start;
  max-block-size: 360px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.history-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--space-2);
  padding: var(--space-3);
  border-bottom: var(--ui-border);

  &:last-child {
    border-bottom: none;
  }

  &.unread {
    background: color-mix(in srgb, var(--color-accent) 6%, transparent);
  }
}

.indicator {
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: var(--radius-full);
  background: var(--color-accent, var(--accent));
}

.success .indicator {
  background: var(--success);
}

.warning .indicator {
  background: var(--warning);
}

.error .indicator {
  background: var(--error);
}

.info .indicator {
  background: var(--color-accent, var(--accent));
}

.history-copy {
  display: grid;
  gap: var(--space-1);
  min-inline-size: 0;
}

.history-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  line-height: 1.2;
}

.type-label {
  font-weight: var(--weight-semibold);
  color: var(--color-text-secondary);
}

.meta-dot {
  opacity: 0.55;
}

.history-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.history-message {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  line-height: 1.45;
  overflow-wrap: break-word;
  white-space: pre-line;
}

.history-time {
  color: var(--color-text-muted, var(--dim));
  font-size: var(--text-xs);
  line-height: 1.2;
}

:deep(.empty-state) {
  margin: var(--space-2);
  border: none;
  box-shadow: none;
  background: transparent;
}

.notification-panel-enter-active,
.notification-panel-leave-active,
.sheet-backdrop-enter-active,
.sheet-backdrop-leave-active {
  transition:
    opacity var(--transition-emphasized),
    transform var(--transition-emphasized);
}

.notification-panel-enter-from,
.notification-panel-leave-to {
  opacity: 0;
  transform: translateY(-18px);
}

.sheet-backdrop-enter-from,
.sheet-backdrop-leave-to {
  opacity: 0;
}

@include mobile {
  .sheet-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: calc(var(--z-modal) - 1);
    margin: 0;
    padding: 0;
    border: none;
    background: color-mix(in srgb, var(--color-bg) 48%, transparent);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .sheet-handle {
    display: none;
  }

  .notification-panel {
    inset-block-start: calc(
      env(safe-area-inset-top, 0px) + var(--space-2) + var(--space-11) + var(--space-2) +
        var(--space-2)
    );
    inset-block-end: auto;
    inset-inline-start: max(var(--space-3), env(safe-area-inset-left, 0px));
    inset-inline-end: max(var(--space-3), env(safe-area-inset-right, 0px));
    z-index: var(--z-modal);
    inline-size: auto;
    max-inline-size: none;
    max-block-size: min(
      78dvh,
      calc(100dvh - env(safe-area-inset-top, 0px) - var(--space-11) - var(--space-8) - 72px)
    );
    padding-block-end: var(--space-2);
    border: var(--ui-border);
    border-radius: var(--radius-lg);
    background: transparent;
    backdrop-filter: var(--glass-strong-filter);
    -webkit-backdrop-filter: var(--glass-strong-filter);
    box-shadow: none !important;
    filter: none;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .panel-toolbar {
    padding: var(--space-3) var(--space-4) 0;
  }

  .history-list {
    max-block-size: none;
    min-block-size: 0;
  }
}
</style>
