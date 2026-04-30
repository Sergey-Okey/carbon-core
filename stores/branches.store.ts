import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Branch, BranchId, Milestone } from '~/types/branch.types'
import type { Edge } from '@vue-flow/core'
import { v4 as uuidv4 } from 'uuid'
import { useTasksStore } from './tasks.store'

export const useBranchesStore = defineStore(
  'branches',
  () => {
    // ========== Демо-данные (ветка COF) ==========
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
      { id: 'edge-cof-m1', source: 'COF', target: 'cof-m1', type: 'smoothstep', animated: false, style: { stroke: 'var(--accent)', strokeWidth: 1 } },
      { id: 'edge-m1-m2', source: 'cof-m1', target: 'cof-m2', type: 'smoothstep', animated: false, style: { stroke: 'var(--accent)', strokeWidth: 1 } },
      { id: 'edge-m1-m3', source: 'cof-m1', target: 'cof-m3', type: 'smoothstep', animated: false, style: { stroke: 'var(--accent)', strokeWidth: 1 } },
      { id: 'edge-m2-m4', source: 'cof-m2', target: 'cof-m4', type: 'smoothstep', animated: false, style: { stroke: 'var(--accent)', strokeWidth: 1 } },
      { id: 'edge-m3-m5', source: 'cof-m3', target: 'cof-m5', type: 'smoothstep', animated: false, style: { stroke: 'var(--accent)', strokeWidth: 1 } },
      { id: 'edge-m4-m6', source: 'cof-m4', target: 'cof-m6', type: 'smoothstep', animated: false, style: { stroke: 'var(--accent)', strokeWidth: 1 } },
      { id: 'edge-m5-m6', source: 'cof-m5', target: 'cof-m6', type: 'smoothstep', animated: false, style: { stroke: 'var(--accent)', strokeWidth: 1 } },
    ])

    // ========== Вспомогательные функции ==========
    function migrateMissingEdges() { /* без изменений */ }
    function cleanupEdges() { /* без изменений */ }

    function addXPToBranch(branchId: BranchId, xp: number) { /* без изменений */ }
    function updateMilestoneStatus(milestone: Milestone) { /* без изменений */ }
    function updateBranchStatus(branch: Branch) { /* без изменений */ }
    function getBranchTotalTasks(branchId: string): number { /* без изменений */ }
    function getBranchCompletedTasks(branchId: string): number { /* без изменений */ }
    function refreshMilestonesByTaskId(taskId: string) { /* без изменений */ }
    function syncMilestoneIcon(milestoneId: string) { /* без изменений */ }

    // Новая функция: полное обновление ветки
    function refreshBranch(branchId: string) {
      const branch = branches.value.find(b => b.id === branchId)
      if (branch) {
        branch.milestones.forEach(m => updateMilestoneStatus(m))
        updateBranchStatus(branch)
      }
    }

    function attachMilestoneToBranch(milestoneId: string, branchId: string) {
      let milestone: Milestone | undefined
      let sourceBranch: Branch | undefined
      for (const branch of branches.value) {
        const index = branch.milestones.findIndex((m) => m.id === milestoneId)
        if (index !== -1) {
          milestone = branch.milestones.splice(index, 1)[0]
          sourceBranch = branch
          break
        }
      }
      if (!milestone) return
      const targetBranch = branches.value.find((b) => b.id === branchId)
      if (targetBranch) {
        milestone.icon = targetBranch.icon
        targetBranch.milestones.push(milestone)
        const previousNodeId =
          targetBranch.milestones.length === 1
            ? targetBranch.id
            : targetBranch.milestones[targetBranch.milestones.length - 2].id
        const newEdge: Edge = {
          id: `edge-${previousNodeId}-${milestone.id}-${Date.now()}`,
          source: previousNodeId,
          target: milestone.id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: 'var(--accent)', strokeWidth: 1 },
        }
        addEdge(newEdge)
        refreshBranch(targetBranch.id)
      }
      if (sourceBranch && sourceBranch.milestones.length === 0) {
        const branchIndex = branches.value.findIndex((b) => b.id === sourceBranch!.id)
        if (branchIndex !== -1) branches.value.splice(branchIndex, 1)
      } else if (sourceBranch) {
        refreshBranch(sourceBranch.id)
      }
    }

    function detachMilestoneFromBranch(milestoneId: string) {
      for (const branch of branches.value) {
        const index = branch.milestones.findIndex((m) => m.id === milestoneId)
        if (index !== -1) {
          const milestone = branch.milestones.splice(index, 1)[0]
          milestone.icon = 'help-circle'
          milestone.currentXP = 0
          milestone.status = 'pending'
          updateMilestoneStatus(milestone)
          edges.value = edges.value.filter(
            (e) => e.source !== milestoneId && e.target !== milestoneId
          )
          if (branch.milestones.length > 0) {
            refreshBranch(branch.id)
          }
          if (branch.milestones.length === 0) {
            const branchIndex = branches.value.findIndex((b) => b.id === branch.id)
            if (branchIndex !== -1) branches.value.splice(branchIndex, 1)
          }
          const newBranchId = uuidv4()
          branches.value.push({
            id: newBranchId,
            displayName: milestone.name,
            icon: 'help-circle',
            description: '',
            taskIds: [],
            milestones: [milestone],
            order: branches.value.length,
            position: { x: milestone.position.x - 150, y: milestone.position.y },
          })
          const newEdge: Edge = {
            id: `edge-${newBranchId}-${milestone.id}-detach`,
            source: newBranchId,
            target: milestone.id,
            type: 'smoothstep',
            animated: false,
            style: { stroke: 'var(--accent)', strokeWidth: 1 },
          }
          addEdge(newEdge)
          refreshBranch(newBranchId)
          break
        }
      }
    }

    function addBranch(displayName: string, icon: string, description: string = '', taskIds: string[] = []) {
      let branchPos = { x: 100, y: 100 }
      if (branches.value.length > 0) {
        const lastBranch = branches.value[branches.value.length - 1]
        const lastBranchPos = lastBranch.position || { x: 100, y: 100 }
        branchPos = { x: lastBranchPos.x, y: lastBranchPos.y + 150 }
      }
      const newBranchId = uuidv4()
      const newBranch: Branch = {
        id: newBranchId,
        displayName,
        icon,
        description,
        taskIds,
        milestones: [],
        order: branches.value.length,
        position: branchPos,
      }
      branches.value.push(newBranch)
    }

    function deleteBranch(branchId: string) { /* без изменений */ }
    function addMilestone(branchId: BranchId | null, name: string, position?: { x: number; y: number }): Milestone { /* без изменений */ }
    function addMilestoneWithoutEdge(branchId: BranchId | null, name: string, position?: { x: number; y: number }): Milestone { /* без изменений */ }
    function updateMilestone(milestoneId: string, updates: Partial<Milestone>) { /* без изменений */ }
    function deleteMilestone(milestoneId: string) { /* без изменений */ }
    function addEdge(edge: Edge) { edges.value.push(edge) }
    function removeEdge(edgeId: string) { edges.value = edges.value.filter((e) => e.id !== edgeId) }
    function updateEdge(updatedEdge: Edge) { /* без изменений */ }
    function updateBranch(branchId: string, updates: Partial<Branch>) { /* без изменений */ }
    function updateBranchPosition(branchId: string, position: { x: number; y: number }) { /* без изменений */ }

    if (import.meta.client) {
      migrateMissingEdges()
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
      updateEdge,
      updateBranch,
      updateBranchPosition,
      getBranchTotalTasks,
      getBranchCompletedTasks,
      refreshMilestonesByTaskId,
      syncMilestoneIcon,
      attachMilestoneToBranch,
      detachMilestoneFromBranch,
      refreshBranch,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-branches', storage: localStorage }
      : undefined,
  }
)