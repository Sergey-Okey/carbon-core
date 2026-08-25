import { getBackendFetchOptions, getBackendUrl } from '~/utils/backend'
import { applyAiOperations } from '~/utils/ai/apply'
import { buildAiContext } from '~/utils/ai/context'
import { runLocalAgent } from '~/utils/ai/localAgent'
import { buildClientAiSnapshot } from '~/utils/ai/snapshot'
import {
  linksFromApplyResults,
  linksFromQuotedTitles,
  mergeAiLinks,
  stripPublicFallbackNotice,
} from '~/utils/ai/chat'
import type { AiActResponse, AiApplyResult, AiEntityRef } from '~/types/ai.types'
import { useAiStore } from '~/stores/ai.store'

function getHttpStatus(error: unknown) {
  if (typeof error !== 'object' || error === null) return 0
  const candidate = error as { statusCode?: unknown; status?: unknown }
  return Number(candidate.statusCode || candidate.status || 0)
}

function getHttpMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) return ''
  const candidate = error as { statusMessage?: unknown; message?: unknown }
  return String(candidate.statusMessage || candidate.message || '')
}

export function useAiAgent() {
  const tasksStore = useTasksStore()
  const branchesStore = useBranchesStore()
  const tagsStore = useTagsStore()
  const rewardsStore = useRewardsStore()
  const settingsStore = useSettingsStore()
  const userStore = useUserStore()
  const aiStore = useAiStore()
  const { error } = useNotification()
  const pending = computed(() => aiStore.pending)
  const lastResults = ref<AiApplyResult[]>([])
  const liveRequest = ref('')
  const liveError = ref('')

  function collectSnapshot() {
    return buildClientAiSnapshot({
      tasks: tasksStore.tasks as unknown as Array<Record<string, unknown>>,
      deletedTasks: tasksStore.deletedTasks as unknown as Array<Record<string, unknown>>,
      branches: branchesStore.branches as unknown as Array<Record<string, unknown>>,
      edges: branchesStore.edges as unknown as Array<Record<string, unknown>>,
      tags: tagsStore.tags as unknown as Array<Record<string, unknown>>,
      rewards: rewardsStore.rewards as unknown as Array<Record<string, unknown>>,
      progress: {
        name: userStore.profile.name,
        bio: userStore.profile.bio,
        level: userStore.level,
        league: userStore.league,
        leaguePoints: userStore.leaguePoints,
      },
      settings: {
        themeMode: settingsStore.themeMode,
        accentColor: settingsStore.accentColor,
        uiDensity: settingsStore.uiDensity,
        animationsEnabled: settingsStore.animationsEnabled,
        soundEnabled: settingsStore.soundEnabled,
        hapticsEnabled: settingsStore.hapticsEnabled,
        notificationsEnabled: settingsStore.notificationsEnabled,
        showTopStats: settingsStore.showTopStats,
        showSettingsStats: settingsStore.showSettingsStats,
        boardLayoutDensity: settingsStore.boardLayoutDensity,
        boardColumns: settingsStore.boardColumns,
        boardShowNodeTypes: settingsStore.boardShowNodeTypes,
      },
      memory: aiStore.memory,
    })
  }

  function extraTitleLinks(message: string): AiEntityRef[] {
    return linksFromQuotedTitles(message, {
      tasks: tasksStore.tasks.map((task) => ({ id: task.id, title: task.title })),
      branches: branchesStore.branches.map((branch) => ({
        id: branch.id,
        displayName: branch.displayName,
        milestones: (branch.milestones || []).map((milestone) => ({
          id: milestone.id,
          name: milestone.name,
        })),
      })),
    })
  }

  async function ask(request: string): Promise<boolean> {
    const text = request.trim()
    if (text.length < 2 || aiStore.pending) return false

    aiStore.setPending(true)
    lastResults.value = []
    liveRequest.value = text
    liveError.value = ''
    try {
      let payload: AiActResponse
      try {
        payload = await $fetch<AiActResponse>(getBackendUrl('/api/ai/act'), {
          method: 'POST',
          ...getBackendFetchOptions(),
          body: {
            request: text,
            context: collectSnapshot(),
          },
        })
      } catch (err) {
        if (getHttpStatus(err) !== 401) throw err
        payload = runLocalAgent(text, buildAiContext(collectSnapshot()))
      }
      const results = applyAiOperations(payload.operations)
      lastResults.value = results
      const applied = results.filter((item) => item.ok).map((item) => item.detail)
      const message = stripPublicFallbackNotice(payload.message)
      aiStore.remember({
        at: Date.now(),
        request: text,
        message,
        applied,
        links: mergeAiLinks(linksFromApplyResults(results), extraTitleLinks(message)),
      })
      liveRequest.value = ''
      return true
    } catch (err) {
      const status = getHttpStatus(err)
      if (status === 429) {
        liveError.value = 'Слишком много запросов. Подождите немного.'
      } else {
        liveError.value = getHttpMessage(err) || 'Не получилось выполнить запрос.'
      }
      error(liveError.value)
      return false
    } finally {
      aiStore.setPending(false)
    }
  }

  return {
    pending,
    lastResults,
    liveRequest,
    liveError,
    lastMessage: computed(() => aiStore.lastMessage),
    memory: computed(() => aiStore.memory),
    ask,
  }
}
