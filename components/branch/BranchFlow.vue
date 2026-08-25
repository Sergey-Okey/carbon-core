<template>
  <div
    ref="boardWrapper"
    class="branch-flow-wrapper"
    :class="{ 'is-auto-layouting': isAutoLayoutAnimating }"
  >
    <VueFlow
      :key="flowRenderKey"
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
      :select-nodes-on-drag="false"
      :multi-selection-key-code="['Control', 'Meta', 'Shift']"
      :zoom-on-scroll="true"
      :connection-radius="28"
      :fit-view-on-init="false"
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
        :search-query="boardSearchQuery"
        :search-results="boardSearchResults"
        :search-active-id="boardSearchActiveId"
        @fit-view="fitBoardView"
        @align-layout="alignLayoutSmart"
        @export-png="exportBoardPng"
        @update:search-query="onBoardSearch"
        @update:search-active-id="onBoardSearchActiveId"
        @select-search="onBoardSearchSelect"
        @search-next="onBoardSearchNext"
        @add-branch="openAddBranchModal"
        @add-milestone="addMilestoneToSelectedBranch"
        @delete-selected="deleteSelected"
        @undo="undo"
        @redo="redo"
      />

      <template #node-branch-node="nodeProps">
        <BranchNode
          :data="nodeProps.data"
          :selected="isNodeSelected(nodeProps.id)"
          @edit="openBranchEditor(nodeProps.data.branchId)"
        />
      </template>
      <template #node-milestone-node="nodeProps">
        <MilestoneNode
          :data="nodeProps.data"
          :selected="isNodeSelected(nodeProps.id)"
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
import {
  VueFlow,
  ConnectionMode,
  useVueFlow,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseEvent,
} from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import BranchNode from './BranchNode.vue'
import MilestoneNode from './MilestoneNode.vue'
import type { Milestone, Branch, BranchNodeData } from '~/types/branch.types'
import { exportBoardImage } from '~/utils/exportBoardImage'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const branchesStore = useBranchesStore()
const settingsStore = useSettingsStore()
const guidedTour = useGuidedTourStore()
const tasksStore = useTasksStore()
const uiStore = useUIStore()
const { fitView, getSelectedNodes } = useVueFlow()
const { applyNetworkLayout } = useAutoLayout()
const { confirm } = useConfirm()
const { success, info, warning, error: notifyError } = useNotification()
const connectionSpacing = ref(56)
const boardSearchQuery = ref('')
const boardSearchActiveId = ref<string | null>(null)
const searchMatchIndex = ref(0)
const defaultEdgeOptions = computed(() => ({
  type: 'smoothstep',
  pathOptions: { borderRadius: 16, offset: 10 },
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
type FlowNode = Node<BranchNodeData> & { selected?: boolean }
const nodes = shallowRef<FlowNode[]>([])
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
const flowRenderKey = ref(0)

const emptyMilestone: Milestone = {
  id: '',
  name: '',
  icon: 'target',
  description: '',
  status: 'pending',
  taskIds: [],
  markerColor: '#d6d6d6',
  position: { x: 0, y: 0 },
}

const canAddBranch = computed(() => !selectedNodeId.value && !selectedEdgeId.value)
const canAddMilestone = computed(() => selectedNodeId.value !== null)
const selectedNodeIds = computed(() => {
  const fromNodes = nodes.value.filter((node) => node.selected).map((node) => node.id)
  if (fromNodes.length) return fromNodes
  const fromVueFlow = getSelectedNodes.value.map((node) => node.id)
  if (fromVueFlow.length) return fromVueFlow
  return selectedNodeId.value ? [selectedNodeId.value] : []
})

function setNodesSelected(ids: Iterable<string>) {
  const selected = new Set(ids)
  nodes.value = nodes.value.map((node) => ({
    ...node,
    selected: selected.has(node.id),
  }))
}

function isNodeSelected(nodeId: string) {
  return selectedNodeIds.value.includes(nodeId)
}
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
  const previouslySelected = new Set(nodes.value.filter((node) => node.selected).map((node) => node.id))
  const newNodes: FlowNode[] = []
  branchesStore.branches.forEach((branch) => {
    newNodes.push({
      id: branch.id,
      type: 'branch-node',
      position: branch.position || { x: 100, y: 100 },
      selected: previouslySelected.has(branch.id),
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
        selected: previouslySelected.has(milestone.id),
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
            ...((edge as Edge & { pathOptions?: typeof baseEdgeOptions.pathOptions }).pathOptions || {}),
            ...baseEdgeOptions.pathOptions,
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
  if (!connection.source || !connection.target) return connection

  let source = connection.source
  let target = connection.target
  let sourceHandle = connection.sourceHandle
  let targetHandle = connection.targetHandle

  if (sourceHandle?.startsWith('target-')) {
    ;[source, target] = [target, source]
    ;[sourceHandle, targetHandle] = [targetHandle, sourceHandle]
  }

  const sideFromHandle = (handle?: string | null) => {
    if (!handle) return null as 'top' | 'right' | 'bottom' | 'left' | null
    if (handle.includes('-top-')) return 'top'
    if (handle.includes('-right-')) return 'right'
    if (handle.includes('-bottom-')) return 'bottom'
    if (handle.includes('-left-')) return 'left'
    return null
  }

  if (targetHandle?.startsWith('source-')) {
    const side = sideFromHandle(targetHandle) || 'left'
    targetHandle = `target-${side}-${target}`
  }

  if (sourceHandle?.startsWith('target-')) {
    const side = sideFromHandle(sourceHandle) || 'right'
    sourceHandle = `source-${side}-${source}`
  }

  if (!sourceHandle?.startsWith('source-')) {
    const side = sideFromHandle(sourceHandle) || 'right'
    sourceHandle = `source-${side}-${source}`
  }

  if (!targetHandle?.startsWith('target-')) {
    const side = sideFromHandle(targetHandle) || 'left'
    targetHandle = `target-${side}-${target}`
  }

  return {
    ...connection,
    source,
    target,
    sourceHandle,
    targetHandle,
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
    warning(result.reason || 'Связь недоступна')
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
    warning(result.reason || 'Связь недоступна')
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
    setNodesSelected([])
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
    compact: { branchGapY: 220 },
    normal: { branchGapY: 260 },
    wide: { branchGapY: 320 },
  }[settingsStore.boardLayoutDensity]
  const cols = settingsStore.boardColumns
  const milestoneGapX = connectionSpacing.value
  const branchGapX = Math.max(connectionSpacing.value * 4, 620)
  const branchGapY = density.branchGapY
  const milestoneStartX = Math.max(connectionSpacing.value + 80, 220)
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
  success('Доска выровнена')
}

function alignLayoutSmart() {
  if (branchesStore.branches.length === 0) return

  const density = {
    compact: { nodeSep: 56, rankSep: 100, componentGap: 96 },
    normal: { nodeSep: 72, rankSep: 128, componentGap: 120 },
    wide: { nodeSep: 88, rankSep: 156, componentGap: 148 },
  }[settingsStore.boardLayoutDensity]

  isAutoLayoutAnimating.value = true
  syncNodesAndEdges()

  const nodeIds = new Set(nodes.value.map((node) => node.id))
  const layoutEdges = branchesStore.edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  )
  const { nodes: layoutedNodes, edges: syncedEdges } = applyNetworkLayout(
    nodes.value,
    layoutEdges,
    'LR',
    {
      rankSep: density.rankSep,
      nodeSep: density.nodeSep,
      marginX: Math.max(64, uiStore.panelWidth + 28),
      marginY: 64,
      snapGrid: 20,
      edgeGap: density.rankSep,
      componentGap: density.componentGap,
    }
  )

  layoutedNodes.forEach((node) => {
    if (node.type === 'branch-node') {
      branchesStore.updateBranchPosition(node.id, node.position)
      return
    }

    if (node.type === 'milestone-node') {
      branchesStore.updateMilestone(node.id, { position: node.position })
    }
  })

  branchesStore.replaceEdges(syncedEdges)

  syncNodesAndEdges()
  saveToHistory()
  nextTick(() => {
    void fitBoardView()
    window.setTimeout(() => {
      isAutoLayoutAnimating.value = false
    }, 460)
  })
  success('Доска выровнена по связям')
}

function getBoardSearchMatches(query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return [] as { id: string; label: string; kind: string }[]

  const matches: { id: string; label: string; kind: string }[] = []
  branchesStore.branches.forEach((branch) => {
    const branchName = branch.displayName || ''
    if (branchName.toLowerCase().includes(normalized)) {
      matches.push({ id: branch.id, label: branchName, kind: 'Ветка' })
    }
    branch.milestones.forEach((milestone) => {
      if (milestone.name.toLowerCase().includes(normalized)) {
        matches.push({ id: milestone.id, label: milestone.name, kind: 'Этап' })
      }
    })
  })
  return matches
}

const boardSearchResults = computed(() => getBoardSearchMatches(boardSearchQuery.value))

function focusBoardSearchMatch(nodeId: string) {
  boardSearchActiveId.value = nodeId
  selectedNodeId.value = nodeId
  setNodesSelected([nodeId])
  selectedEdgeId.value = null
  selectedEdge.value = null

  const matchIndex = boardSearchResults.value.findIndex((item) => item.id === nodeId)
  if (matchIndex >= 0) searchMatchIndex.value = matchIndex

  nextTick(() => {
    void fitView({
      nodes: [nodeId],
      padding: 0.4,
      minZoom: 0.1,
      maxZoom: 1.15,
      duration: 240,
    })
  })
}

function onBoardSearch(query: string) {
  boardSearchQuery.value = query
  const matches = getBoardSearchMatches(query)
  if (!matches.length) {
    boardSearchActiveId.value = null
    searchMatchIndex.value = 0
    return
  }
  searchMatchIndex.value = 0
  focusBoardSearchMatch(matches[0].id)
}

function onBoardSearchActiveId(id: string | null) {
  if (id === boardSearchActiveId.value) return
  boardSearchActiveId.value = id
  if (!id) return
  focusBoardSearchMatch(id)
}

function onBoardSearchSelect(id: string) {
  focusBoardSearchMatch(id)
}

function onBoardSearchNext() {
  const matches = getBoardSearchMatches(boardSearchQuery.value)
  if (!matches.length) {
    if (boardSearchQuery.value.trim()) {
      info('Ничего не найдено')
    }
    return
  }
  searchMatchIndex.value = (searchMatchIndex.value + 1) % matches.length
  focusBoardSearchMatch(matches[searchMatchIndex.value].id)
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
    warning('Выберите ветку или этап')
    return
  }

  openMilestoneCreator()
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
  selectedNodeId.value = null
  selectedEdgeId.value = null
  selectedEdge.value = null
  setNodesSelected([])

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

function onNodeClick({ node, event }: NodeMouseEvent) {
  selectedEdgeId.value = null
  selectedEdge.value = null

  const multi = !!(event.ctrlKey || event.metaKey || event.shiftKey)

  if (multi) {
    const current = new Set(selectedNodeIds.value)

    if (node.type === 'branch-node') {

      current.add(node.id)
      const branch = getBranchByNodeId(node.id)
      branch?.milestones.forEach((milestone) => current.add(milestone.id))
      setNodesSelected(current)
      selectedNodeId.value = node.id
    } else {

      if (current.has(node.id)) current.delete(node.id)
      else current.add(node.id)
      setNodesSelected(current)
      selectedNodeId.value = current.size ? [...current].at(-1)! : null
    }
  } else {
    setNodesSelected([node.id])
    selectedNodeId.value = node.id
  }

  guidedTour.handleAction('branch-selected')
}

function onEdgeClick({ edge }: { edge: Edge }) {
  selectedEdgeId.value = edge.id
  selectedEdge.value = { ...edge }
  selectedNodeId.value = null
  setNodesSelected([])
}

function onPaneClick() {
  selectedNodeId.value = null
  selectedEdgeId.value = null
  selectedEdge.value = null
  setNodesSelected([])
}

function onNodeDragStop({
  node,
  nodes: draggedNodes,
}: {
  node: Node
  nodes?: Node[]
}) {
  const moved = draggedNodes?.length ? draggedNodes : [node]
  for (const item of moved) {
    if (item.type === 'branch-node') {
      branchesStore.updateBranchPosition(item.id, item.position)
    }
    if (item.type === 'milestone-node') {
      branchesStore.updateMilestone(item.id, { position: item.position })
    }
  }
  branchesStore.refreshEdgePortsFromPositions()
  syncNodesAndEdges()
  saveToHistory()
}

async function fitBoardView() {
  if (isMobile.value) return

  await fitView({
    padding: {
      top: '88px',
      right: '28px',
      bottom: '92px',
      left: '92px',
    },
    minZoom: 0.1,
    maxZoom: 1.1,
    duration: 240,
  })
}

async function exportBoardPng() {
  if (isMobile.value) {
    notifyError('Экспорт доступен на десктопе')
    return
  }
  if (!branchesStore.branches.length) {
    notifyError('Доска пуста')
    return
  }

  try {
    await exportBoardImage({
      branches: branchesStore.branches,
      edges: branchesStore.edges as Edge[],
      tasks: tasksStore.tasks,
      getBranchTaskIds: (branchId) => branchesStore.getBranchTaskIds(branchId),
    })
    success('Доска экспортирована в PNG')
  } catch {
    notifyError('Не удалось экспортировать доску')
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
      requestAnimationFrame(() => {
        void fitBoardView()
      })
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

watch(
  () => tasksStore.tasks,
  () => branchesStore.refreshAllBranches(),
  { deep: true }
)

watch(
  () => uiStore.pendingNavTarget,
  (target) => {
    if (!target) return
    if (target.kind !== 'branch' && target.kind !== 'milestone') return
    const id = target.id
    uiStore.clearPendingNavTarget()
    nextTick(() => {
      setTimeout(() => focusBoardSearchMatch(id), 120)
    })
  },
  { immediate: true }
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
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    margin: 0;
    border-radius: 0;
    overflow: hidden;
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

:deep(.vue-flow__node.selected .branch-node) {
  border-width: 2px !important;
  border-style: dashed !important;
  border-color: color-mix(in srgb, var(--node-marker-color) 55%, var(--accent)) !important;
}

:deep(.vue-flow__node.selected .milestone-node) {
  border-color: var(--accent) !important;
}

:deep(.vue-flow__node.dragging .branch-node) {
  border-width: 2px !important;
  border-style: dashed !important;
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
