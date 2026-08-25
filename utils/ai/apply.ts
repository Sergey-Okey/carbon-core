import { useTasksStore } from '~/stores/tasks.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useTagsStore } from '~/stores/tags.store'
import { useRewardsStore } from '~/stores/rewards.store'
import { useSettingsStore } from '~/stores/settings.store'
import { useUserStore } from '~/stores/user.store'
import type { AiApplyResult, AiEntityRef, AiOperation } from '~/types/ai.types'
import type { Task, TaskType } from '~/types/task.types'

function resolveId(id: string | undefined, refs: Map<string, string>) {
  if (!id) return ''
  return refs.get(id) || id
}

function remember(refs: Map<string, string>, ref: string | undefined, id: string) {
  if (ref) refs.set(ref, id)
}

function findMilestone(branches: ReturnType<typeof useBranchesStore>, milestoneId: string) {
  for (const branch of branches.branches) {
    const milestone = branch.milestones.find((item) => item.id === milestoneId)
    if (milestone) return { branch, milestone }
  }
  return null
}

function resolveTagIds(
  tagNames: string[] | undefined,
  tagsStore: ReturnType<typeof useTagsStore>,
  refs: Map<string, string>
) {
  if (!tagNames?.length) return [] as string[]
  return tagNames
    .map((name) => {
      const resolved = refs.get(name)
      if (resolved) return resolved
      const existing = tagsStore.findTagByName(name)
      if (existing) return existing.id
      return tagsStore.addTag({ name, order: tagsStore.tags.length }).id
    })
    .filter(Boolean)
}

function linkTask(
  branches: ReturnType<typeof useBranchesStore>,
  taskId: string,
  branchId?: string,
  milestoneId?: string
) {
  if (milestoneId) {
    const found = findMilestone(branches, milestoneId)
    if (!found) return false
    if (!found.milestone.taskIds.includes(taskId)) {
      branches.updateMilestone(milestoneId, {
        taskIds: [...found.milestone.taskIds, taskId],
      })
    }
    return true
  }
  if (branchId) {
    const branch = branches.branches.find((item) => item.id === branchId)
    if (!branch) return false
    const direct = branch.directTaskIds || []
    if (!direct.includes(taskId)) {
      branches.updateBranch(branchId, { taskIds: [...direct, taskId] })
    }
    return true
  }
  return false
}

function unlinkTask(
  branches: ReturnType<typeof useBranchesStore>,
  taskId: string,
  branchId?: string,
  milestoneId?: string
) {
  if (milestoneId) {
    const found = findMilestone(branches, milestoneId)
    if (!found) return false
    branches.updateMilestone(milestoneId, {
      taskIds: found.milestone.taskIds.filter((id) => id !== taskId),
    })
    return true
  }
  if (branchId) {
    const branch = branches.branches.find((item) => item.id === branchId)
    if (!branch) return false
    const direct = (branch.directTaskIds || []).filter((id) => id !== taskId)
    branches.updateBranch(branchId, { taskIds: direct })
    return true
  }
  branches.removeTaskFromMilestones(taskId)
  return true
}

function entity(kind: AiEntityRef['kind'], id: string, label: string): AiEntityRef {
  return { kind, id, label }
}

function applySettings(
  settings: ReturnType<typeof useSettingsStore>,
  values: Record<string, string | number | boolean>
) {
  if (typeof values.themeMode === 'string') {
    const mode = values.themeMode
    if (mode === 'dark' || mode === 'light' || mode === 'system' || mode === 'schedule') {
      settings.setThemeMode(mode)
    }
  }
  if (typeof values.accentColor === 'string') settings.setAccentColor(values.accentColor)
  if (values.uiDensity === 'comfortable' || values.uiDensity === 'compact') {
    settings.setUiDensity(values.uiDensity)
  }
  if (typeof values.animationsEnabled === 'boolean') {
    settings.setAnimationsEnabled(values.animationsEnabled)
  }
  if (typeof values.soundEnabled === 'boolean') settings.setSoundEnabled(values.soundEnabled)
  if (typeof values.hapticsEnabled === 'boolean') settings.setHapticsEnabled(values.hapticsEnabled)
  if (typeof values.notificationsEnabled === 'boolean') {
    settings.setNotificationsEnabled(values.notificationsEnabled)
  }
  if (typeof values.showTopStats === 'boolean') settings.setShowTopStats(values.showTopStats)
  if (typeof values.showSettingsStats === 'boolean') {
    settings.setShowSettingsStats(values.showSettingsStats)
  }
  if (
    values.boardLayoutDensity === 'compact' ||
    values.boardLayoutDensity === 'normal' ||
    values.boardLayoutDensity === 'wide'
  ) {
    settings.setBoardLayoutDensity(values.boardLayoutDensity)
  }
  if (typeof values.boardColumns === 'number') settings.setBoardColumns(values.boardColumns)
  if (typeof values.boardShowNodeTypes === 'boolean') {
    settings.setBoardShowNodeTypes(values.boardShowNodeTypes)
  }
}

