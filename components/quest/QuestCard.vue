<template>
  <GlassCard class="quest-card" :class="{ completed: quest.done }">
    <div class="quest-header">
      <div class="branch-icon">
        <component :is="branchIconComponent" :size="20" />
      </div>
      <div class="quest-info">
        <h4>{{ quest.title }}</h4>
        <p v-if="quest.description">{{ quest.description }}</p>
      </div>
      <span class="quest-type" :class="quest.type">{{ quest.type }}</span>
    </div>
    <div class="quest-footer">
      <div class="rewards">
        <span><Zap :size="14" /> {{ quest.xpReward }} XP</span>
        <span
          ><Coins :size="14" />
          {{ quest.goldReward || (quest.xpReward * 0.1).toFixed(0) }} G</span
        >
      </div>
      <div class="actions">
        <button
          class="complete-btn"
          :class="{ done: quest.done }"
          @click="emit('toggle', quest.id)"
          :disabled="quest.type !== 'HABIT' && quest.done"
        >
          <CheckCircle v-if="quest.done" :size="22" />
          <Circle v-else :size="22" />
        </button>
        <button class="delete-btn" @click.stop="emit('delete', quest.id)">
          <Trash2 :size="18" />
        </button>
      </div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Quest } from '~/types/quest.types'
import GlassCard from '~/components/base/GlassCard.vue'
import {
  Zap,
  Coins,
  CheckCircle,
  Circle,
  Trash2,
  TrendingUp,
  Dumbbell,
  Brain,
  Users,
  Target,
} from 'lucide-vue-next'

const props = defineProps<{ quest: Quest }>()
const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', id: string): void
}>()

const branchIconComponent = computed(() => {
  const map: Record<string, any> = {
    FIN: TrendingUp,
    BODY: Dumbbell,
    MIND: Brain,
    LDR: Users,
  }
  return map[props.quest.branchId] || Target
})
</script>

<style scoped lang="scss">
.quest-card {
  padding: 16px;
  transition: all var(--transition-standard);
  &.completed {
    filter: grayscale(1);
    opacity: 0.4;
  }
  .quest-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }
  .branch-icon {
    background: var(--surface);
    padding: 6px;
    border-radius: 8px;
    color: var(--accent);
  }
  .quest-info {
    flex: 1;
    h4 {
      font-size: 1rem;
      margin-bottom: 4px;
      color: var(--accent);
    }
    p {
      font-size: 0.85rem;
      color: var(--dim);
    }
  }
  .quest-type {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 12px;
    background: var(--border);
    text-transform: uppercase;
    color: var(--accent);
    &.DAILY {
      background: rgba(255, 255, 255, 0.1);
    }
    &.HABIT {
      background: rgba(0, 255, 136, 0.1);
    }
    &.EPIC {
      background: rgba(255, 68, 68, 0.1);
    }
  }
  .quest-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .rewards {
    display: flex;
    gap: 12px;
    font-size: 0.8rem;
    color: var(--dim);
    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
  .actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .complete-btn {
    color: var(--dim);
    transition: color var(--transition-standard);
    &:hover:not(:disabled) {
      color: var(--accent);
    }
    &.done {
      color: var(--success);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  .delete-btn {
    color: var(--dim);
    transition: color var(--transition-standard);
    &:hover {
      color: var(--error);
    }
  }
}
</style>
