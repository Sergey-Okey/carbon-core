<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <GlassCard class="modal">
      <h3>Новый квест</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Название</label>
          <input v-model="form.title" required />
        </div>
        <div class="form-group">
          <label>Описание (опционально)</label>
          <input v-model="form.description" />
        </div>
        <div class="form-group">
          <label>Тип</label>
          <div class="radio-group">
            <label
              ><input type="radio" value="DAILY" v-model="form.type" />
              Ежедневный</label
            >
            <label
              ><input type="radio" value="HABIT" v-model="form.type" />
              Привычка</label
            >
            <label
              ><input type="radio" value="EPIC" v-model="form.type" />
              Эпический</label
            >
          </div>
        </div>
        <div class="form-group">
          <label>Ветка</label>
          <AppSelect
            v-model="form.branchId"
            :options="branchOptions"
            :disabled="branchOptions.length === 0"
            placeholder="Сначала создайте ветку"
          />
        </div>
        <div class="form-group">
          <label>XP награда</label>
          <input
            type="number"
            v-model.number="form.xpReward"
            min="1"
            required
          />
        </div>
        <div class="form-group">
          <label>Золото (по умолчанию XP * 0.1)</label>
          <input type="number" v-model.number="form.goldReward" min="0" />
        </div>
        <div class="form-actions">
          <button type="button" @click="emit('close')">Отмена</button>
          <button type="submit" class="primary" :disabled="branchOptions.length === 0">
            Создать
          </button>
        </div>
      </form>
    </GlassCard>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import GlassCard from '~/components/base/GlassCard.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import { useBranchesStore } from '~/stores/branches.store'
import type { AppSelectOption } from '~/types/ui.types'
import type { QuestType, BranchId } from '~/types/quest.types'

const emit = defineEmits<{ (e: 'close'): void; (e: 'save', data: Omit<Quest, 'done' | 'createdAt'>): void }>()

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
.modal-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--bg) 70%, transparent);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}
.modal {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  color: var(--accent);
}
.form-group {
  margin-bottom: 20px;
  label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.9rem;
    color: var(--dim);
  }
  input,
  select {
    width: 100%;
    padding: 10px 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-sm);
    color: var(--accent);
    &:focus {
      border-color: var(--accent);
      outline: none;
    }
  }
  .radio-group {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    label {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--accent);
      cursor: pointer;
    }
  }
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  button {
    padding: 10px 20px;
    border-radius: var(--border-radius-sm);
    background: var(--surface);
    color: var(--accent);
    &:hover {
      background: var(--border);
    }
    &.primary {
      background: var(--accent);
      color: var(--bg);
      font-weight: 500;
      &:hover {
        opacity: 0.9;
      }
    }
  }
}
</style>
