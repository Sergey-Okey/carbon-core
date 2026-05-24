<template>
  <div class="stats-bar">
    <!-- Уровень и точки прогресса -->
    <div class="stat-item">
      <div class="stat-item__header">
        <Zap :size="18" />
        <span>Ур. {{ userStore.level }}</span>
      </div>
      <div class="stat-item__body">
        <div class="dot-track">
          <div
            v-for="i in 20"
            :key="'lvl-' + i"
            class="dot"
            :class="{ 'dot--active': i <= filledLevelDots }"
          />
        </div>
        <span class="stat-item__progress">
          {{ userStore.currentProgress }}/{{ tasksNeededForNextLevel }}
        </span>
      </div>
    </div>

    <!-- Лига и точки прогресса -->
    <div class="stat-item">
      <div class="stat-item__header">
        <component :is="leagueIcon" :size="18" :class="leagueClass" />
        <span>{{ userStore.league }}</span>
      </div>
      <div class="stat-item__body">
        <div class="dot-track">
          <div
            v-for="i in 20"
            :key="'lg-' + i"
            class="dot"
            :class="{ 'dot--active': i <= filledLeagueDots }"
          />
        </div>
        <span class="stat-item__progress">{{ leagueProgressPercent }}%</span>
      </div>
    </div>

    <!-- Мини-график активности (тонкий, с подписями дней) -->
    <div class="stat-item stat-item--chart">
      <div class="chart-summary">
        <span>Активность</span>
      </div>
      <div class="mini-chart">
        <svg class="line-chart" viewBox="0 0 140 42" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="statsLineGradient" x1="0" y1="0" x2="140" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="var(--dim)" stop-opacity="0.35" />
              <stop offset="52%" stop-color="var(--accent)" stop-opacity="0.95" />
              <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.55" />
            </linearGradient>
            <linearGradient id="statsAreaGradient" x1="0" y1="4" x2="0" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.22" />
              <stop offset="54%" stop-color="var(--accent)" stop-opacity="0.08" />
              <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path class="line-chart__area" :d="lineAreaPath" />
          <path class="line-chart__line" :d="linePath" />
          <g
            v-for="point in linePointItems"
            :key="point.key"
            class="line-chart__hit"
          >
            <title>{{ point.label }}: {{ point.count }} задач закрыто</title>
            <line
              class="line-chart__hover-line"
              :x1="point.x"
              :x2="point.x"
              y1="5"
              y2="39"
            />
            <circle
              class="line-chart__point"
              :class="{ 'line-chart__point--today': point.isToday }"
              :cx="point.x"
              :cy="point.y"
              r="1.15"
            />
            <circle
              class="line-chart__hit-area"
              :cx="point.x"
              :cy="point.y"
              r="9"
            />
          </g>
        </svg>
        <div class="chart-labels">
          <span
            v-for="day in weeklyChart"
            :key="day.date"
            :class="{ active: day.isToday }"
          >
            {{ day.shortLabel }}
          </span>
        </div>
      </div>
    </div>

    <!-- Счётчики задач -->
    <div class="stat-item stat-item--tasks">
      <div class="stat-item__body">
        <div class="task-counters">
          <div
            class="task-counter"
            :class="{ 'task-counter--done': completed.day === 3 }"
          >
            <span class="task-counter__label">Д</span>
            <span class="task-counter__value">{{ completed.day }}/3</span>
          </div>
          <div
            class="task-counter"
            :class="{ 'task-counter--done': completed.week === 3 }"
          >
            <span class="task-counter__label">Н</span>
            <span class="task-counter__value">{{ completed.week }}/3</span>
          </div>
          <div
            class="task-counter"
            :class="{ 'task-counter--done': completed.month === 3 }"
          >
            <span class="task-counter__label">М</span>
            <span class="task-counter__value">{{ completed.month }}/3</span>
          </div>
          <div
            class="task-counter"
            :class="{ 'task-counter--done': completed.year === 3 }"
          >
            <span class="task-counter__label">Г</span>
            <span class="task-counter__value">{{ completed.year }}/3</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Zap, Medal, Award, Gem, Crown } from 'lucide-vue-next'
import { useUserStore } from '~/stores/user.store'
import { useTasksStore } from '~/stores/tasks.store'
import type { Task } from '~/types/task.types'

const userStore = useUserStore()
const tasksStore = useTasksStore()

