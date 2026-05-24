<template>
  <div class="branch-flow-wrapper">
    <BranchMobileView
      v-if="isMobile"
      @edit-milestone="openMilestoneEditor"
      @add-milestone="addMilestoneToSelectedBranch"
      @add-branch="openAddBranchModal"
      @edit-branch="openBranchEditor"
      @delete-branch="handleDeleteBranchFromMobile"
      @delete-milestone="handleDeleteMilestoneFromMobile"
    />

    <VueFlow
      v-else
      ref="vueFlowRef"
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
      @nodes-change="onNodesChange"
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
        :selected-node-id="selectedNodeId"
        :selected-edge-id="selectedEdgeId"
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
const { fitView, zoomIn: vfZoomIn, zoomOut: vfZoomOut } = useVueFlow()
const { confirm } = useConfirm()
const { addNotification } = useNotification()

// ========== История ==========
const history = ref<any[]>([])
const historyIndex = ref(-1)
const isRestoring = ref(false)
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

function saveToHistory() {
  if (isRestoring.value) return
  if (historyIndex.value < history.value.length - 1)
    history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push({
    branches: JSON.parse(JSON.stringify(branchesStore.branches)),
    edges: JSON.parse(JSON.stringify(branchesStore.edges)),
  })
  historyIndex.value = history.value.length - 1
}

function undo() {
  if (!canUndo.value) return
  isRestoring.value = true
  historyIndex.value--
  const snapshot = history.value[historyIndex.value]
  branchesStore.$patch({ branches: snapshot.branches, edges: snapshot.edges })
  syncNodesAndEdges()
  isRestoring.value = false
}

function redo() {
  if (!canRedo.value) return
  isRestoring.value = true
  historyIndex.value++
  const snapshot = history.value[historyIndex.value]
  branchesStore.$patch({ branches: snapshot.branches, edges: snapshot.edges })
  syncNodesAndEdges()
  isRestoring.value = false
}

// ========== Состояние ==========
const nodeTypes = { 'branch-node': BranchNode, 'milestone-node': MilestoneNode }
const nodes = ref<Node<BranchNodeData>[]>([])
const edges = ref<Edge[]>([])
const isMobile = ref(false)
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)

const canAddBranch = computed(() => selectedNodeId.value === null)
const canAddMilestone = computed(() => selectedNodeId.value !== null)

const emptyMilestone = {
  id: '',
  name: '',
  icon: 'target',
  description: '',
  requiredXP: 500,
  currentXP: 0,
  status: 'pending' as const,
  taskIds: [],
  position: { x: 0, y: 0 },
}

function syncNodesAndEdges() {
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
  const existingIds = new Set(newNodes.map((n) => n.id))
  nodes.value = newNodes
  edges.value = branchesStore.edges.filter(
    (e) => existingIds.has(e.source) && existingIds.has(e.target)
  )
}

// ========== СВЯЗИ (работают) ==========
function onConnect(connection: Connection) {
  const sourceNode = nodes.value.find((n) => n.id === connection.source)
  const targetNode = nodes.value.find((n) => n.id === connection.target)
  if (sourceNode?.type !== 'milestone-node') return

  if (targetNode?.type === 'branch-node') {
    branchesStore.attachMilestoneToBranch(
      connection.source!,
      targetNode.data.branchId
    )
    saveToHistory()
    syncNodesAndEdges()
    return
  }
  if (targetNode?.type === 'milestone-node') {
    const sourceBranchId = sourceNode.data.branchId
    const targetBranchId = targetNode.data.branchId
    if (sourceBranchId !== targetBranchId) {
      branchesStore.attachMilestoneToBranch(connection.source!, targetBranchId)
    } else {
      const newEdge: Edge = {
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--accent)', strokeWidth: 1 },
      }
      branchesStore.addEdge(newEdge)
    }
    saveToHistory()
    syncNodesAndEdges()
    return
  }
}

function onEdgeUpdate({ edge, connection }: any) {
  const sourceNode = nodes.value.find((n) => n.id === connection.source)
  const targetNode = nodes.value.find((n) => n.id === connection.target)
  if (sourceNode?.type !== 'milestone-node' || !targetNode) return

  branchesStore.removeEdge(edge.id)
  onConnect(connection)
}

// ========== УДАЛЕНИЕ ==========
function deleteSelected() {
  if (selectedEdgeId.value) deleteSelectedEdge()
  else if (selectedNodeId.value) {
    const node = nodes.value.find((n) => n.id === selectedNodeId.value)
    if (node?.type === 'branch-node') deleteSelectedBranch()
    else if (node?.type === 'milestone-node') deleteSelectedMilestone()
  }
}

