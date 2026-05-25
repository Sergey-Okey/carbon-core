<template>
  <GlassCard
    :id="`node-${data.branchId}`"
    class="branch-node"
    :class="{
      completed: isBranchCompleted,
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
          <span v-else class="empty">Нет задач</span>
        </div>
      </div>
    </Transition>

    <!-- Хендлы -->
    <Handle type="target" :position="Position.Right" class="handle handle-right" />
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
  data: BranchNodeData
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
  return branchesStore.getBranchTotalTasks(props.data.branchId)
})

const indicatorTasks = totalTasks
const completedIndicatorTasks = computed(() =>
  branchesStore.getBranchCompletedTasks(props.data.branchId)
)

const linkedTasks = computed(() => {
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
  padding: 12px;
  position: relative;
  overflow: visible;
  transition:
    border-color 0.2s,
    background 0.2s;
  border: 1px solid var(--glass-border);

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
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--glass-border);
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
    border-radius: var(--border-radius-sm);
    background: transparent;
    border: none;
    color: var(--dim);
    cursor: pointer;
    opacity: 0;
    z-index: 3;
    transition:
      opacity 0.2s,
      background 0.2s,
      color 0.2s;
    &:hover {
      background: var(--glass-surface);
      color: var(--accent);
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
    background: var(--border);
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
    right:13px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: var(--border-radius-sm);
    background: transparent;
    border: none;
    color: var(--dim);
    cursor: pointer;
    transition: all 0.2s;
    z-index: 5;
    &:hover {
      background: var(--glass-surface);
      color: var(--accent);
    }
    .rotated {
      transform: rotate(180deg);
    }
  }

  .node-details {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--glass-border);
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

  /* Хендлы – общие стили */
  .handle {
    transition: opacity 0.2s ease, transform 0.2s ease;
    background: var(--accent);
    border: 1px solid var(--glass-border);
    opacity: 0;
    z-index: 10;
  }

  .handle-right {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    top: 55px !important;
    right: -5px !important;
    transform: none !important;
  }

  &:hover .handle,
  &.selected .handle {
    opacity: 1;
    transform: scale(1.05);
  }

  .handle:active {
    box-shadow: 0 0 0 2px var(--accent);
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
