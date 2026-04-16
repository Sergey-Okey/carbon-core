<template>
  <div class="branch-flow-wrapper">
    <div v-if="isMobile" class="mobile-warning">
      <div class="warning-card">
        <AlertTriangle :size="48" />
        <h2>Требуется десктоп</h2>
        <p>Доска развития доступна только на больших экранах.</p>
      </div>
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
      @pane-context-menu="onPaneContextMenu"
      @node-context-menu="onNodeContextMenu"
      @edge-context-menu="onEdgeContextMenu"
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
      </Panel>

      <template #node-branch="nodeProps">
        <BranchNode
          :data="nodeProps.data"
          @edit="openEditor(nodeProps.data.milestone)"
        />
      </template>
    </VueFlow>

    <!-- Кастомное контекстное меню -->
    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
        @click.stop
      >
        <template v-if="contextMenu.type === 'pane'">
          <button @click="addMilestoneHere">Добавить узел</button>
          <button @click="openAddBranchModal">Добавить ветку</button>
        </template>
        <template v-else-if="contextMenu.type === 'node'">
          <button @click="editSelectedNode">Редактировать</button>
          <button @click="deleteSelectedNode">Удалить</button>
        </template>
        <template v-else-if="contextMenu.type === 'edge'">
          <button @click="deleteSelectedEdge">Удалить связь</button>
        </template>
      </div>
    </Teleport>

    <NodeEditorModal
      v-if="editingMilestone"
      :milestone="editingMilestone"
      @close="editingMilestone = null"
      @save="handleSaveMilestone"
    />

    <BranchModal
      v-if="branchModal.visible"
      :branch="branchModal.branch"
      @close="branchModal.visible = false"
      @save="handleSaveBranch"
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
} from 'lucide-vue-next'
import { useBranchesStore } from '~/stores/branches.store'
import { useAutoLayout } from '~/composables/useAutoLayout'
import BranchNode from './BranchNode.vue'
import NodeEditorModal from './NodeEditorModal.vue'
import BranchModal from './BranchModal.vue'
import type { Milestone, Branch } from '~/types/branch.types'
import { useEventListener } from '@vueuse/core'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const branchesStore = useBranchesStore()
const { fitView, zoomIn: vfZoomIn, zoomOut: vfZoomOut } = useVueFlow()
const { applyGridLayout } = useAutoLayout()

const nodeTypes = { branch: BranchNode }
const nodes = ref<Node[]>([])
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

// Контекстное меню
const contextMenu = ref<{
  visible: boolean
  x: number
  y: number
  type: 'pane' | 'node' | 'edge'
  nodeId?: string
  edgeId?: string
}>({ visible: false, x: 0, y: 0, type: 'pane' })

function onPaneContextMenu(event: MouseEvent) {
  event.preventDefault()
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    type: 'pane',
  }
}
function onNodeContextMenu(event: any, node: Node) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault()
  }
  contextMenu.value = {
    visible: true,
    x: event?.clientX || 0,
    y: event?.clientY || 0,
    type: 'node',
    nodeId: node.id,
  }
}
function onEdgeContextMenu(event: any, edge: Edge) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault()
  }
  contextMenu.value = {
    visible: true,
    x: event?.clientX || 0,
    y: event?.clientY || 0,
    type: 'edge',
    edgeId: edge.id,
  }
}

// Закрытие меню при клике вне его
useEventListener(document, 'click', (event) => {
  const menu = document.querySelector('.context-menu')
  if (menu && menu.contains(event.target as Node)) return
  contextMenu.value.visible = false
})

// Редактирование узла
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

// Модалка ветки
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
    branchesStore.updateBranch(branchModal.value.branch.id, data)
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

// Удаление по клавише Delete
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Delete') {
    if (contextMenu.value.nodeId) {
      deleteSelectedNode()
    } else if (contextMenu.value.edgeId) {
      deleteSelectedEdge()
    }
  }
}
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// Синхронизация с хранилищем
watch(
  () => [branchesStore.branches, branchesStore.edges],
  () => {
    const newNodes: Node[] = []
    branchesStore.branches.forEach((branch) => {
      branch.milestones.forEach((milestone) => {
        newNodes.push({
          id: milestone.id,
          type: 'branch',
          position: milestone.position,
          data: { milestone, branchIcon: branch.icon },
        })
      })
    })
    nodes.value = newNodes

    // Фильтруем битые рёбра
    const existingNodeIds = new Set(newNodes.map((n) => n.id))
    edges.value = branchesStore.edges.filter(
      (e) => existingNodeIds.has(e.source) && existingNodeIds.has(e.target)
    )
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
  edge.source = connection.source
  edge.target = connection.target
}

function zoomIn() {
  vfZoomIn()
}
function zoomOut() {
  vfZoomOut()
}

function autoLayout() {
  const allMilestones = branchesStore.branches.flatMap((b) => b.milestones)
  const positions = applyGridLayout(allMilestones)
  allMilestones.forEach((m, i) => {
    branchesStore.updateMilestone(m.id, { position: positions[i] })
  })
}

function addMilestoneHere() {
  const firstBranch = branchesStore.branches[0]
  if (firstBranch) {
    branchesStore.addMilestone(firstBranch.id, 'Новый этап')
  }
}

function editSelectedNode() {
  if (contextMenu.value.nodeId) {
    const milestone = branchesStore.branches
      .flatMap((b) => b.milestones)
      .find((m) => m.id === contextMenu.value.nodeId)
    if (milestone) {
      contextMenu.value.visible = false
      openEditor(milestone)
    }
  }
}
function deleteSelectedNode() {
  if (contextMenu.value.nodeId) {
    branchesStore.deleteMilestone(contextMenu.value.nodeId)
    contextMenu.value.visible = false
  }
}
function deleteSelectedEdge() {
  if (contextMenu.value.edgeId) {
    branchesStore.removeEdge(contextMenu.value.edgeId)
    contextMenu.value.visible = false
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
  align-items: center;
  justify-content: center;
  height: 100%;
  .warning-card {
    @include glass;
    padding: 32px;
    border-radius: var(--border-radius-lg);
    text-align: center;
    max-width: 300px;
    color: var(--accent);
    h2 {
      margin: 16px 0 8px;
    }
    p {
      color: var(--dim);
    }
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

.context-menu {
  position: fixed;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: 4px;
  z-index: 1000;
  button {
    display: block;
    width: 100%;
    padding: 8px 16px;
    text-align: left;
    background: transparent;
    border: none;
    color: var(--accent);
    cursor: pointer;
    border-radius: var(--border-radius-sm);
    &:hover {
      background: var(--border);
    }
  }
}
</style>
