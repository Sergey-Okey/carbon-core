import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Branch, BranchId, Milestone } from '~/types/branch.types'
import type { Edge } from '@vue-flow/core'
import { v4 as uuidv4 } from 'uuid'
import { useTasksStore } from './tasks.store'

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
            icon: 'trending-up',
            description: '',
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
            icon: 'dumbbell',
            description: '',
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
            icon: 'brain',
            description: '',
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
            icon: 'users',
            description: '',
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
      updateBranchStatus(branch)
    }

    function updateMilestoneStatus(milestone: Milestone) {
      const tasksStore = useTasksStore()
      const allTasksDone =
        milestone.taskIds.length > 0 &&
        milestone.taskIds.every((id) => {
          const task = tasksStore.tasks.find((t) => t.id === id)
          return task && task.done
        })

      if (allTasksDone) {
        milestone.status = 'completed'
      } else if (milestone.currentXP >= milestone.requiredXP) {
        milestone.status = 'completed'
      } else if (milestone.currentXP > 0) {
        milestone.status = 'active'
      } else {
        milestone.status = 'pending'
      }
    }

    function updateBranchStatus(branch: Branch) {
      const allCompleted = branch.milestones.every(
        (m) => m.status === 'completed'
      )
      if (allCompleted && branch.milestones.length > 0) {
        branch.milestones[0].status = 'completed'
      } else if (branch.milestones.length > 0) {
        const activeOrPending = branch.milestones.find(
          (m) => m.status !== 'completed'
        )
        branch.milestones[0].status = activeOrPending?.status ?? 'pending'
      }
    }

    function getBranchTotalTasks(branchId: string): number {
      const branch = branches.value.find((b) => b.id === branchId)
      if (!branch) return 0
      const allTaskIds = new Set<string>()
      branch.milestones.forEach((m) =>
        m.taskIds.forEach((id) => allTaskIds.add(id))
      )
      return allTaskIds.size
    }

    function getBranchCompletedTasks(branchId: string): number {
      const branch = branches.value.find((b) => b.id === branchId)
      if (!branch) return 0
      const allTaskIds = new Set<string>()
      branch.milestones.forEach((m) =>
        m.taskIds.forEach((id) => allTaskIds.add(id))
      )
      const tasksStore = useTasksStore()
      return [...allTaskIds].filter((id) => {
        const task = tasksStore.tasks.find((t) => t.id === id)
        return task && task.done
      }).length
    }

    function refreshMilestonesByTaskId(taskId: string) {
      for (const branch of branches.value) {
        let changed = false
        for (const milestone of branch.milestones) {
          if (milestone.taskIds.includes(taskId)) {
            updateMilestoneStatus(milestone)
            changed = true
          }
        }
        if (changed) updateBranchStatus(branch)
      }
    }

    function syncMilestoneIcon(milestoneId: string) {
      for (const branch of branches.value) {
        const milestone = branch.milestones.find((m) => m.id === milestoneId)
        if (milestone) {
          milestone.icon = branch.icon
          break
        }
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
      }

      if (sourceBranch && sourceBranch.milestones.length === 0) {
        const branchIndex = branches.value.findIndex(
          (b) => b.id === sourceBranch!.id
        )
        if (branchIndex !== -1) branches.value.splice(branchIndex, 1)
      }
    }

    function detachMilestoneFromBranch(milestoneId: string) {
      for (const branch of branches.value) {
        const index = branch.milestones.findIndex((m) => m.id === milestoneId)
        if (index !== -1) {
          const milestone = branch.milestones.splice(index, 1)[0]
          milestone.icon = 'help-circle'
          if (branch.milestones.length === 0) {
            const branchIndex = branches.value.findIndex(
              (b) => b.id === branch.id
            )
            if (branchIndex !== -1) branches.value.splice(branchIndex, 1)
          }
          branches.value.push({
            id: uuidv4(),
            displayName: milestone.name,
            icon: 'help-circle',
            description: '',
            taskIds: [],
            milestones: [milestone],
            order: branches.value.length,
          })
          break
        }
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
            icon,
            description,
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
      branchId: BranchId | null,
      name: string,
      position?: { x: number; y: number }
    ) {
      const branch = branchId
        ? branches.value.find((b) => b.id === branchId)
        : null
      const last = branch
        ? branch.milestones[branch.milestones.length - 1]
        : undefined
      const newMilestone: Milestone = {
        id: uuidv4(),
        name,
        icon: 'help-circle',
        requiredXP: last ? Math.floor(last.requiredXP * 1.5) : 500,
        currentXP: 0,
        status: 'pending',
        taskIds: [],
        description: '',
        position: position || {
          x: (last?.position.x || 200) + 250,
          y: last?.position.y || 200,
        },
      }
      if (branch) {
        branch.milestones.push(newMilestone)
      } else {
        branches.value.push({
          id: uuidv4(),
          displayName: name,
          icon: 'help-circle',
          description: '',
          taskIds: [],
          milestones: [newMilestone],
          order: branches.value.length,
        })
      }
      return newMilestone
    }

    function updateMilestone(milestoneId: string, updates: Partial<Milestone>) {
      for (const branch of branches.value) {
        const index = branch.milestones.findIndex((m) => m.id === milestoneId)
        if (index !== -1) {
          // Создаём новый объект для гарантированной реактивности
          const updatedMilestone = { ...branch.milestones[index], ...updates }
          branch.milestones.splice(index, 1, updatedMilestone)
          // Явно перезаписываем массив для гарантии реактивности Pinia/Vue
          branch.milestones = [...branch.milestones]
          updateMilestoneStatus(updatedMilestone)
          updateBranchStatus(branch)
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
          if (branch.milestones.length === 0) {
            const branchIndex = branches.value.findIndex(
              (b) => b.id === branch.id
            )
            if (branchIndex !== -1) branches.value.splice(branchIndex, 1)
          } else {
            updateBranchStatus(branch)
          }
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
    function updateEdge(updatedEdge: Edge) {
      const index = edges.value.findIndex((e) => e.id === updatedEdge.id)
      if (index !== -1) edges.value[index] = updatedEdge
    }
    function updateBranch(branchId: string, updates: Partial<Branch>) {
      const branch = branches.value.find((b) => b.id === branchId)
      if (branch) {
        Object.assign(branch, updates)
        const firstMilestone = branch.milestones[0]
        if (firstMilestone) {
          if (updates.displayName) firstMilestone.name = updates.displayName
          if (updates.icon) firstMilestone.icon = updates.icon
          if (updates.description)
            firstMilestone.description = updates.description
          if (updates.taskIds) firstMilestone.taskIds = updates.taskIds
        }
        updateBranchStatus(branch)
      }
    }

    if (import.meta.client) {
      Promise.resolve().then(() => cleanupEdges())
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
      updateEdge,
      updateBranch,
      getBranchTotalTasks,
      getBranchCompletedTasks,
      refreshMilestonesByTaskId,
      syncMilestoneIcon,
      attachMilestoneToBranch,
      detachMilestoneFromBranch,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-branches', storage: localStorage }
      : undefined,
  }
)
