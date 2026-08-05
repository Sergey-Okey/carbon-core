import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { Edge } from '@vue-flow/core'
import { v4 as uuidv4 } from 'uuid'
import type { Branch, BranchId, Milestone } from '~/types/branch.types'
import { useTasksStore } from './tasks.store'
import { accessAwareStorage } from '~/utils/accessStorage'

const edgeStyle = { stroke: 'var(--dim)', strokeWidth: 1.15 }
const edgePathOptions = { borderRadius: 16, offset: 10 }
const defaultMarkerColor = '#d6d6d6'

type PortSide = 'top' | 'right' | 'bottom' | 'left'

function sourcePort(nodeId: string, side: PortSide = 'right') {
  return `source-${side}-${nodeId}`
}

function targetPort(nodeId: string, side: PortSide = 'left') {
  return `target-${side}-${nodeId}`
}

function oppositePortSide(side: PortSide): PortSide {
  if (side === 'top') return 'bottom'
  if (side === 'right') return 'left'
  if (side === 'bottom') return 'top'
  return 'right'
}

function dominantPortSide(dx: number, dy: number): PortSide {
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'right' : 'left'
  return dy >= 0 ? 'bottom' : 'top'
}

function isSourceHandle(handle?: string | null) {
  return !!handle && handle.startsWith('source-')
}

function isTargetHandle(handle?: string | null) {
  return !!handle && handle.startsWith('target-')
}

