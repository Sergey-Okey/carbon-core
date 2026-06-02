<template>
  <div class="branch-mobile-view">
    <!-- Панель инструментов -->
    <div class="mobile-controls">
      <button @click="addBranch">
        <Plus :size="20" />
        <span>Ветка</span>
      </button>
      <button @click="addMilestoneToSelectedBranch">
        <PlusCircle :size="20" />
        <span>Этап</span>
      </button>
    </div>

    <!-- Список веток -->
    <div class="branches-list">
      <div
        v-for="branch in branches"
        :key="branch.id"
        class="branch-item"
        :class="{ expanded: expandedBranch === branch.id }"
        :style="{ '--node-bg-color': branch.backgroundColor || '#d6d6d6' }"
      >
        <!-- Заголовок ветки -->
        <div class="branch-header" @click="toggleBranch(branch.id)">
          <div class="branch-info">
            <!-- Декоративный маркер ветки (квадрат) -->
            <div class="node-marker branch-marker"></div>
            <component :is="getIconComponent(branch.icon)" :size="22" class="branch-icon" />
            <div class="branch-text">
              <h4>{{ branch.displayName }}</h4>
              <div class="branch-stats">
                <span class="task-count">{{ totalTasks(branch.id) }} задач</span>
                <div class="progress-dashes" v-if="totalTasks(branch.id) > 0">
                  <span
                    v-for="i in totalTasks(branch.id)"
                    :key="i"
                    class="dash"
                    :class="{ filled: i <= completedTasks(branch.id) }"
                  ></span>
                </div>
              </div>
            </div>
          </div>
          <div class="branch-actions">
            <button class="branch-edit" @click.stop="editBranch(branch.id)">
              <PenSquare :size="16" />
            </button>
            <button class="branch-delete" @click.stop="deleteBranch(branch.id)">
              <Trash2 :size="16" />
            </button>
            <ChevronDown :size="20" :class="{ rotated: expandedBranch === branch.id }" />
          </div>
        </div>

        <!-- Список этапов ветки (раскрывается) -->
        <Transition name="expand">
          <div v-if="expandedBranch === branch.id" class="milestones">
            <div
              v-for="(milestone, index) in branch.milestones"
              :key="milestone.id"
              class="milestone-item"
              :class="milestone.status"
              :style="{ '--node-bg-color': milestone.backgroundColor || branch.backgroundColor || '#d6d6d6' }"
              @click="selectNode(milestone.id)"
            >
              <!-- Декоративный маркер этапа (круг) -->
              <div class="node-marker milestone-marker"></div>
              <div class="milestone-number">{{ index + 1 }}</div>
              <div class="milestone-content">
                <div class="milestone-header">
                  <h5>{{ milestone.name }}</h5>
                  <div class="milestone-badges">
                    <div class="task-dashes" v-if="milestone.taskIds.length">
                      <span
                        v-for="i in milestone.taskIds.length"
                        :key="i"
                        class="dash small"
                        :class="{ filled: i <= completedMilestoneTasks(milestone) }"
                      ></span>
                    </div>
                  </div>
                </div>
                <p v-if="milestone.description" class="description">
                  {{ milestone.description }}
                </p>
                <div class="progress-dashes" v-if="milestone.taskIds.length">
                  <span
                    v-for="i in milestone.taskIds.length"
                    :key="i"
                    class="dash"
                    :class="{ filled: i <= completedMilestoneTasks(milestone) }"
                  ></span>
                </div>
                <div class="task-counter">
                  {{ completedMilestoneTasks(milestone) }} / {{ milestone.taskIds.length }} задач
                </div>
                <div class="milestone-tasks" v-if="getMilestoneTasks(milestone).length">
                  <ul>
                    <li 
                      v-for="task in getMilestoneTasks(milestone)" 
                      :key="task.id"
                      :class="{ done: task.done }"
                    >
                      {{ task.title }}
                    </li>
                  </ul>
                </div>
              </div>
              <div class="milestone-actions">
                <button
                  class="milestone-edit"
                  @click.stop="editMilestone(milestone)"
                >
                  <PenSquare :size="16" />
                </button>
                <button
                  class="milestone-delete"
                  @click.stop="deleteMilestone(milestone.id)"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>

            <button
              class="add-milestone-btn"
              @click.stop="addMilestone(branch.id)"
            >
              <Plus :size="16" /> Добавить этап
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ChevronDown,
  Plus,
  PlusCircle,
  PenSquare,
  Trash2,
  TrendingUp,
  Dumbbell,
  Brain,
  Users,
  Target,
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
import { useBranchesStore } from '~/stores/branches.store'
import { useTasksStore } from '~/stores/tasks.store'
import type { Milestone } from '~/types/branch.types'

