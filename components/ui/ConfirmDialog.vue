<template>
  <AppModal
    v-if="confirmState.state.value.isOpen"
    title="Подтверждение"
    size="sm"
    :z-index="2200"
    @close="confirmState.handleCancel"
  >
    <p class="confirm-message">{{ confirmState.state.value.message }}</p>

    <template #footer>
      <AppButton variant="secondary" @click="confirmState.handleCancel">
        Отмена
      </AppButton>
      <AppButton variant="danger" @click="confirmState.handleConfirm">
        Удалить
      </AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { useConfirm } from '~/composables/useConfirm'
import AppButton from '~/components/ui/AppButton.vue'
import AppModal from '~/components/ui/AppModal.vue'

const confirmState = useConfirm()
</script>

<style scoped lang="scss">
.confirm-message {
  color: var(--accent);
  font-size: 1rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
</style>
