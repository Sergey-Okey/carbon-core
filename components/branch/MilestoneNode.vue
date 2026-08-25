<template>
  <GlassCard
    :id="`node-${data.milestone.id}`"
    class="milestone-node"
    variant="surface"
    :class="{
      completed: data.milestone.status === 'completed',
      expanded: isExpanded,
      selected: selected,
    }"
    :style="nodeStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="node-main">
      <div class="node-header">
        <span class="node-icon" aria-hidden="true">
          <component :is="iconComponent" :size="18" />
        </span>
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
      <div class="node-title-row">
        <h4>{{ data.milestone.name }}</h4>
        <button class="expand-btn nodrag" @click.stop="togglePinned">
          <ChevronDown :size="16" :class="{ rotated: isExpanded }" />
        </button>
      </div>
      <div class="node-foot">
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
      </div>
    </div>

    <Transition name="expand">
      <div v-if="isExpanded" class="node-details">
        <section class="detail-section">
          <h5 class="detail-label">Описание</h5>
          <p v-if="data.milestone.description" class="detail-text">
            {{ data.milestone.description }}
          </p>
          <p v-else class="detail-empty">Нет описания</p>
        </section>

        <section class="detail-section">
          <div class="detail-heading">
            <h5 class="detail-label">Задачи</h5>
            <span v-if="linkedTasks.length" class="detail-count">
              {{ completedLinkedTasks }}/{{ linkedTasks.length }}
            </span>
          </div>
          <ul v-if="linkedTasks.length" class="task-list">
            <li
              v-for="(task, index) in linkedTasks"
              :key="task.id"
              class="task-row"
              :class="{ done: task.done }"
            >
              <span class="task-index" aria-hidden="true">{{ index + 1 }}</span>
              <span class="task-title">{{ task.title }}</span>
            </li>
          </ul>
          <p v-else class="detail-empty">Нет привязанных задач</p>
        </section>
      </div>
    </Transition>

    <Handle
      :id="`target-top-${data.milestone.id}`"
      type="target"
      :position="Position.Top"
      :connectable="true"
      :connectable-start="true"
      :connectable-end="true"
      class="handle handle-top handle-target"
      :style="targetHandleStyle"
    />
    <Handle
      :id="`source-top-${data.milestone.id}`"
      type="source"
      :position="Position.Top"
      :connectable="true"
      :connectable-start="true"
      :connectable-end="true"
      class="handle handle-top handle-source"
      :style="sourceHandleStyle"
    />
    <Handle
      :id="`target-left-${data.milestone.id}`"
      type="target"
      :position="Position.Left"
      :connectable="true"
      :connectable-start="true"
      :connectable-end="true"
      class="handle handle-left handle-target"
      :style="targetHandleStyle"
    />
    <Handle
      :id="`source-left-${data.milestone.id}`"
      type="source"
      :position="Position.Left"
      :connectable="true"
      :connectable-start="true"
      :connectable-end="true"
      class="handle handle-left handle-source"
      :style="sourceHandleStyle"
    />
    <Handle
      :id="`target-right-${data.milestone.id}`"
      type="target"
      :position="Position.Right"
      :connectable="true"
      :connectable-start="true"
      :connectable-end="true"
      class="handle handle-right handle-target"
      :style="targetHandleStyle"
    />
    <Handle
      :id="`source-right-${data.milestone.id}`"
      type="source"
      :position="Position.Right"
      :connectable="true"
      :connectable-start="true"
      :connectable-end="true"
      class="handle handle-right handle-source"
      :style="sourceHandleStyle"
    />
    <Handle
      :id="`target-bottom-${data.milestone.id}`"
      type="target"
      :position="Position.Bottom"
      :connectable="true"
      :connectable-start="true"
      :connectable-end="true"
      class="handle handle-bottom handle-target"
      :style="targetHandleStyle"
    />
    <Handle
      :id="`source-bottom-${data.milestone.id}`"
      type="source"
      :position="Position.Bottom"
      :connectable="true"
      :connectable-start="true"
      :connectable-end="true"
      class="handle handle-bottom handle-source"
      :style="sourceHandleStyle"
    />
  </GlassCard>