const tasksNeededForNextLevel = computed(() => {
  const val = userStore.tasksForNextLevel
  return typeof val === 'number' && Number.isFinite(val) && val > 0 ? val : 10
})

const filledLevelDots = computed(() => {
  const total = tasksNeededForNextLevel.value
  if (total <= 0) return 0
  return Math.min(20, Math.floor((userStore.currentProgress / total) * 20))
})

const leagueProgressPercent = computed(() => {
  const points = userStore.leaguePoints
  if (points < 1000) return Math.floor((points / 1000) * 100)
  if (points < 3000) return Math.floor(((points - 1000) / 2000) * 100)
  if (points < 6000) return Math.floor(((points - 3000) / 3000) * 100)
  return 100
})

const filledLeagueDots = computed(() => {
  return Math.floor((leagueProgressPercent.value / 100) * 20)
})

const leagueIcon = computed(() => {
  const league = userStore.league
  if (league === 'Бронза') return Medal
  if (league === 'Серебро') return Award
  if (league === 'Золото') return Gem
  return Crown
})

const leagueClass = computed(() => userStore.league.toLowerCase())

const completed = computed(() => {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const isInPeriod = (completedAt: number, start: Date) => {
    return new Date(completedAt) >= start
  }

  return {
    day: countCompletedTasks('TASK_DAY', startOfDay, isInPeriod),
    week: countCompletedTasks('TASK_WEEK', startOfWeek, isInPeriod),
    month: countCompletedTasks('TASK_MONTH', startOfMonth, isInPeriod),
    year: countCompletedTasks('TASK_YEAR', startOfYear, isInPeriod),
  }
})

const weeklyChart = computed(() => {
  const days = []
  const today = new Date()
  const todayKey = toDateKey(today)
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  const fullDayNames = [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
  ]

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = toDateKey(d)
    const count = tasksStore.tasks.filter((t: Task) => {
      if (!t.done || !t.completedAt) return false
      const completedDate = toDateKey(new Date(t.completedAt))
      return completedDate === dateStr
    }).length

    days.push({
      date: dateStr,
      label: fullDayNames[d.getDay()],
      shortLabel: dayNames[d.getDay()],
      count,
      isToday: dateStr === todayKey,
    })
  }
  return days
})

const maxChartCount = computed(() => {
  const max = Math.max(...weeklyChart.value.map((d) => d.count), 1)
  return max
})

const linePointItems = computed(() => {
  const width = 140
  const height = 42
  const horizontalPadding = 3
  const topPadding = 5
  const bottomPadding = 7
  const drawableHeight = height - topPadding - bottomPadding
  const step = (width - horizontalPadding * 2) / Math.max(weeklyChart.value.length - 1, 1)

  return weeklyChart.value.map((day, index) => {
    const normalized = maxChartCount.value > 0 ? day.count / maxChartCount.value : 0
    const y = height - bottomPadding - normalized * drawableHeight

    return {
      key: day.date,
      x: horizontalPadding + step * index,
      y: Math.max(topPadding, Math.min(height - bottomPadding, y)),
      count: day.count,
      label: day.label,
      isToday: day.isToday,
    }
  })
})

const linePath = computed(() => createLinePath(linePointItems.value))

const lineAreaPath = computed(() => {
  const points = linePointItems.value
  if (!points.length) return ''

  const baseline = 39
  const first = points[0]
  const last = points[points.length - 1]
  const line = points.map((point) => `L ${point.x} ${point.y}`).join(' ')
  return `M ${first.x} ${baseline} ${line} L ${last.x} ${baseline} Z`
})

