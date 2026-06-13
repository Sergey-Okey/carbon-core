<template>
  <div
    ref="boardWrapper"
    class="branch-flow-wrapper"
    :class="{ 'is-auto-layouting': isAutoLayoutAnimating }"
  >
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
      :default-edge-options="defaultEdgeOptions"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      :snap-to-grid="true"
      :snap-grid="[20, 20]"
      :connection-mode="ConnectionMode.Loose"
      :pan-on-drag="[0, 1, 2]"
      :selection-on-drag="false"
      :multi-selection-key-code="['Control', 'Meta', 'Shift']"
      :zoom-on-scroll="true"
      :fit-view-on-init="true"
      :nodes-draggable="true"
      :edges-updatable="true"
      :nodes-focusable="false"
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
        :has-selection="selectedNodeIds.length > 0 || !!selectedEdgeId"
        :selection-type="selectedControlType"
        :handle-offset="handleOffset"
        @fit-view="fitView"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @align-layout="alignLayoutSmart"
        @export-png="exportBoardPng"
        @update:handle-offset="handleOffset = $event"
        @add-branch="openAddBranchModal"
        @add-milestone="addMilestoneToSelectedBranch"
        @delete-selected="deleteSelected"
        @undo="undo"
        @redo="redo"
      />

      <template #node-branch-node="nodeProps">
        <BranchNode
          :data="nodeProps.data"
          :selected="nodeProps.selected || selectedNodeId === nodeProps.id"
          @edit="openBranchEditor(nodeProps.data.branchId)"
        />
      </template>
      <template #node-milestone-node="nodeProps">
        <MilestoneNode
          :data="nodeProps.data"
          :selected="nodeProps.selected || selectedNodeId === nodeProps.id"
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
import { ref, shallowRef, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
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
import { useGuidedTourStore } from '~/stores/guidedTour.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useUIStore } from '~/stores/ui.store'
import { useAutoLayout } from '~/composables/useAutoLayout'
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
const guidedTour = useGuidedTourStore()
const tasksStore = useTasksStore()
const uiStore = useUIStore()
const { fitView, zoomIn: vfZoomIn, zoomOut: vfZoomOut, getSelectedNodes } = useVueFlow()
const { applyLayout } = useAutoLayout()
const { confirm } = useConfirm()
const { addNotification } = useNotification()
const handleOffset = ref(24)
const defaultEdgeOptions = computed(() => ({
  type: 'smoothstep',
  pathOptions: { borderRadius: 50, offset: handleOffset.value },
  animated: false,
  style: { stroke: 'var(--dim)', strokeWidth: 1.15 },
}))

const history = ref<{ branches: Branch[]; edges: Edge[] }[]>([])
const historyIndex = ref(-1)
const isRestoring = ref(false)
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const nodeTypes = {
  'branch-node': BranchNode as any,
  'milestone-node': MilestoneNode as any,
} as any
const nodes = shallowRef<Node<BranchNodeData>[]>([])
const edges = shallowRef<Edge[]>([])
const isMobile = ref(false)
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)
const selectedEdge = shallowRef<Edge | null>(null)
const edgeSnapshot = shallowRef<Edge[]>([])
const isSyncingFlow = ref(false)
const isAutoLayoutAnimating = ref(false)
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
  markerColor: '#d6d6d6',
  position: { x: 0, y: 0 },
}

const canAddBranch = computed(() => !selectedNodeId.value && !selectedEdgeId.value)
const canAddMilestone = computed(() => selectedNodeId.value !== null)
const selectedNodeIds = computed(() => {
  const selected = getSelectedNodes.value.map((node) => node.id)
  if (selectedNodeId.value && !selected.includes(selectedNodeId.value)) selected.push(selectedNodeId.value)
  return selected
})
const selectedControlType = computed<'branch' | 'milestone' | 'edge' | 'none'>(() => {
  if (selectedEdgeId.value) return 'edge'
  if (!selectedNodeId.value) return 'none'

  const node = nodes.value.find((item) => item.id === selectedNodeId.value)
  if (node?.type === 'branch-node') return 'branch'
  if (node?.type === 'milestone-node') return 'milestone'
  return 'none'
})

function getBranchByNodeId(nodeId: string): Branch | undefined {
  return branchesStore.branches.find(
    (branch) =>
      branch.id === nodeId ||
      branch.milestones.some((milestone) => milestone.id === nodeId)
  )
}

