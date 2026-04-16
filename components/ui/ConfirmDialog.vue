<template>
  <Teleport to="body">
    <div
      v-if="confirmState.state.value.isOpen"
      class="confirm-overlay"
      @click.self="confirmState.handleCancel"
    >
      <div class="confirm-modal">
        <p class="confirm-message">{{ confirmState.state.value.message }}</p>
        <div class="confirm-actions">
          <button class="btn-secondary" @click="confirmState.handleCancel">
            Отмена
          </button>
          <button class="btn-danger" @click="confirmState.handleConfirm">
            Удалить
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useConfirm } from '~/composables/useConfirm'
const confirmState = useConfirm()
</script>

<style scoped lang="scss">
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}
.confirm-modal {
  @include glass;
  border-radius: var(--border-radius-lg);
  padding: 24px;
  max-width: min(400px, 90vw);
  width: fit-content;
  border: 1px solid var(--border);
  color: var(--accent);
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.confirm-message {
  margin-bottom: 24px;
  font-size: 1rem;
  line-height: 1.5;
  white-space: normal;
  word-break: break-word;
}
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  button {
    padding: 10px 20px;
    border-radius: var(--border-radius-sm);
    border: none;
    cursor: pointer;
    white-space: nowrap;
  }
  .btn-secondary {
    background: transparent;
    color: var(--dim);
    &:hover {
      background: var(--surface);
    }
  }
  .btn-danger {
    background: transparent;
    color: var(--error);
    border: 1px solid var(--error);
    &:hover {
      background: var(--error);
      color: var(--bg);
    }
  }
}
</style>
