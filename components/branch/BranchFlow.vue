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
        :can-add-milestone="canAddMilestone"
        :has-selection="!!selectedNodeId || !!selectedEdgeId"
        @fit-view="fitView"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @auto-layout="autoLayout"
        @add-branch="openAddBranchModal"
        @add-milestone="addMilestoneToSelectedBranch"
        @delete-selected="deleteSelected"
        @undo="undo"
        @redo="redo"
        @rebuild="autoLayout"
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

    <!-- Модалки -->
    <NodeEditorModal
      v-if="editingMilestone"
      :milestone="editingMilestone"
      @close="editingMilestone = null"
      @save="handleSaveMilestone"
      @delete="handleDeleteMilestone"
    />
    <NodeEditorModal
      v-if="creatingMilestone"
      :milestone="{
        id: '',
        name: '',
        icon: 'target',
        description: '',
        requiredXP: 500,
        currentXP: 0,
        status: 'pending',
        taskIds: [],
        position: { x: 0, y: 0 },
      }"
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
const { fitView, zoomIn: vfZoomIn, zoomOut: vfZoomOut } = useVueFlow()
const { applyLayout } = useAutoLayout()
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
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
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

const isBranchNode = (nodeId: string) => nodes.value.find(n => n.id === nodeId)?.type === 'branch-node'
const canAddMilestone = computed(() => {
  if (!selectedNodeId.value) return false
  const node = nodes.value.find(n => n.id === selectedNodeId.value)
  return node?.type === 'branch-node' || node?.type === 'milestone-node'
})

// Синхронизация узлов и рёбер
function syncNodesAndEdges() {
  const newNodes: Node<BranchNodeData>[] = []
  branchesStore.branches.forEach((branch) => {
    newNodes.push({
      id: branch.id,
      type: 'branch-node',
      position: branch.position || { x: 100, y: 100 },
      data: { type: 'branch', branchId: branch.id, milestone: null, branchIcon: branch.icon },
    })
    branch.milestones.forEach((milestone) => {
      newNodes.push({
        id: milestone.id,
        type: 'milestone-node',
        position: milestone.position,
        data: { type: 'milestone', branchId: branch.id, milestone, branchIcon: branch.icon },
      })
    })
  })
  const existingIds = new Set(newNodes.map(n => n.id))
  nodes.value = newNodes
  edges.value = branchesStore.edges.filter(e => existingIds.has(e.source) && existingIds.has(e.target))
}

// ========== Связи ==========
function onConnect(connection: Connection) {
  const sourceNode = nodes.value.find(n => n.id === connection.source)
  const targetNode = nodes.value.find(n => n.id === connection.target)

  if (sourceNode?.type !== 'milestone-node') {
    addNotification({ type: 'warning', message: 'Только этапы могут быть источником связи' })
    return
  }

  if (targetNode?.type === 'branch-node') {
    branchesStore.attachMilestoneToBranch(connection.source!, targetNode.data.branchId)
    saveToHistory()
    return
  }

  if (targetNode?.type === 'milestone-node') {
    const sourceBranchId = sourceNode.data.branchId
    const targetBranchId = targetNode.data.branchId
    if (sourceBranchId === targetBranchId) {
      addNotification({ type: 'warning', message: 'Нельзя связать этапы внутри одной ветки' })
      return
    }
    branchesStore.attachMilestoneToBranch(connection.source!, targetBranchId)
    saveToHistory()
    return
  }

  addNotification({ type: 'warning', message: 'Недопустимое соединение' })
}

function onEdgeUpdate({ edge, connection }: any) {
  branchesStore.removeEdge(edge.id)
  onConnect(connection)
}

function deleteSelected() {
  if (selectedEdgeId.value) {
    deleteSelectedEdge()
  } else if (selectedNodeId.value) {
    const node = nodes.value.find(n => n.id === selectedNodeId.value)
    if (node?.type === 'branch-node') deleteSelectedBranch()
    else if (node?.type === 'milestone-node') deleteSelectedMilestone()
  }
}

async function deleteSelectedEdge() {
  const edgeId = selectedEdgeId.value
  if (!edgeId) return
  const ok = await confirm('Удалить связь?')
  if (!ok) return
  branchesStore.removeEdge(edgeId)
  const edge = edges.value.find(e => e.id === edgeId)
  if (edge) {
    branchesStore.refreshMilestonesByTaskId(edge.source)
    branchesStore.refreshMilestonesByTaskId(edge.target)
  }
  selectedEdgeId.value = null
  saveToHistory()
}

