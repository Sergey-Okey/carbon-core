import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Branch, BranchId, Milestone } from '~/types/branch.types'
import type { Edge } from '@vue-flow/core'
import { v4 as uuidv4 } from 'uuid'

export const useBranchesStore = defineStore(
  'branches',
  () => {
    const branches = ref<Branch[]>([
      {
        id: 'FIN',
        displayName: 'Финансы',
        icon: 'trending-up',
        description: '',
        taskIds: [],
        milestones: [
          {
            id: uuidv4(),
            name: 'Основы финансов',
            requiredXP: 500,
            currentXP: 0,
            status: 'pending',
            taskIds: [],
            position: { x: 200, y: 200 },
          },
        ],
        order: 0,
      },
      {
        id: 'BODY',
        displayName: 'Тело',
        icon: 'dumbbell',
        description: '',
        taskIds: [],
        milestones: [
          {
            id: uuidv4(),
            name: 'Регулярные тренировки',
            requiredXP: 300,
            currentXP: 0,
            status: 'pending',
            taskIds: [],
            position: { x: 500, y: 200 },
          },
        ],
        order: 1,
      },
      {
        id: 'MIND',
        displayName: 'Интеллект',
        icon: 'brain',
        description: '',
        taskIds: [],
        milestones: [
          {
            id: uuidv4(),
            name: 'Ежедневное чтение',
            requiredXP: 400,
            currentXP: 0,
            status: 'pending',
            taskIds: [],
            position: { x: 800, y: 200 },
          },
        ],
        order: 2,
      },
      {
        id: 'LDR',
        displayName: 'Лидерство',
        icon: 'users',
        description: '',
        taskIds: [],
        milestones: [
          {
            id: uuidv4(),
            name: 'Первая публичная речь',
            requiredXP: 200,
            currentXP: 0,
            status: 'pending',
            taskIds: [],
            position: { x: 1100, y: 200 },
          },
        ],
        order: 3,
      },
    ])

    const edges = ref<Edge[]>([])

    // Очистка битых рёбер после восстановления из localStorage
    function cleanupEdges() {
      const existingNodeIds = new Set(
        branches.value.flatMap((b) => b.milestones.map((m) => m.id))
      )
      edges.value = edges.value.filter(
        (e) => existingNodeIds.has(e.source) && existingNodeIds.has(e.target)
      )
    }

    function addXPToBranch(branchId: BranchId, xp: number) {
      const branch = branches.value.find((b) => b.id === branchId)
      if (!branch) return

      const activeMilestone = branch.milestones.find(
        (m) => m.status === 'active'
      )
      if (activeMilestone) {
        activeMilestone.currentXP += xp
        updateMilestoneStatus(activeMilestone)
      } else {
        const pendingMilestone = branch.milestones.find(
          (m) => m.status === 'pending'
        )
        if (pendingMilestone) {
          pendingMilestone.currentXP += xp
          pendingMilestone.status = 'active'
          updateMilestoneStatus(pendingMilestone)
        }
      }
    }

    function updateMilestoneStatus(milestone: Milestone) {
      if (milestone.currentXP >= milestone.requiredXP) {
        milestone.status = 'completed'
        const branch = branches.value.find((b) =>
          b.milestones.some((m) => m.id === milestone.id)
        )
        if (branch) {
          const nextXP = Math.floor(milestone.requiredXP * 1.5)
          const newMilestone: Milestone = {
            id: uuidv4(),
            name: `Новый этап`,
            requiredXP: nextXP,
            currentXP: 0,
            status: 'pending',
            taskIds: [],
            position: {
              x: milestone.position.x + 250,
              y: milestone.position.y,
            },
          }
          branch.milestones.push(newMilestone)
          edges.value.push({
            id: uuidv4(),
            source: milestone.id,
            target: newMilestone.id,
            type: 'smoothstep',
            animated: false,
            style: { stroke: 'var(--accent)', strokeWidth: 1 },
          })
        }
      } else {
        milestone.status = 'active'
      }
    }

    function addBranch(
      displayName: string,
      icon: string,
      description: string = '',
      taskIds: string[] = []
    ) {
      let x = 200
      let y = 200
      if (branches.value.length > 0) {
        const lastBranch = branches.value[branches.value.length - 1]
        const lastMilestone = lastBranch.milestones[0]
        if (lastMilestone) {
          x = lastMilestone.position.x + 300
          y = lastMilestone.position.y
        }
      }

      const newBranch: Branch = {
        id: uuidv4(),
        displayName,
        icon,
        description,
        taskIds,
        milestones: [
          {
            id: uuidv4(),
            name: displayName,
            requiredXP: 500,
            currentXP: 0,
            status: 'pending',
            taskIds: taskIds,
            position: { x, y },
          },
        ],
        order: branches.value.length,
      }
      branches.value.push(newBranch)
    }

    function deleteBranch(branchId: string) {
      const index = branches.value.findIndex((b) => b.id === branchId)
      if (index !== -1) {
        const milestoneIds = branches.value[index].milestones.map((m) => m.id)
        edges.value = edges.value.filter(
          (e) =>
            !milestoneIds.includes(e.source) && !milestoneIds.includes(e.target)
        )
        branches.value.splice(index, 1)
      }
    }

    function addMilestone(
      branchId: BranchId,
      name: string,
      position?: { x: number; y: number }
    ) {
      const branch = branches.value.find((b) => b.id === branchId)
      if (!branch) return
      const last = branch.milestones[branch.milestones.length - 1]
      const newMilestone: Milestone = {
        id: uuidv4(),
        name,
        requiredXP: last ? Math.floor(last.requiredXP * 1.5) : 500,
        currentXP: 0,
        status: 'pending',
        taskIds: [],
        position: position || {
          x: (last?.position.x || 200) + 250,
          y: last?.position.y || 200,
        },
      }
      branch.milestones.push(newMilestone)
      if (last) {
        edges.value.push({
          id: uuidv4(),
          source: last.id,
          target: newMilestone.id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: 'var(--accent)', strokeWidth: 1 },
        })
      }
    }

    function updateMilestone(milestoneId: string, updates: Partial<Milestone>) {
      for (const branch of branches.value) {
        const milestone = branch.milestones.find((m) => m.id === milestoneId)
        if (milestone) {
          Object.assign(milestone, updates)
          break
        }
      }
    }

    function deleteMilestone(milestoneId: string) {
      for (const branch of branches.value) {
        const index = branch.milestones.findIndex((m) => m.id === milestoneId)
        if (index !== -1) {
          branch.milestones.splice(index, 1)
          edges.value = edges.value.filter(
            (e) => e.source !== milestoneId && e.target !== milestoneId
          )
          break
        }
      }
    }

    function addEdge(edge: Edge) {
      edges.value.push(edge)
    }

    function removeEdge(edgeId: string) {
      edges.value = edges.value.filter((e) => e.id !== edgeId)
    }

    function updateBranch(branchId: string, updates: Partial<Branch>) {
      const branch = branches.value.find((b) => b.id === branchId)
      if (branch) {
        Object.assign(branch, updates)
        const firstMilestone = branch.milestones[0]
        if (firstMilestone) {
          if (updates.displayName) firstMilestone.name = updates.displayName
          if (updates.taskIds) firstMilestone.taskIds = updates.taskIds
        }
      }
    }

    // Вызываем очистку после восстановления из persist
    if (import.meta.client) {
      const store = useBranchesStore()
      if (store.$persistedState) {
        store.$persistedState.isReady.then(() => {
          cleanupEdges()
        })
      } else {
        cleanupEdges()
      }
    }

    return {
      branches,
      edges,
      addXPToBranch,
      addBranch,
      deleteBranch,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      addEdge,
      removeEdge,
      updateBranch,
    }
  },
  {
    persist: { key: 'carbon-branches', storage: localStorage },
  }
)
