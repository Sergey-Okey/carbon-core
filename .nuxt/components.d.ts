
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T


export const AnalyticsPanel: typeof import("../components/analytics/AnalyticsPanel.vue")['default']
export const AnalyticsHealthIndicator: typeof import("../components/analytics/HealthIndicator.vue")['default']
export const AnalyticsOverallProgress: typeof import("../components/analytics/OverallProgress.vue")['default']
export const AuthPanel: typeof import("../components/auth/AuthPanel.vue")['default']
export const BaseGlassCard: typeof import("../components/base/GlassCard.vue")['default']
export const BaseIconWrapper: typeof import("../components/base/IconWrapper.vue")['default']
export const BaseProgressBar: typeof import("../components/base/ProgressBar.vue")['default']
export const BaseTheFooter: typeof import("../components/base/TheFooter.vue")['default']
export const BaseTheHeader: typeof import("../components/base/TheHeader.vue")['default']
export const BaseTheNavbar: typeof import("../components/base/TheNavbar.vue")['default']
export const BaseToastContainer: typeof import("../components/base/ToastContainer.vue")['default']
export const BranchBoardControls: typeof import("../components/branch/BoardControls.vue")['default']
export const BranchFlow: typeof import("../components/branch/BranchFlow.vue")['default']
export const BranchModal: typeof import("../components/branch/BranchModal.vue")['default']
export const BranchNode: typeof import("../components/branch/BranchNode.vue")['default']
export const BranchMilestoneModal: typeof import("../components/branch/MilestoneModal.vue")['default']
export const BranchNodeEditorModal: typeof import("../components/branch/NodeEditorModal.vue")['default']
export const DashboardStatsOverview: typeof import("../components/dashboard/StatsOverview.vue")['default']
export const ProfileModal: typeof import("../components/profile/ProfileModal.vue")['default']
export const ProfilePanel: typeof import("../components/profile/ProfilePanel.vue")['default']
export const QuestCard: typeof import("../components/quest/QuestCard.vue")['default']
export const QuestForm: typeof import("../components/quest/QuestForm.vue")['default']
export const QuestList: typeof import("../components/quest/QuestList.vue")['default']
export const SettingsDataManager: typeof import("../components/settings/DataManager.vue")['default']
export const SettingsPanel: typeof import("../components/settings/SettingsPanel.vue")['default']
export const ShopRewardCard: typeof import("../components/shop/RewardCard.vue")['default']
export const ShopRewardList: typeof import("../components/shop/RewardList.vue")['default']
export const TaskCard: typeof import("../components/task/TaskCard.vue")['default']
export const TaskForm: typeof import("../components/task/TaskForm.vue")['default']
export const TaskList: typeof import("../components/task/TaskList.vue")['default']
export const UiConfirmDialog: typeof import("../components/ui/ConfirmDialog.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const Motion: typeof import("@vueuse/motion")['MotionComponent']
export const MotionGroup: typeof import("@vueuse/motion")['MotionGroupComponent']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyAnalyticsPanel: LazyComponent<typeof import("../components/analytics/AnalyticsPanel.vue")['default']>
export const LazyAnalyticsHealthIndicator: LazyComponent<typeof import("../components/analytics/HealthIndicator.vue")['default']>
export const LazyAnalyticsOverallProgress: LazyComponent<typeof import("../components/analytics/OverallProgress.vue")['default']>
export const LazyAuthPanel: LazyComponent<typeof import("../components/auth/AuthPanel.vue")['default']>
export const LazyBaseGlassCard: LazyComponent<typeof import("../components/base/GlassCard.vue")['default']>
export const LazyBaseIconWrapper: LazyComponent<typeof import("../components/base/IconWrapper.vue")['default']>
export const LazyBaseProgressBar: LazyComponent<typeof import("../components/base/ProgressBar.vue")['default']>
export const LazyBaseTheFooter: LazyComponent<typeof import("../components/base/TheFooter.vue")['default']>
export const LazyBaseTheHeader: LazyComponent<typeof import("../components/base/TheHeader.vue")['default']>
export const LazyBaseTheNavbar: LazyComponent<typeof import("../components/base/TheNavbar.vue")['default']>
export const LazyBaseToastContainer: LazyComponent<typeof import("../components/base/ToastContainer.vue")['default']>
export const LazyBranchBoardControls: LazyComponent<typeof import("../components/branch/BoardControls.vue")['default']>
export const LazyBranchFlow: LazyComponent<typeof import("../components/branch/BranchFlow.vue")['default']>
export const LazyBranchModal: LazyComponent<typeof import("../components/branch/BranchModal.vue")['default']>
export const LazyBranchNode: LazyComponent<typeof import("../components/branch/BranchNode.vue")['default']>
export const LazyBranchMilestoneModal: LazyComponent<typeof import("../components/branch/MilestoneModal.vue")['default']>
export const LazyBranchNodeEditorModal: LazyComponent<typeof import("../components/branch/NodeEditorModal.vue")['default']>
export const LazyDashboardStatsOverview: LazyComponent<typeof import("../components/dashboard/StatsOverview.vue")['default']>
export const LazyProfileModal: LazyComponent<typeof import("../components/profile/ProfileModal.vue")['default']>
export const LazyProfilePanel: LazyComponent<typeof import("../components/profile/ProfilePanel.vue")['default']>
export const LazyQuestCard: LazyComponent<typeof import("../components/quest/QuestCard.vue")['default']>
export const LazyQuestForm: LazyComponent<typeof import("../components/quest/QuestForm.vue")['default']>
export const LazyQuestList: LazyComponent<typeof import("../components/quest/QuestList.vue")['default']>
export const LazySettingsDataManager: LazyComponent<typeof import("../components/settings/DataManager.vue")['default']>
export const LazySettingsPanel: LazyComponent<typeof import("../components/settings/SettingsPanel.vue")['default']>
export const LazyShopRewardCard: LazyComponent<typeof import("../components/shop/RewardCard.vue")['default']>
export const LazyShopRewardList: LazyComponent<typeof import("../components/shop/RewardList.vue")['default']>
export const LazyTaskCard: LazyComponent<typeof import("../components/task/TaskCard.vue")['default']>
export const LazyTaskForm: LazyComponent<typeof import("../components/task/TaskForm.vue")['default']>
export const LazyTaskList: LazyComponent<typeof import("../components/task/TaskList.vue")['default']>
export const LazyUiConfirmDialog: LazyComponent<typeof import("../components/ui/ConfirmDialog.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyMotion: LazyComponent<typeof import("@vueuse/motion")['MotionComponent']>
export const LazyMotionGroup: LazyComponent<typeof import("@vueuse/motion")['MotionGroupComponent']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