async function deleteSelectedEdge() {
  const edgeId = selectedEdgeId.value
  if (!edgeId) return
  const ok = await confirm('Разорвать связь?')
  if (!ok) return
  const edge = edges.value.find((e) => e.id === edgeId)
  if (!edge) return
  const sourceNode = nodes.value.find((n) => n.id === edge.source)
  const targetNode = nodes.value.find((n) => n.id === edge.target)
  branchesStore.removeEdge(edgeId)
  if (sourceNode?.type === 'milestone-node' && targetNode?.type === 'branch-node') {
    branchesStore.detachMilestoneFromBranch(edge.source)
  } else {
    // Обновляем статусы затронутых узлов
    const refreshNode = (node: any) => {
      if (!node) return
      if (node.type === 'milestone-node' && node.data.milestone) {
        branchesStore.refreshMilestonesByTaskId(node.id)
        const branch = branchesStore.branches.find(
          (b) => b.id === node.data.branchId
        )
        if (branch) branchesStore.refreshBranch(branch.id)
      } else if (node.type === 'branch-node') {
        const branch = branchesStore.branches.find(
          (b) => b.id === node.data.branchId
        )
        if (branch) branchesStore.refreshBranch(branch.id)
      }
    }
    refreshNode(sourceNode)
    refreshNode(nodes.value.find((n) => n.id === edge.target))
  }
  selectedEdgeId.value = null
  saveToHistory()
  syncNodesAndEdges()
}

async function deleteSelectedBranch() {
  const node = nodes.value.find((n) => n.id === selectedNodeId.value)
  if (!node || node.type !== 'branch-node') return
  const branch = branchesStore.branches.find((b) => b.id === node.data.branchId)
  if (!branch) return
  const ok = await confirm(`Удалить ветку «${branch.displayName}»?`)
  if (!ok) return
  branchesStore.deleteBranch(branch.id)
  selectedNodeId.value = null
  saveToHistory()
  syncNodesAndEdges()
}

async function deleteSelectedMilestone() {
  const node = nodes.value.find((n) => n.id === selectedNodeId.value)
  if (!node || node.type !== 'milestone-node' || !node.data.milestone) return
  const milestone = node.data.milestone
  const ok = await confirm(`Удалить этап «${milestone.name}»?`)
  if (!ok) return
  branchesStore.deleteMilestone(milestone.id)
  selectedNodeId.value = null
  saveToHistory()
  syncNodesAndEdges()
}

// ========== ВЫРАВНИВАНИЕ (только по кнопке) ==========
function alignLayout() {
  const branches = [...branchesStore.branches]
  if (branches.length === 0) return

  const cols = 4
  const offsetX = 380
  const offsetY = 300
  const startX = 100
  const startY = 100
  const milestoneStepX = 260
  const branchToFirstX = 180

  // 1. Расставляем ветки сеткой
  branches.forEach((branch, idx) => {
    const col = idx % cols
    const row = Math.floor(idx / cols)
    const newBranchX = startX + col * offsetX
    const newBranchY = startY + row * offsetY
    branchesStore.updateBranchPosition(branch.id, {
      x: newBranchX,
      y: newBranchY,
    })
  })

  // 2. Для каждой ветки перестраиваем этапы и связи
  branches.forEach((branch) => {
    const milestones = branch.milestones
    if (milestones.length === 0) return
    // Удаляем старые рёбра, связанные с веткой и её этапами
    const branchPos = branch.position || { x: 100, y: 100 }
    // Расставляем этапы
    milestones.forEach((milestone, idx) => {
      const milestoneX = branchPos.x + branchToFirstX + idx * milestoneStepX
      const milestoneY = branchPos.y
      branchesStore.updateMilestone(milestone.id, {
        position: { x: milestoneX, y: milestoneY },
      })
    })
    // Создаём новые рёбра
  })

  syncNodesAndEdges()
  saveToHistory()
  nextTick(() => fitView())
  addNotification({ type: 'success', message: 'Доска выровнена' })
}

// ========== Обработчики клавиш ==========
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    deleteSelected()
  }
}

// ========== Создание этапа ==========
const editingMilestone = ref<Milestone | null>(null)
const creatingMilestone = ref(false)
const branchModal = ref<{ visible: boolean; branch: Branch | null }>({
  visible: false,
  branch: null,
})

function openMilestoneEditor(milestone: Milestone) {
  editingMilestone.value = milestone
}
function openMilestoneCreator() {
  creatingMilestone.value = true
}

async function handleCreateMilestone(data: any) {
  let targetBranch: Branch | undefined
  let sourceId: string | null = null

  if (selectedNodeId.value) {
    const node = nodes.value.find((n) => n.id === selectedNodeId.value)
    if (node?.type === 'branch-node') {
      targetBranch = branchesStore.branches.find(
        (b) => b.id === node.data.branchId
      )
      if (targetBranch) sourceId = targetBranch.id
    } else if (node?.type === 'milestone-node' && node.data.milestone) {
      targetBranch = branchesStore.branches.find(
        (b) => b.id === node.data.branchId
      )
      sourceId = node.id
    }
  }

  if (!targetBranch || !sourceId) {
    addNotification({
      type: 'warning',
      message: 'Выберите ветку или этап, к которому привязать новый этап',
    })
    creatingMilestone.value = false
    return
  }

  const newMilestone = branchesStore.addMilestoneWithoutEdge(
    targetBranch.id,
    data.name
  )
  branchesStore.updateMilestone(newMilestone.id, {
    description: data.description,
    icon: targetBranch.icon,
    taskIds: data.taskIds,
  })
  const newEdge: Edge = {
    id: `edge-${sourceId}-${newMilestone.id}-${Date.now()}`,
    source: sourceId,
    target: newMilestone.id,
    type: 'smoothstep',
    animated: false,
    style: { stroke: 'var(--accent)', strokeWidth: 1 },
  }
  branchesStore.addEdge(newEdge)

  creatingMilestone.value = false
  saveToHistory()
  syncNodesAndEdges()
  addNotification({ type: 'success', message: `Этап «${data.name}» создан` })
}

