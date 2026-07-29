<template>
  <Teleport to="body">
    <Transition name="modal-fade" appear>
      <div
        class="app-modal-overlay"
        :class="{ 'form-sheet-overlay': asForm }"
        :style="{ '--modal-z-index': resolvedZIndex }"
        role="presentation"
        @click.self="handleBackdrop"
      >
        <Transition name="modal-panel" appear>
          <component
            :is="asForm ? 'form' : 'div'"
            class="app-modal"
            :class="[`size-${size}`, { 'allow-overflow': allowOverflow, 'is-form-sheet': asForm }]"
            role="dialog"
            aria-modal="true"
            :aria-label="title"
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
                :aria-label="closeTitle"
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
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import AppButton from '~/components/ui/primitives/AppButton.vue'

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
    zIndex: undefined,
    allowOverflow: false,
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
}>()

const resolvedZIndex = computed(() => props.zIndex ?? 'var(--z-modal)')

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
  padding: max(var(--space-4), env(safe-area-inset-top, 0px))
    max(var(--space-4), env(safe-area-inset-right, 0px))
    max(var(--space-4), env(safe-area-inset-bottom, 0px))
    max(var(--space-4), env(safe-area-inset-left, 0px));
  overflow: hidden;
  background: color-mix(in srgb, var(--color-bg) 54%, transparent);
  backdrop-filter: var(--glass-strong-filter);
  -webkit-backdrop-filter: var(--glass-strong-filter);
}

.app-modal {
  @include surface-panel;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(100%, 520px);
  max-height: min(calc(100dvh - var(--space-8)), 760px);
  min-height: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);

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
  min-height: calc(var(--space-12) + var(--space-3));
  padding: var(--space-3) var(--panel-padding);
}

.title-block {
  min-width: 0;

  h3 {
    margin: var(--space-1) 0 0;
    color: var(--color-text-primary);
    font-size: var(--text-md);
    font-weight: var(--weight-semibold);
    line-height: var(--leading-tight);
    word-break: break-word;
  }
}

.modal-kicker {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.app-modal-body {
  min-height: 0;
  padding: var(--panel-padding);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  overflow-y: auto;

  &.allow-overflow {
    overflow: visible;
  }

  &::-webkit-scrollbar {
    width: var(--space-1);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--ui-border-color);
    border-radius: var(--radius-sm);
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
  transform: translateY(var(--space-2));
}

@media (max-width: 640px) {
  .app-modal-overlay {
    padding: max(var(--space-2), env(safe-area-inset-top, 0px))
      max(var(--space-2), env(safe-area-inset-right, 0px))
      max(var(--space-2), env(safe-area-inset-bottom, 0px))
      max(var(--space-2), env(safe-area-inset-left, 0px));
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .app-modal-overlay.form-sheet-overlay {
    align-items: flex-end;
    padding: max(var(--space-2), env(safe-area-inset-top, 0px)) 0 0;
  }

  .app-modal.is-form-sheet {
    inline-size: 100%;
    max-inline-size: 560px;
    max-block-size: min(86dvh, 720px);
    border: var(--ui-border);
    border-bottom: none;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    transform-origin: bottom center;
    box-shadow: var(--shadow-lg);

    &.allow-overflow {
      overflow: hidden;
    }
  }

  .app-modal-header,
  .app-modal-footer {
    padding: var(--space-3);
  }

  .app-modal.is-form-sheet .app-modal-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .app-modal-body {
    padding: var(--space-3);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    &.allow-overflow {
      overflow-y: auto;
      overflow-x: visible;
    }
  }

  .app-modal.is-form-sheet.modal-panel-enter-from,
  .app-modal.is-form-sheet.modal-panel-leave-to {
    transform: translateY(100%);
  }
}
</style>
