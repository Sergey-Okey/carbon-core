import { useBranchesStore } from '~/stores/branches.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useTagsStore } from '~/stores/tags.store'
import type { Branch, Milestone } from '~/types/branch.types'
import { v4 as uuidv4 } from 'uuid'

export function useBranchAutomation() {
  const branchesStore = useBranchesStore()
  const tasksStore = useTasksStore()
  const tagsStore = useTagsStore()

  // Главный метод — вызывается после изменения задач или тегов
  async function rebuildBoard() {
    // 1. Сбросить все милестоуны и XP в ветках
    branchesStore.branches.forEach((branch) => {
      branch.totalXP = 0
      branch.milestones = []
    })
    branchesStore.clearEdges()

    // 2. Для каждой выполненной задачи добавить XP в связанные ветки
    const completedTasks = tasksStore.tasks.filter((t) => t.done)
    for (const task of completedTasks) {
      const tags = tagsStore.getTagsByIds(task.tagIds)
      const affectedBranches = [...new Set(tags.map((t) => t.branchId))]
      for (const branchId of affectedBranches) {
        let branch = branchesStore.branches.find((b) => b.id === branchId)
        if (!branch) {
          // Создаём новую ветку, если её нет
          const tag = tags.find((t) => t.branchId === branchId)
          branch = branchesStore.addBranch({
            displayName: tag?.name || branchId,
            icon: 'target',
            totalXP: 0,
            milestones: [],
            position: { x: 50, y: 100 + branchesStore.branches.length * 100 },
            order: branchesStore.branches.length,
          })
        }
        branchesStore.addXPToBranch(branch.id, task.xpReward || 100, task.id)
      }

      // Если задача имеет несколько веток, создаём связи
      if (affectedBranches.length > 1) {
        // Найдём последние милестоуны этих веток
        const lastMilestones: { branchId: string; milestoneId: string }[] = []
        for (const branchId of affectedBranches) {
          const branch = branchesStore.branches.find((b) => b.id === branchId)
          if (branch && branch.milestones.length > 0) {
            const last = branch.milestones[branch.milestones.length - 1]
            lastMilestones.push({ branchId, milestoneId: last.id })
          }
        }
        // Создадим рёбра между ними
        for (let i = 0; i < lastMilestones.length; i++) {
          for (let j = i + 1; j < lastMilestones.length; j++) {
            const source = `${lastMilestones[i].branchId}-${lastMilestones[i].milestoneId}`
            const target = `${lastMilestones[j].branchId}-${lastMilestones[j].milestoneId}`
            // Проверим, нет ли уже такого ребра
            const exists = branchesStore.edges.some(
              (e) =>
                (e.source === source && e.target === target) ||
                (e.source === target && e.target === source)
            )
            if (!exists) {
              branchesStore.addEdge({
                source,
                target,
                type: 'smoothstep',
                animated: true,
                label: task.title.slice(0, 20),
                style: { stroke: 'var(--accent)', strokeWidth: 2 },
              })
            }
          }
        }
      }
    }

    // 3. Для каждой ветки без милестоунов создать первый
    branchesStore.branches.forEach((branch) => {
      if (branch.milestones.length === 0) {
        branchesStore.addXPToBranch(branch.id, 0)
      }
    })
  }

  return {
    rebuildBoard,
  }
}
