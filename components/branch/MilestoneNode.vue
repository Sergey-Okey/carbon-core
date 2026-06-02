<template>
  <GlassCard
    :id="`node-${data.milestone.id}`"
    class="milestone-node"
    :class="{
      completed: data.milestone.status === 'completed',
      expanded: isExpanded,
      selected: selected,
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="node-main">
      <div class="node-header">
        <component :is="iconComponent" :size="20" />
        <div class="header-actions">
          <div class="node-marker"></div>
          <button
            class="edit-btn nodrag"
            @click.stop="emit('edit', data.milestone)"
          >
            <PenSquare :size="14" />
          </button>
        </div>
      </div>
      <h4>{{ data.milestone.name }}</h4>
      <div class="progress-dashes" v-if="indicatorTasks > 0">
        <span
          v-for="i in indicatorTasks"
          :key="i"
          class="dash"
          :class="{ filled: i <= completedIndicatorTasks }"
        ></span>
      </div>
      <div class="task-counter">
        {{ completedIndicatorTasks }} / {{ indicatorTasks }} задач
      </div>
      <button class="expand-btn nodrag" @click.stop="togglePinned">
        <ChevronDown :size="16" :class="{ rotated: isExpanded }" />
      </button>
    </div>

    <Transition name="expand">
      <div v-if="isExpanded" class="node-details">
        <p v-if="data.milestone.description">
          {{ data.milestone.description }}
        </p>
        <p v-else class="placeholder">Нет описания</p>
        <div class="linked-tasks">
          <span class="label">Привязанные задачи:</span>
          <ul v-if="linkedTasks.length">
            <li v-for="task in linkedTasks" :key="task.id">{{ task.title }}</li>
          </ul>
          <span v-else class="empty">Задачи не привязаны</span>
        </div>
      </div>
    </Transition>

    <!-- Хендлы -->
    <Handle
      :id="`target-top-${data.milestone.id}`"
      type="target"
      :position="Position.Top"
      class="handle handle-top handle-target"
    />
    <Handle
      :id="`target-left-${data.milestone.id}`"
      type="target"
      :position="Position.Left"
      class="handle handle-left handle-target"
    />
    <Handle
      :id="`source-right-${data.milestone.id}`"
      type="source"
      :position="Position.Right"
      class="handle handle-right handle-source"
    />
    <Handle
      :id="`source-bottom-${data.milestone.id}`"
      type="source"
      :position="Position.Bottom"
      class="handle handle-bottom handle-source"
    />
  </GlassCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import {
  TrendingUp,
  Dumbbell,
  Brain,
  Users,
  Target,
  PenSquare,
  ChevronDown,
  Briefcase,
  Heart,
  BookOpen,
  Globe,
  Award,
  Coffee,
  Music,
  Camera,
  Code,
  HelpCircle,
} from 'lucide-vue-next'
import GlassCard from '~/components/base/GlassCard.vue'
import { useTasksStore } from '~/stores/tasks.store'
import type { Milestone, BranchNodeData } from '~/types/branch.types'

const props = defineProps<{
  data: Extract<BranchNodeData, { type: 'milestone' }>
  selected?: boolean
}>()
const emit = defineEmits<{ (e: 'edit', milestone: Milestone): void }>()

const tasksStore = useTasksStore()
const milestone = computed(() => props.data.milestone!)

const isExpanded = ref(false)
const isPinned = ref(false)
const hovered = ref(false)

const iconComponent = computed(() => {
  const iconName = milestone.value.icon || 'help-circle'
  const map: Record<string, any> = {
    'trending-up': TrendingUp,
    dumbbell: Dumbbell,
    brain: Brain,
    users: Users,
    target: Target,
    briefcase: Briefcase,
    heart: Heart,
    'book-open': BookOpen,
    globe: Globe,
    award: Award,
    coffee: Coffee,
    music: Music,
    camera: Camera,
    code: Code,
    'help-circle': HelpCircle,
  }
  return map[iconName] || HelpCircle
})

const linkedTasks = computed(() => {
  return tasksStore.tasks.filter((t) => milestone.value.taskIds.includes(t.id))
})

const indicatorTasks = computed(() => milestone.value.taskIds.length)
const completedIndicatorTasks = computed(
  () => linkedTasks.value.filter((t) => t.done).length
)

