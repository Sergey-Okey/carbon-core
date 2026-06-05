<template>
  <header ref="headerRoot" class="header">
    <div class="brand">
      <img class="brand-mark" src="/favicon.svg" alt="" aria-hidden="true" />
      <div class="brand-text">
        <span class="logo-text">CORE OF LIFE</span>
        <span class="logo-icon">COF</span>
      </div>
    </div>

    <div class="section-title" aria-live="polite">
      {{ currentSectionTitle }}
    </div>

    <div class="actions">
      <button
        class="action-btn"
        type="button"
        aria-label="Открыть обучение"
        data-tooltip="Обучение"
        data-tooltip-position="bottom"
        @click="openOnboarding"
      >
        <HelpCircle :size="20" />
      </button>
      <NotificationCenter />
      <button
        class="profile-btn"
        type="button"
        aria-label="Открыть профиль"
        data-tooltip="Профиль"
        data-tooltip-position="bottom"
        @click="toggleProfilePanel"
      >
        <div v-if="userStore.profile.avatar" class="avatar-small">
          <img :src="userStore.profile.avatar" alt="" />
        </div>
        <UserCircle v-else :size="20" />
      </button>
    </div>
    <Teleport to="body">
      <Transition name="profile-panel">
        <section
          v-if="isProfileModalOpen"
          ref="profilePanel"
          class="profile-panel"
          @click.stop
        >
          <header class="profile-panel-header">
            <div class="account-preview">
              <div class="account-avatar">
                <img v-if="userStore.profile.avatar" :src="userStore.profile.avatar" alt="" />
                <UserCircle v-else :size="28" />
              </div>
              <div>
                <h3>{{ userName }}</h3>
                <span>{{ userEmail }}</span>
              </div>
            </div>
          </header>

          <div class="account-modal-actions">
            <AppButton type="button" variant="ghost" @click="openProfile">
              <UserCircle :size="16" />
              Профиль
            </AppButton>
            <AppButton type="button" variant="danger" @click="logout">
              <LogOut :size="16" />
              Выйти
            </AppButton>
          </div>
        </section>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { HelpCircle, LogOut, UserCircle } from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import NotificationCenter from '~/components/base/NotificationCenter.vue'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth.store'
import { useUserStore } from '~/stores/user.store'
import { useUIStore, type NavSection } from '~/stores/ui.store'
import { useGuidedTourStore } from '~/stores/guidedTour.store'

const authStore = useAuthStore()
const userStore = useUserStore()
const uiStore = useUIStore()
const guidedTour = useGuidedTourStore()
const route = useRoute()
const { addNotification } = useNotification()
const isProfileModalOpen = ref(false)
const headerRoot = ref<HTMLElement | null>(null)
const profilePanel = ref<HTMLElement | null>(null)

const sectionTitles: Record<NavSection, string> = {
  board: 'Доска',
  tasks: 'Задачи',
  shop: 'Фокус',
  analytics: 'Аналитика',
  settings: 'Настройки',
}

const currentSectionTitle = computed(() => sectionTitles[uiStore.activeNav])
const userName = computed(() => userStore.displayName || 'COF User')
const userEmail = computed(
  () => userStore.profile.email || authStore.currentUser?.email || 'Локальный профиль'
)

function openProfile() {
  isProfileModalOpen.value = false
  navigateTo('/profile')
}

async function openOnboarding() {
  isProfileModalOpen.value = false
  window.dispatchEvent(new CustomEvent('cof:close-notifications'))
  if (route.path !== '/') {
    await navigateTo('/')
  }
  guidedTour.start(true)
}

function toggleProfilePanel() {
  isProfileModalOpen.value = !isProfileModalOpen.value
  if (isProfileModalOpen.value) {
    window.dispatchEvent(new CustomEvent('cof:close-notifications'))
  }
}

function logout() {
  isProfileModalOpen.value = false
  authStore.logout()
  addNotification({ type: 'info', message: 'Вы вышли из аккаунта' })
  navigateTo('/auth')
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Node
  if (!headerRoot.value?.contains(target) && !profilePanel.value?.contains(target)) {
    isProfileModalOpen.value = false
  }
}

function closeProfilePanel() {
  isProfileModalOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('cof:close-profile-panel', closeProfilePanel)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('cof:close-profile-panel', closeProfilePanel)
})
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 3000;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  margin: 12px 12px 4px;
  padding: 8px 14px;
  border-radius: var(--border-radius-lg);
  @include glass;
  background: transparent;
  border: var(--ui-border);
  transition:
    background var(--transition-standard),
    opacity var(--transition-standard);

  @include mobile {
    position: fixed;
    left: 0;
    right: 0;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    margin: 0;
    padding: calc(env(safe-area-inset-top, 0px) + 8px) 12px 8px;
    border: none;
    border-bottom: var(--ui-border);
    border-radius: 0;
  }
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand-mark {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border: none;
  border-radius: var(--border-radius-md);
  background: transparent;

  @include mobile {
    width: 30px;
    height: 30px;
    border-radius: var(--border-radius-pill);
  }
}

.brand-text {
  min-width: 0;
  color: var(--text);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0;

  .logo-text {
    display: inline;
  }

  .logo-icon {
    display: none;
  }

  @include mobile {
    .logo-text {
      display: none;
    }

    .logo-icon {
      display: inline;
      font-size: 0.95rem;
      font-weight: 700;
    }
  }
}

.section-title {
  justify-self: center;
  max-width: min(320px, 40vw);
  overflow: hidden;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;

  @include mobile {
    display: none;
  }
}

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  min-width: 0;

  @include mobile {
    gap: 4px;
  }
}

.action-btn,
.profile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  border: none;
  border-radius: var(--border-radius-md);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--text);
  }

  &:active {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--accent) 18%, transparent);
    outline-offset: 2px;
  }

  @include mobile {
    width: 44px;
    height: 44px;
    border-radius: var(--border-radius-md);
  }
}

.actions :deep(.notification-trigger) {
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  min-height: var(--control-icon-size);
  padding: 0;
  border: none;
  border-radius: var(--border-radius-md);
  background: transparent;
  color: var(--dim);

  &:hover,
  &:focus-visible {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--text);
  }

  &:active {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }

  @include mobile {
    width: 44px;
    height: 44px;
    min-height: 44px;
  }
}

.avatar-small {
  width: 28px;
  height: 28px;
  overflow: hidden;
  border: none;
  border-radius: var(--border-radius-pill);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.account-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.profile-panel {
  @include glass;
  position: fixed;
  top: 72px;
  right: 12px;
  z-index: 4300;
  width: min(320px, calc(100vw - 24px));
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background: transparent;
  color: var(--text);
}

.profile-panel-header {
  padding: 14px;
  border-bottom: var(--ui-border);
}

.account-avatar {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: var(--border-radius-md);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  color: var(--text);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.account-preview h3,
.account-preview span {
  display: block;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-preview h3 {
  color: var(--text);
  font-size: 0.98rem;
  font-weight: 700;
}

.account-preview span {
  margin-top: 4px;
  color: var(--dim);
  font-size: 0.84rem;
}

.account-modal-actions {
  display: grid;
  gap: 6px;
  padding: 10px;

  :deep(.app-button) {
    justify-content: flex-start;
  }
}

.profile-panel-enter-active,
.profile-panel-leave-active {
  transition:
    opacity var(--transition-standard),
    transform var(--transition-standard);
}

.profile-panel-enter-from,
.profile-panel-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 640px) {
  .profile-panel {
    top: 70px;
    left: 12px;
    right: 12px;
    width: auto;
  }
}
</style>
