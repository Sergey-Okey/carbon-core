<template>
  <div class="overall-progress">
    <h4>Общий прогресс XP</h4>
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

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    labels.push(d.toLocaleDateString('ru', { day: 'numeric', month: 'short' }))
    const progress = Math.min(
      1,
      (d.getTime() - startDate.getTime()) /
        (today.getTime() - startDate.getTime())
    )
    data.push(Math.floor(userStore.totalXP * progress))
  }

  return {
    labels,
    datasets: [
      {
        label: 'XP',
        data,
        borderColor: getCssVar('--accent'),
        backgroundColor: (context: any) => {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return getCssVar('--accent')
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          )
          gradient.addColorStop(0, getCssVar('--bg'))
          gradient.addColorStop(1, getCssVar('--accent'))
          return gradient
        },
        fill: true,
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
    },
  },
}
</script>

<style scoped lang="scss">
.overall-progress {
  height: 200px;
  margin-bottom: 24px;
  h4 {
    margin-bottom: 12px;
    color: var(--accent);
  }
}
</style>
