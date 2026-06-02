<template>
  <div class="analytics-page">
    <div class="analytics-head">
      <h3>Аналитика</h3>
    </div>

    <div class="analytics-grid">
      <GlassCard class="analytics-card">
        <OverallProgress />
      </GlassCard>
      <GlassCard class="analytics-card">
        <TasksChart />
      </GlassCard>
      <GlassCard class="analytics-card">
        <LevelChart />
      </GlassCard>
      <GlassCard class="analytics-card">
        <CoinsChart />
      </GlassCard>
      <GlassCard class="analytics-card analytics-card--wide">
        <TaskTypesChart />
      </GlassCard>
      <GlassCard class="analytics-card">
        <HealthIndicator />
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import GlassCard from '~/components/base/GlassCard.vue'
import OverallProgress from './OverallProgress.vue'
import TasksChart from './TasksChart.vue'
import LevelChart from './LevelChart.vue'
import CoinsChart from './CoinsChart.vue'
import TaskTypesChart from './TaskTypesChart.vue'
import HealthIndicator from './HealthIndicator.vue'
</script>

<style scoped lang="scss">
.analytics-page {
  display: grid;
  gap: 18px;
}

.analytics-head {
  @include glass;
  padding: 18px 20px;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);

  h3 {
    margin: 0;
    color: var(--text);
    font-size: 1.2rem;
    font-weight: 600;
  }
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.analytics-card {
  border: var(--ui-border);

  &--wide {
    @include desktop {
      grid-column: span 2;
    }
  }
}
</style>
