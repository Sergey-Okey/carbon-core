<template>
  <GlassCard
    :id="`node-${data.branchId}`"
    class="branch-node"
    :class="{
      completed: isBranchCompleted,
      expanded: isExpanded,
      selected: selected,
    }"
    :style="nodeStyle"
    data-tour="board-branch-node"
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
            @click.stop="emit('edit', data.branchId)"
          >
            <PenSquare :size="14" />
          </button>
        </div>
      </div>
      <h4>{{ branchName }}</h4>
      <div class="progress-dashes" v-if="indicatorTasks > 0">
        <span
          v-for="i in indicatorTasks"
          :key="i"
          class="dash"
          :class="{ filled: i <= completedIndicatorTasks }"
        ></span>
      </div>
      <div class="task-counter">{{ totalTasks }} задач</div>
      <div v-if="isBranchCompleted" class="completed-label">Выполнена</div>
      <button class="expand-btn nodrag" @click.stop="togglePinned">
        <ChevronDown :size="16" :class="{ rotated: isExpanded }" />
      </button>
    </div>

    <Transition name="expand">
      <div v-if="isExpanded" class="node-details">
        <p v-if="branchDescription">
          {{ branchDescription }}
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
      :id="`target-top-${data.branchId}`"
      type="target"
      :position="Position.Top"
      class="handle handle-top handle-target"
      :style="targetHandleStyle"
    />
    <Handle
      :id="`target-left-${data.branchId}`"
      type="target"
      :position="Position.Left"
      class="handle handle-left handle-target"
      :style="targetHandleStyle"
    />
    <Handle
      :id="`source-right-${data.branchId}`"
      type="source"
      :position="Position.Right"
      class="handle handle-right handle-source"
      :style="sourceHandleStyle"
    />
    <Handle
      :id="`source-bottom-${data.branchId}`"
      type="source"
      :position="Position.Bottom"
      class="handle handle-bottom handle-source"
      :style="sourceHandleStyle"
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
import { useBranchesStore } from '~/stores/branches.store'
import type { BranchNodeData } from '~/types/branch.types'

const props = defineProps<{
  data: Extract<BranchNodeData, { type: 'branch' }>
  selected?: boolean
}>()
const emit = defineEmits<{ (e: 'edit', branchId: string): void }>()

const tasksStore = useTasksStore()
const branchesStore = useBranchesStore()

const isExpanded = ref(false)
const isPinned = ref(false)
const hovered = ref(false)

const branchName = computed(() => {
  const branch = branchesStore.branches.find(
    (b) => b.id === props.data.branchId
  )
  return branch?.displayName || 'Ветка'
})

const branchDescription = computed(() => {
  const branch = branchesStore.branches.find(
    (b) => b.id === props.data.branchId
  )
  return branch?.description?.trim() || ''
})

const branchColor = computed(() => {
  const branch = branchesStore.branches.find(
    (b) => b.id === props.data.branchId
  )
  return branch?.markerColor || branch?.backgroundColor || props.data.branchColor || '#d6d6d6'
})

const nodeStyle = computed(() => ({
  '--node-marker-color': branchColor.value,
  '--node-handle-color': branchColor.value,
}))

const sourceHandleStyle = computed(() => ({
  background: branchColor.value,
  borderColor: branchColor.value,
}))

const targetHandleStyle = computed(() => ({
  background: 'var(--glass-surface)',
  borderColor: branchColor.value,
}))

