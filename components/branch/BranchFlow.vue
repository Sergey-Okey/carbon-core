<template>
  <div class="branch-flow-wrapper">
    <!-- ✅ АЛЬТЕРНАТИВНЫЙ МОБ ИЛЬНЫЙ ВИД ВМЕСТО WARNING -->
    <BranchMobileView
      v-if="isMobile"
      @edit-milestone="openMilestoneEditor"
      @add-milestone="addMilestoneToSelectedBranch"
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
      :edges-updatable="false"
      :nodes-focusable="true"
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
      @connect="onConnect"
      @edge-update="onEdgeUpdate"
      @node-click="onNodeClick"
      @edge-click="onEdgeClick"
      @pane-click="onPaneClick"
    >
      <Background :variant="BackgroundVariant.Dots" :gap="20" :size="1.5" />

      <Panel position="top-left" class="custom-controls">
        <button @click="fitView" title="Сбросить вид">
          <Maximize :size="18" />
        </button>
        <button @click="zoomIn" title="Приблизить">
          <ZoomIn :size="18" />
        </button>
        <button @click="zoomOut" title="Отдалить">
          <ZoomOut :size="18" />
        </button>
        <div class="divider"></div>
        <button @click="autoLayout" title="Авто-расположение">
          <Layout :size="18" />
        </button>
        <button @click="openAddBranchModal" title="Добавить ветку">
          <Plus :size="18" />
        </button>
        <button
          v-if="selectedNodeId && isBranchNode(selectedNodeId)"
          @click="addMilestoneToSelectedBranch"
          title="Добавить этап"
        >
          <PlusCircle :size="18" />
        </button>
        <button
          v-if="selectedEdgeId"
          @click="deleteSelectedEdge"
          title="Удалить связь"
        >
          <Unlink :size="18" />
        </button>
        <button
          v-if="selectedNodeId && isBranchNode(selectedNodeId)"
          @click="deleteSelectedBranch"
          title="Удалить ветку"
        >
          <Trash2 :size="18" />
        </button>
        <button
          v-if="selectedNodeId && !isBranchNode(selectedNodeId)"
          @click="deleteSelectedMilestone"
          title="Удалить этап"
        >
          <Trash2 :size="18" />
        </button>
      </Panel>

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
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  VueFlow,
  ConnectionMode,
  useVueFlow,
  Panel,
  type Node,
  type Edge,
  type Connection,
} from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import {
  AlertTriangle,
  Maximize,
  ZoomIn,
  ZoomOut,
  Plus,
  Layout,
  Unlink,
  PlusCircle,
  Trash2,
} from 'lucide-vue-next'
import { useBranchesStore } from '~/stores/branches.store'
import { useAutoLayout } from '~/composables/useAutoLayout'
import { useConfirm } from '~/composables/useConfirm'
import BranchNode from './BranchNode.vue'
import MilestoneNode from './MilestoneNode.vue'
import NodeEditorModal from './NodeEditorModal.vue'
import BranchModal from './BranchModal.vue'
import BranchMobileView from './BranchMobileView.vue' // ✅ Новый мобильный компонент
import type { Milestone, Branch, BranchNodeData } from '~/types/branch.types'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const branchesStore = useBranchesStore()
const { fitView, zoomIn: vfZoomIn, zoomOut: vfZoomOut } = useVueFlow()
const { applyLayout } = useAutoLayout()
const { confirm } = useConfirm()

const nodeTypes = {
  'branch-node': BranchNode,
  'milestone-node': MilestoneNode,
}
const nodes = ref<Node<BranchNodeData>[]>([])
const edges = ref<Edge[]>([])

const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)

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

