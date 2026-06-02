<template>
  <AppModal title="Новый квест" as-form @close="emit('close')" @submit="handleSubmit">
    <div class="modal-form">
      <AppFormField label="Название">
        <AppInput v-model="form.title" required />
      </AppFormField>

      <AppFormField label="Описание">
        <AppInput v-model="form.description" placeholder="Опционально" />
      </AppFormField>

      <AppFormField label="Тип">
        <div class="radio-group">
          <label class="radio-option">
            <input type="radio" value="DAILY" v-model="form.type" />
            <span>Ежедневный</span>
          </label>
          <label class="radio-option">
            <input type="radio" value="HABIT" v-model="form.type" />
            <span>Привычка</span>
          </label>
          <label class="radio-option">
            <input type="radio" value="EPIC" v-model="form.type" />
            <span>Эпический</span>
          </label>
        </div>
      </AppFormField>

      <AppFormField label="Ветка">
        <AppSelect
          v-model="form.branchId"
          :options="branchOptions"
          :disabled="branchOptions.length === 0"
          placeholder="Сначала создайте ветку"
        />
      </AppFormField>

      <div class="form-row">
        <AppFormField label="XP награда">
          <AppInput v-model="form.xpReward" type="number" min="1" required />
        </AppFormField>

        <AppFormField label="Золото">
          <AppInput v-model="form.goldReward" type="number" min="0" />
        </AppFormField>
      </div>
    </div>

    <template #footer>
      <div class="modal-actions">
        <AppButton variant="secondary" @click="emit('close')">Отмена</AppButton>
        <AppButton
          type="submit"
          variant="primary"
          :disabled="branchOptions.length === 0"
        >
          Создать
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { Quest } from '~/types/quest.types'
import AppButton from '~/components/ui/AppButton.vue'
import AppFormField from '~/components/ui/AppFormField.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppModal from '~/components/ui/AppModal.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import { useBranchesStore } from '~/stores/branches.store'
import type { AppSelectOption } from '~/types/ui.types'
import type { QuestType, BranchId } from '~/types/quest.types'

const emit = defineEmits<{ (e: 'close'): void; (e: 'save', data: Omit<Quest, 'done' | 'createdAt' | 'id'>): void }>()

const branchesStore = useBranchesStore()
const branchOptions = computed<AppSelectOption[]>(() =>
  branchesStore.branches.map((branch) => ({
    label: branch.displayName,
    value: branch.id,
  }))
)

const form = reactive({
  title: '',
  description: '',
  type: 'DAILY' as QuestType,
  branchId: 'FIN' as BranchId,
  xpReward: 100,
  goldReward: undefined as number | undefined,
})

watch(
  () => branchesStore.branches.map((branch) => branch.id),
  (branchIds) => {
    if (!branchIds.includes(form.branchId)) {
      form.branchId = (branchIds[0] || '') as BranchId
    }
  },
  { immediate: true }
)

function handleSubmit() {
  if (!form.branchId || !branchesStore.branches.some((branch) => branch.id === form.branchId)) return
  emit('save', { ...form })
}
</script>

<style scoped lang="scss">
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.radio-option {
  @include glass;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
  color: var(--text);
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard);

  &:hover {
    border-color: color-mix(in srgb, var(--accent) 45%, var(--ui-border-color));
  }

  input {
    accent-color: var(--text);
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }
}
</style>
