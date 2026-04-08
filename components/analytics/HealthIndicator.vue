<template>
  <div class="health-indicator">
    <h4>Здоровье</h4>
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useUserStore } from '~/stores/user.store'

ChartJS.register(ArcElement, Tooltip, Legend)

const userStore = useUserStore()

const chartData = computed(() => ({
  labels: ['HP', 'Потеряно'],
  datasets: [
    {
      data: [userStore.hp, 100 - userStore.hp],
      backgroundColor: ['#FFFFFF', '#222222'],
      borderWidth: 0,
    },
  ],
}))

const chartOptions = {
  cutout: '70%',
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
}
</script>

<style scoped lang="scss">
.health-indicator {
  height: 150px;
  h4 {
    margin-bottom: 8px;
    color: var(--accent);
  }
}
</style>
