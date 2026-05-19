import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Edge } from '@vue-flow/core'
import { v4 as uuidv4 } from 'uuid'
import type { Branch, BranchId, Milestone } from '~/types/branch.types'
import { useTasksStore } from './tasks.store'

const edgeStyle = { stroke: 'var(--accent)', strokeWidth: 1 }

function createEdge(source: string, target: string): Edge {
  return {
    id: `edge-${source}-${target}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source,
    target,
    type: 'smoothstep',
    animated: false,
    style: edgeStyle,
  }
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
        taskIds: [],
        milestones: [
          {
            id: 'cof-m1',
            name: 'Идея и концепция',
            icon: 'target',
            description: 'Определение миссии, целевой аудитории и ключевых фич',
            requiredXP: 200,
            currentXP: 200,
            status: 'completed',
            taskIds: ['task-ideation', 'task-research'],
            position: { x: 200, y: 200 },
          },
          {
            id: 'cof-m2',
            name: 'Дизайн интерфейса',
            icon: 'palette',
            description: 'Прототипирование, UI Kit, адаптивный дизайн',
            requiredXP: 300,
            currentXP: 150,
            status: 'active',
            taskIds: ['task-design', 'task-prototype'],
            position: { x: 500, y: 150 },
          },
          {
            id: 'cof-m3',
            name: 'Frontend (Vue 3)',
            icon: 'code',
            description: 'Компоненты, маршрутизация, хранение состояния',
            requiredXP: 400,
            currentXP: 100,
            status: 'active',
            taskIds: ['task-frontend-base', 'task-state'],
            position: { x: 500, y: 300 },
          },
          {
            id: 'cof-m4',
            name: 'Backend & API',
            icon: 'server',
            description: 'Создание API, авторизация, база данных',
            requiredXP: 500,
            currentXP: 0,
            status: 'pending',
            taskIds: ['task-backend-setup', 'task-api'],
            position: { x: 800, y: 150 },
          },
          {
            id: 'cof-m5',
            name: 'Интеграция и тестирование',
            icon: 'test-tube',
            description: 'Юнит-тесты, e2e, исправление багов',
            requiredXP: 300,
            currentXP: 0,
            status: 'pending',
            taskIds: ['task-testing', 'task-fixes'],
            position: { x: 800, y: 300 },
          },
          {
            id: 'cof-m6',
            name: 'Деплой и мониторинг',
            icon: 'rocket',
            description: 'Развёртывание, CI/CD, аналитика',
            requiredXP: 250,
            currentXP: 0,
            status: 'pending',
            taskIds: ['task-deploy', 'task-monitor'],
            position: { x: 1100, y: 220 },
          },
        ],
        order: 0,
        position: { x: 50, y: 220 },
      },
    ])

    const edges = ref<Edge[]>([
      { id: 'edge-cof-m1', source: 'COF', target: 'cof-m1', type: 'smoothstep', animated: false, style: edgeStyle },
      { id: 'edge-m1-m2', source: 'cof-m1', target: 'cof-m2', type: 'smoothstep', animated: false, style: edgeStyle },
      { id: 'edge-m1-m3', source: 'cof-m1', target: 'cof-m3', type: 'smoothstep', animated: false, style: edgeStyle },
      { id: 'edge-m2-m4', source: 'cof-m2', target: 'cof-m4', type: 'smoothstep', animated: false, style: edgeStyle },
      { id: 'edge-m3-m5', source: 'cof-m3', target: 'cof-m5', type: 'smoothstep', animated: false, style: edgeStyle },
      { id: 'edge-m4-m6', source: 'cof-m4', target: 'cof-m6', type: 'smoothstep', animated: false, style: edgeStyle },
      { id: 'edge-m5-m6', source: 'cof-m5', target: 'cof-m6', type: 'smoothstep', animated: false, style: edgeStyle },
    ])

    function allNodeIds(): Set<string> {
      const ids = new Set<string>()
      branches.value.forEach((branch) => {
        ids.add(branch.id)
        branch.milestones.forEach((milestone) => ids.add(milestone.id))
      })
      return ids
    }

    function findBranchByMilestone(milestoneId: string): Branch | undefined {
      return branches.value.find((branch) =>
        branch.milestones.some((milestone) => milestone.id === milestoneId)
      )
    }

    function findMilestone(milestoneId: string): Milestone | undefined {
      return findBranchByMilestone(milestoneId)?.milestones.find(
        (milestone) => milestone.id === milestoneId
      )
    }

    function collectBranchTaskIds(branch: Branch): string[] {
      const ids = new Set<string>()
      branch.milestones.forEach((milestone) => {
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
      edges.value = edges.value.filter((edge) => {
        const key = `${edge.source}->${edge.target}`
        if (!ids.has(edge.source) || !ids.has(edge.target) || seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    function updateMilestoneStatus(milestone: Milestone) {
      const tasksStore = useTasksStore()
      const linkedTasks = milestone.taskIds
        .map((id) => tasksStore.tasks.find((task) => task.id === id))
        .filter(Boolean)

      const completed = linkedTasks.filter((task) => task?.done).length
      milestone.currentXP = completed

      if (linkedTasks.length === 0 || completed === 0) {
        milestone.status = 'pending'
      } else if (completed >= linkedTasks.length) {
        milestone.status = 'completed'
      } else {
        milestone.status = 'active'
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
        if (branch.milestones.some((milestone) => milestone.taskIds.includes(taskId))) {
          updateBranchStatus(branch)
        }
      })
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
      return collectBranchTaskIds(branch).filter((id) => tasksStore.tasks.find((task) => task.id === id)?.done)
        .length
    }

    function getBranchTaskIds(branchId: string): string[] {
      const branch = branches.value.find((item) => item.id === branchId)
      return branch ? collectBranchTaskIds(branch) : []
    }

    function addXPToBranch(branchId: BranchId, xp: number) {
      const branch = branches.value.find((item) => item.id === branchId)
      if (!branch) return
      const activeMilestone =
        branch.milestones.find((milestone) => milestone.status === 'active') ||
        branch.milestones.find((milestone) => milestone.status === 'pending')
      if (!activeMilestone) return
      activeMilestone.currentXP = Math.min(
        activeMilestone.requiredXP,
        activeMilestone.currentXP + xp
      )
      if (activeMilestone.currentXP >= activeMilestone.requiredXP) {
        activeMilestone.status = 'completed'
      } else if (activeMilestone.currentXP > 0) {
        activeMilestone.status = 'active'
      }
      updateBranchStatus(branch)
    }

    function syncMilestoneIcon(milestoneId: string) {
      const branch = findBranchByMilestone(milestoneId)
      const milestone = findMilestone(milestoneId)
      if (branch && milestone) milestone.icon = branch.icon
    }

    function addEdge(edge: Edge) {
      if (edge.source === edge.target) return
      if (edges.value.some((item) => item.source === edge.source && item.target === edge.target)) {
        return
      }
      edges.value.push({ ...edge, type: edge.type || 'smoothstep', style: edge.style || edgeStyle })
      refreshAllBranches()
      cleanupEdges()
    }

    function removeEdge(edgeId: string) {
      edges.value = edges.value.filter((edge) => edge.id !== edgeId)
      refreshAllBranches()
    }

    function disconnectEdge(edgeOrId: string | Pick<Edge, 'id' | 'source' | 'target'>) {
      const edge =
        typeof edgeOrId === 'string'
          ? edges.value.find((item) => item.id === edgeOrId)
          : edgeOrId
      if (!edge) return

      const sourceBranch = findBranchByMilestone(edge.source)
      const targetBranch = findBranchByMilestone(edge.target)
      const affectedBranchIds = new Set(
        [sourceBranch?.id, targetBranch?.id].filter(Boolean) as string[]
      )

      edges.value = edges.value.filter((item) => item.id !== edge.id)

      if (sourceBranch) {
        detachMilestoneFromBranch(edge.source, false)
      } else if (targetBranch) {
        detachMilestoneFromBranch(edge.target, false)
      } else {
        cleanupEdges()
      }

      affectedBranchIds.forEach((branchId) => refreshBranch(branchId))
      refreshAllBranches()
    }

    function updateEdge(updatedEdge: Edge) {
      const index = edges.value.findIndex((edge) => edge.id === updatedEdge.id)
      if (index !== -1) edges.value[index] = updatedEdge
      refreshAllBranches()
      cleanupEdges()
    }

    function addBranch(
      displayName: string,
      icon: string,
      description: string = '',
      taskIds: string[] = []
    ) {
      const lastBranch = branches.value.at(-1)
      const lastPosition = lastBranch?.position || { x: 100, y: 100 }
      const newBranch: Branch = {
        id: uuidv4(),
        displayName,
        icon,
        description,
        taskIds,
        milestones: [],
        order: branches.value.length,
        position: { x: lastPosition.x, y: lastPosition.y + 180 },
      }
      branches.value.push(newBranch)
    }

    function updateBranch(branchId: string, updates: Partial<Branch>) {
      const branch = branches.value.find((item) => item.id === branchId)
      if (!branch) return
      Object.assign(branch, updates)
      branch.milestones.forEach((milestone) => {
        milestone.icon = branch.icon
      })
      updateBranchStatus(branch)
    }

    function updateBranchPosition(branchId: string, position: { x: number; y: number }) {
      const branch = branches.value.find((item) => item.id === branchId)
      if (branch) branch.position = position
    }

    function deleteBranch(branchId: string) {
      branches.value = branches.value.filter((branch) => branch.id !== branchId)
      edges.value = edges.value.filter(
        (edge) => edge.source !== branchId && edge.target !== branchId
      )
      refreshAllBranches()
      cleanupEdges()
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
      const milestone: Milestone = {
        id: uuidv4(),
        name,
        icon: branch?.icon || 'target',
        description: '',
        requiredXP: 500,
        currentXP: 0,
        status: 'pending',
        taskIds: [],
        position:
          position ||
          {
            x: basePosition.x + 320 + (branch?.milestones.length || 0) * 260,
            y: basePosition.y,
          },
      }
      branch?.milestones.push(milestone)
      if (branch) updateBranchStatus(branch)
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
        const index = branch.milestones.findIndex((item) => item.id === milestone.id)
        const source = index === 0 ? branch.id : branch.milestones[index - 1].id
        addEdge(createEdge(source, milestone.id))
      }
      return milestone
    }

    function updateMilestone(milestoneId: string, updates: Partial<Milestone>) {
      const milestone = findMilestone(milestoneId)
      if (!milestone) return
      Object.assign(milestone, updates)
      const branch = findBranchByMilestone(milestoneId)
      if (branch) updateBranchStatus(branch)
    }

    function deleteMilestone(milestoneId: string) {
      const branch = findBranchByMilestone(milestoneId)
      if (!branch) return
      branch.milestones = branch.milestones.filter((milestone) => milestone.id !== milestoneId)
      edges.value = edges.value.filter(
        (edge) => edge.source !== milestoneId && edge.target !== milestoneId
      )
      if (branch.milestones.length === 0) {
        deleteBranch(branch.id)
      } else {
        updateBranchStatus(branch)
        cleanupEdges()
      }
    }

    function moveMilestoneToBranch(
      milestoneId: string,
      branchId: string,
      attachAfterMilestoneId?: string
    ) {
      const sourceBranch = findBranchByMilestone(milestoneId)
      const targetBranch = branches.value.find((branch) => branch.id === branchId)
      if (!sourceBranch || !targetBranch) return

      const sourceIndex = sourceBranch.milestones.findIndex(
        (milestone) => milestone.id === milestoneId
      )
      if (sourceIndex === -1) return

      const [milestone] = sourceBranch.milestones.splice(sourceIndex, 1)
      milestone.icon = targetBranch.icon

      const insertAfterIndex = attachAfterMilestoneId
        ? targetBranch.milestones.findIndex(
            (item) => item.id === attachAfterMilestoneId
          )
        : -1
      const insertIndex = insertAfterIndex === -1 ? targetBranch.milestones.length : insertAfterIndex + 1
      targetBranch.milestones.splice(insertIndex, 0, milestone)

      edges.value = edges.value.filter(
        (edge) => edge.source !== milestoneId && edge.target !== milestoneId
      )

      const source =
        insertIndex === 0 ? targetBranch.id : targetBranch.milestones[insertIndex - 1].id
      addEdge(createEdge(source, milestone.id))

      if (sourceBranch.id !== targetBranch.id && sourceBranch.milestones.length === 0) {
        deleteBranch(sourceBranch.id)
      } else {
        updateBranchStatus(sourceBranch)
      }
      updateBranchStatus(targetBranch)
      cleanupEdges()
    }

    function attachMilestoneToBranch(milestoneId: string, branchId: string) {
      moveMilestoneToBranch(milestoneId, branchId)
    }

    function detachMilestoneFromBranch(milestoneId: string, connectToNewBranch = true) {
      const sourceBranch = findBranchByMilestone(milestoneId)
      const milestone = findMilestone(milestoneId)
      if (!sourceBranch || !milestone) return

      sourceBranch.milestones = sourceBranch.milestones.filter(
        (item) => item.id !== milestoneId
      )
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
        taskIds: [],
        milestones: [milestone],
        order: branches.value.length,
        position: { x: Math.max(40, milestone.position.x - 280), y: milestone.position.y },
      }
      branches.value.push(newBranch)
      if (connectToNewBranch) {
        addEdge(createEdge(newBranchId, milestone.id))
      }

      if (sourceBranch.milestones.length === 0) {
        deleteBranch(sourceBranch.id)
      } else {
        updateBranchStatus(sourceBranch)
      }
      updateBranchStatus(newBranch)
      cleanupEdges()
    }

    function replaceEdges(nextEdges: Edge[]) {
      edges.value = nextEdges
      refreshAllBranches()
      cleanupEdges()
    }

    if (import.meta.client) {
      syncAllBranchTaskIds()
      refreshAllBranches()
      cleanupEdges()
    }

    return {
      branches,
      edges,
      addXPToBranch,
      addBranch,
      deleteBranch,
      addMilestone,
      addMilestoneWithoutEdge,
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
      syncMilestoneIcon,
      attachMilestoneToBranch,
      moveMilestoneToBranch,
      detachMilestoneFromBranch,
      refreshBranch,
      refreshAllBranches,
      replaceEdges,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-branches', storage: localStorage }
      : undefined,
  }
)