function getEdgeColor(edge: Edge) {
  const branch = getBranchByNodeId(edge.source)
  return branch?.markerColor || branch?.backgroundColor || 'var(--dim)'
}

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
  const baseEdgeOptions = defaultEdgeOptions.value
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
        branchColor: branch.markerColor || branch.backgroundColor,
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
          branchColor: branch.markerColor || branch.backgroundColor,
        },
      })
    })
  })

  const existingIds = new Set(newNodes.map((node) => node.id))
  nodes.value = newNodes
  const storedEdges = branchesStore.edges as Edge[]
  edges.value = storedEdges
    .filter((edge) => existingIds.has(edge.source) && existingIds.has(edge.target))
    .map(
      (edge) =>
        ({
          ...baseEdgeOptions,
          ...edge,
          pathOptions: {
            ...baseEdgeOptions.pathOptions,
            ...((edge as Edge & { pathOptions?: typeof baseEdgeOptions.pathOptions }).pathOptions || {}),
          },
          style: {
            ...(edge.style || {}),
            ...baseEdgeOptions.style,
            stroke: getEdgeColor(edge),
          },
        }) as Edge
    )
  edgeSnapshot.value = JSON.parse(JSON.stringify(edges.value))
  nextTick(() => {
    isSyncingFlow.value = false
  })
}

function normalizeConnection(connection: Connection): Connection {
  const shouldSwap =
    connection.sourceHandle?.startsWith('target-') ||
    connection.targetHandle?.startsWith('source-')

  if (!shouldSwap) return connection

  return {
    ...connection,
    source: connection.target,
    target: connection.source,
    sourceHandle: connection.targetHandle,
    targetHandle: connection.sourceHandle,
  }
}