const props = defineProps<{
  selectedNodeId?: string | null
}>()

const emit = defineEmits<{
  (e: 'select-node', nodeId: string | null): void
  (e: 'edit-milestone', milestone: Milestone): void
  (e: 'add-milestone', branchId?: string): void
  (e: 'add-branch'): void
  (e: 'edit-branch', branchId: string): void
  (e: 'delete-branch', branchId: string): void
  (e: 'delete-milestone', milestoneId: string): void
}>()

const branchesStore = useBranchesStore()
const tasksStore = useTasksStore()
const expandedBranch = ref<string | null>(null)

const branches = computed(() => branchesStore.branches)

function totalTasks(branchId: string): number {
  return branchesStore.getBranchTotalTasks(branchId)
}

function completedTasks(branchId: string): number {
  return branchesStore.getBranchCompletedTasks(branchId)
}

function completedMilestoneTasks(milestone: Milestone): number {
  const completed = milestone.taskIds.filter((id) => {
    const task = tasksStore.tasks.find((t) => t.id === id)
    return task?.done
  }).length
  return completed
}

function getMilestoneTasks(milestone: Milestone) {
  return milestone.taskIds
    .map((id) => tasksStore.tasks.find((t) => t.id === id))
    .filter((task) => task !== undefined)
}

function toggleBranch(branchId: string) {
  const isClosingSelectedBranch =
    expandedBranch.value === branchId && props.selectedNodeId === branchId

  expandedBranch.value = expandedBranch.value === branchId ? null : branchId
  emit('select-node', isClosingSelectedBranch ? null : branchId)
}

function selectNode(nodeId: string) {
  emit('select-node', nodeId)
}

function editMilestone(milestone: Milestone) {
  emit('edit-milestone', milestone)
}

function deleteMilestone(milestoneId: string) {
  emit('delete-milestone', milestoneId)
}

function addMilestone(branchId: string) {
  emit('add-milestone', branchId)
}

function addBranch() {
  if (props.selectedNodeId) return
  emit('add-branch')
}

function addMilestoneToSelectedBranch() {
  if (!props.selectedNodeId) return
  emit('add-milestone', props.selectedNodeId)
}

function editBranch(branchId: string) {
  emit('edit-branch', branchId)
}

function deleteBranch(branchId: string) {
  emit('delete-branch', branchId)
}

function getIconComponent(iconName: string) {
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
}
</script>

<style scoped lang="scss">
.branch-mobile-view {
  padding: 12px;
  max-width: 100%;
  overflow-y: auto;
  background: transparent;
  min-height: 100%;
}

.mobile-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--accent);
    border: none;
    border-radius: var(--border-radius-pill);
    color: var(--bg);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &:hover {
      background: var(--accent);
      color: var(--bg);
    }

    &:active {
      background: var(--accent);
      color: var(--bg);
    }
  }
}

.branches-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.branch-item {
  @include glass;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--node-bg-color) 12%, transparent),
      color-mix(in srgb, var(--node-bg-color) 4%, transparent)
    ),
    var(--glass-surface);
  overflow: hidden;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard);

}

.branch-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  transition: background-color var(--transition-standard);

  &:active {
    background: var(--glass-surface);
  }
}

.branch-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  .node-marker {
    margin-right: 2px;
  }
}

.branch-icon {
  flex-shrink: 0;
  color: var(--text);
}

