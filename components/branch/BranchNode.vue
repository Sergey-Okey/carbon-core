<template>
  <div
    class="branch-node"
    :class="{ completed: milestone.achieved, active: isActive }"
    @click="$emit('click')"
  >
    <div class="node-content">
      <div class="icon-wrapper">
        <component :is="iconComponent" :size="24" />
      </div>
      <span class="title">{{ milestone.name }}</span>
      <div class="progress-ring">
        <svg viewBox="0 0 36 36" class="circular-chart">
          <path
            class="circle-bg"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            class="circle"
            :stroke-dasharray="`${progress}, 100`"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      </div>
      <div v-if="milestone.sourceTaskIds.length" class="task-badge">
        {{ milestone.sourceTaskIds.length }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, Dumbbell, Brain, Users, Target } from 'lucide-vue-next'
import type { Milestone } from '~/types/branch.types'

const props = defineProps<{
  data: {
    branchId: string
    milestone: Milestone
    currentXP: number
    icon: string
    branchName: string
  }
}>()

defineEmits(['click'])

const milestone = props.data.milestone
const currentXP = props.data.currentXP

const iconComponent = computed(() => {
  const map: Record<string, any> = {
    'trending-up': TrendingUp,
    dumbbell: Dumbbell,
    brain: Brain,
    users: Users,
  }
  return map[props.data.icon] || Target
})

const progress = computed(() => {
  if (milestone.achieved) return 100
  return Math.min(100, (currentXP / milestone.requiredXP) * 100)
})

const isActive = computed(() => !milestone.achieved && currentXP > 0)
</script>

<style scoped lang="scss">
.branch-node {
  @include glass;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2px solid var(--border);
  position: relative;
  cursor: pointer;

  &.active {
    border-color: var(--accent);
    box-shadow: 0 0 20px var(--accent);
    animation: pulse-glow 2s infinite;
  }

  &.completed {
    border-color: var(--success);
    background: rgba(76, 175, 127, 0.1);
    .icon-wrapper {
      color: var(--success);
    }
  }

  .node-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .icon-wrapper {
    color: var(--accent);
  }

  .title {
    font-size: 0.7rem;
    font-weight: 600;
    text-align: center;
    color: var(--accent);
    max-width: 80px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .progress-ring {
    position: absolute;
    top: -5px;
    left: -5px;
    width: 110px;
    height: 110px;
  }

  .circular-chart {
    width: 100%;
    height: 100%;
  }

  .circle-bg {
    fill: none;
    stroke: var(--border);
    stroke-width: 2.5;
  }

  .circle {
    fill: none;
    stroke: var(--accent);
    stroke-width: 2.5;
    stroke-linecap: round;
    transition: stroke-dasharray 0.3s ease;
  }

  .task-badge {
    position: absolute;
    bottom: -5px;
    right: -5px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 2px 6px;
    font-size: 0.7rem;
    color: var(--accent);
  }
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 10px var(--accent);
  }
  50% {
    box-shadow: 0 0 25px var(--accent);
  }
  100% {
    box-shadow: 0 0 10px var(--accent);
  }
}
</style>
