<template>
  <div class="branch-flow-wrapper">
    <div v-if="isMobile" class="mobile-warning">
      <AlertTriangle :size="32" />
      <h3>Доступно только на десктопе</h3>
      <p>
        Для работы с доской развития используйте компьютер или планшет в
        горизонтальной ориентации.
      </p>
    </div>

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
          v-if="selectedEdgeId"
          @click="deleteSelectedEdge"
          title="Удалить связь"
        >
          <Unlink :size="18" />
        </button>
        <button @click="addMilestoneToSelectedBranch" title="Добавить этап">
          <PlusCircle :size="18" />
        </button>
        <button
          v-if="selectedNodeId && isBranchNode(selectedNodeId)"
          @click="deleteSelectedBranch"
          title="Удалить ветку"
        >
          <Trash2 :size="18" />
        </button>
      </Panel>

      <template #node-branch="nodeProps">
        <BranchNode
          :data="nodeProps.data"
          :selected="selectedNodeId === nodeProps.id"
          @edit="openEditor(nodeProps.data.milestone)"
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
import { ref, watch, onMounted, onUnmounted } from 'vue'
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
import NodeEditorModal from './NodeEditorModal.vue'
import BranchModal from './BranchModal.vue'
import type { Milestone, Branch, BranchNodeData } from '~/types/branch.types'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const branchesStore = useBranchesStore()
const { fitView, zoomIn: vfZoomIn, zoomOut: vfZoomOut } = useVueFlow()
const { applyLayout } = useAutoLayout()
const { confirm } = useConfirm()

const nodeTypes = { branch: BranchNode }
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

// Проверка, является ли узел веткой (единственный этап в ветке)
function isBranchNode(nodeId: string): boolean {
  const node = nodes.value.find((n) => n.id === nodeId)
  if (!node) return false
  const branch = branchesStore.branches.find((b) =>
    b.milestones.some((m) => m.id === nodeId)
  )
  return branch?.milestones.length === 1 && branch.milestones[0].id === nodeId
}

const editingMilestone = ref<Milestone | null>(null)
function openEditor(milestone: Milestone) {
  editingMilestone.value = milestone
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

const branchModal = ref<{ visible: boolean; branch: Branch | null }>({
  visible: false,
  branch: null,
})
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
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Delete') return

  if (selectedNodeId.value) {
    const node = nodes.value.find((n) => n.id === selectedNodeId.value)
    if (!node) return
    const milestone = node.data.milestone!
    const branch = branchesStore.branches.find((b) =>
      b.milestones.some((m) => m.id === selectedNodeId.value)
    )

    if (
      branch &&
      branch.milestones.length === 1 &&
      branch.milestones[0].id === selectedNodeId.value
    ) {
      // Это единственный узел ветки → удаляем ветку
      confirm(`Удалить ветку «${branch.displayName}»?`).then((ok) => {
        if (ok) {
          branchesStore.deleteBranch(branch.id)
          selectedNodeId.value = null
        }
      })
    } else {
      // Обычный этап
      confirm(`Удалить этап «${milestone.name}»?`).then((ok) => {
        if (ok) {
          branchesStore.deleteMilestone(selectedNodeId.value!)
          selectedNodeId.value = null
        }
      })
    }
  } else if (selectedEdgeId.value) {
    confirm('Удалить связь?').then((ok) => {
      if (ok) {
        branchesStore.removeEdge(selectedEdgeId.value!)
        selectedEdgeId.value = null
      }
    })
  }
}
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

async function deleteSelectedEdge() {
  if (selectedEdgeId.value) {
    const ok = await confirm('Удалить связь?')
    if (ok) {
      branchesStore.removeEdge(selectedEdgeId.value)
      selectedEdgeId.value = null
    }
  }
}

async function deleteSelectedBranch() {
  if (!selectedNodeId.value) return
  const branch = branchesStore.branches.find((b) =>
    b.milestones.some((m) => m.id === selectedNodeId.value)
  )
  if (!branch) return
  const ok = await confirm(`Удалить ветку «${branch.displayName}»?`)
  if (ok) {
    branchesStore.deleteBranch(branch.id)
    selectedNodeId.value = null
  }
}

function syncNodesAndEdges() {
  const newNodes: Node<BranchNodeData>[] = []
  branchesStore.branches.forEach((branch) => {
    branch.milestones.forEach((milestone) => {
      newNodes.push({
        id: milestone.id,
        type: 'branch',
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
}
function onEdgeUpdate({ edge, connection }: any) {
  const updatedEdge = {
    ...edge,
    source: connection.source,
    target: connection.target,
  }
  branchesStore.updateEdge(updatedEdge)
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
    type: 'branch',
    position: m.position,
    data: { milestone: m },
  }))
  const currentEdges: Edge[] = branchesStore.edges

  const layoutedNodes = applyLayout(currentNodes, currentEdges)
  layoutedNodes.forEach((node) => {
    branchesStore.updateMilestone(node.id, { position: node.position })
  })
}

function addMilestoneToSelectedBranch() {
  let targetBranch: Branch | undefined
  if (selectedNodeId.value) {
    targetBranch = branchesStore.branches.find((b) =>
      b.milestones.some((m) => m.id === selectedNodeId.value)
    )
  }
  if (!targetBranch) {
    targetBranch = branchesStore.branches[0]
  }
  if (targetBranch) {
    branchesStore.addMilestone(targetBranch.id, 'Новый этап', '')
  }
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
:deep(.vue-flow__node-branch.selected) {
  .branch-node {
    border: 1px solid var(--accent);
    box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.2);
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