function createEdge(
  source: string,
  target: string,
  sourceHandle?: string | null,
  targetHandle?: string | null
): Edge {
  return {
    id: `edge-${source}-${target}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source,
    target,
    sourceHandle: sourceHandle || sourcePort(source),
    targetHandle: targetHandle || targetPort(target),
    type: 'smoothstep',
    pathOptions: edgePathOptions,
    animated: false,
    style: edgeStyle,
  }
}

type BoardNodeKind = 'branch' | 'milestone'

type MilestoneLocation = {
  branch: Branch
  milestone: Milestone
  index: number
}

type BoardActionResult = {
  ok: boolean
  reason?: string
}

export const useBranchesStore = defineStore(
  'branches',
  () => {
    const branches = ref<Branch[]>([
      {
        id: 'COF',
        displayName: 'Core of Life',
        icon: 'target',
        description: 'Разработка главного приложения для саморазвития',
        markerColor: defaultMarkerColor,
        taskIds: [],
        milestones: [
          {
            id: 'cof-m1',
            name: 'Идея и концепция',
            icon: 'target',
            description: 'Определение миссии, целевой аудитории и ключевых фич',
            status: 'completed',
            taskIds: [],
            position: { x: 200, y: 200 },
            achieved: true,
          },
          {
            id: 'cof-m2',
            name: 'Дизайн интерфейса',
            icon: 'palette',
            description: 'Прототипирование, UI Kit, адаптивный дизайн',
            status: 'completed',
            taskIds: [],
            position: { x: 500, y: 150 },
            achieved: true,
          },
          {
            id: 'cof-m3',
            name: 'Frontend (Vue 3)',
            icon: 'code',
            description: 'Компоненты, маршрутизация, хранение состояния',
            status: 'completed',
            taskIds: [],
            position: { x: 500, y: 300 },
            achieved: true,
          },
          {
            id: 'cof-m4',
            name: 'Backend & API',
            icon: 'server',
            description: 'Создание API, авторизация, база данных',
            status: 'active',
            taskIds: [],
            position: { x: 800, y: 150 },
          },
          {
            id: 'cof-m5',
            name: 'Интеграция и тестирование',
            icon: 'test-tube',
            description: 'Юнит-тесты, e2e, исправление багов',
            status: 'pending',
            taskIds: [],
            position: { x: 800, y: 300 },
          },
          {
            id: 'cof-m6',
            name: 'Деплой и мониторинг',
            icon: 'rocket',
            description: 'Развёртывание, CI/CD, аналитика',
            status: 'pending',
            taskIds: [],
            position: { x: 1100, y: 220 },
          },
        ],
        order: 0,
        position: { x: 50, y: 220 },
      },
    ])

    const edges = shallowRef<Edge[]>([
      {
        id: 'edge-cof-m1',
        source: 'COF',
        target: 'cof-m1',
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--accent)', strokeWidth: 1 },
      },
      {
        id: 'edge-m1-m2',
        source: 'cof-m1',
        target: 'cof-m2',
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--accent)', strokeWidth: 1 },
      },
      {
        id: 'edge-m1-m3',
        source: 'cof-m1',
        target: 'cof-m3',
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--accent)', strokeWidth: 1 },
      },
      {
        id: 'edge-m2-m4',
        source: 'cof-m2',
        target: 'cof-m4',
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--accent)', strokeWidth: 1 },
      },
      {
        id: 'edge-m3-m5',
        source: 'cof-m3',
        target: 'cof-m5',
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--accent)', strokeWidth: 1 },
      },
      {
        id: 'edge-m4-m6',
        source: 'cof-m4',
        target: 'cof-m6',
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--accent)', strokeWidth: 1 },
      },
      {
        id: 'edge-m5-m6',
        source: 'cof-m5',
        target: 'cof-m6',
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--accent)', strokeWidth: 1 },
      },
      {
        id: 'edge-cof-m1',
        source: 'COF',
        target: 'cof-m1',
        type: 'smoothstep',
        animated: false,
        style: edgeStyle,
      },
      {
        id: 'edge-m1-m2',
        source: 'cof-m1',
        target: 'cof-m2',
        type: 'smoothstep',
        animated: false,
        style: edgeStyle,
      },
      {
        id: 'edge-m1-m3',
        source: 'cof-m1',
        target: 'cof-m3',
        type: 'smoothstep',
        animated: false,
        style: edgeStyle,
      },
      {
        id: 'edge-m2-m4',
        source: 'cof-m2',
        target: 'cof-m4',
        type: 'smoothstep',
        animated: false,
        style: edgeStyle,
      },
      {
        id: 'edge-m3-m5',
        source: 'cof-m3',
        target: 'cof-m5',
        type: 'smoothstep',
        animated: false,
        style: edgeStyle,
      },
      {
        id: 'edge-m4-m6',
        source: 'cof-m4',
        target: 'cof-m6',
        type: 'smoothstep',
        animated: false,
        style: edgeStyle,
      },
      {
        id: 'edge-m5-m6',
        source: 'cof-m5',
        target: 'cof-m6',
        type: 'smoothstep',
        animated: false,
        style: edgeStyle,
      },
    ])
    const graphRevision = ref(0)

    function getBranch(branchId: string): Branch | undefined {
      return branches.value.find((branch) => branch.id === branchId)
    }

    function getNodeKind(nodeId: string): BoardNodeKind | null {
      if (getBranch(nodeId)) return 'branch'
      return getMilestoneLocation(nodeId) ? 'milestone' : null
    }

    function allNodeIds(): Set<string> {
      const ids = new Set<string>()
      branches.value.forEach((branch) => {
        ids.add(branch.id)
        branch.milestones.forEach((milestone) => ids.add(milestone.id))
      })
      return ids
    }

    function getMilestoneLocation(
      milestoneId: string
    ): MilestoneLocation | undefined {
      for (const branch of branches.value) {
        const index = branch.milestones.findIndex(
          (milestone) => milestone.id === milestoneId
        )
        if (index !== -1) {
          return { branch, milestone: branch.milestones[index], index }
        }
      }
      return undefined
    }

    function getNodePosition(nodeId: string) {
      const branch = getBranch(nodeId)
      if (branch) return branch.position || { x: 100, y: 100 }
      return getMilestoneLocation(nodeId)?.milestone.position
    }

    function getNodeCenter(nodeId: string) {
      const position = getNodePosition(nodeId)
      if (!position) return null
      const isBranch = !!getBranch(nodeId)
      const width = isBranch ? 240 : 220
      const height = isBranch ? 138 : 120
      return {
        x: position.x + width / 2,
        y: position.y + height / 2,
      }
    }

    function portSideFromHandle(handle?: string | null): PortSide | null {
      if (!handle) return null
      if (handle.includes('-top-')) return 'top'
      if (handle.includes('-right-')) return 'right'
      if (handle.includes('-bottom-')) return 'bottom'
      if (handle.includes('-left-')) return 'left'
      return null
    }

    function normalizeEdgePorts(edge: Edge, forceFromPositions = false): Edge {
      let next = { ...edge }

      if (isTargetHandle(next.sourceHandle)) {
        next = {
          ...next,
          source: edge.target,
          target: edge.source,
          sourceHandle: edge.targetHandle,
          targetHandle: edge.sourceHandle,
        }
      }

      if (isSourceHandle(next.targetHandle)) {
        const side = portSideFromHandle(next.targetHandle) || 'left'
        next = {
          ...next,
          targetHandle: targetPort(next.target, side),
        }
      }

      if (isTargetHandle(next.sourceHandle)) {
        const side = portSideFromHandle(next.sourceHandle) || 'right'
        next = {
          ...next,
          sourceHandle: sourcePort(next.source, side),
        }
      }

      const sourceCenter = getNodeCenter(next.source)
      const targetCenter = getNodeCenter(next.target)
      const canCompute =
        !!sourceCenter &&
        !!targetCenter &&
        (forceFromPositions ||
          !isSourceHandle(next.sourceHandle) ||
          !isTargetHandle(next.targetHandle))

      if (canCompute && sourceCenter && targetCenter) {
        const dx = targetCenter.x - sourceCenter.x
        const dy = targetCenter.y - sourceCenter.y
        const side = dominantPortSide(dx, dy)
        return {
          ...next,
          sourceHandle: sourcePort(next.source, side),
          targetHandle: targetPort(next.target, oppositePortSide(side)),
          type: next.type || 'smoothstep',
          pathOptions: edgePathOptions,
          style: edgeStyle,
        } as Edge
      }

      return {
        ...next,
        sourceHandle: next.sourceHandle || sourcePort(next.source),
        targetHandle: next.targetHandle || targetPort(next.target),
        type: next.type || 'smoothstep',
        pathOptions: edgePathOptions,
        style: edgeStyle,
      } as Edge
    }

    function refreshEdgePortsFromPositions() {
      edges.value = (edges.value as Edge[]).map((edge) =>
        normalizeEdgePorts(edge, true)
      )
    }

    function getAllMilestones(): Milestone[] {
      return branches.value.flatMap((branch) => branch.milestones)
    }

    function collectReachableNodeIds(startId: string): Set<string> {
      const visited = new Set<string>()
      const queue = [startId]
      const normalizedEdges: Edge[] = (edges.value as Edge[]).map((edge) =>
        normalizeEdgePorts(edge)
      )

      while (queue.length) {
        const currentId = queue.shift()!
        for (const edge of normalizedEdges) {
          if (edge.source !== currentId) continue
          if (visited.has(edge.target)) continue
          visited.add(edge.target)
          queue.push(edge.target)
        }
      }

      return visited
    }

    function collectReachableMilestoneIds(startId: string): Set<string> {
      const milestoneIds = new Set(
        getAllMilestones().map((milestone) => milestone.id)
      )
      const reachable = collectReachableNodeIds(startId)
      return new Set([...reachable].filter((id) => milestoneIds.has(id)))
    }

    function countIncomingEdges(nodeId: string) {
      const normalizedEdges: Edge[] = (edges.value as Edge[]).map((edge) =>
        normalizeEdgePorts(edge)
      )
      return normalizedEdges.filter((edge) => edge.target === nodeId).length
    }

    function wouldCreateCycle(sourceId: string, targetId: string) {

      if (sourceId === targetId) return true
      return collectReachableNodeIds(targetId).has(sourceId)
    }

    function collectRelatedMilestoneIds(startIds: string | string[]): Set<string> {
      const milestoneIds = new Set(
        getAllMilestones().map((milestone) => milestone.id)
      )
      const initialIds = Array.isArray(startIds) ? startIds : [startIds]
      const visitedNodes = new Set<string>(initialIds)
      const visitedMilestones = new Set<string>()
      const queue = [...initialIds]
      const normalizedEdges: Edge[] = (edges.value as Edge[]).map((edge) =>
        normalizeEdgePorts(edge)
      )

      initialIds.forEach((id) => {
        if (milestoneIds.has(id)) visitedMilestones.add(id)
      })

      while (queue.length) {
        const currentId = queue.shift()!

        for (const edge of normalizedEdges) {
          const nextId =
            edge.source === currentId
              ? edge.target
              : edge.target === currentId
                ? edge.source
                : null

          if (!nextId || visitedNodes.has(nextId)) continue

          visitedNodes.add(nextId)
          if (milestoneIds.has(nextId)) visitedMilestones.add(nextId)
          queue.push(nextId)
        }
      }

      return visitedMilestones
    }

    function collectBranchMilestoneIds(branchId: string): Set<string> {
      graphRevision.value
      return collectRelatedMilestoneIds(branchId)
    }

    function findBranchByMilestone(milestoneId: string): Branch | undefined {
      return getMilestoneLocation(milestoneId)?.branch
    }

    function findMilestone(milestoneId: string): Milestone | undefined {
      return getMilestoneLocation(milestoneId)?.milestone
    }

    function collectBranchTaskIds(branch: Branch): string[] {
      const reachableMilestoneIds = collectBranchMilestoneIds(branch.id)
      const reachableMilestones = getAllMilestones().filter((milestone) =>
        reachableMilestoneIds.has(milestone.id)
      )
      const milestoneTaskIds = new Set(reachableMilestones.flatMap((milestone) => milestone.taskIds))
      if (!branch.directTaskIds) {
        branch.directTaskIds = (branch.taskIds || []).filter((id) => !milestoneTaskIds.has(id))
      }
      const ids = new Set<string>(branch.directTaskIds)
      reachableMilestones.forEach((milestone) => {
        milestone.taskIds.forEach((id) => ids.add(id))
      })
      return [...ids]
    }

    function syncBranchTaskIds(branch: Branch) {
      branch.taskIds = collectBranchTaskIds(branch)
    }

    function syncAllBranchTaskIds() {
      branches.value.forEach((branch) => syncBranchTaskIds(branch))
    }

    function cleanupEdges() {
      const ids = allNodeIds()
      const seen = new Set<string>()
      const nextEdges: Edge[] = []
      const currentEdges = edges.value as Edge[]

      for (const currentEdge of currentEdges) {
        const edge = normalizeEdgePorts(currentEdge)
        const key = `${edge.source}->${edge.target}`
        if (!ids.has(edge.source) || !ids.has(edge.target) || seen.has(key)) {
          continue
        }
        seen.add(key)
        nextEdges.push(edge)
      }

      edges.value = nextEdges
    }

    function normalizeBoard() {
      graphRevision.value += 1
      branches.value.forEach((branch, index) => {
        branch.order = index
        updateBranchStatus(branch)
      })
      cleanupEdges()
    }

    function deleteBranchIfEmpty(branchId: string) {
      const branch = getBranch(branchId)
      if (branch && branch.milestones.length === 0) {
        deleteBranch(branchId)
      }
    }

    function updateMilestoneStatus(milestone: Milestone) {
      const tasksStore = useTasksStore()
      const linkedTasks = milestone.taskIds
        .map((id) => tasksStore.tasks.find((task) => task.id === id))
        .filter(Boolean)

      if (linkedTasks.length === 0) {
        if (milestone.achieved || milestone.status === 'completed') {
          milestone.status = 'completed'
          milestone.achieved = true
        }
        return
      }

      const completed = linkedTasks.filter((task) => task?.done).length

      if (completed === 0) {
        milestone.status = 'pending'
        milestone.achieved = false
      } else if (completed >= linkedTasks.length) {
        milestone.status = 'completed'
        milestone.achieved = true
      } else {
        milestone.status = 'active'
        milestone.achieved = false
      }
    }

    function updateBranchStatus(branch: Branch) {
      branch.milestones.forEach((milestone) => updateMilestoneStatus(milestone))
      syncBranchTaskIds(branch)
    }

    function refreshBranch(branchId: string) {
      const branch = branches.value.find((item) => item.id === branchId)
      if (branch) updateBranchStatus(branch)
    }

    function refreshAllBranches() {
      branches.value.forEach((branch) => updateBranchStatus(branch))
    }

    function refreshMilestonesByTaskId(taskId: string) {
      branches.value.forEach((branch) => {
        if (
          branch.milestones.some((milestone) =>
            milestone.taskIds.includes(taskId)
          )
        ) {
          updateBranchStatus(branch)
        }
      })
    }

    function removeTaskFromMilestones(taskId: string) {
      let changed = false

      branches.value.forEach((branch) => {
        const nextDirectTaskIds = (branch.directTaskIds || []).filter((id) => id !== taskId)
        if (nextDirectTaskIds.length !== (branch.directTaskIds || []).length) {
          branch.directTaskIds = nextDirectTaskIds
          changed = true
        }
        branch.milestones.forEach((milestone) => {
          const nextTaskIds = milestone.taskIds.filter((id) => id !== taskId)
          if (nextTaskIds.length !== milestone.taskIds.length) {
            milestone.taskIds = nextTaskIds
            changed = true
          }
        })
      })

      if (changed) refreshAllBranches()
    }

    function getBranchTotalTasks(branchId: string): number {
      const branch = branches.value.find((item) => item.id === branchId)
      if (!branch) return 0
      return collectBranchTaskIds(branch).length
    }

    function getBranchCompletedTasks(branchId: string): number {
      const tasksStore = useTasksStore()
      const branch = branches.value.find((item) => item.id === branchId)
      if (!branch) return 0
      return collectBranchTaskIds(branch).filter(
        (id) => tasksStore.tasks.find((task) => task.id === id)?.done
      ).length
    }

    function getBranchTaskIds(branchId: string): string[] {
      const branch = branches.value.find((item) => item.id === branchId)
      return branch ? collectBranchTaskIds(branch) : []
    }

    function syncMilestoneIcon(milestoneId: string) {
      const branch = findBranchByMilestone(milestoneId)
      const milestone = findMilestone(milestoneId)
      if (branch && milestone) milestone.icon = branch.icon
    }

    function addEdge(edge: Edge) {
      if (edge.source === edge.target) return
      if (
        edges.value.some(
          (item) => item.source === edge.source && item.target === edge.target
        )
      ) {
        return
      }
      const normalizedEdge: Edge = normalizeEdgePorts(edge)
      edges.value = [...(edges.value as Edge[]), normalizedEdge]
      normalizeBoard()
    }

    function removeEdge(edgeId: string) {
      edges.value = (edges.value as Edge[]).filter((edge) => edge.id !== edgeId)
      normalizeBoard()
    }

    function disconnectEdge(
      edgeOrId: string | Pick<Edge, 'id' | 'source' | 'target'>
    ) {
      const edge =
        typeof edgeOrId === 'string'
          ? edges.value.find((item) => item.id === edgeOrId)
          : edgeOrId
      if (!edge) return

      edges.value = (edges.value as Edge[]).filter((item) => item.id !== edge.id)
      normalizeBoard()
    }

    function updateEdge(updatedEdge: Edge) {
      const index = edges.value.findIndex((edge) => edge.id === updatedEdge.id)
      if (index !== -1) {
        edges.value = edges.value.map((edge, edgeIndex) =>
          edgeIndex === index ? updatedEdge : edge
        )
      }
      normalizeBoard()
    }

    function addBranch(
      displayName: string,
      icon: string,
      description: string = '',
      taskIds: string[] = [],
      markerColor: string = defaultMarkerColor
    ) {
      const lastBranch = branches.value.at(-1)
      const lastPosition = lastBranch?.position || { x: 100, y: 100 }
      let nextY = lastPosition.y + 220
      if (lastBranch) {
        const networkBottom = lastBranch.milestones.reduce((maxY, milestone) => {
          return Math.max(maxY, (milestone.position?.y ?? lastPosition.y) + 160)
        }, lastPosition.y + 160)
        nextY = networkBottom + 120
      }
      const newBranch: Branch = {
        id: uuidv4(),
        displayName,
        icon,
        description,
          markerColor,
          taskIds,
          directTaskIds: [...taskIds],
          milestones: [],
        order: branches.value.length,
        position: { x: lastPosition.x, y: nextY },
      }
      branches.value.push(newBranch)
      normalizeBoard()
    }

    function updateBranch(branchId: string, updates: Partial<Branch>) {
      const branch = branches.value.find((item) => item.id === branchId)
      if (!branch) return
      const { taskIds, ...branchUpdates } = updates
      Object.assign(branch, branchUpdates)
      if (taskIds) branch.directTaskIds = [...taskIds]
      branch.milestones.forEach((milestone) => {
        milestone.icon = branch.icon
      })
      normalizeBoard()
    }

    function updateBranchPosition(
      branchId: string,
      position: { x: number; y: number }
    ) {
      const branch = branches.value.find((item) => item.id === branchId)
      if (branch) branch.position = position
    }

    function deleteBranch(branchId: string) {
      branches.value = branches.value.filter((branch) => branch.id !== branchId)
      edges.value = edges.value.filter(
        (edge) => edge.source !== branchId && edge.target !== branchId
      )
      normalizeBoard()
    }

    function addMilestoneWithoutEdge(
      branchId: BranchId | null,
      name: string,
      position?: { x: number; y: number }
    ): Milestone {
      const branch = branchId
        ? branches.value.find((item) => item.id === branchId)
        : branches.value[0]
      const basePosition = branch?.position || { x: 100, y: 100 }
      const lastMilestone = branch?.milestones.at(-1)
      const anchor = lastMilestone?.position || basePosition
      const milestone: Milestone = {
        id: uuidv4(),
        name,
        icon: branch?.icon || 'target',
        description: '',
        markerColor: branch?.markerColor || branch?.backgroundColor || defaultMarkerColor,
        status: 'pending',
        taskIds: [],
        position: position || {
          x: anchor.x + 300,
          y: anchor.y,
        },
      }
      branch?.milestones.push(milestone)
      normalizeBoard()
      return milestone
    }

    function addMilestone(
      branchId: BranchId | null,
      name: string,
      position?: { x: number; y: number }
    ): Milestone {
      const milestone = addMilestoneWithoutEdge(branchId, name, position)
      const branch = findBranchByMilestone(milestone.id)
      if (branch) {
        const index = branch.milestones.findIndex(
          (item) => item.id === milestone.id
        )
        const source = index === 0 ? branch.id : branch.milestones[index - 1].id
        addEdge(createEdge(source, milestone.id))
      }
      return milestone
    }

    function createMilestoneFromSource(
      sourceId: string,
      data: Partial<Milestone>
    ): Milestone | null {
      const sourceKind = getNodeKind(sourceId)
      const sourceLocation =
        sourceKind === 'milestone' ? getMilestoneLocation(sourceId) : undefined
      const branch =
        sourceKind === 'branch' ? getBranch(sourceId) : sourceLocation?.branch
      if (!branch) return null

      const sourcePosition =
        sourceKind === 'branch'
          ? branch.position || { x: 100, y: 100 }
          : sourceLocation?.milestone.position || branch.position || { x: 100, y: 100 }

      const milestone: Milestone = {
        id: uuidv4(),
        name: data.name || 'Новый этап',
        icon: branch.icon,
        description: data.description || '',
        markerColor: data.markerColor || data.backgroundColor || branch.markerColor || branch.backgroundColor || defaultMarkerColor,
        status: data.status || 'pending',
        taskIds: data.taskIds || [],
        position: data.position || {
          x: sourcePosition.x + 300,
          y: sourcePosition.y,
        },
      }

      branch.milestones.push(milestone)
      edges.value = [...edges.value, createEdge(sourceId, milestone.id)]
      normalizeBoard()
      return milestone
    }

    function updateMilestone(milestoneId: string, updates: Partial<Milestone>) {
      const milestone = findMilestone(milestoneId)
      if (!milestone) return
      Object.assign(milestone, updates)
      normalizeBoard()
    }

    function deleteMilestone(milestoneId: string) {
      const branch = findBranchByMilestone(milestoneId)
      if (!branch) return
      branch.milestones = branch.milestones.filter(
        (milestone) => milestone.id !== milestoneId
      )
      edges.value = edges.value.filter(
        (edge) => edge.source !== milestoneId && edge.target !== milestoneId
      )
      if (branch.milestones.length === 0) {
        deleteBranch(branch.id)
      } else {
        normalizeBoard()
      }
    }

    function moveMilestoneToBranch(
      milestoneId: string,
      branchId: string,
      attachAfterMilestoneId?: string
    ) {
      const location = getMilestoneLocation(milestoneId)
      const targetBranch = getBranch(branchId)
      if (!location || !targetBranch) return

      const sourceBranch = location.branch
      const chainIds = collectReachableMilestoneIds(milestoneId)
      chainIds.add(milestoneId)
      const movedIds = new Set(
        [...chainIds].filter(
          (id) => getMilestoneLocation(id)?.branch.id === sourceBranch.id
        )
      )
      if (movedIds.size === 0) return

      const movedMilestones = sourceBranch.milestones.filter((milestone) =>
        movedIds.has(milestone.id)
      )
      movedMilestones.forEach((milestone) => {
        milestone.icon = targetBranch.icon
      })

      if (sourceBranch.id !== targetBranch.id) {
        sourceBranch.milestones = sourceBranch.milestones.filter(
          (milestone) => !movedIds.has(milestone.id)
        )

        const insertAfterIndex = attachAfterMilestoneId
          ? targetBranch.milestones.findIndex(
              (item) => item.id === attachAfterMilestoneId
            )
          : -1
        const insertIndex =
          insertAfterIndex === -1
            ? targetBranch.milestones.length
            : insertAfterIndex + 1
        targetBranch.milestones.splice(insertIndex, 0, ...movedMilestones)
      }

      edges.value = edges.value.filter((edge) => {
        const sourceMoved = movedIds.has(edge.source)
        const targetMoved = movedIds.has(edge.target)
        return sourceMoved === targetMoved
      })

      const source = attachAfterMilestoneId || targetBranch.id
      edges.value = [...edges.value, createEdge(source, milestoneId)]

      if (sourceBranch.id !== targetBranch.id) {
        deleteBranchIfEmpty(sourceBranch.id)
      }
      normalizeBoard()
    }

    function attachMilestoneToBranch(milestoneId: string, branchId: string) {
      moveMilestoneToBranch(milestoneId, branchId)
    }

    function detachMilestoneFromBranch(milestoneId: string) {
      const location = getMilestoneLocation(milestoneId)
      if (!location) return

      const sourceBranch = location.branch
      const [milestone] = sourceBranch.milestones.splice(location.index, 1)
      edges.value = edges.value.filter(
        (edge) => edge.source !== milestoneId && edge.target !== milestoneId
      )

      const newBranchId = uuidv4()
      milestone.icon = 'help-circle'
      const newBranch: Branch = {
        id: newBranchId,
        displayName: milestone.name,
        icon: 'help-circle',
        description: '',
          markerColor: defaultMarkerColor,
          taskIds: [],
          directTaskIds: [],
          milestones: [milestone],
        order: branches.value.length,
        position: {
          x: Math.max(40, milestone.position.x - 280),
          y: milestone.position.y,
        },
      }
      branches.value.push(newBranch)
      edges.value = [...edges.value, createEdge(newBranchId, milestone.id)]

      deleteBranchIfEmpty(sourceBranch.id)
      normalizeBoard()
    }

    function connectNodes(
      sourceId: string,
      targetId: string,
      sourceHandle?: string | null,
      targetHandle?: string | null
    ): BoardActionResult {
      if (sourceId === targetId) {
        return { ok: false, reason: 'Нельзя связать узел с самим собой' }
      }

      const sourceKind = getNodeKind(sourceId)
      const targetKind = getNodeKind(targetId)
      if (
        edges.value.some(
          (edge) => edge.source === sourceId && edge.target === targetId
        )
      ) {
        return { ok: false, reason: 'Такая связь уже существует' }
      }
      if (!sourceKind || !targetKind) {
        return { ok: false, reason: 'Узел связи не найден' }
      }
      if (sourceKind === 'branch' && targetKind === 'branch') {
        return { ok: false, reason: 'Связывайте ветку с этапом' }
      }

      const sourceBranch =
        sourceKind === 'branch' ? getBranch(sourceId) : findBranchByMilestone(sourceId)
      if (!sourceBranch) return { ok: false, reason: 'Источник связи не найден' }

      if (wouldCreateCycle(sourceId, targetId)) {
        return { ok: false, reason: 'Нельзя создавать замыкающую связь' }
      }

      if (targetKind === 'branch') {
        if (sourceKind !== 'milestone') {
          return { ok: false, reason: 'К ветке можно подключить только этап' }
        }
        moveMilestoneToBranch(sourceId, targetId)
        return { ok: true }
      }

      const targetBranch = findBranchByMilestone(targetId)
      if (!targetBranch) return { ok: false, reason: 'Целевой этап не найден' }

      if (countIncomingEdges(targetId) > 0) {
        return {
          ok: false,
          reason: 'У этапа уже есть входящая связь — сначала удалите старую',
        }
      }

      if (sourceKind === 'branch') {
        addEdge(createEdge(sourceId, targetId, sourceHandle, targetHandle))
        return { ok: true }
      }

      if (sourceBranch.id === targetBranch.id) {
        addEdge(createEdge(sourceId, targetId, sourceHandle, targetHandle))
        return { ok: true }
      }

      moveMilestoneToBranch(sourceId, targetBranch.id, targetId)
      return { ok: true }
    }

    function replaceEdges(nextEdges: Edge[]) {
      edges.value = nextEdges.map((edge) => normalizeEdgePorts(edge))
      normalizeBoard()
    }

    if (import.meta.client) {
      syncAllBranchTaskIds()
      refreshAllBranches()
      cleanupEdges()
    }

    return {
      branches,
      edges,
      graphRevision,
      addBranch,
      deleteBranch,
      addMilestone,
      addMilestoneWithoutEdge,
      createMilestoneFromSource,
      updateMilestone,
      deleteMilestone,
      addEdge,
      removeEdge,
      disconnectEdge,
      updateEdge,
      updateBranch,
      updateBranchPosition,
      getBranchTaskIds,
      getBranchTotalTasks,
      getBranchCompletedTasks,
      refreshMilestonesByTaskId,
      removeTaskFromMilestones,
      syncMilestoneIcon,
      attachMilestoneToBranch,
      connectNodes,
      moveMilestoneToBranch,
      detachMilestoneFromBranch,
      refreshBranch,
      refreshAllBranches,
      replaceEdges,
      refreshEdgePortsFromPositions,
    }
  },
  {
    persist: import.meta.client
      ? {
          key: 'carbon-branches',
          storage: accessAwareStorage,
          afterHydrate: (ctx) => {
            try {
              const raw = accessAwareStorage.getItem('carbon-branches')
              if (!raw) return
              const parsed = JSON.parse(raw) as { edges?: Edge[] }
              if (!Array.isArray(parsed.edges)) return
              const store = ctx.store as ReturnType<typeof useBranchesStore>

              store.replaceEdges(parsed.edges)
            } catch {

            }
          },
        }
      : undefined,
  }
)
