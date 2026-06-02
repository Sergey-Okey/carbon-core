<template>
  <div class="coins-chart">
    <h4>Монеты по дням</h4>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useUserStore } from '~/stores/user.store'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

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

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    labels.push(d.toLocaleDateString('ru', { day: 'numeric', month: 'short' }))
    const dateStr = d.toISOString().split('T')[0]
    const history = userStore.coinsHistory.find((h) => h.date === dateStr)
    data.push(history ? history.coins : 0)
  }

  return {
    labels,
    datasets: [
      {
        label: 'Монеты',
        data,
        backgroundColor: getCssVar('--success'),
        borderColor: getCssVar('--success'),
        borderWidth: 1,
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
    },
  },
}
</script>

<style scoped lang="scss">
.coins-chart {
  height: 200px;
  margin-bottom: 24px;
  h4 {
    margin-bottom: 12px;
    color: var(--text);
  }
}
</style>
