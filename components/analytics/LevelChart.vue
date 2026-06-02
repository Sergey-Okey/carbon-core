<template>
  <div class="level-chart">
    <h4>Прогресс уровня</h4>
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { useUserStore } from '~/stores/user.store'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const userStore = useUserStore()

function getCssVar(name: string): string {
  if (typeof document === 'undefined') return '#d6d6d6'
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    '#d6d6d6'
  )
}

const chartData = computed(() => {
  const labels: string[] = []
  const data: number[] = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 6)

  let cumulativeXP = 0
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    labels.push(d.toLocaleDateString('ru', { day: 'numeric', month: 'short' }))
    const dateStr = d.toISOString().split('T')[0]
    const history = userStore.xpHistory.find((h) => h.date === dateStr)
    if (history) {
      cumulativeXP += history.xp
    }
    // Calculate level based on cumulative XP
    const level = Math.floor(cumulativeXP / 100) + 1 // Simple level calculation
    data.push(level)
  }

  return {
    labels,
    datasets: [
      {
        label: 'Уровень',
        data,
        borderColor: getCssVar('--accent'),
        backgroundColor: getCssVar('--accent'),
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { color: getCssVar('--border') },
      ticks: { color: getCssVar('--dim') },
    },
    y: {
      grid: { color: getCssVar('--border') },
      ticks: { color: getCssVar('--dim') },
      beginAtZero: true,
    },
  },
}
</script>

<style scoped lang="scss">
.level-chart {
  height: 200px;
  margin-bottom: 24px;
  h4 {
    margin-bottom: 12px;
    color: var(--text);
  }
}
</style>
