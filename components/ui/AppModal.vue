<template>
  <Teleport to="body">
    <Transition name="modal-fade" appear>
      <div
        class="app-modal-overlay"
        :style="{ '--modal-z-index': zIndex }"
        @click.self="handleBackdrop"
      >
        <Transition name="modal-panel" appear>
          <component
            :is="asForm ? 'form' : 'div'"
            class="app-modal"
            :class="[`size-${size}`, { 'allow-overflow': allowOverflow }]"
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
  padding: 16px;
  background: color-mix(in srgb, var(--bg) 54%, transparent);
  backdrop-filter: var(--glass-strong-filter);
  -webkit-backdrop-filter: var(--glass-strong-filter);
}

.app-modal {
  @include glass;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(100%, 520px);
  max-height: min(88dvh, 760px);
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
    align-items: center;
    padding: 10px;
  }

  .app-modal {
    width: calc(100vw - 20px);
    max-height: calc(100dvh - 20px);
  }

  .app-modal-header,
  .app-modal-footer {
    padding: 14px;
  }

  .app-modal-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .app-modal-body {
    padding: 14px;
  }
}
</style>
