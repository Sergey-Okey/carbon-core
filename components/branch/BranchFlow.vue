<template>
  <div ref="boardWrapper" class="branch-flow-wrapper" tabindex="-1">
    <BranchMobileView
      v-if="isMobile"
      :selected-node-id="selectedNodeId"
      @edit-milestone="openMilestoneEditor"
      @select-node="selectMobileNode"
      @add-milestone="addMilestoneToSelectedBranch"
      @add-branch="openAddBranchModal"
      @edit-branch="openBranchEditor"
      @delete-branch="handleDeleteBranchFromMobile"
      @delete-milestone="handleDeleteMilestoneFromMobile"
    />

    <VueFlow
      v-else
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      :snap-to-grid="true"
      :snap-grid="[20, 20]"
      :connection-mode="ConnectionMode.Loose"
      :pan-on-drag="true"
      :zoom-on-scroll="true"
      :fit-view-on-init="true"
      :nodes-draggable="true"
      :edges-updatable="true"
      :nodes-focusable="true"
      @node-drag-stop="onNodeDragStop"
      @edges-change="onEdgesChange"
      @connect="onConnect"
      @edge-update="onEdgeUpdate"
      @node-click="onNodeClick"
      @edge-click="onEdgeClick"
      @pane-click="onPaneClick"
    >
      <Background :variant="BackgroundVariant.Dots" :gap="20" :size="1.5" />

      <BoardControls
        :can-undo="canUndo"
        :can-redo="canRedo"
        :can-add-branch="canAddBranch"
        :can-add-milestone="canAddMilestone"
        :has-selection="!!selectedNodeId || !!selectedEdgeId"
        :selection-type="selectedControlType"
        @fit-view="fitView"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @align-layout="alignLayout"
        @add-branch="openAddBranchModal"
        @add-milestone="addMilestoneToSelectedBranch"
        @delete-selected="deleteSelected"
        @undo="undo"
        @redo="redo"
      />

      <template #node-branch-node="nodeProps">
        <BranchNode
          :data="nodeProps.data"
          :selected="selectedNodeId === nodeProps.id"
          @edit="openBranchEditor(nodeProps.data.branchId)"
        />
      </template>
      <template #node-milestone-node="nodeProps">
        <MilestoneNode
          :data="nodeProps.data"
          :selected="selectedNodeId === nodeProps.id"
          @edit="
            nodeProps.data.milestone &&
            openMilestoneEditor(nodeProps.data.milestone)
          "
        />
      </template>
    </VueFlow>

    <NodeEditorModal
      v-if="editingMilestone"
      :milestone="editingMilestone"
      @close="editingMilestone = null"
      @save="handleSaveMilestone"
      @delete="handleDeleteMilestone"
    />
    <NodeEditorModal
      v-if="creatingMilestone"
      :milestone="emptyMilestone"
      :is-create-mode="true"
      @close="creatingMilestone = false"
      @save="handleCreateMilestone"
    />
    <BranchModal
      v-if="branchModal.visible"
      :branch="branchModal.branch"
      @close="branchModal.visible = false"
      @save="handleSaveBranch"
      @delete="handleDeleteBranch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import {
  VueFlow,
  ConnectionMode,
  useVueFlow,
  type Node,
  type Edge,
  type Connection,
} from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { useBranchesStore } from '~/stores/branches.store'
import { useSettingsStore } from '~/stores/settings.store'
import { useConfirm } from '~/composables/useConfirm'
import { useNotification } from '~/composables/useNotification'
import BranchNode from './BranchNode.vue'
import MilestoneNode from './MilestoneNode.vue'
import NodeEditorModal from './NodeEditorModal.vue'
import BranchModal from './BranchModal.vue'
import BranchMobileView from './BranchMobileView.vue'
import BoardControls from './BoardControls.vue'
import type { Milestone, Branch, BranchNodeData } from '~/types/branch.types'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const branchesStore = useBranchesStore()
const settingsStore = useSettingsStore()
const { fitView, zoomIn: vfZoomIn, zoomOut: vfZoomOut } = useVueFlow()
const { confirm } = useConfirm()
const { addNotification } = useNotification()