const iconComponent = computed(() => {
  const branch = branchesStore.branches.find(
    (b) => b.id === props.data.branchId
  )
  const iconName = branch?.icon || 'help-circle'
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

const isBranchCompleted = computed(() => {
  const branch = branchesStore.branches.find(
    (b) => b.id === props.data.branchId
  )
  if (!branch || branch.milestones.length === 0) return false
  return branch.milestones.every((m) => m.status === 'completed')
})

const totalTasks = computed(() => {
  branchesStore.graphRevision
  return branchesStore.getBranchTotalTasks(props.data.branchId)
})

const indicatorTasks = totalTasks
const completedIndicatorTasks = computed(() => {
  branchesStore.graphRevision
  return branchesStore.getBranchCompletedTasks(props.data.branchId)
})

const linkedTasks = computed(() => {
  branchesStore.graphRevision
  const taskIds = branchesStore.getBranchTaskIds(props.data.branchId)
  return tasksStore.tasks.filter((task) => taskIds.includes(task.id))
})

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
  const el = document.getElementById(`node-${props.data.branchId}`)
  if (el && !el.contains(event.target as Node)) {
    isPinned.value = false
    hovered.value = false
    updateExpanded()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped lang="scss">
.branch-node {
  width: 240px;
  min-height: 138px;
  padding: 12px;
  position: relative;
  overflow: visible;
  transition:
    border-color var(--transition-standard),
    background-color var(--transition-standard);
  background: var(--surface);
  border: var(--ui-border);
  box-shadow: var(--shadow-soft);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;

  .node-main {
    display: flex;
    flex-direction: column;
  }

  &.selected {
    border-color: var(--text);
  }

  &.completed {
    border-color: var(--success);
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
    width: 9px;
    height: 9px;
    background: var(--node-marker-color);
    border-radius: 2px;
    border: none;
    transition: opacity var(--transition-standard);
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
      color: var(--text);
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
    color: var(--text);
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
    transition: background var(--transition-standard);
    &.filled {
      background: var(--accent);
    }
  }
  .task-counter {
    font-size: 0.8rem;
    color: var(--dim);
    margin-bottom: 4px;
  }
  .completed-label {
    text-align: center;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--success);
    margin-bottom: 6px;
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
      color: var(--text);
    }
    &:active {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
    }
    .rotated {
      transform: rotate(180deg);
    }
  }

  .node-details {
    position: absolute;
    left: 0;
    top: calc(100% + 8px);
    z-index: 80;
    width: 100%;
    box-sizing: border-box;
    max-height: 220px;
    padding: 12px;
    overflow-y: auto;
    background: var(--surface);
    border: var(--ui-border);
    border-radius: var(--border-radius-md);
    box-shadow: 0 16px 42px color-mix(in srgb, var(--bg) 36%, transparent);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    font-size: 0.85rem;
    word-wrap: break-word;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--ui-border-color);
      border-radius: var(--border-radius-sm);
    }

    p {
      margin: 0 0 8px;
      color: var(--text);
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
        color: var(--text);
        font-size: 0.8rem;
        margin-bottom: 2px;
        &::before {
          content: '•';
          color: var(--text);
          margin-right: 6px;
        }
      }
      .empty {
        color: var(--dim);
        font-size: 0.8rem;
      }
    }
  }

  /* Хендлы – общие стили */
  .handle {
    transition:
      transform var(--transition-standard),
      outline-color var(--transition-standard);
    background: var(--node-handle-color);
    border: 1px solid color-mix(in srgb, var(--node-handle-color) 46%, var(--ui-border-color));
    opacity: 1;
    z-index: 10;
  }

  .handle-target {
    background: var(--glass-surface);
    border-color: var(--node-handle-color);
  }

  .handle-source {
    background: var(--node-handle-color);
  }

  .handle-top {
    width: 12px;
    height: 5px;
    border-radius: var(--border-radius-sm);
    top: -3px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
  }

  .handle-left,
  .handle-right,
  .handle-bottom {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .handle-left {
    left: -5px !important;
    top: 54px !important;
    transform: none !important;
  }

  .handle-right {
    top: 54px !important;
    right: -5px !important;
    transform: none !important;
  }

  .handle-bottom {
    bottom: -5px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
  }

  &:hover .handle,
  &.selected .handle {
    outline: 2px solid color-mix(in srgb, var(--node-handle-color) 35%, var(--ui-border-color));
    outline-offset: 1px;
  }

  .handle:active {
    outline: 2px solid var(--node-handle-color);
    outline-offset: 1px;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition:
    opacity var(--transition-standard),
    transform var(--transition-standard);
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
