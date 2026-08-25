<template>
  <AppModal
    v-if="confirmState.state.value.isOpen"
    title="Подтверждение"
    size="sm"
    @close="confirmState.handleCancel"
  >
    <p class="confirm-message">{{ confirmState.state.value.message }}</p>

    <template #footer>
      <div class="confirm-actions">
        <AppButton variant="secondary" @click="confirmState.handleCancel">
          Отмена
        </AppButton>
        <AppButton variant="danger" @click="confirmState.handleConfirm">
          Удалить
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
const confirmState = useConfirm()
</script>

<style scoped lang="scss">
.confirm-message {
  @include meta-text;
  color: var(--color-text-primary);
  overflow-wrap: break-word;
}

.confirm-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
  width: 100%;
}
</style>