.branch-text {
  flex: 1;

  h4 {
    font-weight: 600;
    font-size: 1rem;
    margin: 0 0 4px;
    color: var(--text);
  }

  .branch-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .task-count {
    font-size: 0.75rem;
    color: var(--dim);
  }

  .progress-dashes {
    display: flex;
    gap: 4px;
    align-items: center;
  }
}

.dash {
  width: 12px;
  height: 3px;
  background: var(--ui-border-color);
  border-radius: var(--border-radius-sm);
  transition: background var(--transition-standard);

  &.filled {
    background: var(--accent);
  }

  &.small {
    width: 8px;
    height: 2px;
  }
}

.branch-actions {
  display: flex;
  align-items: center;
  gap: 8px;

  button {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--dim);
    padding: 6px;
    border-radius: var(--border-radius-pill);
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &:hover {
      background: var(--glass-surface);
      color: var(--text);
    }

    &:active {
      background: var(--glass-surface);
      color: var(--text);
    }
  }

  .branch-delete:active {
    color: var(--error);
  }
}

.milestones {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.milestone-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  @include glass;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--node-bg-color) 12%, transparent),
      color-mix(in srgb, var(--node-bg-color) 4%, transparent)
    ),
    var(--glass-surface);
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard);

  .node-marker {
    margin-top: 8px;
  }

  &.active {
    border-color: var(--warning);
  }

  &.completed {
    border-color: var(--success);
  }
}

.milestone-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: var(--glass-surface);
  border-radius: var(--border-radius-pill);
  font-weight: 600;
  font-size: 0.85rem;
  flex-shrink: 0;
  color: var(--dim);
}

.milestone-content {
  flex: 1;
  min-width: 0;
}

.milestone-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  flex-wrap: wrap;
  gap: 6px;

  h5 {
    font-weight: 600;
    font-size: 0.9rem;
    margin: 0;
    color: var(--text);
  }

  .milestone-badges {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .task-dashes {
    display: flex;
    gap: 3px;
    align-items: center;
  }
}

.description {
  font-size: 0.8rem;
  color: var(--dim);
  margin: 6px 0;
  line-height: 1.35;
}

.progress-dashes {
  display: flex;
  gap: 3px;
  align-items: center;
  margin: 6px 0 4px;
}

.task-counter {
  font-size: 0.75rem;
  color: var(--dim);
  margin-bottom: 8px;
}

.milestone-tasks {
  ul {
    list-style: none;
    padding: 0;
    margin: 8px 0 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  li {
    font-size: 0.8rem;
    color: var(--text);
    padding: 4px 6px;
    border-radius: var(--border-radius-pill);
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &.done {
      color: var(--dim);
      text-decoration: line-through;
    }
  }
}

.milestone-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;

  button {
    background: transparent;
    border: none;
    color: var(--dim);
    cursor: pointer;
    padding: 6px;
    border-radius: var(--border-radius-pill);
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &:hover {
      background: var(--glass-surface);
      color: var(--text);
    }

    &:active {
      background: var(--glass-surface);
      color: var(--text);
    }
  }

  .milestone-delete:active {
    color: var(--error);
  }
}

.add-milestone-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: var(--glass-surface);
  border: none;
  border-radius: var(--border-radius-pill);
  color: var(--dim);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    color var(--transition-standard);

  &:active {
    background: var(--glass-surface);
    border-style: solid;
    color: var(--text);
  }
}

/* Маркеры (декоративные) */
.node-marker {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  background: var(--accent);
  border: none;
  transition: opacity var(--transition-standard);
}

.branch-marker {
  border-radius: 2px;
}

.milestone-marker {
  border-radius: var(--border-radius-pill);
}

/* Анимации раскрытия */
.expand-enter-active,
.expand-leave-active {
  transition:
    opacity var(--transition-standard),
    transform var(--transition-standard);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Ротация иконки */
svg {
  transition: transform var(--transition-standard);

  &.rotated {
    transform: rotate(180deg);
  }
}
</style>