function createLinePath(points: Array<{ x: number; y: number }>, includeMove = true) {
  if (!points.length) return ''
  return points
    .map((point, index) => `${index === 0 && includeMove ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
}

function countCompletedTasks(
  type: Task['type'],
  start: Date,
  isInPeriod: (completedAt: number, start: Date) => boolean
) {
  return tasksStore.tasks.filter(
    (task: Task) =>
      task.type === type &&
      task.done &&
      task.completedAt &&
      isInPeriod(task.completedAt, start)
  ).length
}

function toDateKey(date: Date) {
  return date.toISOString().split('T')[0]
}
</script>

<style scoped lang="scss">
.stats-bar {
  display: grid;
  align-items: center;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  @include glass;
  border-radius: var(--border-radius-lg);
  padding: 12px 18px;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 78%, transparent);
  box-shadow: var(--shadow-sm);

  @include mobile {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding: 12px;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  justify-content: flex-end;
  align-items: flex-start;
  min-width: 0;
  height: 100%;
  padding-inline: 2px;
  animation: stats-item-in 360ms ease-out both;

  @for $i from 1 through 4 {
    &:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * 45}ms;
    }
  }

  @include mobile {
    width: 100%;
    align-items: stretch;
  }

  &--tasks {
    @include mobile {
      margin-left: 0;
    }
  }

  &--chart {
    @include mobile {
      grid-column: 1 / -1;
      align-items: stretch;
    }
  }
}

.stat-item__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  font-size: 0.86rem;
  color: var(--accent);

  svg {
    color: var(--dim);
  }
}

.stat-item__body {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  @include mobile {
    justify-content: center;
  }
}

.dot-track {
  display: grid;
  grid-template-columns: repeat(20, minmax(2px, 1fr));
  flex: 1;
  gap: 2px;
  min-width: 0;
}

.dot {
  width: min(100%, 5px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: color-mix(in srgb, var(--border) 82%, transparent);
  transition: background var(--transition-standard);
  justify-self: center;

  &--active {
    background: var(--accent);
    box-shadow: 0 0 4px rgba(var(--accent-rgb), 0.28);
  }
}

.stat-item__progress {
  min-width: max-content;
  font-size: 0.76rem;
  font-weight: 500;
  color: var(--dim);
  margin-left: 4px;
}

.task-counters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  width: 100%;
  min-width: 0;

  @include mobile {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-content: stretch;
  }
}

.task-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  min-height: 27px;
  padding: 3px 6px;
  border-radius: var(--border-radius-md);
  background: color-mix(in srgb, var(--surface) 56%, transparent);
  border: 1px solid var(--border);
  font-size: 0.8rem;
  color: var(--accent);
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    color var(--transition-standard);

  &--done {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--bg);
  }
}

.task-counter__label {
  min-width: 0;
  font-weight: 600;
}

.task-counter__value {
  min-width: 0;
  font-weight: 500;
}

.mini-chart {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  min-height: 48px;
  animation: chart-fade-in 420ms ease-out both;

  @include mobile {
    min-height: 52px;
  }
}

.chart-summary {
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: var(--dim);
  font-size: 0.7rem;
  font-weight: 500;

  strong {
    color: var(--accent);
    font-size: 0.78rem;
    font-weight: 600;
  }

  @include mobile {
    justify-content: center;
  }
}

.line-chart {
  width: 92%;
  height: 30px;
  margin: 0 auto;
  overflow: visible;
}

.line-chart__area {
  fill: url('#statsAreaGradient');
  stroke: none;
}

.line-chart__line {
  fill: none;
  stroke: url('#statsLineGradient');
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.15;
  filter: drop-shadow(0 0 2px rgba(var(--accent-rgb), 0.12));
  stroke-dasharray: 180;
  stroke-dashoffset: 180;
  animation: chart-line-in 520ms ease-out both;
}

.line-chart__hit {
  cursor: default;

  &:hover {
    .line-chart__hover-line {
      opacity: 1;
    }

    .line-chart__point {
      opacity: 1;
      stroke-width: 1.1;
    }
  }
}

.line-chart__hover-line {
  stroke: color-mix(in srgb, var(--accent) 28%, transparent);
  stroke-width: 0.7;
  opacity: 0;
  transition: opacity var(--transition-standard);
}

.line-chart__point {
  fill: var(--accent);
  stroke: var(--accent);
  stroke-width: 0;
  opacity: 0.62;
  transition:
    opacity var(--transition-standard),
    r var(--transition-standard);

  &--today {
    fill: var(--accent);
    opacity: 1;
  }
}

.line-chart__hit-area {
  fill: rgba(var(--accent-rgb), 0.001);
  stroke: transparent;
  pointer-events: all;
}

.chart-labels {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--dim);
  text-align: center;

  .active {
    color: var(--accent);
  }
}

@media (max-width: 520px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }

  .stat-item--chart {
    grid-column: auto;
  }
}

.бронза {
  color: var(--bronze);
}
.серебро {
  color: var(--silver);
}
.золото {
  color: var(--gold);
}
.платина {
  color: var(--platinum);
}

@keyframes chart-line-in {
  from {
    stroke-dashoffset: 180;
  }

  to {
    stroke-dashoffset: 0;
  }
}

@keyframes chart-fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes stats-item-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stat-item {
    animation: none;
  }

  .mini-chart,
  .line-chart__line {
    animation: none;
  }
}
</style>
