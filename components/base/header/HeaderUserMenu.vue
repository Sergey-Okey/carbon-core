<template>
  <div class="header-user-menu">
    <button
      class="profile-btn"
      type="button"
      aria-label="Открыть меню профиля"
      data-tooltip="Профиль"
      data-tooltip-position="bottom"
      :aria-expanded="open"
      aria-haspopup="dialog"
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
          role="dialog"
          aria-label="Меню профиля"
          @click.stop
        >
          <div class="panel-actions">
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
  padding: 0;
  overflow: hidden;
  border: none;
  border-radius: var(--radius-full);
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
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.profile-panel {
  @include glass;
  position: fixed;
  inset-block-start: calc(72px + env(safe-area-inset-top, 0px));
  inset-inline-end: max(var(--space-3), env(safe-area-inset-right, 0px));
  z-index: var(--z-dropdown);
  inline-size: min(220px, calc(100dvw - var(--space-6) - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)));
  padding: var(--space-2);
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-text-primary);
  box-shadow: var(--shadow-md);
}

.panel-actions {
  display: grid;
  gap: var(--space-1);
  width: 100%;

  :deep(.app-button) {
    justify-content: flex-start;
    width: 100%;
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
