<template>
  <header class="header">
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
        title="Обучение"
        aria-label="Открыть обучение"
        @click="openOnboarding"
      >
        <HelpCircle :size="20" />
      </button>
      <NotificationCenter />
      <button
        class="profile-btn"
        type="button"
        title="Профиль"
        aria-label="Открыть профиль"
        @click="openProfile"
      >
        <div v-if="userStore.profile.avatar" class="avatar-small">
          <img :src="userStore.profile.avatar" alt="" />
        </div>
        <UserCircle v-else :size="20" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { HelpCircle, UserCircle } from 'lucide-vue-next'
import NotificationCenter from '~/components/base/NotificationCenter.vue'
import { useUserStore } from '~/stores/user.store'
import { useUIStore, type NavSection } from '~/stores/ui.store'

const userStore = useUserStore()
const uiStore = useUIStore()

const sectionTitles: Record<NavSection, string> = {
  board: 'Доска',
  tasks: 'Задачи',
  shop: 'Магазин',
  analytics: 'Аналитика',
  settings: 'Настройки',
}

const currentSectionTitle = computed(() => sectionTitles[uiStore.activeNav])

function openProfile() {
  navigateTo('/profile')
}

function openOnboarding() {
  navigateTo('/onboarding')
}
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 50;
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
  box-shadow: none;
  transition:
    background var(--transition-standard),
    opacity var(--transition-standard);

  @include mobile {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    margin: 8px 8px 0;
    padding: 8px 10px;
    border-radius: var(--border-radius-pill);
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
  color: var(--accent);
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
  color: var(--accent);
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
    color var(--transition-standard),
    box-shadow var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--accent);
    transform: none;
    box-shadow: none;
  }

  &:active {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 18%, transparent);
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
  box-shadow: none;

  &:hover,
  &:focus-visible {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--accent);
    box-shadow: none;
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
</style>
