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
      <div class="mini-chart">
        <div
          v-for="(day, idx) in weeklyChart"
          :key="idx"
          class="chart-column"
          :title="`${day.label}: ${day.count} задач`"
        >
          <div
            class="chart-column__bar"
            :style="{
              height:
                day.count > 0
                  ? Math.max(2, (day.count / maxChartCount) * 20) + 'px'
                  : '2px',
            }"
            :class="{ 'chart-column__bar--empty': day.count === 0 }"
          ></div>
          <div
            class="chart-column__dot"
            :class="{ 'chart-column__dot--active': day.count > 0 }"
          ></div>
          <span class="chart-column__label">{{ day.shortLabel }}</span>
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
  return typeof val === 'number' && !isNaN(val) ? val : 10
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
  const today = now.toISOString().split('T')[0]
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  startOfWeek.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const isInPeriod = (completedAt: number, start: Date) => {
    return new Date(completedAt) >= start
  }

  return {
    day: tasksStore.tasks.filter(
      (t: Task) =>
        t.type === 'TASK_DAY' &&
        t.done &&
        t.completedAt &&
        isInPeriod(t.completedAt, new Date(today))
    ).length,
    week: tasksStore.tasks.filter(
      (t: Task) =>
        t.type === 'TASK_WEEK' &&
        t.done &&
        t.completedAt &&
        isInPeriod(t.completedAt, startOfWeek)
    ).length,
    month: tasksStore.tasks.filter(
      (t: Task) =>
        t.type === 'TASK_MONTH' &&
        t.done &&
        t.completedAt &&
        isInPeriod(t.completedAt, startOfMonth)
    ).length,
    year: tasksStore.tasks.filter(
      (t: Task) =>
        t.type === 'TASK_YEAR' &&
        t.done &&
        t.completedAt &&
        isInPeriod(t.completedAt, startOfYear)
    ).length,
  }
})

const weeklyChart = computed(() => {
  const days = []
  const today = new Date()
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
    const dateStr = d.toISOString().split('T')[0]
    const count = tasksStore.tasks.filter((t: Task) => {
      if (!t.done || !t.completedAt) return false
      const completedDate = new Date(t.completedAt).toISOString().split('T')[0]
      return completedDate === dateStr
    }).length

    days.push({
      label: fullDayNames[d.getDay()],
      shortLabel: dayNames[d.getDay()],
      count,
    })
  }
  return days
})

const maxChartCount = computed(() => {
  const max = Math.max(...weeklyChart.value.map((d: any) => d.count), 1)
  return max
})
</script>

<style scoped lang="scss">
.stats-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
  @include glass;
  border-radius: var(--border-radius-lg);
  padding: 14px 22px;
  border: 1px solid var(--border);
  background: var(--surface);

  @include mobile {
    gap: 14px;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
  align-items: flex-start;

  @include mobile {
    width: 100%;
    align-items: stretch;
  }

  &--tasks {
    margin-left: auto;
    @include mobile {
      margin-left: 0;
    }
  }

  &--chart {
    flex: 1;
    margin: 0 8px;
    @include mobile {
      flex: auto;
      margin: 0;
      align-items: stretch;
    }
  }
}

.stat-item__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--accent);

  svg {
    color: var(--dim);
  }
}

.stat-item__body {
  display: flex;
  align-items: center;
  gap: 8px;

  @include mobile {
    justify-content: center;
  }
}

.dot-track {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--border);
  transition: background var(--transition-standard);

  &--active {
    background: var(--accent);
    box-shadow: 0 0 5px rgba(var(--accent-rgb), 0.4);
  }
}

.stat-item__progress {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--dim);
  margin-left: 4px;
}

.task-counters {
  display: flex;
  gap: 10px;

  @include mobile {
    justify-content: center;
    flex-wrap: wrap;
  }
}

.task-counter {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 0.85rem;
  color: var(--accent);
  transition: all var(--transition-standard);

  &--done {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--bg);
  }
}

.task-counter__label {
  font-weight: 600;
}

.task-counter__value {
  font-weight: 500;
}

.mini-chart {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;

  @include mobile {
    gap: 6px;
    align-items: flex-start;
  }
}

.chart-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.chart-column__bar {
  width: 4px;
  min-height: 2px;
  border-radius: 2px;
  background: var(--accent);
  opacity: 0.55;
  transition:
    height 0.3s ease,
    opacity 0.2s;

  @include mobile {
    width: 100%;
    max-width: 24px;
  }

  &--empty {
    background: var(--border);
    opacity: 0.35;
  }
}

.chart-column__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--border);
  transition: background var(--transition-standard);

  &--active {
    background: var(--accent);
    box-shadow: 0 0 5px rgba(var(--accent-rgb), 0.4);
  }
}

.chart-column__label {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--dim);
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
</style>
