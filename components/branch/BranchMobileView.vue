<template>
  <div class="branch-mobile-view">
    <!-- Панель инструментов -->
    <div class="mobile-controls">
      <button data-tour="board-add-branch" @click="addBranch">
        <Plus :size="20" />
        <span>Ветка</span>
      </button>
      <button data-tour="board-add-milestone" @click="addMilestoneToSelectedBranch">
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
        :style="{ '--node-marker-color': branch.markerColor || branch.backgroundColor || '#d6d6d6' }"
        data-tour="board-branch-node"
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
              :style="{ '--node-marker-color': milestone.markerColor || milestone.backgroundColor || branch.markerColor || branch.backgroundColor || '#d6d6d6' }"
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

    <aside class="desktop-invitation">
      <div class="desktop-invitation-icon" aria-hidden="true">
        <MonitorUp :size="22" />
      </div>
      <div>
        <span>Полная версия доски</span>
        <strong>Увидьте всю систему целиком</strong>
        <p>Откройте COF на компьютере, чтобы свободно перемещать ветки, соединять этапы и видеть связи на одном пространстве.</p>
      </div>
    </aside>
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
  MonitorUp,
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
  width: 100%;
  padding:
    calc(72px + env(safe-area-inset-top, 0px))
    max(12px, env(safe-area-inset-right, 0px))
    calc(96px + env(safe-area-inset-bottom, 0px))
    max(12px, env(safe-area-inset-left, 0px));
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background: transparent;
  min-height: 100%;
  box-sizing: border-box;
}

.mobile-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 20px;

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    min-width: 0;
    min-height: 44px;
    padding: 0 14px;
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
  width: 100%;
  min-width: 0;
}

.desktop-invitation {
  @include glass;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  margin-top: 24px;
  padding: 18px;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background: var(--glass-surface);

  div:last-child {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  span {
    color: var(--dim);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  strong {
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.08rem;
    line-height: 1.15;
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.8rem;
    line-height: 1.5;
  }
}

.desktop-invitation-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  color: var(--accent);
}

.branch-item {
  @include glass;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background: var(--glass-surface);
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
  min-width: 0;
  box-sizing: border-box;
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
  min-width: 0;

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
  min-width: 0;

  h4 {
    font-weight: 600;
    font-size: 1rem;
    margin: 0 0 4px;
    color: var(--text);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .branch-stats {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .task-count {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    max-width: 100%;
    padding: 3px 8px;
    border-radius: var(--border-radius-pill);
    background: color-mix(in srgb, var(--glass-surface) 92%, transparent);
    font-size: 0.75rem;
    color: var(--dim);
    line-height: 1.2;
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
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
  padding: 12px;
  box-sizing: border-box;
}

.milestone-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  padding: 12px;
  box-sizing: border-box;
  @include glass;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background: var(--glass-surface);
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
  max-width: 100%;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  max-width: 100%;
  padding: 5px 10px;
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--glass-surface) 92%, transparent);
  font-size: 0.75rem;
  color: var(--dim);
  margin-bottom: 8px;
  line-height: 1.2;
  white-space: nowrap;
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

/* Decorative markers */
.node-marker {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  background: var(--node-marker-color, var(--accent));
  border: none;
  transition: opacity var(--transition-standard);
}

.branch-marker {
  border-radius: 2px;
}

.milestone-marker {
  border-radius: var(--border-radius-pill);
}

/* Expand animation */
.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 160ms ease,
    transform 180ms cubic-bezier(0.2, 0, 0, 1);
  overflow: hidden;
  transform-origin: top;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 480px) {
  .branch-header {
    align-items: center;
    gap: 10px;
    padding: 12px;
  }

  .branch-actions {
    gap: 4px;
    margin-top: 0;
    flex: 0 0 auto;

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--control-icon-size);
      height: var(--control-icon-size);
      padding: 0;
      flex: 0 0 var(--control-icon-size);
    }

    > svg {
      width: var(--control-icon-size);
      height: var(--control-icon-size);
      padding: 7px;
      box-sizing: border-box;
      flex: 0 0 var(--control-icon-size);
    }
  }

  .branch-text {
    .branch-stats {
      gap: 6px;
    }

    .progress-dashes {
      width: 100%;
      overflow: hidden;
    }
  }

  .milestone-item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 8px;

    .node-marker {
      display: none;
    }
  }

  .milestone-header {
    align-items: flex-start;
  }

  .milestone-badges,
  .task-dashes,
  .progress-dashes {
    flex-wrap: wrap;
  }

  .task-counter {
    width: 100%;
    justify-content: flex-start;
    box-sizing: border-box;
  }
}

/* Icon rotation */
svg {
  transition: transform var(--transition-standard);

  &.rotated {
    transform: rotate(180deg);
  }
}
</style>
