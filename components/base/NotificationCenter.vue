<template>
  <div ref="root" class="notification-center">
    <AppButton
      class="notification-trigger"
      variant="ghost"
      icon-only
      title="Уведомления"
      aria-label="Открыть уведомления"
      :aria-expanded="isOpen"
      @click="togglePanel"
    >
      <Bell :size="20" />
      <span v-if="notificationHistory.length" class="badge">
        {{ notificationHistory.length > 9 ? '9+' : notificationHistory.length }}
      </span>
    </AppButton>

    <Teleport to="body">
      <Transition name="panel">
        <section v-if="isOpen" ref="panel" class="notification-panel" @click.stop>
          <header class="panel-header">
            <div>
              <h3>Уведомления</h3>
              <span>{{ historyLabel }}</span>
            </div>
            <AppButton
              v-if="notificationHistory.length"
              variant="ghost"
              size="sm"
              @click="clearNotificationHistory"
            >
              Очистить
            </AppButton>
          </header>

          <div class="notification-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              class="tab-btn"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <component :is="tab.icon" :size="16" />
              <span>{{ tab.label }}</span>
              <b>{{ tab.count }}</b>
            </button>
          </div>

          <div v-if="visibleHistory.length" class="history-list">
            <article
              v-for="item in visibleHistory"
              :key="item.id"
              class="history-item"
              :class="item.type"
            >
              <span class="indicator"></span>
              <div class="history-copy">
                <strong>{{ item.message }}</strong>
                <span>{{ formatTime(item.createdAt) }}</span>
              </div>
              <AppButton
                variant="ghost"
                icon-only
                title="Удалить уведомление"
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
            :description="emptyText"
          />
        </section>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Bell, BellOff, Shield, Trash2, UserCircle } from 'lucide-vue-next'
import AppButton from '~/components/ui/primitives/AppButton.vue'
import EmptyState from '~/components/ui/feedback/EmptyState.vue'
import { useNotification } from '~/composables/useNotification'

const {
  notificationHistory,
  removeHistoryItem,
  clearNotificationHistory,
} = useNotification()
const isOpen = ref(false)
const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const activeTab = ref<'all' | 'system' | 'user'>('all')

const systemHistory = computed(() =>
  notificationHistory.value.filter((item) => item.category === 'system')
)
const userHistory = computed(() =>
  notificationHistory.value.filter((item) => item.category === 'user')
)
const visibleHistory = computed(() => {
  if (activeTab.value === 'system') return systemHistory.value
  if (activeTab.value === 'user') return userHistory.value
  return notificationHistory.value
})
const tabs = computed(() => [
  {
    id: 'all' as const,
    label: 'Все',
    icon: Bell,
    count: notificationHistory.value.length,
  },
  {
    id: 'system' as const,
    label: 'Системные',
    icon: Shield,
    count: systemHistory.value.length,
  },
  {
    id: 'user' as const,
    label: 'Личные',
    icon: UserCircle,
    count: userHistory.value.length,
  },
])

const historyLabel = computed(() => {
  const count = notificationHistory.value.length
  if (!count) return 'Нет уведомлений'
  if (count === 1) return '1 важное событие'
  if (count < 5) return `${count} важных события`
  return `${count} важных событий`
})

const emptyText = computed(() =>
  notificationHistory.value.length
    ? 'В этом разделе пока пусто'
    : 'Пока пусто'
)

function formatTime(value?: string) {
  if (!value) return ''
  return new Date(value).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function togglePanel() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    window.dispatchEvent(new CustomEvent('cof:close-profile-panel'))
  }
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Node
  if (!root.value?.contains(target) && !panel.value?.contains(target)) {
    isOpen.value = false
  }
}

function closePanel() {
  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('cof:close-notifications', closePanel)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('cof:close-notifications', closePanel)
})
</script>

<style scoped lang="scss">
.notification-center {
  position: relative;
}

