import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Branch, BranchId, Milestone } from '~/types/branch.types'
import type { Edge } from '@vue-flow/core'
import { v4 as uuidv4 } from 'uuid'
import { useTasksStore } from './tasks.store'

export const useBranchesStore = defineStore(
  'branches',
  () => {
    // ========== Демо-данные ==========
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
    ])

    // ========== Вспомогательные ==========
    function migrateMissingEdges() {
      branches.value.forEach((branch) => {
        if (branch.milestones.length === 0) return
        const first = branch.milestones[0]
        if (
          !edges.value.some(
            (e) => e.source === branch.id && e.target === first.id
          )
        ) {
          edges.value.push({
            id: `edge-${branch.id}-${first.id}-migrate`,
            source: branch.id,
            target: first.id,
            type: 'smoothstep',
            animated: false,
            style: { stroke: 'var(--accent)', strokeWidth: 1 },
          })
        }
        for (let i = 0; i < branch.milestones.length - 1; i++) {
          const src = branch.milestones[i].id,
            tgt = branch.milestones[i + 1].id
          if (!edges.value.some((e) => e.source === src && e.target === tgt)) {
            edges.value.push({
              id: `edge-${src}-${tgt}-migrate`,
              source: src,
              target: tgt,
              type: 'smoothstep',
              animated: false,
              style: { stroke: 'var(--accent)', strokeWidth: 1 },
            })
          }
        }
      })
    }

    function cleanupEdges() {
      const existing = new Set(
        branches.value.flatMap((b) => b.milestones.map((m) => m.id))
      )
      branches.value.forEach((b) => existing.add(b.id))
      edges.value = edges.value.filter(
        (e) => existing.has(e.source) && existing.has(e.target)
      )
    }

    // XP и статусы
    function addXPToBranch(branchId: BranchId, xp: number) {
      const branch = branches.value.find((b) => b.id === branchId)
      if (!branch) return
      const active = branch.milestones.find((m) => m.status === 'active')
      if (active) {
        active.currentXP += xp
        updateMilestoneStatus(active)
      } else {
        const pending = branch.milestones.find((m) => m.status === 'pending')
        if (pending) {
          pending.currentXP += xp
          pending.status = 'active'
          updateMilestoneStatus(pending)
        }
      }
      updateBranchStatus(branch)
    }

    function updateMilestoneStatus(milestone: Milestone) {
      const tasksStore = useTasksStore()
      const allDone =
        milestone.taskIds.length > 0 &&
        milestone.taskIds.every(
          (id) => tasksStore.tasks.find((t) => t.id === id)?.done
        )
      if (allDone || milestone.currentXP >= milestone.requiredXP)
        milestone.status = 'completed'
      else if (milestone.currentXP > 0) milestone.status = 'active'
      else milestone.status = 'pending'
    }

    function updateBranchStatus(branch: Branch) {
      if (branch.milestones.length === 0) return
      const allCompleted = branch.milestones.every(
        (m) => m.status === 'completed'
      )
      if (allCompleted) branch.milestones[0].status = 'completed'
      else {
        const activeOrPending = branch.milestones.find(
          (m) => m.status !== 'completed'
        )
        branch.milestones[0].status = activeOrPending?.status ?? 'pending'
      }
    }

    function getBranchTotalTasks(branchId: string): number {
      const branch = branches.value.find((b) => b.id === branchId)
      if (!branch) return 0
      const tasks = new Set<string>()
      branch.milestones.forEach((m) => m.taskIds.forEach((id) => tasks.add(id)))
      return tasks.size
    }

    function getBranchCompletedTasks(branchId: string): number {
      const branch = branches.value.find((b) => b.id === branchId)
      if (!branch) return 0
      const tasksStore = useTasksStore()
      const allIds = new Set<string>()
      branch.milestones.forEach((m) =>
        m.taskIds.forEach((id) => allIds.add(id))
      )
      return [...allIds].filter(
        (id) => tasksStore.tasks.find((t) => t.id === id)?.done
      ).length
    }

    function refreshMilestonesByTaskId(taskId: string) {
      for (const branch of branches.value) {
        let changed = false
        for (const m of branch.milestones) {
          if (m.taskIds.includes(taskId)) {
            updateMilestoneStatus(m)
            changed = true
          }
        }
        if (changed) updateBranchStatus(branch)
      }
    }

    function refreshBranch(branchId: string) {
      const branch = branches.value.find((b) => b.id === branchId)
      if (branch) {
        branch.milestones.forEach((m) => updateMilestoneStatus(m))
        updateBranchStatus(branch)
      }
    }

    function syncMilestoneIcon(milestoneId: string) {
      for (const branch of branches.value) {
        const m = branch.milestones.find((m) => m.id === milestoneId)
        if (m) {
          m.icon = branch.icon
          break
        }
      }
    }

    // Прикрепление / отсоединение этапов
    function attachMilestoneToBranch(milestoneId: string, branchId: string) {
      let milestone: Milestone | undefined
      let sourceBranch: Branch | undefined
      for (const branch of branches.value) {
        const idx = branch.milestones.findIndex((m) => m.id === milestoneId)
        if (idx !== -1) {
          milestone = branch.milestones.splice(idx, 1)[0]
          sourceBranch = branch
          break
        }
      }
      if (!milestone) return
      const targetBranch = branches.value.find((b) => b.id === branchId)
      if (targetBranch) {
        milestone.icon = targetBranch.icon
        targetBranch.milestones.push(milestone)
        const prev =
          targetBranch.milestones.length === 1
            ? targetBranch.id
            : targetBranch.milestones[targetBranch.milestones.length - 2].id
        addEdge({
          id: `edge-${prev}-${milestone.id}-${Date.now()}`,
          source: prev,
          target: milestone.id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: 'var(--accent)', strokeWidth: 1 },
        })
        refreshBranch(targetBranch.id)
      }
      if (sourceBranch && sourceBranch.milestones.length === 0) {
        const idx = branches.value.findIndex((b) => b.id === sourceBranch!.id)
        if (idx !== -1) branches.value.splice(idx, 1)
      } else if (sourceBranch) {
        refreshBranch(sourceBranch.id)
      }
    }

    function detachMilestoneFromBranch(milestoneId: string) {
      for (const branch of branches.value) {
        const idx = branch.milestones.findIndex((m) => m.id === milestoneId)
        if (idx !== -1) {
          const milestone = branch.milestones.splice(idx, 1)[0]
          milestone.icon = 'help-circle'
          milestone.currentXP = 0
          milestone.status = 'pending'
          updateMilestoneStatus(milestone)
          edges.value = edges.value.filter(
            (e) => e.source !== milestoneId && e.target !== milestoneId
          )
          if (branch.milestones.length > 0) refreshBranch(branch.id)
          if (branch.milestones.length === 0) {
            const bi = branches.value.findIndex((b) => b.id === branch.id)
            if (bi !== -1) branches.value.splice(bi, 1)
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
          addEdge({
            id: `edge-${newBranchId}-${milestone.id}-detach`,
            source: newBranchId,
            target: milestone.id,
            type: 'smoothstep',
            animated: false,
            style: { stroke: 'var(--accent)', strokeWidth: 1 },
          })
          refreshBranch(newBranchId)
          break
        }
      }
    }

    // Управление ветками
    function addBranch(
      displayName: string,
      icon: string,
      description = '',
      taskIds: string[] = []
    ) {
      let pos = { x: 100, y: 100 }
      if (branches.value.length) {
        const last = branches.value[branches.value.length - 1]
        const lastPos = last.position || { x: 100, y: 100 }
        pos = { x: lastPos.x, y: lastPos.y + 150 }
      }
      const newId = uuidv4()
      branches.value.push({
        id: newId,
        displayName,
        icon,
        description,
        taskIds,
        milestones: [],
        order: branches.value.length,
        position: pos,
      })
    }

    function deleteBranch(branchId: string) {
      const idx = branches.value.findIndex((b) => b.id === branchId)
      if (idx !== -1) {
        const mids = branches.value[idx].milestones.map((m) => m.id)
        edges.value = edges.value.filter(
          (e) =>
            !mids.includes(e.source) &&
            !mids.includes(e.target) &&
            e.source !== branchId &&
            e.target !== branchId
        )
        branches.value.splice(idx, 1)
      }
    }

    // Управление этапами
    function addMilestone(
      branchId: BranchId | null,
      name: string,
      position?: { x: number; y: number }
    ): Milestone {
      let branch = branchId
        ? branches.value.find((b) => b.id === branchId)
        : null
      if (!branch) {
        const newId = uuidv4()
        const m: Milestone = {
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
        branches.value.push({
          id: newId,
          displayName: name,
          icon: 'help-circle',
          description: '',
          taskIds: [],
          milestones: [m],
          order: branches.value.length,
          position: { x: m.position.x - 150, y: m.position.y },
        })
        addEdge({
          id: `edge-${newId}-${m.id}-${Date.now()}`,
          source: newId,
          target: m.id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: 'var(--accent)', strokeWidth: 1 },
        })
        return m
      }
      const last = branch.milestones[branch.milestones.length - 1]
      const m: Milestone = {
        id: uuidv4(),
        name,
        icon: branch.icon,
        requiredXP: last ? Math.floor(last.requiredXP * 1.5) : 500,
        currentXP: 0,
        status: 'pending',
        taskIds: [],
        description: '',
        position: position || {
          x: (last?.position.x || 0) + 250,
          y: last?.position.y || 200,
        },
      }
      const newBranch = { ...branch, milestones: [...branch.milestones, m] }
      const idx = branches.value.findIndex((b) => b.id === branch.id)
      const newBranches = [...branches.value]
      newBranches.splice(idx, 1, newBranch)
      branches.value = newBranches
      const source = branch.milestones.length === 0 ? branch.id : last!.id
      addEdge({
        id: `edge-${source}-${m.id}-${Date.now()}`,
        source,
        target: m.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'var(--accent)', strokeWidth: 1 },
      })
      return m
    }

    function addMilestoneWithoutEdge(
      branchId: BranchId | null,
      name: string,
      position?: { x: number; y: number }
    ): Milestone {
      let branch = branchId
        ? branches.value.find((b) => b.id === branchId)
        : null
      if (!branch) {
        const newId = uuidv4()
        const m: Milestone = {
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
        branches.value.push({
          id: newId,
          displayName: name,
          icon: 'help-circle',
          description: '',
          taskIds: [],
          milestones: [m],
          order: branches.value.length,
          position: { x: m.position.x - 150, y: m.position.y },
        })
        return m
      }
      const last = branch.milestones[branch.milestones.length - 1]
      const m: Milestone = {
        id: uuidv4(),
        name,
        icon: branch.icon,
        requiredXP: last ? Math.floor(last.requiredXP * 1.5) : 500,
        currentXP: 0,
        status: 'pending',
        taskIds: [],
        description: '',
        position: position || {
          x: (last?.position.x || 0) + 250,
          y: last?.position.y || 200,
        },
      }
      const newBranch = { ...branch, milestones: [...branch.milestones, m] }
      const idx = branches.value.findIndex((b) => b.id === branch.id)
      const newBranches = [...branches.value]
      newBranches.splice(idx, 1, newBranch)
      branches.value = newBranches
      return m
    }

    function updateMilestone(milestoneId: string, updates: Partial<Milestone>) {
      const branchIdx = branches.value.findIndex((b) =>
        b.milestones.some((m) => m.id === milestoneId)
      )
      if (branchIdx === -1) return
      const branch = branches.value[branchIdx]
      const mIdx = branch.milestones.findIndex((m) => m.id === milestoneId)
      if (mIdx === -1) return
      const updated = { ...branch.milestones[mIdx], ...updates }
      const newMilestones = [...branch.milestones]
      newMilestones.splice(mIdx, 1, updated)
      const newBranch = { ...branch, milestones: newMilestones }
      const newBranches = [...branches.value]
      newBranches.splice(branchIdx, 1, newBranch)
      branches.value = newBranches
      updateMilestoneStatus(updated)
      updateBranchStatus(newBranch)
    }

    function deleteMilestone(milestoneId: string) {
      for (const branch of branches.value) {
        const idx = branch.milestones.findIndex((m) => m.id === milestoneId)
        if (idx !== -1) {
          branch.milestones.splice(idx, 1)
          edges.value = edges.value.filter(
            (e) => e.source !== milestoneId && e.target !== milestoneId
          )
          if (branch.milestones.length === 0) {
            const bi = branches.value.findIndex((b) => b.id === branch.id)
            if (bi !== -1) branches.value.splice(bi, 1)
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
      const idx = edges.value.findIndex((e) => e.id === updatedEdge.id)
      if (idx !== -1) edges.value[idx] = updatedEdge
    }
    function updateBranch(branchId: string, updates: Partial<Branch>) {
      const branch = branches.value.find((b) => b.id === branchId)
      if (branch) {
        Object.assign(branch, updates)
        const first = branch.milestones[0]
        if (first) {
          if (updates.displayName) first.name = updates.displayName
          if (updates.icon) first.icon = updates.icon
          if (updates.description) first.description = updates.description
          if (updates.taskIds) first.taskIds = updates.taskIds
        }
        updateBranchStatus(branch)
      }
    }
    function updateBranchPosition(
      branchId: string,
      position: { x: number; y: number }
    ) {
      const branch = branches.value.find((b) => b.id === branchId)
      if (branch) branch.position = position
    }

    function updateNodePosition(
      nodeId: string,
      position: { x: number; y: number }
    ) {
      const branch = branches.value.find((b) => b.id === nodeId)
      if (branch) {
        branch.position = position
        return
      }
      updateMilestone(nodeId, { position })
    }

    function removeTaskReferences(taskId: string) {
      branches.value.forEach((branch) => {
        branch.taskIds = branch.taskIds.filter((id) => id !== taskId)
        let changed = false
        branch.milestones.forEach((milestone) => {
          const nextTaskIds = milestone.taskIds.filter((id) => id !== taskId)
          if (nextTaskIds.length !== milestone.taskIds.length) {
            milestone.taskIds = nextTaskIds
            updateMilestoneStatus(milestone)
            changed = true
          }
        })
        if (changed) updateBranchStatus(branch)
      })
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
      addMilestoneWithoutEdge,
      updateMilestone,
      deleteMilestone,
      addEdge,
      removeEdge,
      updateEdge,
      updateBranch,
      updateBranchPosition,
      updateNodePosition,
      removeTaskReferences,
      getBranchTotalTasks,
      getBranchCompletedTasks,
      refreshMilestonesByTaskId,
      refreshBranch,
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