function handleSaveMilestone(updates: any) {
  if (editingMilestone.value) {
    branchesStore.updateMilestone(editingMilestone.value.id, updates)
    editingMilestone.value = null
    saveToHistory()
    syncNodesAndEdges()
  }
}

async function handleDeleteMilestone() {
  const milestone = editingMilestone.value
  if (!milestone) return
  const ok = await confirm(`Удалить этап «${milestone.name}»?`)
  if (ok) {
    branchesStore.deleteMilestone(milestone.id)
    editingMilestone.value = null
    saveToHistory()
    syncNodesAndEdges()
  }
}

// ========== Создание ветки ==========
function openBranchEditor(branchId: string) {
  const branch = branchesStore.branches.find((b) => b.id === branchId)
  if (branch) branchModal.value = { visible: true, branch }
}

function openAddBranchModal() {
  if (selectedNodeId.value !== null) {
    addNotification({
      type: 'warning',
      message: 'Сначала снимите выделение, чтобы создать ветку',
    })
    return
  }
  branchModal.value = { visible: true, branch: null }
}

function handleSaveBranch(data: any) {
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
      data.taskIds
    )
  }
  branchModal.value.visible = false
  saveToHistory()
  syncNodesAndEdges()
}

async function handleDeleteBranch() {
  const branch = branchModal.value.branch
  if (!branch) return
  const ok = await confirm(`Удалить ветку «${branch.displayName}»?`)
  if (ok) {
    branchesStore.deleteBranch(branch.id)
    branchModal.value.visible = false
    selectedNodeId.value = null
    saveToHistory()
    syncNodesAndEdges()
  }
}

function addMilestoneToSelectedBranch(branchId?: string) {
  if (branchId) {
    selectedNodeId.value = branchId
    selectedEdgeId.value = null
    openMilestoneCreator()
    return
  }
  if (!selectedNodeId.value) {
    addNotification({ type: 'warning', message: 'Выберите ветку или этап' })
    return
  }
  openMilestoneCreator()
}

// ========== Мобильные ==========
async function handleDeleteBranchFromMobile(branchId: string) {
  const branch = branchesStore.branches.find((b) => b.id === branchId)
  if (!branch) return
  const ok = await confirm(`Удалить ветку «${branch.displayName}»?`)
  if (ok) {
    branchesStore.deleteBranch(branchId)
    saveToHistory()
    syncNodesAndEdges()
  }
}

async function handleDeleteMilestoneFromMobile(milestoneId: string) {
  const milestone = branchesStore.branches
    .flatMap((b) => b.milestones)
    .find((m) => m.id === milestoneId)
  if (!milestone) return
  const ok = await confirm(`Удалить этап «${milestone.name}»?`)
  if (ok) {
    branchesStore.deleteMilestone(milestoneId)
    saveToHistory()
    syncNodesAndEdges()
  }
}

// ========== События ==========
function onNodeClick({ node }: { node: Node }) {
  selectedNodeId.value = node.id
  selectedEdgeId.value = null
}
function onEdgeClick({ edge }: { edge: Edge }) {
  selectedEdgeId.value = edge.id
  selectedNodeId.value = null
}
function onPaneClick() {
  selectedNodeId.value = null
  selectedEdgeId.value = null
}
function onNodesChange() {}
function onEdgesChange() {}
function onNodeDragStop({ node }: { node: Node }) {
  branchesStore.updateNodePosition(node.id, { ...node.position })
  saveToHistory()
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
  window.addEventListener('resize', checkMobile)
  window.addEventListener('keydown', handleKeyDown)
  nextTick(() => {
    if (!isMobile.value) {
      syncNodesAndEdges()
      setTimeout(() => fitView(), 100)
      saveToHistory()
    }
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
  width: 100%;
  height: 110%;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border);
  background: var(--bg);
  position: relative;
  overflow: hidden;
  @include mobile {
    width: 100%;
    height: 100%;
    margin: 0;
  }
}
:deep(.vue-flow) {
  background: var(--bg);
  width: 100%;
  height: 100%;
}
:deep(.vue-flow__background) {
  background-color: var(--bg);
  .vue-flow__background-pattern {
    stroke: var(--border);
  }
}
:deep(.vue-flow__edge-path) {
  stroke: var(--accent);
  stroke-width: 1;
}
:deep(
  .vue-flow__node.selected .branch-node,
  .vue-flow__node.selected .milestone-node
) {
  border: 1px solid #ffffff !important;
}
:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: var(--accent);
  stroke-width: 3;
}
</style>