function isBranchNode(nodeId: string): boolean {
  const node = nodes.value.find((n) => n.id === nodeId)
  return node?.type === 'branch-node'
}

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
function handleCreateMilestone(data: {
  name: string
  icon: string
  description: string
  taskIds: string[]
}) {
  let targetBranch: Branch | undefined
  if (selectedNodeId.value) {
    targetBranch = branchesStore.branches.find((b) =>
      b.milestones.some((m) => m.id === selectedNodeId.value)
    )
  }
  const branchId = targetBranch?.id || null
  const icon = targetBranch?.icon || data.icon

  const lastMilestone =
    targetBranch?.milestones[targetBranch.milestones.length - 1]

  const newMilestone = branchesStore.addMilestone(branchId, data.name)

  // принудительно обновляем milestone в сторе для гарантированной реактивности
  branchesStore.updateMilestone(newMilestone.id, {
    description: data.description,
    icon: icon,
    taskIds: data.taskIds,
  })

  if (lastMilestone) {
    branchesStore.addEdge({
      id: `edge-${lastMilestone.id}-${newMilestone.id}-${Date.now()}`,
      source: lastMilestone.id,
      target: newMilestone.id,
      type: 'smoothstep',
      animated: false,
      style: { stroke: 'var(--accent)', strokeWidth: 1 },
    })
  }

  nextTick(() => {
    syncNodesAndEdges()
  })

  creatingMilestone.value = false
}
function handleSaveMilestone(updates: Partial<Milestone>) {
  if (editingMilestone.value) {
    branchesStore.updateMilestone(editingMilestone.value.id, updates)
    editingMilestone.value = null
  }
}
async function handleDeleteMilestone() {
  const milestone = editingMilestone.value
  if (!milestone) return
  const ok = await confirm(`Удалить этап «${milestone.name}»?`)
  if (ok) {
    branchesStore.deleteMilestone(milestone.id)
    editingMilestone.value = null
  }
}

