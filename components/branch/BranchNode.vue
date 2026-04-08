<template>
  <div class="branch-node">
    <div class="drag-handle">
      <Move :size="16" />
    </div>
    <div class="node-content">
      <div class="header">
        <component :is="iconComponent" :size="20" />
        <span class="title">{{ branch.displayName }}</span>
        <button class="delete-btn" @click.stop="deleteBranch">
          <Trash2 :size="16" />
        </button>
      </div>
      <ProgressBar
        :value="branch.totalXP"
        :max="nextMilestoneXP"
        :show-percent="true"
      />
      <div class="milestones">
        <div
          v-for="ms in branch.milestones"
          :key="ms.id"
          class="milestone"
          :class="{ achieved: ms.achieved }"
          :style="{ left: (ms.requiredXP / maxMilestoneXP) * 100 + '%' }"
          :title="ms.name"
        >
          <div class="dot"></div>
          <span class="milestone-label">{{ ms.name }}</span>
        </div>
      </div>
    </div>
    <Handle type="source" :position="Position.Bottom" class="handle-bottom" />
    <Handle type="target" :position="Position.Top" class="handle-top" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import {
  Move,
  Trash2,
  TrendingUp,
  Dumbbell,
  Brain,
  Users,
  Target,
} from 'lucide-vue-next'
import ProgressBar from '~/components/base/ProgressBar.vue'
import { useBranchesStore } from '~/stores/branches.store'
import type { Branch } from '~/types/branch.types'

const props = defineProps<{ data: { branch: Branch } }>()
const branch = props.data.branch
const branchesStore = useBranchesStore()

const iconComponent = computed(() => {
  const map: Record<string, any> = {
    'trending-up': TrendingUp,
    dumbbell: Dumbbell,
    brain: Brain,
    users: Users,
  }
  return map[branch.icon] || Target
})

const nextMilestoneXP = computed(() => {
  const next = branch.milestones.find((m) => !m.achieved)
  return next
    ? next.requiredXP
    : branch.milestones[branch.milestones.length - 1]?.requiredXP || 1000
})

const maxMilestoneXP = computed(() => {
  return Math.max(...branch.milestones.map((m) => m.requiredXP), 1)
})

function deleteBranch() {
  branchesStore.deleteBranch(branch.id)
}
</script>

<style scoped lang="scss">
.branch-node {
  @include glass;
  border-radius: var(--border-radius-md);
  width: 280px;
  padding: 14px;
  color: var(--accent);
  position: relative;
  transition: box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .drag-handle {
    position: absolute;
    top: 8px;
    left: 8px;
    color: var(--dim);
    cursor: grab;
    opacity: 0.6;
    transition: opacity 0.2s;
    &:hover {
      opacity: 1;
    }
    &:active {
      cursor: grabbing;
    }
  }

  .node-content {
    margin-left: 24px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;

    .title {
      font-weight: 600;
      font-size: 1rem;
      flex: 1;
    }

    .delete-btn {
      padding: 4px;
      border-radius: 4px;
      color: var(--dim);
      &:hover {
        color: var(--error);
        background: var(--surface);
      }
    }
  }

  .milestones {
    position: relative;
    height: 32px;
    margin-top: 14px;

    .milestone {
      position: absolute;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--border);
        border: 2px solid var(--dim);
        transition: all var(--transition-standard);
      }

      &.achieved .dot {
        background: var(--accent);
        border-color: var(--accent);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
      }

      .milestone-label {
        position: absolute;
        top: 18px;
        white-space: nowrap;
        font-size: 0.65rem;
        color: var(--dim);
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
      }

      &:hover .milestone-label {
        opacity: 1;
      }
    }
  }

  .handle-bottom,
  .handle-top {
    width: 12px;
    height: 12px;
    background: var(--accent);
    border: 2px solid var(--bg);
    border-radius: 50%;
    transition: transform 0.2s;
    &:hover {
      transform: scale(1.3);
    }
  }
}
</style>
