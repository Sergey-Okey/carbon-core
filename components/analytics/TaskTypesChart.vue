<template>
  <div class="task-types-chart">
    <h4>Задачи по типам</h4>
    <Doughnut :data="chartData" :options="chartOptions" />
    <div class="task-stats">
      <div class="stat-item">
        <span>Привычки:</span>
        <strong>{{ habitsCount }}</strong>
      </div>
      <div class="stat-item">
        <span>Сегодня:</span>
        <strong>{{ todayTasksCount }}</strong>
      </div>
      <div class="stat-item">
        <span>Неделя:</span>
        <strong>{{ weekTasksCount }}</strong>
      </div>
      <div class="stat-item">
        <span>Месяц:</span>
        <strong>{{ monthTasksCount }}</strong>
      </div>
      <div class="stat-item">
        <span>Год:</span>
        <strong>{{ yearTasksCount }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useTasksStore } from '~/stores/tasks.store'

ChartJS.register(ArcElement, Tooltip, Legend)

const tasksStore = useTasksStore()

function getCssVar(name: string): string {
  if (typeof document === 'undefined') return '#d6d6d6'
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    '#d6d6d6'
  )
}

const habitsCount = computed(
  () => tasksStore.tasks.filter((t) => t.type === 'HABIT').length
)
const todayTasksCount = computed(
  () => tasksStore.tasks.filter((t) => t.type === 'TASK_DAY').length
)
const weekTasksCount = computed(
  () => tasksStore.tasks.filter((t) => t.type === 'TASK_WEEK').length
)
const monthTasksCount = computed(
  () => tasksStore.tasks.filter((t) => t.type === 'TASK_MONTH').length
)
const yearTasksCount = computed(
  () => tasksStore.tasks.filter((t) => t.type === 'TASK_YEAR').length
)

const chartData = computed(() => ({
  labels: ['Привычки', 'Сегодня', 'Неделя', 'Месяц', 'Год'],
  datasets: [
    {
      data: [
        habitsCount.value,
        todayTasksCount.value,
        weekTasksCount.value,
        monthTasksCount.value,
        yearTasksCount.value,
      ],
      backgroundColor: [
        getCssVar('--accent'),
        getCssVar('--success'),
        getCssVar('--warning'),
        getCssVar('--error'),
        getCssVar('--info'),
      ],
      borderWidth: 0,
    },
  ],
}))

const chartOptions = {
  cutout: '60%',
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
}
</script>

<style scoped lang="scss">
.task-types-chart {
  height: 250px;
  margin-bottom: 24px;
  h4 {
    margin-bottom: 12px;
    color: var(--text);
  }

  .task-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-top: 16px;

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--glass-surface);
      border: var(--ui-border);
      border-radius: var(--border-radius-lg);
      font-size: 0.85rem;

      span {
        color: var(--dim);
      }

      strong {
        color: var(--text);
      }
    }
  }
}
</style>
