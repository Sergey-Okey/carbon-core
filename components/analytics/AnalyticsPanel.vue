<template>
  <GlassCard>
    <h3>Аналитика</h3>
    <OverallProgress />
    <TasksChart />
    <LevelChart />
    <CoinsChart />
    <TaskTypesChart />
    <HealthIndicator />
  </GlassCard>
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
