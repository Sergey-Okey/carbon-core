<template>
  <Teleport to="body">
    <Transition name="modal-fade" appear>
      <div
        class="app-modal-overlay"
        :class="{ 'form-sheet-overlay': asForm }"
        :style="{ '--modal-z-index': zIndex }"
        @click.self="handleBackdrop"
      >
        <Transition name="modal-panel" appear>
          <component
            :is="asForm ? 'form' : 'div'"
            class="app-modal"
            :class="[`size-${size}`, { 'allow-overflow': allowOverflow, 'is-form-sheet': asForm }]"
            @submit.prevent="emit('submit')"
            @keydown.stop
          >
            <header class="app-modal-header">
              <div class="title-block">
                <span v-if="kicker" class="modal-kicker">{{ kicker }}</span>
                <h3>{{ title }}</h3>
              </div>
              <AppButton
                v-if="closable"
                variant="ghost"
                icon-only
                :title="closeTitle"
                @click="emit('close')"
              >
                <X :size="20" />
              </AppButton>
            </header>

            <section class="app-modal-body" :class="{ 'allow-overflow': allowOverflow }">
              <slot />
            </section>

            <footer v-if="$slots.footer" class="app-modal-footer">
              <slot name="footer" />
            </footer>
          </component>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'

const props = withDefaults(
  defineProps<{
    title: string
    kicker?: string
    size?: 'sm' | 'md' | 'lg'
    asForm?: boolean
    closable?: boolean
    closeOnBackdrop?: boolean
    closeTitle?: string
    zIndex?: number
    allowOverflow?: boolean
  }>(),
  {
    kicker: undefined,
    size: 'md',
    asForm: false,
    closable: true,
    closeOnBackdrop: true,
    closeTitle: 'Закрыть',
    zIndex: 5000,
    allowOverflow: false,
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
}>()

function handleBackdrop() {
  if (props.closeOnBackdrop) emit('close')
}
</script>

<style scoped lang="scss">
.app-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--modal-z-index);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(16px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) max(16px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
  overflow: hidden;
  background: color-mix(in srgb, var(--bg) 54%, transparent);
  backdrop-filter: var(--glass-strong-filter);
  -webkit-backdrop-filter: var(--glass-strong-filter);
}

.app-modal {
  @include glass;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(100%, 520px);
  max-height: min(calc(100dvh - 32px), 760px);
  min-height: 0;
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  color: var(--text);

  &.allow-overflow {
    overflow: visible;
  }

  &.size-sm {
    width: min(100%, 390px);
  }

  &.size-lg {
    width: min(100%, 640px);
  }
}

.app-modal-header,
.app-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--panel-gap);
  min-height: 62px;
  padding: 14px 16px;
}

.title-block {
  min-width: 0;

  h3 {
    margin: 2px 0 0;
    color: var(--text);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.25;
    word-break: break-word;
  }
}

.modal-kicker {
  display: block;
  color: var(--dim);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.app-modal-body {
  min-height: 0;
  padding: 16px;
  color: var(--text);
  font-size: 0.92rem;
  line-height: 1.5;
  overflow-y: auto;

  &.allow-overflow {
    overflow: visible;
  }

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--ui-border-color);
    border-radius: var(--border-radius-sm);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity var(--transition-standard);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-panel-enter-active,
.modal-panel-leave-active {
  transition:
    opacity var(--transition-standard),
    transform var(--transition-standard);
}

.modal-panel-enter-from,
.modal-panel-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 640px) {
  .app-modal-overlay {
    padding: max(10px, env(safe-area-inset-top, 0px)) max(10px, env(safe-area-inset-right, 0px)) max(10px, env(safe-area-inset-bottom, 0px)) max(10px, env(safe-area-inset-left, 0px));
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .app-modal-overlay.form-sheet-overlay {
    align-items: flex-end;
  }

  .app-modal.is-form-sheet {
    inline-size: 100%;
    max-block-size: min(78dvh, 720px);
    border-radius: calc(var(--border-radius-lg) + 4px) calc(var(--border-radius-lg) + 4px) var(--border-radius-lg) var(--border-radius-lg);
    transform-origin: bottom center;

    &.allow-overflow {
      overflow: hidden;
    }
  }

  .app-modal-header,
  .app-modal-footer {
    padding: 14px;
  }

  .app-modal.is-form-sheet .app-modal-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .app-modal-body {
    padding: 14px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    &.allow-overflow {
      overflow-y: auto;
      overflow-x: visible;
    }
  }

  .app-modal.is-form-sheet.modal-panel-enter-from,
  .app-modal.is-form-sheet.modal-panel-leave-to {
    transform: translateY(22px);
  }
}
</style>
