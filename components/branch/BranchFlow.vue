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
    >
      <Background :variant="BackgroundVariant.Dots" :gap="20" :size="1.5" />

      <BoardControls
        @fit-view="fitView"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @rebuild="handleRebuild"
      />

      <template #node-branch="nodeProps">
        <BranchNode
          :data="nodeProps.data"
          @click="openMilestoneModal(nodeProps.data)"
        />
      </template>
    </VueFlow>

    <Teleport to="body">
      <MilestoneModal
        v-if="selectedMilestone"
        :milestone="selectedMilestone"
        :branch="selectedBranch"
        @close="selectedMilestone = null"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  VueFlow,
  ConnectionMode,
  useVueFlow,
  type Node,
  type Edge,
} from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { AlertTriangle } from 'lucide-vue-next'
import { useBranchesStore } from '~/stores/branches.store'
import { useBranchAutomation } from '~/composables/useBranchAutomation'
import BoardControls from './BoardControls.vue'
import BranchNode from './BranchNode.vue'
import MilestoneModal from './MilestoneModal.vue'
import type { Branch, Milestone } from '~/types/branch.types'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const branchesStore = useBranchesStore()
const { fitView, zoomIn: vfZoomIn, zoomOut: vfZoomOut } = useVueFlow()
const { rebuildBoard } = useBranchAutomation()

const nodeTypes = { branch: BranchNode }
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}
if (import.meta.client) {
  checkMobile()
  window.addEventListener('resize', checkMobile)
}

const selectedMilestone = ref<Milestone | null>(null)
const selectedBranch = ref<Branch | null>(null)

// Преобразование данных стора в формат Vue Flow
function buildGraph() {
  const newNodes: Node[] = []
  const newEdges: Edge[] = []

  branchesStore.branches.forEach((branch) => {
    let prevX = branch.position.x
    let prevY = branch.position.y
    branch.milestones.forEach((milestone, index) => {
      const nodeId = `${branch.id}-${milestone.id}`
      // Вычисляем позицию: цепочка слева направо с отступом
      const x = prevX + (index === 0 ? 0 : 180)
      const y = prevY
      newNodes.push({
        id: nodeId,
        type: 'branch',
        position: { x, y },
        data: {
          branchId: branch.id,
          milestone,
          currentXP: branch.totalXP,
          icon: branch.icon,
          branchName: branch.displayName,
        },
      })
      prevX = x
      prevY = y
    })
  })

  // Добавляем рёбра из стора
  branchesStore.edges.forEach((edge) => {
    newEdges.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'smoothstep',
      animated: edge.animated,
      label: edge.label,
      style: edge.style,
    })
  })

  // Добавляем линейные связи внутри веток
  branchesStore.branches.forEach((branch) => {
    const milestoneIds = branch.milestones.map((m) => m.id)
    for (let i = 0; i < milestoneIds.length - 1; i++) {
      const source = `${branch.id}-${milestoneIds[i]}`
      const target = `${branch.id}-${milestoneIds[i + 1]}`
      const exists = newEdges.some(
        (e) => e.source === source && e.target === target
      )
      if (!exists) {
        newEdges.push({
          id: `${source}-${target}`,
          source,
          target,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'var(--accent)', strokeWidth: 2 },
        })
      }
    }
  })

  nodes.value = newNodes
  edges.value = newEdges
}

// Автоматическое перестроение при изменении стора
watch(
  () => [branchesStore.branches, branchesStore.edges],
  () => {
    buildGraph()
  },
  { immediate: true, deep: true }
)

function onNodesChange(changes: any[]) {
  for (const change of changes) {
    if (change.type === 'position' && change.position) {
      const [branchId] = change.id.split('-')
      branchesStore.updateBranchPosition(branchId, change.position)
    }
  }
}

async function handleRebuild() {
  await rebuildBoard()
  buildGraph()
}

function openMilestoneModal(data: any) {
  selectedMilestone.value = data.milestone
  selectedBranch.value =
    branchesStore.branches.find((b) => b.id === data.branchId) || null
}

function zoomIn() {
  vfZoomIn()
}
function zoomOut() {
  vfZoomOut()
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
  stroke-width: 2;
  transition: stroke 0.3s;
}

:deep(.vue-flow__controls) {
  display: none;
}

:deep(.vue-flow__minimap) {
  display: none;
}
</style>