const history = ref<{ branches: Branch[]; edges: Edge[] }[]>([])
const historyIndex = ref(-1)
const isRestoring = ref(false)
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const nodeTypes = {
  'branch-node': BranchNode as any,
  'milestone-node': MilestoneNode as any,
} as any
const nodes = ref<Node<BranchNodeData>[]>([])
const edges = ref<Edge[]>([])
const isMobile = ref(false)
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)
const selectedEdge = ref<Edge | null>(null)
const edgeSnapshot = ref<Edge[]>([])
const isSyncingFlow = ref(false)
const editingMilestone = ref<Milestone | null>(null)
const creatingMilestone = ref(false)
const branchModal = ref<{ visible: boolean; branch: Branch | null }>({
  visible: false,
  branch: null,
})
const boardWrapper = ref<HTMLElement | null>(null)

const emptyMilestone: Milestone = {
  id: '',
  name: '',
  icon: 'target',
  description: '',
  requiredXP: 500,
  currentXP: 0,
  status: 'pending',
  taskIds: [],
  position: { x: 0, y: 0 },
}

const canAddBranch = computed(() => !selectedNodeId.value && !selectedEdgeId.value)
const canAddMilestone = computed(() => selectedNodeId.value !== null)
const selectedControlType = computed<'branch' | 'milestone' | 'edge' | 'none'>(() => {
  if (selectedEdgeId.value) return 'edge'
  if (!selectedNodeId.value) return 'none'

  const node = nodes.value.find((item) => item.id === selectedNodeId.value)
  if (node?.type === 'branch-node') return 'branch'
  if (node?.type === 'milestone-node') return 'milestone'
  return 'none'
})

function cloneState() {
  return {
    branches: JSON.parse(JSON.stringify(branchesStore.branches)),
    edges: JSON.parse(JSON.stringify(branchesStore.edges)),
  }
}

function saveToHistory() {
  if (isRestoring.value) return
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(cloneState())
  historyIndex.value = history.value.length - 1
}

function restoreSnapshot(index: number) {
  isRestoring.value = true
  const snapshot = history.value[index]
  branchesStore.$patch({
    branches: JSON.parse(JSON.stringify(snapshot.branches)),
    edges: JSON.parse(JSON.stringify(snapshot.edges)),
  })
  syncNodesAndEdges()
  isRestoring.value = false
}

function undo() {
  if (!canUndo.value) return
  historyIndex.value--
  restoreSnapshot(historyIndex.value)
}

function redo() {
  if (!canRedo.value) return
  historyIndex.value++
  restoreSnapshot(historyIndex.value)
}

function syncNodesAndEdges() {
  isSyncingFlow.value = true
  const newNodes: Node<BranchNodeData>[] = []
  branchesStore.branches.forEach((branch) => {
    newNodes.push({
      id: branch.id,
      type: 'branch-node',
      position: branch.position || { x: 100, y: 100 },
      data: {
        type: 'branch',
        branchId: branch.id,
        milestone: null,
        branchIcon: branch.icon,
      },
    })
    branch.milestones.forEach((milestone) => {
      newNodes.push({
        id: milestone.id,
        type: 'milestone-node',
        position: milestone.position,
        data: {
          type: 'milestone',
          branchId: branch.id,
          milestone,
          branchIcon: branch.icon,
        },
      })
    })
  })

  const existingIds = new Set(newNodes.map((node) => node.id))
  nodes.value = newNodes
  edges.value = branchesStore.edges.filter(
    (edge) => existingIds.has(edge.source) && existingIds.has(edge.target)
  )
  edgeSnapshot.value = JSON.parse(JSON.stringify(edges.value))
  nextTick(() => {
    isSyncingFlow.value = false
  })
}

