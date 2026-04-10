<template>
  <div class="dashboard">
    <!-- Статистика (показывается на всех вкладках, кроме доски) -->
    <section
      v-if="uiStore.activeNav !== 'board'"
      class="dashboard-section stats"
    >
      <StatsOverview />
    </section>

    <!-- Контент в зависимости от активной вкладки -->
    <section class="dashboard-section content-section">
      <BranchFlow v-if="uiStore.activeNav === 'board'" />

      <div v-if="uiStore.activeNav === 'tasks'" class="tasks-dashboard">
        <TaskList task-type="HABITS" title="Привычки" default-type="HABIT" />
        <div class="horizons-grid">
          <TaskList
            task-type="TASK_DAY"
            title="Сегодня (макс. 3)"
            default-type="TASK_DAY"
          />
          <TaskList
            task-type="TASK_WEEK"
            title="Неделя (макс. 3)"
            default-type="TASK_WEEK"
          />
          <TaskList
            task-type="TASK_MONTH"
            title="Месяц (макс. 3)"
            default-type="TASK_MONTH"
          />
          <TaskList
            task-type="TASK_YEAR"
            title="Год (макс. 3)"
            default-type="TASK_YEAR"
          />
        </div>
      </div>

      <RewardList v-if="uiStore.activeNav === 'shop'" />
      <AnalyticsPanel v-if="uiStore.activeNav === 'analytics'" />
      <SettingsPanel v-if="uiStore.activeNav === 'settings'" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/ui.store'
import StatsOverview from '~/components/dashboard/StatsOverview.vue'
import BranchFlow from '~/components/branch/BranchFlow.vue'
import TaskList from '~/components/task/TaskList.vue'
import RewardList from '~/components/shop/RewardList.vue'
import AnalyticsPanel from '~/components/analytics/AnalyticsPanel.vue'
import SettingsPanel from '~/components/settings/SettingsPanel.vue'

const uiStore = useUIStore()
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 80px;
  @include desktop {
    padding-bottom: 0;
  }
}

.content-section {
  min-height: 400px;
}

.tasks-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.horizons-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  @include desktop {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