</template>

<script setup lang="ts">
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
  CalendarDays,
  Compass,
  Flag,
  FolderKanban,
  GraduationCap,
  HelpCircle,
  Home,
  Lightbulb,
  Map,
  Plane,
  Rocket,
  Trophy,
  WalletCards,
} from 'lucide-vue-next'
import type { Milestone, BranchNodeData } from '~/types/branch.types'

const props = defineProps<{
  data: Extract<BranchNodeData, { type: 'milestone' }>
  selected?: boolean
  forceExpanded?: boolean
}>()
const emit = defineEmits<{ (e: 'edit', milestone: Milestone): void }>()

const tasksStore = useTasksStore()
const branchesStore = useBranchesStore()
const milestone = computed(() => props.data.milestone!)
const branchColor = computed(() => {
  const branch = branchesStore.branches.find((item) => item.id === props.data.branchId)
  return branch?.markerColor || branch?.backgroundColor || props.data.branchColor || 'var(--accent)'
})
const milestoneColor = computed(
  () => milestone.value.markerColor || milestone.value.backgroundColor || branchColor.value
)
const nodeStyle = computed(() => ({
  '--node-marker-color': milestoneColor.value,
  '--node-handle-color': branchColor.value,
}))
const sourceHandleStyle = computed(() => ({
  background: branchColor.value,
  borderColor: branchColor.value,
}))
const targetHandleStyle = computed(() => ({
  background: branchColor.value,
  borderColor: branchColor.value,
}))

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
    rocket: Rocket,
    flag: Flag,
    compass: Compass,
    map: Map,
    plane: Plane,
    home: Home,
    'graduation-cap': GraduationCap,
    lightbulb: Lightbulb,
    trophy: Trophy,
    'wallet-cards': WalletCards,
    'folder-kanban': FolderKanban,
    'calendar-days': CalendarDays,
    'help-circle': HelpCircle,
  }
  return map[iconName] || HelpCircle
})

const linkedTasks = computed(() => {
  return tasksStore.tasks.filter((t) => milestone.value.taskIds.includes(t.id))
})

const completedLinkedTasks = computed(
  () => linkedTasks.value.filter((t) => t.done).length
)

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
  isExpanded.value = !!props.forceExpanded || hovered.value || isPinned.value
}

