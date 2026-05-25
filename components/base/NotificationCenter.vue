<template>
  <div ref="root" class="notification-center">
    <AppButton
      class="notification-trigger"
      variant="ghost"
      icon-only
      title="Уведомления"
      aria-label="Открыть уведомления"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
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

          <div v-if="notificationHistory.length" class="notification-tabs">
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

          <div v-else class="empty-state">
            <BellOff :size="20" />
            <span>{{ emptyText }}</span>
          </div>
        </section>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Bell, BellOff, Shield, Trash2, UserCircle } from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import { useNotification } from '~/composables/useNotification'

const {
  notificationHistory,
  removeHistoryItem,
  clearNotificationHistory,
} = useNotification()
const isOpen = ref(false)
const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const activeTab = ref<'system' | 'user'>('system')

const systemHistory = computed(() =>
  notificationHistory.value.filter((item) => item.category === 'system')
)
const userHistory = computed(() =>
  notificationHistory.value.filter((item) => item.category === 'user')
)
const visibleHistory = computed(() =>
  activeTab.value === 'system' ? systemHistory.value : userHistory.value
)
const tabs = computed(() => [
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
  if (!count) return 'Нет важных событий'
  if (count === 1) return '1 важное событие'
  if (count < 5) return `${count} важных события`
  return `${count} важных событий`
})

const emptyText = computed(() =>
  notificationHistory.value.length
    ? 'В этом разделе пока пусто'
    : 'История пока пустая'
)

function formatTime(value?: string) {
  if (!value) return ''
  return new Date(value).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Node
  if (!root.value?.contains(target) && !panel.value?.contains(target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped lang="scss">
.notification-center {
  position: relative;
}

.notification-trigger {
  position: relative;

  @media (max-width: 767px) {
    width: 32px;
    height: 32px;
    min-height: 32px;
  }
}

.badge {
  position: absolute;
  right: -2px;
  top: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border: 1px solid var(--bg);
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
  top: 72px;
  right: 12px;
  z-index: 2500;
  width: min(380px, calc(100vw - 24px));
  overflow: hidden;
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  color: var(--accent);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  border-bottom: 1px solid var(--glass-border);

  h3 {
    margin: 0 0 2px;
    font-size: 0.98rem;
    font-weight: 700;
  }

  span {
    color: var(--dim);
    font-size: 0.82rem;
  }
}

.notification-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 10px;
  border-bottom: 1px solid var(--glass-border);
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  padding: 7px 10px;
  border: none;
  border-radius: var(--border-radius-md);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  font-size: 0.82rem;
  transition: all var(--transition-standard);

  b {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--glass-surface);
    color: var(--accent);
    font-size: 0.7rem;
    line-height: 18px;
  }

  &:hover,
  &.active {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--accent);
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
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--dim) 8%, transparent);

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
    overflow: hidden;
    color: var(--accent);
    font-size: 0.88rem;
    font-weight: 600;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    margin-top: 2px;
    color: var(--dim);
    font-size: 0.75rem;
  }
}

.empty-state {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 28px 16px;
  color: var(--dim);
  font-size: 0.88rem;
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
    top: 70px;
    left: 12px;
    right: 12px;
    width: auto;
  }
}
</style>
