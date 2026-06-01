<template>
  <div class="health-indicator">
    <h4>Прогресс уровня</h4>
    <Doughnut :data="chartData" :options="chartOptions" />
    <div class="level-info">
      <span class="level-text">Уровень {{ userStore.level }}</span>
      <span class="tasks-text">{{ userStore.completedTasksCount }} задач</span>
    </div>
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
  labels: ['Прогресс', 'Осталось'],
  datasets: [
    {
      data: [userStore.levelProgressPercent, 100 - userStore.levelProgressPercent],
      backgroundColor: ['var(--accent)', 'var(--ui-border-color)'],
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
  height: 180px;
  h4 {
    margin-bottom: 8px;
    color: var(--accent);
  }
  
  .level-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    
    .level-text {
      font-weight: 600;
      font-size: 1.1rem;
      color: var(--accent);
    }
    
    .tasks-text {
      font-size: 0.85rem;
      color: var(--dim);
    }
  }
}
</style>
