import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Branch, BranchEdge, Milestone } from '~/types/branch.types'
import { v4 as uuidv4 } from 'uuid'

export const useBranchesStore = defineStore(
  'branches',
  () => {
    // Изначальные системные ветки
    const branches = ref<Branch[]>([
      {
        id: 'FIN',
        displayName: 'Финансы',
        icon: 'trending-up',
        totalXP: 0,
        milestones: [],
        position: { x: 50, y: 100 },
        order: 0,
        isSystem: true,
        createdAt: Date.now(),
      },
      {
        id: 'BODY',
        displayName: 'Тело',
        icon: 'dumbbell',
        totalXP: 0,
        milestones: [],
        position: { x: 50, y: 250 },
        order: 1,
        isSystem: true,
        createdAt: Date.now(),
      },
      {
        id: 'MIND',
        displayName: 'Интеллект',
        icon: 'brain',
        totalXP: 0,
        milestones: [],
        position: { x: 50, y: 400 },
        order: 2,
        isSystem: true,
        createdAt: Date.now(),
      },
      {
        id: 'LDR',
        displayName: 'Лидерство',
        icon: 'users',
        totalXP: 0,
        milestones: [],
        position: { x: 50, y: 550 },
        order: 3,
        isSystem: true,
        createdAt: Date.now(),
      },
    ])

    const edges = ref<BranchEdge[]>([])

    function addXPToBranch(
      branchId: string,
      xp: number,
      sourceTaskId?: string
    ) {
      const branch = branches.value.find((b) => b.id === branchId)
      if (!branch) return

      branch.totalXP += xp
      updateMilestonesAchieved(branch, sourceTaskId)
      checkAndAddMilestone(branch, sourceTaskId)
    }

    function updateMilestonesAchieved(branch: Branch, sourceTaskId?: string) {
      branch.milestones.forEach((ms) => {
        if (!ms.achieved && branch.totalXP >= ms.requiredXP) {
          ms.achieved = true
          if (sourceTaskId && !ms.sourceTaskIds.includes(sourceTaskId)) {
            ms.sourceTaskIds.push(sourceTaskId)
          }
        }
      })
    }

    function checkAndAddMilestone(branch: Branch, sourceTaskId?: string) {
      const last = branch.milestones[branch.milestones.length - 1]
      if (!last || last.achieved) {
        const nextXP = last ? last.requiredXP + 1500 : 500
        const newMilestone: Milestone = {
          id: uuidv4(),
          name: `Этап ${branch.milestones.length + 1}`,
          requiredXP: nextXP,
          achieved: false,
          sourceTaskIds: sourceTaskId ? [sourceTaskId] : [],
          icon: branch.icon,
        }
        branch.milestones.push(newMilestone)
      }
    }

    function addBranch(branchData: Omit<Branch, 'id' | 'createdAt'>) {
      const newBranch: Branch = {
        ...branchData,
        id: uuidv4(),
        createdAt: Date.now(),
        isSystem: false,
      }
      branches.value.push(newBranch)
      return newBranch
    }

    function deleteBranch(branchId: string) {
      const index = branches.value.findIndex((b) => b.id === branchId)
      if (index !== -1 && !branches.value[index].isSystem) {
        branches.value.splice(index, 1)
        // Удаляем связанные рёбра
        edges.value = edges.value.filter((e) => {
          const sourceBranch = e.source.split('-')[0]
          const targetBranch = e.target.split('-')[0]
          return sourceBranch !== branchId && targetBranch !== branchId
        })
      }
    }

    function updateBranchPosition(
      branchId: string,
      position: { x: number; y: number }
    ) {
      const branch = branches.value.find((b) => b.id === branchId)
      if (branch) branch.position = position
    }

    function addEdge(edge: Omit<BranchEdge, 'id'>) {
      const newEdge: BranchEdge = { ...edge, id: uuidv4() }
      edges.value.push(newEdge)
    }

    function removeEdge(edgeId: string) {
      edges.value = edges.value.filter((e) => e.id !== edgeId)
    }

    function clearEdges() {
      edges.value = []
    }

    return {
      branches,
      edges,
      addXPToBranch,
      addBranch,
      deleteBranch,
      updateBranchPosition,
      addEdge,
      removeEdge,
      clearEdges,
    }
  },
  {
    persist: { key: 'carbon-branches', storage: localStorage },
  }
)