watch(
  () => props.forceExpanded,
  () => updateExpanded(),
  { immediate: true }
)
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

  --node-pad: var(--space-3);
  --panel-padding: var(--node-pad);
  display: flex;
  flex-direction: column;
  width: 220px;
  min-height: 120px;
  box-sizing: border-box;
  position: relative;
  overflow: visible;
  transition: border-color var(--transition-standard);

  .node-main {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
    min-height: 0;
    height: 100%;
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
    gap: var(--space-2);
    margin: 0;
    min-height: 22px;
    flex: 0 0 auto;
  }

  .node-icon {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    width: auto;
    height: auto;
    flex: 0 0 auto;
    padding: 0;
    margin: 0;
    border-radius: 0;
    color: var(--node-marker-color);
    background: transparent;
    border: none;
    line-height: 0;
  }

  .node-icon :deep(svg) {
    width: 18px;
    height: 18px;
    stroke-width: 2.2;
    display: block;
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
    width: 8px;
    height: 8px;
    background: var(--node-marker-color);
    border-radius: 50%;
    border: none;
    opacity: 0.85;
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

  .node-title-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    flex: 0 0 auto;
    min-width: 0;
  }

  h4 {
    flex: 1 1 auto;
    min-width: 0;
    font-size: var(--text-sm);
    font-weight: 600;
    margin: 0;
    color: var(--text);
    word-break: break-word;
  }

  .node-foot {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-top: auto;
    flex: 0 0 auto;
    min-width: 0;
  }

  .progress-dashes {
    display: flex;
    gap: var(--space-1);
    margin: 0;
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
    font-size: var(--text-sm);
    color: var(--dim);
    margin: 0;
  }

  .expand-btn {
    position: static;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 20px;
    height: 20px;
    margin: 0;
    padding: 0;
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
    @include surface-panel;
    position: absolute;
    left: 0;
    top: calc(100% + 8px);
    z-index: 80;
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
    max-height: 260px;
    padding: var(--node-pad);
    overflow-y: auto;
    border-radius: var(--border-radius-md);
    font-size: var(--text-sm);
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

    .detail-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      min-width: 0;

      & + .detail-section {
        margin-top: var(--space-3);
        padding-top: var(--space-3);
        border-top: 1px solid var(--ui-border-color);
      }
    }

    .detail-heading {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-2);
      min-height: 1em;
    }

    .detail-label {
      margin: 0;
      color: var(--dim);
      font-size: var(--text-2xs);
      font-weight: 700;
      letter-spacing: 0.06em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .detail-count {
      flex: 0 0 auto;
      color: var(--dim);
      font-size: var(--text-2xs);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      line-height: 1.2;
    }

    .detail-text,
    .detail-empty {
      margin: 0;
      padding: 0;
      font-size: var(--text-sm);
      line-height: 1.4;
    }

    .detail-text {
      color: var(--text);
      white-space: pre-wrap;
    }

    .detail-empty {
      color: var(--dim);
    }

    .task-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .task-row {
      display: grid;
      grid-template-columns: 1.25rem minmax(0, 1fr);
      column-gap: var(--space-2);
      align-items: baseline;
      min-width: 0;
      padding: var(--space-1) 0;
      margin: 0;
      background: none;

      &.done {
        .task-title {
          color: var(--dim);
          text-decoration: line-through;
        }

        .task-index {
          color: var(--success);
        }
      }
    }

    .task-index {
      grid-column: 1;
      color: var(--dim);
      font-size: var(--text-sm);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      line-height: 1.4;
      text-align: right;
    }

    .task-title {
      grid-column: 2;
      display: block;
      min-width: 0;
      color: var(--text);
      font-size: var(--text-sm);
      line-height: 1.4;
      overflow-wrap: anywhere;

      &::first-letter {
        text-transform: uppercase;
      }
    }
  }

  .handle {
    z-index: 10;
    width: 12px !important;
    height: 12px !important;
    min-width: 12px !important;
    min-height: 12px !important;
    border-radius: 50% !important;
    opacity: 0.34;
    border: 1.5px solid color-mix(in srgb, var(--node-handle-color) 70%, var(--ui-border-color));
    background: var(--node-handle-color) !important;
    box-shadow: none;
    pointer-events: all !important;
    cursor: crosshair;
    transition:
      opacity var(--transition-standard),
      outline-color var(--transition-standard);
  }

  .handle-target {
    z-index: 10;
  }

  .handle-source {
    z-index: 11;
  }

  .handle.connectionindicator {
    z-index: 12 !important;
    opacity: 1;
  }

  .handle-top {
    top: 0 !important;
    left: 50% !important;
    right: auto !important;
    bottom: auto !important;
    transform: translate(-50%, -50%) !important;
  }

  .handle-bottom {
    bottom: 0 !important;
    left: 50% !important;
    top: auto !important;
    right: auto !important;
    transform: translate(-50%, 50%) !important;
  }

  .handle-left {
    top: 50% !important;
    left: 0 !important;
    right: auto !important;
    bottom: auto !important;
    transform: translate(-50%, -50%) !important;
  }

  .handle-right {
    top: 50% !important;
    right: 0 !important;
    left: auto !important;
    bottom: auto !important;
    transform: translate(50%, -50%) !important;
  }

  &:hover .handle,
  &.selected .handle {
    opacity: 0.95;
    outline: 2px solid color-mix(in srgb, var(--node-handle-color) 30%, transparent);
    outline-offset: 2px;
  }

  .handle:hover,
  .handle:active {
    opacity: 1;
    outline: 2px solid color-mix(in srgb, var(--node-handle-color) 45%, transparent);
    outline-offset: 2px;
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
@media (max-width: 767px) {
  .milestone-node .node-details {
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
      display: none;
    }
  }
}
</style>