function openBranchEditor(branchId: string) {
  const branch = branchesStore.branches.find((b) => b.id === branchId)
  if (branch) {
    branchModal.value = { visible: true, branch }
  }
}
function openAddBranchModal() {
  branchModal.value = { visible: true, branch: null }
}
function handleSaveBranch(data: {
  name: string
  icon: string
  description: string
  taskIds: string[]
}) {
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
}
async function handleDeleteBranch() {
  const branch = branchModal.value.branch
  if (!branch) return
  const ok = await confirm(`Удалить ветку «${branch.displayName}»?`)
  if (ok) {
    branchesStore.deleteBranch(branch.id)
    branchModal.value.visible = false
    selectedNodeId.value = null
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Delete') return

  if (selectedNodeId.value) {
    const node = nodes.value.find((n) => n.id === selectedNodeId.value)
    if (!node) return

    if (node.type === 'branch-node') {
      const branch = branchesStore.branches.find(
        (b) => b.id === node.data.branchId
      )
      if (branch) {
        confirm(`Удалить ветку «${branch.displayName}»?`).then((ok) => {
          if (ok) {
            branchesStore.deleteBranch(branch.id)
            selectedNodeId.value = null
          }
        })
      }
    } else if (node.type === 'milestone-node' && node.data.milestone) {
      const milestone = node.data.milestone
      confirm(`Удалить этап «${milestone.name}»?`).then((ok) => {
        if (ok) {
          branchesStore.deleteMilestone(milestone.id)
          selectedNodeId.value = null
        }
      })
    }
  } else if (selectedEdgeId.value) {
    confirm('Удалить связь?').then((ok) => {
      if (ok) {
        branchesStore.removeEdge(selectedEdgeId.value!)
        const edge = edges.value.find((e) => e.id === selectedEdgeId.value)
        if (edge) {
          const sourceNode = nodes.value.find((n) => n.id === edge.source)
          if (sourceNode?.type === 'milestone-node') {
            branchesStore.detachMilestoneFromBranch(edge.source)
          }
          branchesStore.refreshMilestonesByTaskId(edge.source)
          branchesStore.refreshMilestonesByTaskId(edge.target)
        }
        selectedEdgeId.value = null
      }
    })
  }
}
onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

async function deleteSelectedEdge() {
  if (selectedEdgeId.value) {
    const edge = edges.value.find((e) => e.id === selectedEdgeId.value)
    const ok = await confirm('Удалить связь?')
    if (ok) {
      branchesStore.removeEdge(selectedEdgeId.value)

      if (edge) {
        const sourceNode = nodes.value.find((n) => n.id === edge.source)
        if (sourceNode?.data.type === 'milestone') {
          branchesStore.detachMilestoneFromBranch(edge.source)
        }

        branchesStore.refreshMilestonesByTaskId(edge.source)
        branchesStore.refreshMilestonesByTaskId(edge.target)
      }
      selectedEdgeId.value = null
    }
  }
}
async function deleteSelectedBranch() {
  if (!selectedNodeId.value) return

  const selectedNode = nodes.value.find((n) => n.id === selectedNodeId.value)
  if (!selectedNode) return

  let branchIdToDelete: string | null = null

  if (selectedNode.data.type === 'branch') {
    branchIdToDelete = selectedNode.data.branchId
  } else if (selectedNode.data.type === 'milestone') {
    const branch = branchesStore.branches.find((b) =>
      b.milestones.some((m) => m.id === selectedNodeId.value)
    )
    if (branch && branch.milestones[0]?.id === selectedNodeId.value) {
      branchIdToDelete = branch.id
    }
  }

  if (!branchIdToDelete) return

  const branch = branchesStore.branches.find((b) => b.id === branchIdToDelete)
  if (!branch) return

  const ok = await confirm(`Удалить ветку «${branch.displayName}»?`)
  if (ok) {
    branchesStore.deleteBranch(branchIdToDelete!)
    selectedNodeId.value = null
    nodes.value = nodes.value.map((n) => ({ ...n, selected: false }))
  }
}

async function deleteSelectedMilestone() {
  if (!selectedNodeId.value) return

  const node = nodes.value.find((n) => n.id === selectedNodeId.value)
  if (!node || node.data.type !== 'milestone' || !node.data.milestone) return

  const milestone = node.data.milestone
  const ok = await confirm(`Удалить этап «${milestone.name}»?`)
  if (ok) {
    branchesStore.deleteMilestone(milestone.id)
    selectedNodeId.value = null
    nodes.value = nodes.value.map((n) => ({ ...n, selected: false }))
  }
}

function syncNodesAndEdges() {
  const newNodes: Node<BranchNodeData>[] = []

  branchesStore.branches.forEach((branch) => {
    const firstMilestone = branch.milestones[0]
    if (firstMilestone) {
      newNodes.push({
        id: branch.id,
        type: 'branch-node',
        position: firstMilestone.position,
        data: {
          type: 'branch',
          branchId: branch.id,
          milestone: null,
          branchIcon: branch.icon,
        },
      })
    }

    branch.milestones.slice(1).forEach((milestone) => {
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

  const currentSelectedNode = selectedNodeId.value
  const selectedNodeExists = newNodes.some((n) => n.id === currentSelectedNode)
  if (!selectedNodeExists) {
    selectedNodeId.value = null
  }

  nodes.value = newNodes

  const existingNodeIds = new Set(newNodes.map((n) => n.id))
  edges.value = branchesStore.edges.filter(
    (e) => existingNodeIds.has(e.source) && existingNodeIds.has(e.target)
  )
}

watch(
  () => [branchesStore.branches, branchesStore.edges],
  () => {
    syncNodesAndEdges()
  },
  { immediate: true, deep: true }
)

function onNodesChange(changes: any[]) {
  for (const change of changes) {
    if (change.type === 'position' && change.position) {
      const milestoneId = change.id
      branchesStore.updateMilestone(milestoneId, { position: change.position })
    }
  }
}
function onEdgesChange() {}
function onConnect(connection: Connection) {
  const newEdge: Edge = {
    id: `${connection.source}-${connection.target}-${Date.now()}`,
    source: connection.source!,
    target: connection.target!,
    type: 'smoothstep',
    animated: false,
    style: { stroke: 'var(--accent)', strokeWidth: 1 },
  }
  branchesStore.addEdge(newEdge)

  const sourceNode = nodes.value.find((n) => n.id === connection.source)
  const targetNode = nodes.value.find((n) => n.id === connection.target)

  if (
    sourceNode?.data.type === 'milestone' &&
    targetNode?.data.type === 'branch'
  ) {
    branchesStore.attachMilestoneToBranch(
      connection.source,
      targetNode.data.branchId
    )
    branchesStore.refreshMilestonesByTaskId(connection.source)
  } else if (
    sourceNode?.data.type === 'milestone' &&
    targetNode?.data.type === 'milestone'
  ) {
    const targetBranchId = targetNode.data.branchId
    if (targetBranchId) {
      branchesStore.attachMilestoneToBranch(connection.source, targetBranchId)
      branchesStore.refreshMilestonesByTaskId(connection.source)
    }
  }
}
function onEdgeUpdate({ edge, connection }: any) {
  const oldSource = edge.source
  const oldTarget = edge.target
  const updatedEdge = {
    ...edge,
    source: connection.source,
    target: connection.target,
  }
  branchesStore.updateEdge(updatedEdge)

  const newSourceNode = nodes.value.find((n) => n.id === connection.source)
  const newTargetNode = nodes.value.find((n) => n.id === connection.target)

  if (newSourceNode?.data.type === 'milestone') {
    let newBranchId: string | null = null

    if (newTargetNode?.data.type === 'branch') {
      newBranchId = newTargetNode.data.branchId
    } else if (newTargetNode?.data.type === 'milestone') {
      newBranchId = newTargetNode.data.branchId
    }

    if (newBranchId) {
      branchesStore.attachMilestoneToBranch(connection.source, newBranchId)
    }
  }

  branchesStore.refreshMilestonesByTaskId(oldSource)
  branchesStore.refreshMilestonesByTaskId(oldTarget)
  branchesStore.refreshMilestonesByTaskId(connection.source)
  branchesStore.refreshMilestonesByTaskId(connection.target)
}

function zoomIn() {
  vfZoomIn()
}
function zoomOut() {
  vfZoomOut()
}
function autoLayout() {
  const allMilestones = branchesStore.branches.flatMap((b) => b.milestones)
  const currentNodes: Node[] = allMilestones.map((m) => ({
    id: m.id,
    type: 'milestone-node',
    position: m.position,
    data: {
      type: 'milestone',
      milestone: m,
      branchIcon: '',
      branchId: m.branchId!,
    },
  }))
  const currentEdges: Edge[] = branchesStore.edges
  const layoutedNodes = applyLayout(currentNodes, currentEdges)
  layoutedNodes.forEach((node) => {
    branchesStore.updateMilestone(node.id, { position: node.position })
  })
}
function addMilestoneToSelectedBranch() {
  openMilestoneCreator()
}
</script>

<style scoped lang="scss">
.branch-flow-wrapper {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg);
  @include desktop {
    height: calc(100vh - 120px);
  }
}

.mobile-warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 32px;
  color: var(--accent);
  background: var(--bg);
  border: none;

  h3 {
    margin: 16px 0 8px;
    font-size: 1.3rem;
    font-weight: 600;
  }

  p {
    color: var(--dim);
    max-width: 300px;
    line-height: 1.5;
  }
}

:deep(.vue-flow) {
  background: var(--bg);
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
  &.completed {
    stroke: var(--success);
  }
}
:deep(.vue-flow__node) {
  &.selected {
    .branch-node,
    .milestone-node {
      border: 1px solid #ffffff !important;
    }
  }
}
:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: var(--accent);
  stroke-width: 3;
}

.custom-controls {
  display: flex;
  gap: 8px;
  @include glass;
  padding: 6px;
  border-radius: var(--border-radius-md);
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: var(--border-radius-sm);
    color: var(--accent);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background var(--transition-standard);
    &:hover {
      background: var(--surface);
    }
  }
  .divider {
    width: 1px;
    height: 34px;
    background: var(--border);
    margin: 0 4px;
  }
}
</style>