export function applyAiOperations(operations: AiOperation[]): AiApplyResult[] {
  const tasks = useTasksStore()
  const branches = useBranchesStore()
  const tags = useTagsStore()
  const rewards = useRewardsStore()
  const settings = useSettingsStore()
  const user = useUserStore()
  const refs = new Map<string, string>()
  const results: AiApplyResult[] = []

  for (const operation of operations) {
    try {
      const result = applyOne(operation, {
        tasks,
        branches,
        tags,
        rewards,
        settings,
        user,
        refs,
      })
      results.push(result)
    } catch (error) {
      results.push({
        op: operation.op,
        ok: false,
        detail: error instanceof Error ? error.message : 'Не удалось применить действие',
      })
    }
  }

  return results
}

function applyOne(
  operation: AiOperation,
  deps: {
    tasks: ReturnType<typeof useTasksStore>
    branches: ReturnType<typeof useBranchesStore>
    tags: ReturnType<typeof useTagsStore>
    rewards: ReturnType<typeof useRewardsStore>
    settings: ReturnType<typeof useSettingsStore>
    user: ReturnType<typeof useUserStore>
    refs: Map<string, string>
  }
): AiApplyResult {
  const { tasks, branches, tags, rewards, settings, user, refs } = deps

  switch (operation.op) {
    case 'createTag': {
      const tag = tags.addTag({
        name: operation.name,
        color: operation.color,
        branchId: resolveId(operation.branchId, refs) || '',
        order: tags.tags.length,
      })
      remember(refs, operation.ref, tag.id)
      return {
        op: operation.op,
        ok: true,
        detail: `Тег «${tag.name}»`,
        entity: entity('tag', tag.id, tag.name),
      }
    }
    case 'updateTag': {
      const id = resolveId(operation.id, refs)
      const updated = tags.updateTag(id, {
        name: operation.name,
        color: operation.color,
        branchId: operation.branchId ? resolveId(operation.branchId, refs) : undefined,
      }, tasks.tasks)
      return {
        op: operation.op,
        ok: Boolean(updated),
        detail: updated ? `Тег «${updated.name}» обновлён` : 'Тег не найден',
      }
    }
    case 'deleteTag': {
      const ok = tags.deleteTag(resolveId(operation.id, refs), tasks.tasks)
      return { op: operation.op, ok, detail: ok ? 'Тег удалён' : 'Тег не найден' }
    }
    case 'createBranch': {
      const branch = branches.addBranch(
        operation.displayName,
        operation.icon || 'target',
        operation.description || '',
        [],
        operation.markerColor
      )
      remember(refs, operation.ref, branch.id)
      return {
        op: operation.op,
        ok: true,
        detail: `Ветка «${branch.displayName}»`,
        entity: entity('branch', branch.id, branch.displayName),
      }
    }
    case 'updateBranch': {
      const id = resolveId(operation.id, refs)
      const branch = branches.branches.find((item) => item.id === id)
      if (!branch) return { op: operation.op, ok: false, detail: 'Ветка не найдена' }
      branches.updateBranch(id, {
        displayName: operation.displayName,
        description: operation.description,
        icon: operation.icon,
        markerColor: operation.markerColor,
      })
      return {
        op: operation.op,
        ok: true,
        detail: `Ветка «${operation.displayName || branch.displayName}» обновлена`,
        entity: entity('branch', id, operation.displayName || branch.displayName),
      }
    }
    case 'deleteBranch': {
      const id = resolveId(operation.id, refs)
      const exists = branches.branches.some((item) => item.id === id)
      if (!exists) return { op: operation.op, ok: false, detail: 'Ветка не найдена' }
      branches.deleteBranch(id)
      return { op: operation.op, ok: true, detail: 'Ветка удалена' }
    }
    case 'createMilestone': {
      const branchId = resolveId(operation.branchId, refs)
      const sourceId = resolveId(operation.sourceId, refs)
      const taskIds = (operation.taskIds || []).map((id) => resolveId(id, refs)).filter(Boolean)
      const milestone = sourceId
        ? branches.createMilestoneFromSource(sourceId, {
            name: operation.name,
            description: operation.description,
            taskIds,
          })
        : branches.addMilestone(branchId || branches.branches[0]?.id || null, operation.name)
      if (!milestone) return { op: operation.op, ok: false, detail: 'Не удалось создать этап' }
      if (operation.description && !sourceId) {
        branches.updateMilestone(milestone.id, { description: operation.description, taskIds })
      } else if (taskIds.length && !sourceId) {
        branches.updateMilestone(milestone.id, { taskIds })
      }
      remember(refs, operation.ref, milestone.id)
      return {
        op: operation.op,
        ok: true,
        detail: `Этап «${milestone.name}»`,
        entity: entity('milestone', milestone.id, milestone.name),
      }
    }
    case 'updateMilestone': {
      const id = resolveId(operation.id, refs)
      const found = findMilestone(branches, id)
      if (!found) return { op: operation.op, ok: false, detail: 'Этап не найден' }
      branches.updateMilestone(id, {
        name: operation.name,
        description: operation.description,
        status: operation.status,
        taskIds: operation.taskIds?.map((taskId) => resolveId(taskId, refs)),
      })
      return {
        op: operation.op,
        ok: true,
        detail: `Этап «${operation.name || found.milestone.name}» обновлён`,
        entity: entity('milestone', id, operation.name || found.milestone.name),
      }
    }
    case 'deleteMilestone': {
      const id = resolveId(operation.id, refs)
      const found = findMilestone(branches, id)
      if (!found) return { op: operation.op, ok: false, detail: 'Этап не найден' }
      branches.deleteMilestone(id)
      return { op: operation.op, ok: true, detail: 'Этап удалён' }
    }
    case 'createTask': {
      const tagIds = resolveTagIds(operation.tagNames, tags, refs)
      const created = tasks.addTask({
        title: operation.title,
        description: operation.description,
        type: operation.type,
        tagIds,
        targetDate: operation.targetDate,
        targetTime: operation.targetTime,
        purchaseRewardId: resolveId(operation.purchaseRewardId, refs) || undefined,
      } as Omit<Task, 'id' | 'createdAt' | 'done'>)
      if (!created) {
        return {
          op: operation.op,
          ok: false,
          detail: `Лимит слотов для ${operation.type} исчерпан`,
        }
      }
      remember(refs, operation.ref, created.id)
      const milestoneId = resolveId(operation.milestoneId, refs)
      const branchId = resolveId(operation.branchId, refs)
      if (milestoneId || branchId) linkTask(branches, created.id, branchId, milestoneId)
      return {
        op: operation.op,
        ok: true,
        detail: `«${created.title}»`,
        entity: entity('task', created.id, created.title),
      }
    }
    case 'updateTask': {
      const id = resolveId(operation.id, refs)
      const task = tasks.tasks.find((item) => item.id === id)
      if (!task) return { op: operation.op, ok: false, detail: 'Задача не найдена' }
      const updates: Partial<Task> = {
        title: operation.title,
        description: operation.description,
        type: operation.type as TaskType | undefined,
        targetDate: operation.targetDate,
        targetTime: operation.targetTime,
      }
      if (operation.tagNames) updates.tagIds = resolveTagIds(operation.tagNames, tags, refs)
      tasks.updateTask(id, updates)
      if (operation.done === true && !task.done) tasks.completeTask(id)
      if (operation.done === false && task.done) tasks.reopenTask(id)
      return {
        op: operation.op,
        ok: true,
        detail: `«${operation.title || task.title}» обновлена`,
        entity: entity('task', id, operation.title || task.title),
      }
    }
    case 'completeTask': {
      const id = resolveId(operation.id, refs)
      const task = tasks.tasks.find((item) => item.id === id)
      if (!task) return { op: operation.op, ok: false, detail: 'Задача не найдена' }
      tasks.completeTask(id)
      return {
        op: operation.op,
        ok: true,
        detail: `«${task.title}» отмечена`,
        entity: entity('task', task.id, task.title),
      }
    }
    case 'reopenTask': {
      const id = resolveId(operation.id, refs)
      const reopened = tasks.reopenTask(id)
      return {
        op: operation.op,
        ok: Boolean(reopened),
        detail: reopened ? `«${reopened.title}» открыта снова` : 'Нельзя открыть задачу',
      }
    }
    case 'deleteTask': {
      const id = resolveId(operation.id, refs)
      const task = tasks.tasks.find((item) => item.id === id)
      if (!task) return { op: operation.op, ok: false, detail: 'Задача не найдена' }
      tasks.deleteTask(id)
      return { op: operation.op, ok: true, detail: `«${task.title}» удалена` }
    }
    case 'restoreTask': {
      const restored = tasks.restoreTask(resolveId(operation.id, refs))
      return {
        op: operation.op,
        ok: Boolean(restored),
        detail: restored ? `«${restored.title}» восстановлена` : 'Нельзя восстановить задачу',
      }
    }
    case 'connectNodes': {
      const result = branches.connectNodes(
        resolveId(operation.sourceId, refs),
        resolveId(operation.targetId, refs)
      )
      return { op: operation.op, ok: result.ok, detail: result.reason || 'Связь создана' }
    }
    case 'disconnectNodes': {
      if (operation.edgeId) {
        const id = resolveId(operation.edgeId, refs)
        const exists = branches.edges.some((edge) => edge.id === id)
        if (!exists) return { op: operation.op, ok: false, detail: 'Связь не найдена' }
        branches.disconnectEdge(id)
        return { op: operation.op, ok: true, detail: 'Связь разорвана' }
      }
      const sourceId = resolveId(operation.sourceId, refs)
      const targetId = resolveId(operation.targetId, refs)
      const edge = branches.edges.find(
        (item) => item.source === sourceId && item.target === targetId
      )
      if (!edge) return { op: operation.op, ok: false, detail: 'Связь не найдена' }
      branches.disconnectEdge(edge.id)
      return { op: operation.op, ok: true, detail: 'Связь разорвана' }
    }
    case 'linkTask': {
      const ok = linkTask(
        branches,
        resolveId(operation.taskId, refs),
        resolveId(operation.branchId, refs) || undefined,
        resolveId(operation.milestoneId, refs) || undefined
      )
      return { op: operation.op, ok, detail: ok ? 'Задача привязана' : 'Некуда привязать задачу' }
    }
    case 'unlinkTask': {
      const ok = unlinkTask(
        branches,
        resolveId(operation.taskId, refs),
        resolveId(operation.branchId, refs) || undefined,
        resolveId(operation.milestoneId, refs) || undefined
      )
      return { op: operation.op, ok, detail: ok ? 'Задача отвязана' : 'Привязка не найдена' }
    }
    case 'createReward': {
      const reward = rewards.addReward({
        title: operation.title,
        description: operation.description,
        effect: operation.leaguePoints ? { leaguePoints: operation.leaguePoints } : undefined,
      })
      remember(refs, operation.ref, reward.id)
      return {
        op: operation.op,
        ok: true,
        detail: `Награда «${reward.title}»`,
        entity: entity('reward', reward.id, reward.title),
      }
    }
    case 'updateReward': {
      const updated = rewards.updateReward(resolveId(operation.id, refs), {
        title: operation.title,
        description: operation.description,
        effect:
          operation.leaguePoints === undefined
            ? undefined
            : { leaguePoints: operation.leaguePoints },
      })
      return {
        op: operation.op,
        ok: Boolean(updated),
        detail: updated ? `Награда «${updated.title}» обновлена` : 'Награда не найдена',
      }
    }
    case 'deleteReward': {
      const ok = rewards.deleteReward(resolveId(operation.id, refs))
      return { op: operation.op, ok, detail: ok ? 'Награда удалена' : 'Награда не найдена' }
    }
    case 'updateSettings': {
      applySettings(settings, operation.values)
      return { op: operation.op, ok: true, detail: 'Настройки обновлены' }
    }
    case 'updateProfile': {
      user.updateProfile({
        ...(operation.name ? { name: operation.name } : {}),
        ...(operation.bio ? { bio: operation.bio } : {}),
      })
      return { op: operation.op, ok: true, detail: 'Профиль обновлён' }
    }
    default:
      return { op: (operation as AiOperation).op, ok: false, detail: 'Неизвестное действие' }
  }
}