function onConnect(connection: Connection) {
  if (!connection.source || !connection.target) return

  const result = branchesStore.connectNodes(connection.source, connection.target)
  if (!result.ok) {
    addNotification({ type: 'warning', message: result.reason || 'Связь недоступна' })
    return
  }
  saveToHistory()
}

function onEdgeUpdate({ edge, connection }: { edge: Edge; connection: Connection }) {
  if (!connection.source || !connection.target) {
    branchesStore.disconnectEdge(edge)
    saveToHistory()
    return
  }

  branchesStore.removeEdge(edge.id)
  const result = branchesStore.connectNodes(connection.source, connection.target)
  if (!result.ok) {
    branchesStore.addEdge(edge)
    addNotification({ type: 'warning', message: result.reason || 'Связь недоступна' })
  }
  saveToHistory()
}

function onEdgesChange(changes: any[]) {
  if (isSyncingFlow.value) return

  const removedEdges = changes
    .filter((change) => change.type === 'remove' && change.id)
    .map((change) => change.id as string)
    .map((edgeId) =>
      branchesStore.edges.find((edge) => edge.id === edgeId) ||
      edges.value.find((edge) => edge.id === edgeId) ||
      edgeSnapshot.value.find((edge) => edge.id === edgeId)
    )
    .filter((edge): edge is Edge => !!edge)

  if (removedEdges.length === 0) return

  removedEdges.forEach((edge) => branchesStore.disconnectEdge(edge))
  selectedEdgeId.value = null
  selectedEdge.value = null
  saveToHistory()
}

function deleteSelected() {
  if (selectedEdgeId.value) {
    deleteSelectedEdge()
    return
  }

  if (!selectedNodeId.value) return
  const node = nodes.value.find((item) => item.id === selectedNodeId.value)
  if (node?.type === 'branch-node') deleteSelectedBranch()
  if (node?.type === 'milestone-node') deleteSelectedMilestone()
}

async function deleteSelectedEdge() {
  const edgeId = selectedEdgeId.value
  if (!edgeId) return

  if (settingsStore.boardConfirmEdgeDelete) {
    const ok = await confirm('Разорвать связь?')
    if (!ok) return
  }

  const edge =
    selectedEdge.value ||
    branchesStore.edges.find((item) => item.id === edgeId) ||
    edges.value.find((item) => item.id === edgeId) ||
    edgeSnapshot.value.find((item) => item.id === edgeId)
  if (!edge) return

  branchesStore.disconnectEdge(edge)
  selectedEdgeId.value = null
  selectedEdge.value = null
  saveToHistory()
}

async function deleteSelectedBranch() {
  const node = nodes.value.find((item) => item.id === selectedNodeId.value)
  if (!node || node.type !== 'branch-node' || !node.data) return

  const branch = branchesStore.branches.find((item) => item.id === node.data.branchId)
  if (!branch) return

  if (settingsStore.boardConfirmBranchDelete) {
    const ok = await confirm(`Удалить ветку «${branch.displayName}»?`)
    if (!ok) return
  }

  branchesStore.deleteBranch(branch.id)
  selectedNodeId.value = null
  saveToHistory()
}

async function deleteSelectedMilestone() {
  const node = nodes.value.find((item) => item.id === selectedNodeId.value)
  if (!node || node.type !== 'milestone-node' || !node.data?.milestone) return

  const milestone = node.data.milestone
  const ok = await confirm(`Удалить этап «${milestone.name}»?`)
  if (!ok) return

  branchesStore.deleteMilestone(milestone.id)
  selectedNodeId.value = null
  saveToHistory()
}

