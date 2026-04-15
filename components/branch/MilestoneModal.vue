<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ milestone.name }}</h3>
          <button class="close-btn" @click="$emit('close')">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-content">
          <div class="info-row">
            <span class="label">Ветка</span>
            <span class="value">{{ branch?.displayName }}</span>
          </div>
          <div class="info-row">
            <span class="label">Прогресс</span>
            <span class="value"
              >{{ branch?.totalXP || 0 }} / {{ milestone.requiredXP }} XP</span
            >
          </div>
          <div class="info-row">
            <span class="label">Статус</span>
            <span class="value" :class="{ achieved: milestone.achieved }">
              {{ milestone.achieved ? 'Достигнут' : 'В процессе' }}
            </span>
          </div>
          <div v-if="milestone.sourceTaskIds.length" class="tasks-section">
            <h4>Связанные задачи</h4>
            <ul>
              <li v-for="taskId in milestone.sourceTaskIds" :key="taskId">
                {{ getTaskTitle(taskId) }}
              </li>
            </ul>
          </div>
          <div v-if="milestone.description" class="description">
            <h4>Описание</h4>
            <p>{{ milestone.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useTasksStore } from '~/stores/tasks.store'
import type { Branch, Milestone } from '~/types/branch.types'

const props = defineProps<{
  milestone: Milestone
  branch: Branch | null
}>()

defineEmits(['close'])

const tasksStore = useTasksStore()

function getTaskTitle(taskId: string): string {
  const task = tasksStore.tasks.find((t) => t.id === taskId)
  return task?.title || 'Неизвестная задача'
}
</script>

<style scoped lang="scss">
.modal-overlay {
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

.modal {
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  @include glass;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border);
  color: var(--accent);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;

  h3 {
    font-weight: 600;
    font-size: 1.2rem;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--dim);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all var(--transition-standard);

    &:hover {
      background: var(--surface);
      color: var(--accent);
    }
  }
}

.modal-content {
  padding: 20px 24px 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);

  .label {
    color: var(--dim);
  }

  .value {
    font-weight: 500;
    &.achieved {
      color: var(--success);
    }
  }
}

.tasks-section {
  margin-top: 20px;

  h4 {
    margin-bottom: 8px;
    color: var(--dim);
    font-size: 0.9rem;
    text-transform: uppercase;
  }

  ul {
    list-style: none;
    li {
      padding: 4px 0;
      color: var(--accent);
      &::before {
        content: '•';
        color: var(--accent);
        margin-right: 8px;
      }
    }
  }
}

.description {
  margin-top: 20px;

  h4 {
    margin-bottom: 8px;
    color: var(--dim);
    font-size: 0.9rem;
    text-transform: uppercase;
  }

  p {
    color: var(--accent);
    line-height: 1.5;
  }
}
</style>
