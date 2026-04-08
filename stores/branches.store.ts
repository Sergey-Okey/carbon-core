import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Branch, BranchId, Milestone } from '~/types/branch.types'
import type { Edge } from '@vue-flow/core' // <-- импорт типа Edge
import { v4 as uuidv4 } from 'uuid'

export const useBranchesStore = defineStore(
  'branches',
  () => {
    // Узлы (ветки)
    const branches = ref<Branch[]>([
      {
        id: 'FIN',
        displayName: 'Финансы',
        icon: 'trending-up',
        totalXP: 0,
        milestones: [
          { id: uuidv4(), name: 'Новичок', requiredXP: 500, achieved: false },
          {
            id: uuidv4(),
            name: 'Специалист',
            requiredXP: 1500,
            achieved: false,
          },
          { id: uuidv4(), name: 'Эксперт', requiredXP: 3000, achieved: false },
        ],
        position: { x: 100, y: 100 },
        scale: 1,
        order: 0,
      },
      {
        id: 'BODY',
        displayName: 'Тело',
        icon: 'dumbbell',
        totalXP: 0,
        milestones: [
          { id: uuidv4(), name: 'Разминка', requiredXP: 300, achieved: false },
          { id: uuidv4(), name: 'Сила', requiredXP: 1000, achieved: false },
          {
            id: uuidv4(),
            name: 'Выносливость',
            requiredXP: 2500,
            achieved: false,
          },
        ],
        position: { x: 400, y: 100 },
        scale: 1,
        order: 1,
      },
      {
        id: 'MIND',
        displayName: 'Интеллект',
        icon: 'brain',
        totalXP: 0,
        milestones: [
          { id: uuidv4(), name: 'Ученик', requiredXP: 400, achieved: false },
          { id: uuidv4(), name: 'Знаток', requiredXP: 1200, achieved: false },
          { id: uuidv4(), name: 'Мудрец', requiredXP: 2800, achieved: false },
        ],
        position: { x: 700, y: 100 },
        scale: 1,
        order: 2,
      },
      {
        id: 'LDR',
        displayName: 'Лидерство',
        icon: 'users',
        totalXP: 0,
        milestones: [
          { id: uuidv4(), name: 'Участник', requiredXP: 200, achieved: false },
          {
            id: uuidv4(),
            name: 'Организатор',
            requiredXP: 800,
            achieved: false,
          },
          { id: uuidv4(), name: 'Лидер', requiredXP: 2000, achieved: false },
        ],
        position: { x: 1000, y: 100 },
        scale: 1,
        order: 3,
      },
    ])

    // Связи между ветками (edges)
    const edges = ref<Edge[]>([])

    function addXPToBranch(branchId: BranchId, xp: number) {
      const branch = branches.value.find((b) => b.id === branchId)
      if (branch) {
        branch.totalXP += xp
        updateMilestonesAchieved(branch)
      }
    }

    function updateMilestonesAchieved(branch: Branch) {
      branch.milestones.forEach((ms) => {
        ms.achieved = branch.totalXP >= ms.requiredXP
      })
    }

    function updateBranch(branchId: string, updates: Partial<Branch>) {
      const branch = branches.value.find((b) => b.id === branchId)
      if (branch) {
        Object.assign(branch, updates)
      }
    }

    function updateBranchPosition(
      branchId: string,
      position: { x: number; y: number }
    ) {
      updateBranch(branchId, { position })
    }

    function deleteBranch(branchId: string) {
      const index = branches.value.findIndex((b) => b.id === branchId)
      if (index !== -1) branches.value.splice(index, 1)
      // Также удаляем все связи, связанные с этой веткой
      edges.value = edges.value.filter(
        (e) => e.source !== branchId && e.target !== branchId
      )
    }

    function addBranch(branchData: Omit<Branch, 'id'>) {
      const newBranch: Branch = {
        ...branchData,
        id: uuidv4(),
      }
      branches.value.push(newBranch)
      return newBranch
    }

    // Методы для работы со связями
    function addEdge(edge: Edge) {
      edges.value.push(edge)
    }

    function removeEdge(edgeId: string) {
      edges.value = edges.value.filter((e) => e.id !== edgeId)
    }

    function updateEdge(edgeId: string, updates: Partial<Edge>) {
      const edge = edges.value.find((e) => e.id === edgeId)
      if (edge) Object.assign(edge, updates)
    }

    return {
      branches,
      edges,
      addXPToBranch,
      updateBranch,
      updateBranchPosition,
      deleteBranch,
      addBranch,
      addEdge,
      removeEdge,
      updateEdge,
    }
  },
  {
    persist: {
      key: 'carbon-branches',
      storage: localStorage,
      // Опционально: можно указать пути, которые нужно сохранять
      // paths: ['branches', 'edges'],
    },
  }
)
