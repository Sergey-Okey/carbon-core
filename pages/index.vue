<template>
  <div class="dashboard">
    <!-- Статистика (показывается на всех вкладках, кроме, возможно, доски) -->
    <section
      v-if="uiStore.activeNav !== 'board'"
      class="dashboard-section stats"
    >
      <GlassCard>
        <div class="stats-grid">
          <div class="stat">
            <Zap :size="20" />
            <span>Уровень {{ userStore.level }}</span>
            <ProgressBar
              :value="userStore.currentXP"
              :max="userStore.neededXPForNextLevel"
              height="6px"
            />
          </div>
          <div class="stat" :class="leagueClass">
            <component :is="leagueIcon" :size="20" />
            <span>{{ userStore.league }}</span>
          </div>
          <div class="stat">
            <Coins :size="20" />
            <span>{{ userStore.gold }} G</span>
          </div>
        </div>
      </GlassCard>
    </section>

    <!-- Контент в зависимости от активной вкладки -->
    <section class="dashboard-section content-section">
      <!-- Доска -->
      <BranchFlow v-if="uiStore.activeNav === 'board'" />

      <!-- Задачи (привычки + горизонты) -->
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

      <!-- Магазин -->
      <RewardList v-if="uiStore.activeNav === 'shop'" />

      <!-- Аналитика -->
      <AnalyticsPanel v-if="uiStore.activeNav === 'analytics'" />

      <!-- Настройки -->
      <SettingsPanel v-if="uiStore.activeNav === 'settings'" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '~/stores/user.store'
import { useUIStore } from '~/stores/ui.store'
import GlassCard from '~/components/base/GlassCard.vue'
import ProgressBar from '~/components/base/ProgressBar.vue'
import BranchFlow from '~/components/branch/BranchFlow.vue'
import TaskList from '~/components/task/TaskList.vue'
import RewardList from '~/components/shop/RewardList.vue'
import AnalyticsPanel from '~/components/analytics/AnalyticsPanel.vue'
import SettingsPanel from '~/components/settings/SettingsPanel.vue'
import { Zap, Coins, Medal, Award, Gem, Crown } from 'lucide-vue-next'

const userStore = useUserStore()
const uiStore = useUIStore()

const leagueIcon = computed(() => {
  const league = userStore.league
  if (league === 'Бронза') return Medal
  if (league === 'Серебро') return Award
  if (league === 'Золото') return Gem
  return Crown
})

const leagueClass = computed(() => userStore.league.toLowerCase())
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 80px; // для мобильного навбара
  @include desktop {
    padding-bottom: 0;
  }
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 0 150px;
  color: var(--accent);
}

.бронза {
  color: #cd7f32;
}
.серебро {
  color: #c0c0c0;
}
.золото {
  color: #ffd700;
}
.платина {
  color: #e5e4e2;
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