function onConnect(connection: Connection) {
  if (!connection.source || !connection.target) return

  const normalizedConnection = normalizeConnection(connection)
  const result = branchesStore.connectNodes(
    normalizedConnection.source,
    normalizedConnection.target,
    normalizedConnection.sourceHandle,
    normalizedConnection.targetHandle
  )
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
  const normalizedConnection = normalizeConnection(connection)
  const result = branchesStore.connectNodes(
    normalizedConnection.source,
    normalizedConnection.target,
    normalizedConnection.sourceHandle,
    normalizedConnection.targetHandle
  )
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

async function deleteSelected() {
  if (selectedEdgeId.value) {
    deleteSelectedEdge()
    return
  }

  if (selectedNodeIds.value.length > 1) {
    const ok = await confirm(`Удалить выбранные элементы (${selectedNodeIds.value.length})?`)
    if (!ok) return

    const ids = new Set(selectedNodeIds.value)
    branchesStore.branches
      .filter((branch) => ids.has(branch.id))
      .forEach((branch) => branchesStore.deleteBranch(branch.id))
    branchesStore.branches
      .flatMap((branch) => branch.milestones)
      .filter((milestone) => ids.has(milestone.id))
      .forEach((milestone) => branchesStore.deleteMilestone(milestone.id))
    selectedNodeId.value = null
    saveToHistory()
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

  const branchData = node.data as Extract<BranchNodeData, { type: 'branch' }>
  const branch = branchesStore.branches.find((item) => item.id === branchData.branchId)
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
  addNotification({ type: 'success', message: 'Доска выровнена' })
}

function alignLayoutSmart() {
  if (branchesStore.branches.length === 0) return

  const density = {
    compact: { rankSep: 130, nodeSep: 54 },
    normal: { rankSep: 170, nodeSep: 78 },
    wide: { rankSep: 220, nodeSep: 110 },
  }[settingsStore.boardLayoutDensity]

  isAutoLayoutAnimating.value = true
  syncNodesAndEdges()

  const nodeIds = new Set(nodes.value.map((node) => node.id))
  const layoutEdges = branchesStore.edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  )
  const layoutedNodes = applyLayout(nodes.value, layoutEdges, 'LR', {
    rankSep: density.rankSep,
    nodeSep: density.nodeSep,
    marginX: Math.max(80, uiStore.panelWidth + 36),
    marginY: 80,
    snapGrid: 20,
  })

  layoutedNodes.forEach((node) => {
    if (node.type === 'branch-node') {
      branchesStore.updateBranchPosition(node.id, node.position)
      return
    }

    if (node.type === 'milestone-node') {
      branchesStore.updateMilestone(node.id, { position: node.position })
    }
  })

  syncNodesAndEdges()
  saveToHistory()
  nextTick(() => {
    window.setTimeout(() => {
      isAutoLayoutAnimating.value = false
    }, 460)
  })
  addNotification({ type: 'success', message: 'Доска выровнена по связям' })
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
  const sourceBranch = branchesStore.branches.find(
    (branch) =>
      branch.id === selectedNodeId.value ||
      branch.milestones.some((milestone) => milestone.id === selectedNodeId.value)
  )
  emptyMilestone.markerColor = sourceBranch?.markerColor || sourceBranch?.backgroundColor || '#d6d6d6'
  creatingMilestone.value = true
  guidedTour.handleAction('milestone-modal-open')
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
  if (nodeId) guidedTour.handleAction('branch-selected')
}

function handleCreateMilestone(data: Partial<Milestone>) {
  if (!selectedNodeId.value) return

  const newMilestone = branchesStore.createMilestoneFromSource(selectedNodeId.value, data)
  if (!newMilestone) return

  creatingMilestone.value = false
  guidedTour.handleAction('milestone-created')
  saveToHistory()
}

function handleSaveMilestone(updates: Partial<Milestone>) {
  if (!editingMilestone.value) return
  branchesStore.updateMilestone(editingMilestone.value.id, updates)
  editingMilestone.value = null
  saveToHistory()
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
  guidedTour.handleAction('branch-modal-open')
}

function handleSaveBranch(data: any) {
  const isCreating = !branchModal.value.branch
  if (branchModal.value.branch) {
    branchesStore.updateBranch(branchModal.value.branch.id, {
      ...data,
      displayName: data.name,
    })
  } else {
    branchesStore.addBranch(
      data.name,
      data.icon,
      data.description,
      data.taskIds,
      data.markerColor || data.backgroundColor
    )
  }
  branchModal.value.visible = false
  if (isCreating) guidedTour.handleAction('branch-created')
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
  guidedTour.handleAction('branch-selected')
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
}

function zoomIn() {
  vfZoomIn()
}

function zoomOut() {
  vfZoomOut()
}

async function exportBoardPng() {
  try {
    const exportNodes = nodes.value
    if (!exportNodes.length) throw new Error('Board is empty')

    const margin = 100
    const nodeSize = (node: Node) =>
      node.type === 'branch-node' ? { width: 240, height: 138 } : { width: 220, height: 120 }
    const minX = Math.min(...exportNodes.map((node) => node.position.x))
    const minY = Math.min(...exportNodes.map((node) => node.position.y))
    const maxX = Math.max(...exportNodes.map((node) => node.position.x + nodeSize(node).width))
    const maxY = Math.max(...exportNodes.map((node) => node.position.y + nodeSize(node).height))
    const width = Math.ceil(maxX - minX + margin * 2)
    const height = Math.ceil(maxY - minY + margin * 2)
    const scale = Math.min(window.devicePixelRatio || 1, 2, 12000 / width, 12000 / height)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is unavailable')
    context.scale(scale, scale)
    const css = getComputedStyle(document.documentElement)
    const background = css.getPropertyValue('--bg').trim() || '#121212'
    const surface = css.getPropertyValue('--surface').trim() || '#1e1e1e'
    const text = css.getPropertyValue('--text').trim() || '#d6d6d6'
    const dim = css.getPropertyValue('--dim').trim() || '#888888'
    const border = css.getPropertyValue('--ui-border-color').trim() || 'rgba(255,255,255,.1)'
    context.fillStyle = background
    context.fillRect(0, 0, width, height)

    const pointById = new Map(
      exportNodes.map((node) => {
        const size = nodeSize(node)
        return [
          node.id,
          {
            x: node.position.x - minX + margin,
            y: node.position.y - minY + margin,
            width: size.width,
            height: size.height,
          },
        ]
      })
    )

    context.lineWidth = 1.5
    branchesStore.edges.forEach((edge) => {
      const source = pointById.get(edge.source)
      const target = pointById.get(edge.target)
      if (!source || !target) return
      const sourceBranch = getBranchByNodeId(edge.source)
      context.strokeStyle = sourceBranch?.markerColor || dim
      context.beginPath()
      context.moveTo(source.x + source.width, source.y + source.height / 2)
      const middle = (source.x + source.width + target.x) / 2
      context.bezierCurveTo(
        middle,
        source.y + source.height / 2,
        middle,
        target.y + target.height / 2,
        target.x,
        target.y + target.height / 2
      )
      context.stroke()
    })

    exportNodes.forEach((node) => {
      const box = pointById.get(node.id)!
      const branch = getBranchByNodeId(node.id)
      const milestone = branch?.milestones.find((item) => item.id === node.id)
      const title = milestone?.name || branch?.displayName || 'Элемент'
      const color = milestone?.markerColor || branch?.markerColor || text
      const total = milestone
        ? milestone.taskIds.length
        : branch
          ? branchesStore.getBranchTotalTasks(branch.id)
          : 0
      const completed = milestone
        ? milestone.taskIds.filter((id) => tasksStore.tasks.find((task) => task.id === id)?.done).length
        : branch
          ? branchesStore.getBranchCompletedTasks(branch.id)
          : 0

      context.fillStyle = surface
      context.strokeStyle = border
      context.lineWidth = 1
      context.beginPath()
      context.roundRect(box.x, box.y, box.width, box.height, 18)
      context.fill()
      context.stroke()
      context.fillStyle = color
      context.beginPath()
      context.arc(box.x + 20, box.y + 20, 5, 0, Math.PI * 2)
      context.fill()
      context.fillStyle = text
      context.font = '600 15px Inter, sans-serif'
      context.fillText(title.slice(0, 28), box.x + 16, box.y + 55, box.width - 32)
      context.fillStyle = dim
      context.font = '12px Inter, sans-serif'
      context.fillText(`${completed} / ${total} задач`, box.x + 16, box.y + box.height - 18)
      if (total > 0) {
        context.fillStyle = border
        context.fillRect(box.x + 16, box.y + box.height - 42, box.width - 32, 3)
        context.fillStyle = color
        context.fillRect(box.x + 16, box.y + box.height - 42, (box.width - 32) * (completed / total), 3)
      }
    })

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('PNG creation failed'))), 'image/png')
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `carbon-board-${new Date().toISOString().slice(0, 10)}.png`
    link.href = url
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    addNotification({ type: 'success', message: 'Доска экспортирована в PNG' })
  } catch {
    addNotification({ type: 'error', message: 'Не удалось экспортировать доску' })
  }
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