async function deleteSelectedBranch() {
  const node = nodes.value.find(n => n.id === selectedNodeId.value)
  if (!node || node.type !== 'branch-node') return
  const branch = branchesStore.branches.find(b => b.id === node.data.branchId)
  if (!branch) return
  const ok = await confirm(`Удалить ветку «${branch.displayName}»?`)
  if (!ok) return
  branchesStore.deleteBranch(branch.id)
  selectedNodeId.value = null
  saveToHistory()
}

async function deleteSelectedMilestone() {
  const node = nodes.value.find(n => n.id === selectedNodeId.value)
  if (!node || node.type !== 'milestone-node' || !node.data.milestone) return
  const milestone = node.data.milestone
  const ok = await confirm(`Удалить этап «${milestone.name}»?`)
  if (!ok) return
  branchesStore.deleteMilestone(milestone.id)
  selectedNodeId.value = null
  saveToHistory()
}

// ========== Авто-раскладка ==========
function autoLayout() {
  const allNodes = nodes.value
  if (allNodes.length === 0) return
  const layouted = applyLayout(allNodes, edges.value, 'LR')
  layouted.forEach(node => {
    if (node.type === 'milestone-node')
      branchesStore.updateMilestone(node.id, { position: node.position })
    else if (node.type === 'branch-node')
      branchesStore.updateBranchPosition(node.id, node.position)
  })
  syncNodesAndEdges()
  saveToHistory()
}

// ========== Перетаскивание ==========
function onNodeDragStop() {
  saveToHistory()
}

// ========== Остальные методы ==========
function openBranchEditor(branchId: string) {
  const branch = branchesStore.branches.find(b => b.id === branchId)
  if (branch) branchModal.value = { visible: true, branch }
}
function openAddBranchModal() { branchModal.value = { visible: true, branch: null } }
function handleSaveBranch(data: any) { /* как было, добавить saveToHistory() */ }
async function handleDeleteBranch() { /* как было, добавить saveToHistory() */ }

const editingMilestone = ref<Milestone | null>(null)
const creatingMilestone = ref(false)
const branchModal = ref<{ visible: boolean; branch: Branch | null }>({ visible: false, branch: null })

function openMilestoneEditor(milestone: Milestone) { editingMilestone.value = milestone }
function openMilestoneCreator() { creatingMilestone.value = true }

async function handleCreateMilestone(data: any) {
  // найти выбранную ветку, проверить, если нет – уведомление
  // создать этап, обновить, saveToHistory()
}

function handleSaveMilestone(updates: any) { /* добавить saveToHistory() */ }
async function handleDeleteMilestone() { /* добавить saveToHistory() */ }

function addMilestoneToSelectedBranch() {
  if (!canAddMilestone.value) {
    addNotification({ type: 'warning', message: 'Выберите ветку или этап' })
    return
  }
  openMilestoneCreator()
}

// Хендлеры с мобильной версии
async function handleDeleteBranchFromMobile(branchId: string) { /* подтверждение + deleteBranch + saveToHistory */ }
async function handleDeleteMilestoneFromMobile(milestoneId: string) { /* подтверждение + deleteMilestone + saveToHistory */ }

function onNodeClick({ node }: { node: Node }) { selectedNodeId.value = node.id; selectedEdgeId.value = null }
function onEdgeClick({ edge }: { edge: Edge }) { selectedEdgeId.value = edge.id; selectedNodeId.value = null }
function onPaneClick() { selectedNodeId.value = null; selectedEdgeId.value = null }

function onNodesChange(changes: any[]) { /* сохранять позиции, но не сохранять историю при каждом чихе – только в onNodeDragStop */ }
function onEdgesChange() {}
function zoomIn() { vfZoomIn() }
function zoomOut() { vfZoomOut() }

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  nextTick(() => {
    if (!isMobile.value) {
      syncNodesAndEdges()
      setTimeout(() => fitView(), 100)
      saveToHistory()
    }
  })
})
onUnmounted(() => window.removeEventListener('resize', checkMobile))

const checkMobile = () => { isMobile.value = window.innerWidth < 768 }

watch(() => [branchesStore.branches, branchesStore.edges], () => syncNodesAndEdges(), { immediate: true, deep: true })
</script>

<style scoped lang="scss">
.branch-flow-wrapper {
  width: 100%;
  height: 100%;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg);
  position: relative;
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
:deep(.vue-flow__node.selected .branch-node, .vue-flow__node.selected .milestone-node) {
  border: 1px solid #ffffff !important;
}
:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: var(--accent);
  stroke-width: 3;
}
</style>