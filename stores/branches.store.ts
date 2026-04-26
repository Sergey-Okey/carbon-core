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
            id: 'fin-milestone-1',
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
        position: { x: 50, y: 200 },
      },
      {
        id: 'BODY',
        displayName: 'Тело',
        icon: 'dumbbell',
        description: '',
        taskIds: [],
        milestones: [
          {
            id: 'body-milestone-1',
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
        position: { x: 350, y: 200 },
      },
      {
        id: 'MIND',
        displayName: 'Интеллект',
        icon: 'brain',
        description: '',
        taskIds: [],
        milestones: [
          {
            id: 'mind-milestone-1',
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
        position: { x: 650, y: 200 },
      },
      {
        id: 'LDR',
        displayName: 'Лидерство',
        icon: 'users',
        description: '',
        taskIds: [],
        milestones: [
          {
            id: 'ldr-milestone-1',
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
        position: { x: 950, y: 200 },
      },
    ])

    const edges = ref<Edge[]>([])

    // Миграция недостающих рёбер для старых данных
    function migrateMissingEdges() {
      branches.value.forEach((branch) => {
        if (branch.milestones.length === 0) return
        const firstMilestone = branch.milestones[0]
        const edgeBranchToFirst = edges.value.some(
          (e) => e.source === branch.id && e.target === firstMilestone.id
        )
        if (!edgeBranchToFirst) {
          edges.value.push({
            id: `edge-${branch.id}-${firstMilestone.id}-migrate`,
            source: branch.id,
            target: firstMilestone.id,
            type: 'smoothstep',
            animated: false,
            style: { stroke: 'var(--accent)', strokeWidth: 1 },
          })
        }
        for (let i = 0; i < branch.milestones.length - 1; i++) {
          const source = branch.milestones[i].id
          const target = branch.milestones[i + 1].id
          const edgeExists = edges.value.some(
            (e) => e.source === source && e.target === target
          )
          if (!edgeExists) {
            edges.value.push({
              id: `edge-${source}-${target}-migrate`,
              source,
              target,
              type: 'smoothstep',
              animated: false,
              style: { stroke: 'var(--accent)', strokeWidth: 1 },
            })
          }
        }
      })
    }

    function cleanupEdges() {
      const existingNodeIds = new Set(
        branches.value.flatMap((b) => b.milestones.map((m) => m.id))
      )
      branches.value.forEach((b) => existingNodeIds.add(b.id))
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
        // Добавляем ребро
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
        refreshMilestonesByTaskId(milestone.id)
        if (sourceBranch && sourceBranch.milestones.length > 0) {
          refreshMilestonesByTaskId(sourceBranch.milestones[0].id)
        }
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
          milestone.currentXP = 0
          milestone.status = 'pending'
          updateMilestoneStatus(milestone)
          edges.value = edges.value.filter(
            (e) => e.source !== milestoneId && e.target !== milestoneId
          )
          if (branch.milestones.length > 0) {
            refreshMilestonesByTaskId(branch.milestones[0].id)
          }
          if (branch.milestones.length === 0) {
            const branchIndex = branches.value.findIndex(
              (b) => b.id === branch.id
            )
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
            position: {
              x: milestone.position.x - 150,
              y: milestone.position.y,
            },
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
          refreshMilestonesByTaskId(milestone.id)
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
      let branchPos = { x: 100, y: 100 }
      let milestonePos = { x: 250, y: 100 }
      if (branches.value.length > 0) {
        const lastBranch = branches.value[branches.value.length - 1]
        const lastBranchPos = lastBranch.position || { x: 100, y: 100 }
        branchPos = { x: lastBranchPos.x, y: lastBranchPos.y + 150 }
        milestonePos = { x: branchPos.x + 150, y: branchPos.y }
      }
      const newBranchId = uuidv4()
      const newMilestone: Milestone = {
        id: uuidv4(),
        name: displayName,
        icon,
        description,
        requiredXP: 500,
        currentXP: 0,
        status: 'pending',
        taskIds: taskIds,
        position: milestonePos,
      }
      const newBranch: Branch = {
        id: newBranchId,
        displayName,
        icon,
        description,
        taskIds,
        milestones: [newMilestone],
        order: branches.value.length,
        position: branchPos,
      }
      branches.value.push(newBranch)

      const newEdge: Edge = {
        id: `edge-${newBranchId}-${newMilestone.id}-${Date.now()}`,
        source: newBranchId,
        target: newMilestone.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--accent)', strokeWidth: 1 },
      }
      addEdge(newEdge)
    }

    function deleteBranch(branchId: string) {
      const index = branches.value.findIndex((b) => b.id === branchId)
      if (index !== -1) {
        const milestoneIds = branches.value[index].milestones.map((m) => m.id)
        edges.value = edges.value.filter(
          (e) =>
            !milestoneIds.includes(e.source) &&
            !milestoneIds.includes(e.target) &&
            e.source !== branchId &&
            e.target !== branchId
        )
        branches.value.splice(index, 1)
      }
    }

    function addMilestone(
      branchId: BranchId | null,
      name: string,
      position?: { x: number; y: number }
    ): Milestone {
      let branch = branchId
        ? branches.value.find((b) => b.id === branchId)
        : null
      if (!branch) {
        const newBranchId = uuidv4()
        const newMilestone: Milestone = {
          id: uuidv4(),
          name,
          icon: 'help-circle',
          requiredXP: 500,
          currentXP: 0,
          status: 'pending',
          taskIds: [],
          description: '',
          position: position || { x: 250, y: 100 },
        }
        const newBranch: Branch = {
          id: newBranchId,
          displayName: name,
          icon: 'help-circle',
          description: '',
          taskIds: [],
          milestones: [newMilestone],
          order: branches.value.length,
          position: {
            x: newMilestone.position.x - 150,
            y: newMilestone.position.y,
          },
        }
        branches.value.push(newBranch)
        const newEdge: Edge = {
          id: `edge-${newBranchId}-${newMilestone.id}-${Date.now()}`,
          source: newBranchId,
          target: newMilestone.id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: 'var(--accent)', strokeWidth: 1 },
        }
        addEdge(newEdge)
        return newMilestone
      }

      const lastMilestone = branch.milestones[branch.milestones.length - 1]
      const newMilestone: Milestone = {
        id: uuidv4(),
        name,
        icon: branch.icon,
        requiredXP: lastMilestone
          ? Math.floor(lastMilestone.requiredXP * 1.5)
          : 500,
        currentXP: 0,
        status: 'pending',
        taskIds: [],
        description: '',
        position: position || {
          x: (lastMilestone?.position.x || 0) + 250,
          y: lastMilestone?.position.y || 200,
        },
      }

      const updatedBranch = {
        ...branch,
        milestones: [...branch.milestones, newMilestone],
      }
      const branchIndex = branches.value.findIndex((b) => b.id === branch.id)
      const updatedBranches = [...branches.value]
      updatedBranches.splice(branchIndex, 1, updatedBranch)
      branches.value = updatedBranches

      const sourceId =
        branch.milestones.length === 0 ? branch.id : lastMilestone!.id
      const newEdge: Edge = {
        id: `edge-${sourceId}-${newMilestone.id}-${Date.now()}`,
        source: sourceId,
        target: newMilestone.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--accent)', strokeWidth: 1 },
      }
      addEdge(newEdge)

      return newMilestone
    }

    function updateMilestone(milestoneId: string, updates: Partial<Milestone>) {
      const branchIndex = branches.value.findIndex((b) =>
        b.milestones.some((m) => m.id === milestoneId)
      )
      if (branchIndex === -1) return

      const branch = branches.value[branchIndex]
      const milestoneIndex = branch.milestones.findIndex(
        (m) => m.id === milestoneId
      )
      if (milestoneIndex === -1) return

      const updatedMilestone = {
        ...branch.milestones[milestoneIndex],
        ...updates,
      }
      const updatedMilestones = [...branch.milestones]
      updatedMilestones.splice(milestoneIndex, 1, updatedMilestone)

      const updatedBranch = {
        ...branch,
        milestones: updatedMilestones,
      }

      const updatedBranches = [...branches.value]
      updatedBranches.splice(branchIndex, 1, updatedBranch)
      branches.value = updatedBranches

      updateMilestoneStatus(updatedMilestone)
      updateBranchStatus(updatedBranch)
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
    function updateBranchPosition(
      branchId: string,
      position: { x: number; y: number }
    ) {
      const branch = branches.value.find((b) => b.id === branchId)
      if (branch) {
        branch.position = position
      }
    }

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
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-branches', storage: localStorage }
      : undefined,
  }
)