watch(handleOffset, () => {
  syncNodesAndEdges()
})

watch(
  () => tasksStore.tasks,
  () => branchesStore.refreshAllBranches(),
  { deep: true }
)
</script>

<style scoped lang="scss">
.branch-flow-wrapper {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0;
  position: relative;
  overflow: hidden;
  min-height: 100%;

  @include mobile {
    width: 100%;
    height: auto;
    min-height: 0;
    margin: 0;
    border-radius: var(--border-radius-lg);
    overflow: visible;
  }
}

:deep(.vue-flow) {
  background: transparent;
  width: 100%;
  height: 100%;
}

:deep(.vue-flow__viewport),
:deep(.vue-flow__nodes) {
  overflow: visible;
}

:deep(.vue-flow__node) {
  z-index: 1;
  cursor: grab;
}

:deep(.vue-flow__node.dragging),
:deep(.vue-flow__pane.dragging),
:deep(.vue-flow__pane.selection) {
  cursor: grabbing;
}

:deep(.vue-flow__pane) {
  cursor: grab;
}

:deep(.vue-flow__node:has(.branch-node.expanded)),
:deep(.vue-flow__node:has(.milestone-node.expanded)),
:deep(.vue-flow__node.selected) {
  z-index: 120 !important;
}

:deep(.vue-flow__background) {
  background-color: transparent;

  .vue-flow__background-pattern {
    stroke: var(--ui-border-color);
  }
}

:deep(.vue-flow__edge-path) {
  stroke: var(--dim);
  stroke-width: 1.15;
  stroke-linecap: round;
  stroke-linejoin: round;
}

:deep(.vue-flow__node.selected .branch-node, .vue-flow__node.selected .milestone-node) {
  border: var(--ui-border) !important;
  border-color: var(--accent) !important;
}

.branch-flow-wrapper.is-auto-layouting :deep(.vue-flow__node) {
  transition: transform 0.46s cubic-bezier(0.2, 0, 0, 1);
}

.branch-flow-wrapper.is-auto-layouting :deep(.vue-flow__edge-path) {
  transition:
    stroke var(--transition-standard),
    opacity var(--transition-standard);
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: var(--accent) !important;
  stroke-width: 2.4 !important;
}
</style>