.notification-trigger {
  position: relative;
  border: var(--ui-border);
  background: transparent;

  &:focus-visible {
    background: var(--color-surface-2);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: var(--color-surface-2);
    }
  }

  @media (max-width: 767px) {
    width: 44px;
    height: 44px;
    min-height: 44px;
  }
}

.badge {
  position: absolute;
  right: -2px;
  top: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border: var(--ui-border);
  border-radius: 999px;
  background: var(--accent);
  color: var(--bg);
  font-size: 0.64rem;
  font-weight: 700;
  line-height: 14px;
}

.notification-panel {
  @include glass;
  position: fixed;
  inset-block-start: calc(72px + env(safe-area-inset-top, 0px));
  inset-inline-end: max(12px, env(safe-area-inset-right, 0px));
  z-index: var(--z-dropdown);
  inline-size: min(350px, calc(100dvw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)));
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  background: var(--glass-surface) !important;
  backdrop-filter: var(--glass-strong-filter) !important;
  -webkit-backdrop-filter: var(--glass-strong-filter) !important;
  color: var(--color-text-primary);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  border-bottom: var(--ui-border);

  h3 {
    margin: 0 0 2px;
    font-size: 0.94rem;
    font-weight: 700;
  }

  span {
    color: var(--dim);
    font-size: 0.76rem;
  }
}

.notification-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 7px 8px;
  border-bottom: var(--ui-border);
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 0;
  min-height: 32px;
  padding: 4px 7px;
  border: none;
  border-radius: var(--border-radius-pill);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  svg {
    flex: 0 0 auto;
    width: 14px;
    height: 14px;
    opacity: 0.78;
  }

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  b {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--text) 8%, transparent);
    color: var(--text);
    font-size: 0.62rem;
    font-weight: 600;
    line-height: 1;
  }

  &:hover {
    background: color-mix(in srgb, var(--text) 5%, transparent);
    color: var(--text);
  }

  &.active {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--text);
  }

  &.active:hover {
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    color: var(--text);
  }

  &.active b {
    background: var(--accent);
    color: var(--bg);
  }
}

@media (max-width: 767px) {
  .tab-btn {
    min-height: 34px;
  }
}

.history-list {
  display: grid;
  max-height: 360px;
  overflow-y: auto;
}

.history-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: var(--ui-border);

  &:last-child {
    border-bottom: none;
  }
}

.indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
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

.history-copy {
  min-width: 0;

  strong,
  span {
    display: block;
  }

  strong {
    color: var(--text);
    font-size: 0.82rem;
    font-weight: 600;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  span {
    margin-top: 2px;
    color: var(--dim);
    font-size: 0.7rem;
  }
}

.empty-state {
  margin: var(--space-2);
  border: none;
  box-shadow: none;
  background: transparent;
}

.panel-enter-active,
.panel-leave-active {
  transition:
    opacity var(--transition-standard),
    transform var(--transition-standard);
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 640px) {
  .notification-panel {
    inset-block-start: calc(66px + env(safe-area-inset-top, 0px));
    inset-inline-start: max(10px, env(safe-area-inset-left, 0px));
    inset-inline-end: max(10px, env(safe-area-inset-right, 0px));
    max-height: calc(100dvh - 82px - env(safe-area-inset-bottom, 0px));
    inline-size: auto;
    border-radius: var(--border-radius-lg);
  }

  .panel-header {
    align-items: flex-start;
    padding: 10px;

    h3 {
      font-size: 0.9rem;
    }

    span {
      font-size: 0.72rem;
    }
  }

  .notification-tabs {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    padding: 6px;
  }

  .tab-btn {
    gap: 4px;
    padding-inline: 5px;
    font-size: 0.68rem;

    span {
      max-width: 8ch;
    }

    b {
      min-width: 15px;
      height: 15px;
      padding-inline: 3px;
      font-size: 0.58rem;
    }
  }

  .history-list {
    max-height: calc(100dvh - 210px);
  }

  .history-item {
    grid-template-columns: auto minmax(0, 1fr) 34px;
    gap: 7px;
    padding: 9px;
  }
}
</style>
