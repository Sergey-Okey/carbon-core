<template>
  <div class="branch-flow-wrapper">
    <!-- Мобильное предупреждение -->
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
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
      @connect="onConnect"
      @edge-update="onEdgeUpdate"
    >
      <!-- Фон с точками -->
      <Background :variant="BackgroundVariant.Dots" :gap="20" :size="1.5" />

      <!-- Стандартные контролы (зум, фит) -->
      <Controls position="bottom-right" />

      <!-- Миникарта -->
      <MiniMap position="top-right" :pannable="true" :zoomable="true" />

      <!-- Кастомные кнопки управления -->
      <Panel position="top-left" class="custom-controls">
        <button @click="fitView" title="Сбросить вид (Fit View)">
          <Maximize :size="18" />
        </button>
        <button @click="zoomIn" title="Приблизить">
          <ZoomIn :size="18" />
        </button>
        <button @click="zoomOut" title="Отдалить">
          <ZoomOut :size="18" />
        </button>
        <button @click="addNewBranch" title="Добавить ветку">
          <Plus :size="18" />
        </button>
      </Panel>

      <!-- Кастомный узел -->
      <template #node-branch="nodeProps">
        <BranchNode :data="nodeProps.data" />
      </template>
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { AlertTriangle, Maximize, ZoomIn, ZoomOut, Plus } from 'lucide-vue-next'
import { useBranchesStore } from '~/stores/branches.store'
import BranchNode from './BranchNode.vue'
import type { Branch } from '~/types/branch.types'

// Стили Vue Flow (обязательно)
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

const branchesStore = useBranchesStore()
const { fitView, zoomIn: vfZoomIn, zoomOut: vfZoomOut } = useVueFlow()

// Типы узлов
const nodeTypes = { branch: BranchNode }

// Локальные реактивные данные для Vue Flow
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

// Мобильное обнаружение
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

// Преобразование веток -> узлы
function branchesToNodes(branches: Branch[]): Node[] {
  return branches.map((branch) => ({
    id: branch.id,
    type: 'branch',
    position: branch.position || { x: 0, y: 0 },
    data: { branch },
    dragHandle: '.drag-handle',
  }))
}

// Синхронизация store -> flow (узлы и связи)
watch(
  () => [branchesStore.branches, branchesStore.edges],
  () => {
    nodes.value = branchesToNodes(branchesStore.branches)
    edges.value = branchesStore.edges
  },
  { immediate: true, deep: true }
)

// Сохранение позиций узлов обратно в store
function onNodesChange(changes: any[]) {
  for (const change of changes) {
    if (change.type === 'position' && change.position) {
      branchesStore.updateBranchPosition(change.id, change.position)
    }
  }
}

// Сохранение изменений связей
function onEdgesChange(changes: any[]) {
  // В простом случае просто заменяем edges в store
  // Для оптимизации можно обрабатывать изменения точечно
  edges.value = [...edges.value] // триггер реактивности
  branchesStore.edges = edges.value
}

function onConnect(connection: Connection) {
  const newEdge: Edge = {
    id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
    source: connection.source!,
    target: connection.target!,
    type: 'smoothstep',
    animated: true,
    style: { stroke: 'var(--accent)', strokeWidth: 2 },
  }
  branchesStore.addEdge(newEdge)
}

function onEdgeUpdate({ edge, connection }: any) {
  edge.source = connection.source
  edge.target = connection.target
  // Обновляем в store
  branchesStore.updateEdge(edge.id, edge)
}

// Кастомные действия
function zoomIn() {
  vfZoomIn()
}
function zoomOut() {
  vfZoomOut()
}
function addNewBranch() {
  // Создаём новую ветку с дефолтными значениями
  const newBranch: Omit<Branch, 'id'> = {
    displayName: 'Новая ветка',
    icon: 'target',
    totalXP: 0,
    milestones: [],
    position: { x: 200, y: 200 },
    scale: 1,
    order: branchesStore.branches.length,
  }
  branchesStore.addBranch(newBranch)
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

// Стилизация Vue Flow под Carbon Core
:deep(.vue-flow) {
  background: var(--bg);
}

:deep(.vue-flow__background) {
  background-color: var(--bg);
  .vue-flow__background-pattern {
    stroke: var(--border);
  }
}

:deep(.vue-flow__controls) {
  @include glass;
  border-radius: var(--border-radius-md);
  button {
    background: transparent;
    border-bottom: 1px solid var(--border);
    color: var(--accent);
    &:hover {
      background: var(--surface);
    }
  }
}

:deep(.vue-flow__minimap) {
  @include glass;
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

:deep(.vue-flow__edge-path) {
  stroke: var(--accent);
  stroke-width: 2;
}

// Кастомные кнопки управления
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
}
</style>
