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
          {{ currentLevelProgress }}/{{ tasksNeededForNextLevel }}
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

    <!-- Активность за 7 дней -->
    <div class="stat-item stat-item--chart">
      <div class="chart-summary">
        <span>Активность</span>
      </div>
      <div class="mini-chart">
        <div class="activity-days">
          <button
            v-for="day in weeklyChart"
            :key="day.date"
            type="button"
            class="activity-day"
            :class="{ active: day.isToday, empty: day.count === 0 }"
            :title="`${day.label}: ${formatTaskCount(day.count)}`"
            :aria-label="`${day.label}: ${formatTaskCount(day.count)}`"
          >
            <span class="activity-track">
              <span
                class="activity-fill"
                :style="{ height: `${day.height}%` }"
              />
            </span>
            <span class="activity-label">{{ day.shortLabel }}</span>
            <span class="activity-tooltip">{{ formatTaskCount(day.count) }}</span>
          </button>
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
  const val = levelSize.value
  return typeof val === 'number' && Number.isFinite(val) && val > 0 ? val : 10
})

const levelSize = computed(() => {
  const currentLevelStart = Math.max(0, (userStore.level - 1) * 20)
  const nextLevelStart = userStore.level * 20
  return Math.max(1, nextLevelStart - currentLevelStart)
})

const currentLevelProgress = computed(() => {
  const currentLevelStart = Math.max(0, (userStore.level - 1) * 20)
  return Math.max(0, userStore.completedTasksCount - currentLevelStart)
})

const filledLevelDots = computed(() => {
  const total = tasksNeededForNextLevel.value
  if (total <= 0) return 0
  return Math.min(20, Math.floor((currentLevelProgress.value / total) * 20))
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

const leagueClass = computed(() => {
  const map: Record<string, string> = {
    Бронза: 'league-bronze',
    Серебро: 'league-silver',
    Золото: 'league-gold',
    Платина: 'league-platinum',
  }
  return map[userStore.league] ?? 'league-bronze'
})

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
  const days: Array<{
    date: string
    label: string
    shortLabel: string
    count: number
    isToday: boolean
    height: number
  }> = []
  const today = new Date()
  const todayKey = toDateKey(today)
  const dayNames = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']
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
      height: 0,
    })
  }

  const max = Math.max(...days.map((day) => day.count), 1)
  return days.map((day) => {
    const normalized = day.count / max
    return {
      ...day,
      height: day.count === 0 ? 6 : Math.max(18, Math.round(normalized * 100)),
    }
  })
})

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
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTaskCount(count: number) {
  if (count === 1) return '1 задача закрыта'
  if (count > 1 && count < 5) return `${count} задачи закрыто`
  return `${count} задач закрыто`
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
  border: var(--ui-border);

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
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--ui-border-color) 82%, transparent);
  transition: background var(--transition-standard);
  justify-self: center;

  &--active {
    background: var(--accent);
    box-shadow: 0 0 4px color-mix(in srgb, var(--accent) 28%, transparent);
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
  border-radius: var(--border-radius-pill);
  background: var(--glass-surface);
  border: var(--ui-border);
  font-size: 0.8rem;
  color: var(--accent);
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    color var(--transition-standard);

  &--done {
    background: var(--accent);
    border-color: var(--ui-border-color);
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
  gap: 4px;
  width: 100%;
  min-height: 52px;
  animation: chart-fade-in 420ms ease-out both;

  @include mobile {
    min-height: 56px;
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

.activity-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: end;
  gap: 4px;
  width: 100%;
  min-height: 44px;
}

.activity-day {
  position: relative;
  display: grid;
  grid-template-rows: 30px auto;
  gap: 3px;
  justify-items: center;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--dim);
  cursor: default;
  font: inherit;

  &:hover,
  &:focus-visible {
    outline: none;

    .activity-track {
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }

    .activity-fill {
      opacity: 1;
      transform: scaleY(1.03);
    }

    .activity-tooltip {
      opacity: 1;
      transform: translate(-50%, -4px);
      visibility: visible;
    }
  }

  .active {
    color: var(--accent);
  }
}

.activity-day.active .activity-label {
  color: var(--accent);
}

.activity-track {
  position: relative;
  display: flex;
  align-items: end;
  justify-content: center;
  width: 100%;
  max-width: 10px;
  height: 30px;
  overflow: hidden;
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--ui-border-color) 38%, transparent);
}

.activity-fill {
  width: 100%;
  min-height: 2px;
  border-radius: inherit;
  background: var(--accent);
  opacity: 0.74;
  transform-origin: bottom;
  transition:
    height var(--transition-standard),
    opacity var(--transition-standard),
    transform var(--transition-standard);
}

.activity-day.empty .activity-fill {
  background: var(--ui-border-color);
}

.activity-label {
  font-size: 0.62rem;
  font-weight: 700;
  line-height: 1;
  color: var(--dim);
}

.activity-tooltip {
  @include glass;
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  z-index: 2;
  width: max-content;
  max-width: 150px;
  padding: 5px 8px;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 600;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 0);
  transition:
    opacity var(--transition-standard),
    transform var(--transition-standard),
    visibility var(--transition-standard);
  visibility: hidden;
}

@media (max-width: 520px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }

  .stat-item--chart {
    grid-column: auto;
  }
}

.league-bronze {
  color: var(--bronze);
}
.league-silver {
  color: var(--silver);
}
.league-gold {
  color: var(--gold);
}
.league-platinum {
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

  .mini-chart {
    animation: none;
  }
}
</style>
