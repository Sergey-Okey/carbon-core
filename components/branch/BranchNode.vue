<template>
  <GlassCard
    :id="`node-${milestone?.id}`"
    class="branch-node"
    :class="{
      completed: milestone?.status === 'completed',
      expanded: isExpanded,
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="node-main">
      <div class="node-header">
        <component :is="iconComponent" :size="20" />
        <div class="header-actions">
          <button class="edit-btn" @click.stop="emit('edit', milestone!)">
            <PenSquare :size="14" />
          </button>
          <span class="status-dot" :class="milestone?.status"></span>
        </div>
      </div>
      <h4>{{ milestone?.name }}</h4>
      <div class="task-dots">
        <div 
          v-for="n in Math.min(totalTasksCount, 20)" 
          :key="n"
          class="task-dot"
          :class="{ filled: n <= completedTasksCount }"
        ></div>
        <span v-if="totalTasksCount === 0" class="no-tasks">Нет задач</span>
      </div>
      <div class="xp-info">
        {{ completedTasksCount }} / {{ totalTasksCount }} задач
      </div>
      <button class="expand-btn" @click.stop="togglePinned">
        <ChevronDown :size="16" :class="{ rotated: isExpanded }" />
      </button>
    </div>

    <Transition name="expand">
      <div v-if="isExpanded" class="node-details">
        <p v-if="milestone?.description">{{ milestone.description }}</p>
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

    <Handle type="source" :position="Position.Right" class="handle-right" />
    <Handle type="target" :position="Position.Left" class="handle-left" />
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
  HelpCircle as Question,
} from 'lucide-vue-next'
import GlassCard from '~/components/base/GlassCard.vue'
import { useTasksStore } from '~/stores/tasks.store'
import { useBranchesStore } from '~/stores/branches.store'
import type { Milestone, BranchNodeData } from '~/types/branch.types'

const props = defineProps<{
  data: BranchNodeData
  selected?: boolean
}>()
const emit = defineEmits<{ (e: 'edit', milestone: Milestone): void }>()

const tasksStore = useTasksStore()
const branchesStore = useBranchesStore()

const milestone = props.data.milestone

const isExpanded = ref(false)
const isPinned = ref(false)
const hovered = ref(false)

const iconComponent = computed(() => {
  const iconName = milestone?.icon || props.data.branchIcon || 'target'
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
    question: Question,
  }
  return map[iconName] || Target
})

const linkedTasks = computed(() => {
  if (!milestone) return []
  return tasksStore.tasks.filter((t) => milestone.taskIds.includes(t.id))
})

const totalTasksCount = computed(() => {
  return milestone?.taskIds.length || 0
})

const completedTasksCount = computed(() => {
  if (!milestone) return 0
  return milestone.taskIds.filter(taskId => {
    const task = tasksStore.tasks.find(t => t.id === taskId)
    return task && task.done
  }).length
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
  const node = document.getElementById(`node-${milestone.id}`)
  if (node && !node.contains(event.target as Node)) {
    isPinned.value = false
    hovered.value = false
    updateExpanded()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.branch-node {
  width: 220px;
  max-width: 100%;
  padding: 12px;
  position: relative;
  transition: border-color 0.2s;
  word-wrap: break-word;
  overflow-wrap: break-word;

  &.completed {
    border-color: var(--success);
    background: color-mix(in srgb, var(--success) 8%, var(--surface));
  }

  .node-main {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .completion-badge {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: color-mix(in srgb, var(--success) 90%, var(--surface));
    border: 2px solid var(--success);
    border-radius: var(--border-radius-md);
    color: var(--surface);
    font-weight: 600;
    font-size: 0.95rem;
    z-index: 10;
    box-shadow: var(--shadow-lg);
  }

  .node-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    background: transparent;
    border: none;
    color: var(--dim);
    cursor: pointer;
    opacity: 0;
    transition:
      opacity 0.2s,
      background 0.2s,
      color 0.2s;

    &:hover {
      background: var(--surface);
      color: var(--accent);
    }
  }

  &:hover .edit-btn {
    opacity: 1;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border);
    &.active {
      background: var(--accent);
      box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.2);
    }
    &.completed {
      background: var(--success);
    }
  }

  h4 {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--accent);
    white-space: normal;
    word-break: break-word;
    line-height: 1.3;
    max-height: 3.9rem;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .task-dots {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 6px;
    min-height: 6px;
    
    .task-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--border);
      transition: all var(--transition-standard);
      
      &.filled {
        background: var(--accent);
      }
    }
    
    .no-tasks {
      font-size: 0.75rem;
      color: var(--dim);
      font-style: italic;
    }
  }

  .progress {
    margin-bottom: 4px;
  }

  .xp-info {
    font-size: 0.7rem;
    color: var(--dim);
  }

  .expand-btn {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background: transparent;
    border: none;
    color: var(--dim);
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      background: var(--surface);
      color: var(--accent);
    }
    .rotated {
      transform: rotate(180deg);
    }
  }

  .node-details {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
    font-size: 0.85rem;
    word-wrap: break-word;
    overflow-wrap: break-word;

    p {
      margin-bottom: 8px;
      color: var(--accent);
      white-space: normal;
      word-break: break-word;
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
        white-space: normal;
        word-break: break-word;
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

  .handle-right,
  .handle-left {
    width: 10px;
    height: 10px;
    background: var(--accent);
    border: 1px solid var(--bg);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .handle-right,
  &:hover .handle-left {
    opacity: 1;
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