function alignLayout() {
  if (branchesStore.branches.length === 0) return

  const density = {
    compact: { branchGapX: 760, branchGapY: 220, milestoneGapX: 220 },
    normal: { branchGapX: 980, branchGapY: 260, milestoneGapX: 260 },
    wide: { branchGapX: 1180, branchGapY: 320, milestoneGapX: 320 },
  }[settingsStore.boardLayoutDensity]
  const cols = settingsStore.boardColumns
  const branchGapX = density.branchGapX
  const branchGapY = density.branchGapY
  const milestoneStartX = 300
  const milestoneGapX = density.milestoneGapX
  const startX = 100
  const startY = 100

  branchesStore.branches.forEach((branch, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const branchPosition = {
      x: startX + col * branchGapX,
      y: startY + row * branchGapY,
    }
    branchesStore.updateBranchPosition(branch.id, branchPosition)

    branch.milestones.forEach((milestone, milestoneIndex) => {
      branchesStore.updateMilestone(milestone.id, {
        position: {
          x: branchPosition.x + milestoneStartX + milestoneIndex * milestoneGapX,
          y: branchPosition.y,
        },
      })
    })
  })

  syncNodesAndEdges()
  saveToHistory()
  refocusBoard()
  addNotification({ type: 'success', message: 'Доска выровнена' })
}

function handleKeyDown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const isTyping =
    target?.closest('input, textarea, select, [contenteditable="true"], .app-modal-overlay')

  if (isTyping) return

  const key = event.key.toLowerCase()
  if ((event.ctrlKey || event.metaKey) && key === 'z') {
    event.preventDefault()
    undo()
    return
  }
  if ((event.ctrlKey || event.metaKey) && key === 'y') {
    event.preventDefault()
    redo()
    return
  }
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    deleteSelected()
  }
}

function openMilestoneEditor(milestone: Milestone) {
  editingMilestone.value = milestone
}

function openMilestoneCreator() {
  creatingMilestone.value = true
}

function addMilestoneToSelectedBranch(sourceNodeId?: string) {
  if (sourceNodeId) {
    selectedNodeId.value = sourceNodeId
    selectedEdgeId.value = null
    selectedEdge.value = null
  }

  if (!selectedNodeId.value) {
    addNotification({ type: 'warning', message: 'Выберите ветку или этап' })
    return
  }

  openMilestoneCreator()
}

function selectMobileNode(nodeId: string | null) {
  selectedNodeId.value = nodeId
  selectedEdgeId.value = null
  selectedEdge.value = null
}

function handleCreateMilestone(data: Partial<Milestone>) {
  if (!selectedNodeId.value) return

  const newMilestone = branchesStore.createMilestoneFromSource(selectedNodeId.value, data)
  if (!newMilestone) return

  creatingMilestone.value = false
  saveToHistory()
  refocusBoard()
}

function handleSaveMilestone(updates: Partial<Milestone>) {
  if (!editingMilestone.value) return
  branchesStore.updateMilestone(editingMilestone.value.id, updates)
  editingMilestone.value = null
  saveToHistory()
  refocusBoard()
}

async function handleDeleteMilestone() {
  const milestone = editingMilestone.value
  if (!milestone) return

  if (settingsStore.confirmDangerActions) {
    const ok = await confirm(`Удалить этап «${milestone.name}»?`)
    if (!ok) return
  }

  branchesStore.deleteMilestone(milestone.id)
  editingMilestone.value = null
  saveToHistory()
  refocusBoard()
}

function openBranchEditor(branchId: string) {
  const branch = branchesStore.branches.find((item) => item.id === branchId)
  if (branch) branchModal.value = { visible: true, branch }
}

function openAddBranchModal() {
  if (!canAddBranch.value) {
    addNotification({ type: 'warning', message: 'Снимите выделение, чтобы создать ветку' })
    return
  }

  selectedNodeId.value = null
  selectedEdgeId.value = null
  selectedEdge.value = null

  branchModal.value = { visible: true, branch: null }
}

function handleSaveBranch(data: any) {
  if (branchModal.value.branch) {
    branchesStore.updateBranch(branchModal.value.branch.id, {
      ...data,
      displayName: data.name,
    })
  } else {
    branchesStore.addBranch(data.name, data.icon, data.description, data.taskIds)
  }
  branchModal.value.visible = false
  saveToHistory()
}

