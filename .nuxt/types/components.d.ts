
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

interface _GlobalComponents {
  AnalyticsPanel: typeof import("../../components/analytics/AnalyticsPanel.vue")['default']
  AnalyticsHealthIndicator: typeof import("../../components/analytics/HealthIndicator.vue")['default']
  AnalyticsOverallProgress: typeof import("../../components/analytics/OverallProgress.vue")['default']
  BaseGlassCard: typeof import("../../components/base/GlassCard.vue")['default']
  BaseIconWrapper: typeof import("../../components/base/IconWrapper.vue")['default']
  BaseProgressBar: typeof import("../../components/base/ProgressBar.vue")['default']
  BaseTheFooter: typeof import("../../components/base/TheFooter.vue")['default']
  BaseTheHeader: typeof import("../../components/base/TheHeader.vue")['default']
  BaseTheNavbar: typeof import("../../components/base/TheNavbar.vue")['default']
  BaseToastContainer: typeof import("../../components/base/ToastContainer.vue")['default']
  BranchBoardControls: typeof import("../../components/branch/BoardControls.vue")['default']
  BranchFlow: typeof import("../../components/branch/BranchFlow.vue")['default']
  BranchModal: typeof import("../../components/branch/BranchModal.vue")['default']
  BranchNode: typeof import("../../components/branch/BranchNode.vue")['default']
  BranchMilestoneModal: typeof import("../../components/branch/MilestoneModal.vue")['default']
  BranchNodeEditorModal: typeof import("../../components/branch/NodeEditorModal.vue")['default']
  DashboardStatsOverview: typeof import("../../components/dashboard/StatsOverview.vue")['default']
  ProfileModal: typeof import("../../components/profile/ProfileModal.vue")['default']
  QuestCard: typeof import("../../components/quest/QuestCard.vue")['default']
  QuestForm: typeof import("../../components/quest/QuestForm.vue")['default']
  QuestList: typeof import("../../components/quest/QuestList.vue")['default']
  SettingsAccentColorPicker: typeof import("../../components/settings/AccentColorPicker.vue")['default']
  SettingsDataManager: typeof import("../../components/settings/DataManager.vue")['default']
  SettingsPanel: typeof import("../../components/settings/SettingsPanel.vue")['default']
  ShopRewardCard: typeof import("../../components/shop/RewardCard.vue")['default']
  ShopRewardList: typeof import("../../components/shop/RewardList.vue")['default']
  TaskCard: typeof import("../../components/task/TaskCard.vue")['default']
  TaskForm: typeof import("../../components/task/TaskForm.vue")['default']
  TaskList: typeof import("../../components/task/TaskList.vue")['default']
  UiConfirmDialog: typeof import("../../components/ui/ConfirmDialog.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtImg: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  Motion: typeof import("@vueuse/motion")['MotionComponent']
  MotionGroup: typeof import("@vueuse/motion")['MotionGroupComponent']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyAnalyticsPanel: LazyComponent<typeof import("../../components/analytics/AnalyticsPanel.vue")['default']>
  LazyAnalyticsHealthIndicator: LazyComponent<typeof import("../../components/analytics/HealthIndicator.vue")['default']>
  LazyAnalyticsOverallProgress: LazyComponent<typeof import("../../components/analytics/OverallProgress.vue")['default']>
  LazyBaseGlassCard: LazyComponent<typeof import("../../components/base/GlassCard.vue")['default']>
  LazyBaseIconWrapper: LazyComponent<typeof import("../../components/base/IconWrapper.vue")['default']>
  LazyBaseProgressBar: LazyComponent<typeof import("../../components/base/ProgressBar.vue")['default']>
  LazyBaseTheFooter: LazyComponent<typeof import("../../components/base/TheFooter.vue")['default']>
  LazyBaseTheHeader: LazyComponent<typeof import("../../components/base/TheHeader.vue")['default']>
  LazyBaseTheNavbar: LazyComponent<typeof import("../../components/base/TheNavbar.vue")['default']>
  LazyBaseToastContainer: LazyComponent<typeof import("../../components/base/ToastContainer.vue")['default']>
  LazyBranchBoardControls: LazyComponent<typeof import("../../components/branch/BoardControls.vue")['default']>
  LazyBranchFlow: LazyComponent<typeof import("../../components/branch/BranchFlow.vue")['default']>
  LazyBranchModal: LazyComponent<typeof import("../../components/branch/BranchModal.vue")['default']>
  LazyBranchNode: LazyComponent<typeof import("../../components/branch/BranchNode.vue")['default']>
  LazyBranchMilestoneModal: LazyComponent<typeof import("../../components/branch/MilestoneModal.vue")['default']>
  LazyBranchNodeEditorModal: LazyComponent<typeof import("../../components/branch/NodeEditorModal.vue")['default']>
  LazyDashboardStatsOverview: LazyComponent<typeof import("../../components/dashboard/StatsOverview.vue")['default']>
  LazyProfileModal: LazyComponent<typeof import("../../components/profile/ProfileModal.vue")['default']>
  LazyQuestCard: LazyComponent<typeof import("../../components/quest/QuestCard.vue")['default']>
  LazyQuestForm: LazyComponent<typeof import("../../components/quest/QuestForm.vue")['default']>
  LazyQuestList: LazyComponent<typeof import("../../components/quest/QuestList.vue")['default']>
  LazySettingsAccentColorPicker: LazyComponent<typeof import("../../components/settings/AccentColorPicker.vue")['default']>
  LazySettingsDataManager: LazyComponent<typeof import("../../components/settings/DataManager.vue")['default']>
  LazySettingsPanel: LazyComponent<typeof import("../../components/settings/SettingsPanel.vue")['default']>
  LazyShopRewardCard: LazyComponent<typeof import("../../components/shop/RewardCard.vue")['default']>
  LazyShopRewardList: LazyComponent<typeof import("../../components/shop/RewardList.vue")['default']>
  LazyTaskCard: LazyComponent<typeof import("../../components/task/TaskCard.vue")['default']>
  LazyTaskForm: LazyComponent<typeof import("../../components/task/TaskForm.vue")['default']>
  LazyTaskList: LazyComponent<typeof import("../../components/task/TaskList.vue")['default']>
  LazyUiConfirmDialog: LazyComponent<typeof import("../../components/ui/ConfirmDialog.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyMotion: LazyComponent<typeof import("@vueuse/motion")['MotionComponent']>
  LazyMotionGroup: LazyComponent<typeof import("@vueuse/motion")['MotionGroupComponent']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
