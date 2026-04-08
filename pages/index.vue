<template>
  <div class="dashboard">
    <!-- Статистика -->
    <section class="dashboard-section stats">
      <GlassCard>
        <div class="stats-grid">
          <div class="stat">
            <TrendingUp :size="20" />
            <span>Уровень {{ userStore.level }}</span>
            <ProgressBar
              :value="userStore.currentXP"
              :max="userStore.neededXPForNextLevel"
              height="6px"
            />
          </div>
          <div class="stat">
            <Coins :size="20" />
            <span>{{ userStore.gold }} G</span>
          </div>
          <div class="stat">
            <Heart :size="20" />
            <span>{{ userStore.hp }} / 100</span>
            <ProgressBar :value="userStore.hp" :max="100" height="6px" />
          </div>
        </div>
      </GlassCard>
    </section>

    <!-- Контентная секция в зависимости от activeNav -->
    <section class="dashboard-section content-section">
      <BranchFlow v-if="uiStore.activeNav === 'board'" />
      <QuestList v-if="uiStore.activeNav === 'quests'" />
      <RewardList v-if="uiStore.activeNav === 'shop'" />
      <AnalyticsPanel v-if="uiStore.activeNav === 'analytics'" />
      <SettingsPanel v-if="uiStore.activeNav === 'settings'" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user.store'
import { useUIStore } from '~/stores/ui.store'
import GlassCard from '~/components/base/GlassCard.vue'
import ProgressBar from '~/components/base/ProgressBar.vue'
import BranchFlow from '~/components/branch/BranchFlow.vue'
import QuestList from '~/components/quest/QuestList.vue'
import RewardList from '~/components/shop/RewardList.vue'
import AnalyticsPanel from '~/components/analytics/AnalyticsPanel.vue'
import SettingsPanel from '~/components/settings/SettingsPanel.vue'
import { TrendingUp, Coins, Heart } from 'lucide-vue-next'

const userStore = useUserStore()
const uiStore = useUIStore()
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 80px; // отступ для мобильной нижней панели
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
  flex: 1 0 200px;
  color: var(--accent);
}
.content-section {
  min-height: 400px;
}
</style>