async function handleDeleteBranch() {
  const branch = branchModal.value.branch
  if (!branch) return

  if (settingsStore.boardConfirmBranchDelete) {
    const ok = await confirm(`Удалить ветку «${branch.displayName}»?`)
    if (!ok) return
  }

  branchesStore.deleteBranch(branch.id)
  branchModal.value.visible = false
  selectedNodeId.value = null
  saveToHistory()
  refocusBoard()
}

async function handleDeleteBranchFromMobile(branchId: string) {
  const branch = branchesStore.branches.find((item) => item.id === branchId)
  if (!branch) return

  if (settingsStore.boardConfirmBranchDelete) {
    const ok = await confirm(`Удалить ветку «${branch.displayName}»?`)
    if (!ok) return
  }

  branchesStore.deleteBranch(branchId)
  saveToHistory()
}

async function handleDeleteMilestoneFromMobile(milestoneId: string) {
  const milestone = branchesStore.branches
    .flatMap((branch) => branch.milestones)
    .find((item) => item.id === milestoneId)
  if (!milestone) return

  if (settingsStore.confirmDangerActions) {
    const ok = await confirm(`Удалить этап «${milestone.name}»?`)
    if (!ok) return
  }

  branchesStore.deleteMilestone(milestoneId)
  saveToHistory()
}

function onNodeClick({ node }: { node: Node }) {
  selectedNodeId.value = node.id
  selectedEdgeId.value = null
  selectedEdge.value = null
}

function onEdgeClick({ edge }: { edge: Edge }) {
  selectedEdgeId.value = edge.id
  selectedEdge.value = { ...edge }
  selectedNodeId.value = null
}

function onPaneClick() {
  selectedNodeId.value = null
  selectedEdgeId.value = null
  selectedEdge.value = null
}

function onNodeDragStop({ node }: { node: Node }) {
  if (node.type === 'branch-node') {
    branchesStore.updateBranchPosition(node.id, node.position)
  }
  if (node.type === 'milestone-node') {
    branchesStore.updateMilestone(node.id, { position: node.position })
  }
  saveToHistory()
  refocusBoard()
}

function refocusBoard() {
  if (!settingsStore.boardFocusAfterAction) return
  nextTick(() => boardWrapper.value?.focus({ preventScroll: true }))
}

function zoomIn() {
  vfZoomIn()
}

function zoomOut() {
  vfZoomOut()
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  branchesStore.refreshAllBranches()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('keydown', handleKeyDown)
  nextTick(() => {
    syncNodesAndEdges()
    if (!isMobile.value) {
      setTimeout(() => {
        fitView()
        if (settingsStore.boardAutoFocus) boardWrapper.value?.focus({ preventScroll: true })
      }, 100)
    }
    saveToHistory()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('keydown', handleKeyDown)
})

watch(
  () => [branchesStore.branches, branchesStore.edges],
  () => syncNodesAndEdges(),
  { immediate: true, deep: true }
)
</script>

<style scoped lang="scss">
.branch-flow-wrapper {
  @include glass;
  width: 100%;
  height: 100%;
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  position: relative;
  overflow: hidden;

  @include mobile {
    width: 100%;
    height: 100%;
    margin: 0;
  }
}

:deep(.vue-flow) {
  background: transparent;
  width: 100%;
  height: 100%;
}

:deep(.vue-flow__background) {
  background-color: transparent;

  .vue-flow__background-pattern {
    stroke: var(--border);
  }
}

:deep(.vue-flow__edge-path) {
  stroke: var(--accent);
  stroke-width: 1;
}

:deep(.vue-flow__node.selected .branch-node, .vue-flow__node.selected .milestone-node) {
  border: 1px solid var(--accent) !important;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: var(--accent);
  stroke-width: 3;
}
</style>
