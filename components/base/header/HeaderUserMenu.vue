<template>
  <div class="header-user-menu">
    <button
      class="profile-btn"
      type="button"
      aria-label="Открыть профиль"
      data-tooltip="Профиль"
      data-tooltip-position="bottom"
      :aria-expanded="open"
      @click="emit('toggle')"
    >
      <div v-if="avatar" class="avatar-small">
        <img :src="avatar" alt="" />
      </div>
      <UserCircle v-else :size="20" />
    </button>

    <Teleport to="body">
      <Transition name="profile-panel">
        <section
          v-if="open"
          ref="panelRef"
          class="profile-panel"
          @click.stop
        >
          <header class="profile-panel-header">
            <div class="account-preview">
              <div class="account-avatar">
                <img v-if="avatar" :src="avatar" alt="" />
                <UserCircle v-else :size="28" />
              </div>
              <div>
                <h3>{{ name }}</h3>
                <span>{{ email }}</span>
              </div>
            </div>
          </header>

          <div class="account-modal-actions">
            <AppButton type="button" variant="ghost" @click="emit('open-profile')">
              <UserCircle :size="16" />
              Профиль
            </AppButton>
            <AppButton type="button" variant="danger" @click="emit('logout')">
              <LogOut :size="16" />
              Выйти
            </AppButton>
          </div>
        </section>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LogOut, UserCircle } from 'lucide-vue-next'
import AppButton from '~/components/ui/primitives/AppButton.vue'

defineProps<{
  open: boolean
  name: string
  email: string
  avatar?: string
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'open-profile'): void
  (e: 'logout'): void
}>()

const panelRef = ref<HTMLElement | null>(null)

defineExpose({ panelRef })
</script>

<style scoped lang="scss">
.header-user-menu {
  display: inline-flex;
}

.profile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: color-mix(in srgb, var(--color-accent) 8%, transparent);
      color: var(--color-text-primary);
    }
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 2px;
  }

  @include mobile {
    width: var(--space-11);
    height: var(--space-11);
  }
}

.avatar-small {
  width: 28px;
  height: 28px;
  overflow: hidden;
  border-radius: var(--radius-full);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.profile-panel {
  @include glass;
  position: fixed;
  inset-block-start: calc(72px + env(safe-area-inset-top, 0px));
  inset-inline-end: max(var(--space-3), env(safe-area-inset-right, 0px));
  z-index: var(--z-dropdown);
  inline-size: min(320px, calc(100dvw - var(--space-6) - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)));
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-text-primary);
  box-shadow: var(--shadow-md);
}

.profile-panel-header {
  padding: var(--space-3);
  border-bottom: var(--ui-border);
}

.account-preview {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.account-avatar {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text-primary);

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
  color: var(--color-text-primary);
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
}

.account-preview span {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.account-modal-actions {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-2);

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
  transform: translateY(calc(var(--space-1) * -1 - 2px));
}

@media (max-width: 640px) {
  .profile-panel {
    inset-block-start: calc(70px + env(safe-area-inset-top, 0px));
    inset-inline-start: max(var(--space-3), env(safe-area-inset-left, 0px));
    inset-inline-end: max(var(--space-3), env(safe-area-inset-right, 0px));
    inline-size: auto;
  }
}
</style>
