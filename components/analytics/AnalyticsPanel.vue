<template>
  <GlassCard>
    <h3>Аналитика</h3>
    <OverallProgress />
    <HealthIndicator />
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '~/components/base/GlassCard.vue'
import OverallProgress from './OverallProgress.vue'
import HealthIndicator from './HealthIndicator.vue'
</script>