function togglePinned() {
  isPinned.value = !isPinned.value
  updateExpanded()
}
function handleMouseEnter() {
  hovered.value = true
  updateExpanded()
}
function handleMouseLeave() {
  hovered.value = false
  updateExpanded()
}
function updateExpanded() {
  isExpanded.value = hovered.value || isPinned.value
}
function handleClickOutside(event: MouseEvent) {
  const node = document.getElementById(`node-${milestone.value.id}`)
  if (node && !node.contains(event.target as Node)) {
    isPinned.value = false
    hovered.value = false
    updateExpanded()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped lang="scss">
.milestone-node {
  @include glass;
  width: 220px;
  padding: 12px;
  position: relative;
  overflow: visible;
  transition:
    border-color 0.2s,
    background 0.2s;
  border: var(--ui-border);

  &.selected {
    border-color: var(--accent);
  }

  &.completed {
    border-color: var(--success);
  }

  .node-main {
    display: flex;
    flex-direction: column;
  }
  .node-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .header-actions {
    position: relative;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .node-marker {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    background: var(--accent);
    border-radius: 50%;
    border: none;
    transition: opacity 0.2s;
    z-index: 2;
  }

  &:hover .node-marker {
    opacity: 0;
    z-index: 1;
  }

  .edit-btn {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius-pill);
    background: transparent;
    border: none;
    color: var(--dim);
    cursor: pointer;
    opacity: 0;
    z-index: 3;
    transition:
      opacity var(--transition-standard),
      background var(--transition-standard),
      color var(--transition-standard);
    &:hover {
      background: var(--glass-surface);
      color: var(--accent);
    }
    &:active {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
    }
  }

  &:hover .edit-btn {
    opacity: 1;
  }

  h4 {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--accent);
    word-break: break-word;
  }
  .progress-dashes {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
    width: 100%;
  }
  .dash {
    flex: 1;
    height: 3px;
    background: var(--ui-border-color);
    border-radius: var(--border-radius-sm);
    transition: background 0.2s;
    &.filled {
      background: var(--accent);
    }
  }

  .task-counter {
    font-size: 0.8rem;
    color: var(--dim);
    margin-bottom: 4px;
  }

  .expand-btn {
    position: absolute;
    top: 45px;           /* фиксированный отступ от верхнего края – не съезжает при раскрытии */
    right: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: var(--border-radius-pill);
    background: transparent;
    border: none;
    color: var(--dim);
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);
    z-index: 5;
    &:hover {
      background: var(--glass-surface);
      color: var(--accent);
    }
    &:active {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
    }
    .rotated {
      transform: rotate(180deg);
    }
  }

  .node-details {
    margin-top: 12px;
    padding-top: 12px;
    font-size: 0.85rem;
    word-wrap: break-word;
    p {
      margin-bottom: 8px;
      color: var(--accent);
    }
    .placeholder {
      color: var(--dim);
      font-style: italic;
    }
    .linked-tasks {
      .label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        color: var(--dim);
      }
      ul {
        list-style: none;
        padding-left: 12px;
        margin: 0;
      }
      li {
        color: var(--accent);
        font-size: 0.8rem;
        margin-bottom: 2px;
        &::before {
          content: '•';
          color: var(--accent);
          margin-right: 6px;
        }
      }
      .empty {
        color: var(--dim);
        font-size: 0.8rem;
      }
    }
  }

  /* Хендлы */
  .handle {
    transition:
      transform 0.2s ease,
      outline-color 0.2s ease;
    background: var(--accent);
    border: var(--ui-border);
    opacity: 1;
    z-index: 10;
  }

  .handle-target {
    background: var(--glass-surface);
    border-color: var(--accent);
  }

  .handle-source {
    background: var(--accent);
  }

  .handle-top {
    width: 12px;
    height: 5px;
    border-radius: var(--border-radius-sm);
    left: 50% !important;
    transform: translateX(-50%) !important;
  }

  .handle-top.handle-target {
    top: -3px !important;
  }

  .handle-left,
  .handle-right,
  .handle-bottom {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transform: none !important;
  }

  .handle-left.handle-target {
    left: -5px !important;
    top: 54px !important;
  }

  .handle-right.handle-source {
    right: -5px !important;
    top: 54px !important;
  }

  .handle-bottom.handle-source {
    bottom: -5px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
  }

  &:hover .handle,
  &.selected .handle {
    outline: 2px solid var(--ui-border-color);
    outline-offset: 1px;
  }

  .handle:active {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
