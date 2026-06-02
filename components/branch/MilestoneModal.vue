<template>
  <AppModal :title="milestone.name" size="sm" @close="emit('close')">
    <div class="milestone-info">
      <div class="info-row">
        <span class="label">Ветка</span>
        <span class="value">{{ branch?.displayName || 'Без ветки' }}</span>
      </div>

      <div class="info-row">
        <span class="label">Прогресс</span>
        <span class="value">{{ branch?.totalXP || 0 }} / {{ milestone.requiredXP }} XP</span>
      </div>

      <div class="info-row">
        <span class="label">Статус</span>
        <span class="value" :class="{ achieved: milestone.achieved }">
          {{ milestone.achieved ? 'Достигнут' : 'В процессе' }}
        </span>
      </div>

      <section v-if="milestone.sourceTaskIds?.length" class="details-section">
        <h4>Связанные задачи</h4>
        <ul>
          <li v-for="taskId in milestone.sourceTaskIds" :key="taskId">
            {{ getTaskTitle(taskId) }}
          </li>
        </ul>
      </section>

      <section v-if="milestone.description" class="details-section">
        <h4>Описание</h4>
        <p>{{ milestone.description }}</p>
      </section>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import AppModal from '~/components/ui/AppModal.vue'
import { useTasksStore } from '~/stores/tasks.store'
import type { Branch, Milestone } from '~/types/branch.types'

defineProps<{
  milestone: Milestone
  branch: Branch | null
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const tasksStore = useTasksStore()

function getTaskTitle(taskId: string): string {
  const task = tasksStore.tasks.find((t) => t.id === taskId)
  return task?.title || 'Неизвестная задача'
}
</script>

<style scoped lang="scss">
.milestone-info {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: var(--ui-border);

  .label {
    color: var(--dim);
    font-size: 0.86rem;
  }

  .value {
    color: var(--text);
    font-weight: 600;
    text-align: right;

    &.achieved {
      color: var(--success);
    }
  }
}

.details-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;

  h4 {
    color: var(--dim);
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 6px;
    list-style: none;
  }

  li,
  p {
    color: var(--text);
    font-size: 0.95rem;
    line-height: 1.5;
  }
}

@media (max-width: 420px) {
  .info-row {
    flex-direction: column;
    gap: 4px;

    .value {
      text-align: left;
    }
  }
}
</style>
