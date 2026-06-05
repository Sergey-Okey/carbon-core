<template>
  <section class="analytics-page" aria-label="Аналитика">
    <header class="analytics-head">
      <div>
        <span class="eyebrow">System overview</span>
        <h3>Аналитика</h3>
      </div>
      <div class="head-meta">
        <span>{{ todayLabel }}</span>
        <strong>{{ totalCompletionRate }}%</strong>
      </div>
    </header>

    <div class="analytics-grid">
      <article class="metric-cell metric-cell--progress">
        <div class="cell-title">
          <span>Общий прогресс</span>
          <strong>{{ userStore.levelProgressPercent.toFixed(0) }}%</strong>
        </div>
        <div class="radial-wrap" aria-label="Прогресс уровня">
          <svg viewBox="0 0 160 160" class="radial-chart">
            <g>
              <line
                v-for="tick in radialTicks"
                :key="tick.index"
                x1="80"
                y1="20"
                x2="80"
                y2="34"
                :class="{ active: tick.active }"
                :transform="`rotate(${tick.angle} 80 80)`"
              />
            </g>
          </svg>
          <div class="radial-value">
            <strong>{{ userStore.level }}</strong>
            <span>уровень</span>
          </div>
        </div>
      </article>

      <article class="metric-cell metric-cell--wide">
        <div class="cell-title">
          <span>Пульс выполнения</span>
          <strong>{{ completedThisWeek }} задач</strong>
        </div>
        <div class="volume-bars" aria-label="Выполненные задачи за 14 дней">
          <span
            v-for="day in activitySeries"
            :key="day.date"
            :class="{ active: day.count > 0 }"
            :style="{ '--bar-level': `${Math.max(day.ratio * 100, day.count > 0 ? 14 : 4)}%` }"
            :title="`${day.label}: ${day.count}`"
          />
        </div>
        <div class="axis-row">
          <span>{{ activitySeries[0]?.label }}</span>
          <span>{{ activitySeries[activitySeries.length - 1]?.label }}</span>
        </div>
      </article>

      <article class="metric-cell metric-cell--resources">
        <div class="cell-title">
          <span>Ритм дня</span>
          <strong>{{ topProductiveHourLabel }}</strong>
        </div>
        <div class="resource-lines">
          <div>
            <span>Лучший час</span>
            <strong>{{ topProductiveHourLabel }}</strong>
          </div>
          <div>
            <span>Активных дней</span>
            <strong>{{ productiveDays }}</strong>
          </div>
          <div>
            <span>Завершений</span>
            <strong>{{ completionsLast14 }}</strong>
          </div>
        </div>
      </article>

      <article class="metric-cell metric-cell--speed">
        <div class="cell-title">
          <span>Скорость</span>
          <strong>{{ dailyAverage }}</strong>
        </div>
        <p class="big-number">{{ dailyAverage }}</p>
        <span class="muted">задач в день за последние 14 дней</span>
      </article>

      <article class="metric-cell metric-cell--trajectory">
        <div class="cell-title">
          <span>Продуктивные часы</span>
          <strong>{{ topProductiveHourLabel }}</strong>
        </div>
        <svg class="line-chart" viewBox="0 0 520 160" preserveAspectRatio="none" aria-label="Распределение продуктивности по часам">
          <polyline class="line-grid" points="0,40 520,40" />
          <polyline class="line-grid" points="0,80 520,80" />
          <polyline class="line-grid" points="0,120 520,120" />
          <polyline class="line-fill" :points="productiveAreaPoints" />
          <polyline class="line-path" :points="productiveLinePoints" />
          <circle
            v-for="point in productivePoints"
            :key="point.key"
            :cx="point.x"
            :cy="point.y"
            r="3"
          />
        </svg>
      </article>

      <article class="metric-cell metric-cell--types">
        <div class="cell-title">
          <span>Структура задач</span>
          <strong>{{ tasksStore.tasks.length }}</strong>
        </div>
        <div class="task-types">
          <div v-for="item in taskTypeStats" :key="item.key" class="type-row">
            <span>{{ item.label }}</span>
            <div class="type-track">
              <i :style="{ width: `${item.percent}%` }" />
            </div>
            <strong>{{ item.count }}</strong>
          </div>
        </div>
      </article>

      <article class="metric-cell metric-cell--status">
        <div class="cell-title">
          <span>Состояние</span>
          <strong>{{ activeTasks }}</strong>
        </div>
        <div class="status-stack">
          <span :style="{ '--size': `${completionShare.open}%` }">Активные {{ activeTasks }}</span>
          <span :style="{ '--size': `${completionShare.done}%` }">Готовые {{ completedTasks }}</span>
          <span :style="{ '--size': `${completionShare.habits}%` }">Привычки {{ habitsCount }}</span>
        </div>
      </article>

      <article class="metric-cell metric-cell--board">
        <div class="cell-title">
          <span>Карта веток</span>
          <strong>{{ branchesStore.branches.length }}</strong>
        </div>
        <div class="branch-map">
          <div v-for="branch in branchStats" :key="branch.id" class="branch-row">
            <span class="branch-name">{{ branch.name }}</span>
            <div class="branch-track">
              <i :style="{ width: `${branch.progress}%`, '--marker': branch.color }" />
            </div>
            <strong>{{ branch.done }}/{{ branch.total }}</strong>
          </div>
        </div>
      </article>

      <article class="metric-cell metric-cell--focus">
        <div class="cell-title">
          <span>Фокус</span>
          <strong>{{ focusLabel }}</strong>
        </div>
        <div class="focus-list">
          <span>Следующая задача: {{ nextTaskTitle }}</span>
          <span>Самая сильная ветка: {{ strongestBranch }}</span>
          <span>Незавершенных этапов: {{ pendingMilestones }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBranchesStore } from '~/stores/branches.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useUserStore } from '~/stores/user.store'
import type { TaskType } from '~/types/task.types'

const tasksStore = useTasksStore()
const userStore = useUserStore()
const branchesStore = useBranchesStore()

const taskTypeLabels: Record<TaskType, string> = {
  HABIT: 'Привычки',
  TASK_DAY: 'День',
  TASK_WEEK: 'Неделя',
  TASK_MONTH: 'Месяц',
  TASK_YEAR: 'Год',
  PURCHASE: 'Покупки',
}

const todayLabel = computed(() =>
  new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
)

const activeTasks = computed(() =>
  tasksStore.tasks.filter((task) => !task.done && task.type !== 'HABIT').length
)
const completedTasks = computed(() => tasksStore.tasks.filter((task) => task.done).length)
const habitsCount = computed(() => tasksStore.tasks.filter((task) => task.type === 'HABIT').length)

const totalCompletionRate = computed(() => {
  const actionable = tasksStore.tasks.filter((task) => task.type !== 'HABIT')
  if (!actionable.length) return 0
  return Math.round((actionable.filter((task) => task.done).length / actionable.length) * 100)
})

const activitySeries = computed(() => {
  const days = createDateRange(14)
  const max = Math.max(...tasksStore.completedTasksHistory.map((item) => item.count), 1)

  return days.map((date) => {
    const item = tasksStore.completedTasksHistory.find((history) => history.date === date.key)
    const count = item?.count ?? 0
    return {
      date: date.key,
      label: date.label,
      count,
      ratio: count / max,
    }
  })
})

const completedThisWeek = computed(() =>
  activitySeries.value.slice(-7).reduce((sum, day) => sum + day.count, 0)
)

const dailyAverage = computed(() => {
  const total = activitySeries.value.reduce((sum, day) => sum + day.count, 0)
  return (total / activitySeries.value.length).toFixed(1)
})

const completionEvents = computed(() =>
  tasksStore.tasks
    .flatMap((task) => {
      const events: number[] = []
      if (task.done && task.completedAt) events.push(task.completedAt)
      if (task.type === 'HABIT' && task.lastCompletedAt) events.push(task.lastCompletedAt)
      return events
    })
    .filter((timestamp) => timestamp >= Date.now() - 14 * 24 * 60 * 60 * 1000)
)

const productiveDays = computed(() => {
  const days = new Set(completionEvents.value.map((timestamp) => getLocalDateKey(new Date(timestamp))))
  return days.size
})

const completionsLast14 = computed(() => completionEvents.value.length)

const productiveHourSeries = computed(() => {
  const hours = Array.from({ length: 24 }, (_, hour) => ({
    key: `${hour}`,
    label: `${String(hour).padStart(2, '0')}:00`,
    value: 0,
  }))

  completionEvents.value.forEach((timestamp) => {
    hours[new Date(timestamp).getHours()].value += 1
  })

  return hours
})

const topProductiveHourLabel = computed(() => {
  const top = productiveHourSeries.value.reduce((best, item) =>
    item.value > best.value ? item : best
  )
  return top.value > 0 ? top.label : 'нет данных'
})

const productivePoints = computed(() => {
  const values = productiveHourSeries.value.map((item) => item.value)
  const max = Math.max(...values, 1)
  const step = 520 / Math.max(productiveHourSeries.value.length - 1, 1)

  return productiveHourSeries.value.map((item, index) => ({
    key: item.key,
    x: Math.round(index * step),
    y: Math.round(142 - (item.value / max) * 124),
  }))
})

const productiveLinePoints = computed(() =>
  productivePoints.value.map((point) => `${point.x},${point.y}`).join(' ')
)
const productiveAreaPoints = computed(() => {
  if (!productivePoints.value.length) return ''
  return `0,150 ${productiveLinePoints.value} 520,150`
})

const radialTicks = computed(() => {
  const active = Math.round((userStore.levelProgressPercent / 100) * 40)
  return Array.from({ length: 40 }, (_, index) => ({
    index,
    angle: index * 9,
    active: index < active,
  }))
})

const taskTypeStats = computed(() => {
  const total = Math.max(tasksStore.tasks.length, 1)
  return (Object.keys(taskTypeLabels) as TaskType[]).map((type) => {
    const count = tasksStore.tasks.filter((task) => task.type === type).length
    return {
      key: type,
      label: taskTypeLabels[type],
      count,
      percent: Math.round((count / total) * 100),
    }
  })
})

const completionShare = computed(() => {
  const total = Math.max(tasksStore.tasks.length, 1)
  return {
    open: Math.max(8, Math.round((activeTasks.value / total) * 100)),
    done: Math.max(8, Math.round((completedTasks.value / total) * 100)),
    habits: Math.max(8, Math.round((habitsCount.value / total) * 100)),
  }
})

const branchStats = computed(() =>
  branchesStore.branches.map((branch) => {
    const milestones = branch.milestones ?? []
    const total = milestones.length
    const done = milestones.filter((milestone) => milestone.status === 'completed').length
    return {
      id: branch.id,
      name: branch.displayName,
      total,
      done,
      progress: total ? Math.round((done / total) * 100) : 0,
      color: branch.markerColor || 'var(--accent)',
    }
  })
)

const strongestBranch = computed(() => {
  const [first] = [...branchStats.value].sort((a, b) => b.progress - a.progress)
  return first?.name || 'нет данных'
})

const pendingMilestones = computed(() =>
  branchesStore.branches.reduce(
    (sum, branch) =>
      sum + branch.milestones.filter((milestone) => milestone.status !== 'completed').length,
    0
  )
)

const nextTaskTitle = computed(() => {
  const task = tasksStore.tasks.find((item) => !item.done && item.type !== 'HABIT')
  return task?.title || 'нет активных задач'
})

const focusLabel = computed(() => {
  if (activeTasks.value > 0) return 'в работе'
  if (habitsCount.value > 0) return 'привычки'
  return 'спокойно'
})

function createDateRange(daysCount: number) {
  const today = new Date()
  return Array.from({ length: daysCount }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (daysCount - 1 - index))
    return {
      key: getLocalDateKey(date),
      label: date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
    }
  })
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped lang="scss">
.analytics-page {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: 14px;
}

.analytics-head,
.metric-cell {
  @include glass;
  border: var(--ui-border);
}

.analytics-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
  padding: 16px 18px;
  border-radius: var(--border-radius-lg);
  animation: analytics-cell-in 520ms ease both;

  h3 {
    margin: 4px 0 0;
    color: var(--text);
    font-size: 1.28rem;
    font-weight: 700;
  }

  @include mobile {
    align-items: flex-start;
    flex-direction: column;
  }
}

.eyebrow,
.cell-title span,
.muted,
.axis-row,
.focus-list,
.resource-lines span,
.type-row span,
.branch-name {
  color: var(--dim);
}

.eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.head-meta {
  display: grid;
  justify-items: end;
  gap: 3px;
  color: var(--dim);
  font-size: 0.8rem;

  strong {
    color: var(--text);
    font-size: 1.2rem;
  }

  @include mobile {
    justify-items: start;
  }
}

.analytics-grid {
  display: grid;
  grid-template-areas:
    "progress pulse pulse"
    "speed trajectory trajectory"
    "resources types status"
    "board board focus";
  grid-template-columns: minmax(220px, 0.82fr) minmax(320px, 1.28fr) minmax(240px, 0.92fr);
  gap: 0;
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);

  @media (max-width: 1180px) {
    grid-template-areas:
      "progress pulse"
      "speed trajectory"
      "resources trajectory"
      "types status"
      "board board"
      "focus focus";
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include mobile {
    grid-template-areas:
      "progress"
      "pulse"
      "speed"
      "trajectory"
      "resources"
      "types"
      "status"
      "board"
      "focus";
    grid-template-columns: 1fr;
  }
}

.metric-cell {
  position: relative;
  display: grid;
  align-content: start;
  min-width: 0;
  min-height: 210px;
  gap: 18px;
  padding: 20px 22px;
  border-width: 0 1px 1px 0;
  border-radius: 0;
  box-sizing: border-box;
  isolation: isolate;
  overflow: hidden;
  animation: analytics-cell-in 620ms ease both;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(
      110deg,
      transparent 0%,
      color-mix(in srgb, var(--accent) 10%, transparent) 43%,
      transparent 62%
    );
    opacity: 0;
    transform: translateX(-120%);
    animation: app-glow-scan 1100ms ease both;
    animation-delay: inherit;
    pointer-events: none;
  }

  &:nth-last-child(1) {
    border-bottom-width: 0;
  }

  @for $i from 1 through 9 {
    &:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * 70}ms;

      &::after {
        animation-delay: #{160 + (($i - 1) * 70)}ms;
      }
    }
  }

  @include mobile {
    min-height: 0;
    padding: 18px;
    border-width: 0 0 1px;
  }
}

.metric-cell--progress {
  grid-area: progress;
}

.metric-cell--wide {
  grid-area: pulse;
}

.metric-cell--resources {
  grid-area: resources;
}

.metric-cell--speed {
  grid-area: speed;
}

.metric-cell--trajectory {
  grid-area: trajectory;
}

.metric-cell--types {
  grid-area: types;
}

.metric-cell--status {
  grid-area: status;
}

.metric-cell--board {
  grid-area: board;
}

.metric-cell--focus {
  grid-area: focus;
}

.cell-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;

  span {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  strong {
    color: var(--text);
    font-size: 0.9rem;
    font-weight: 700;
    text-align: right;
  }
}

.radial-wrap {
  position: relative;
  display: grid;
  place-items: center;
  min-height: clamp(132px, 18vw, 170px);

  @include mobile {
    min-height: 214px;
  }
}

.radial-chart {
  width: clamp(142px, 16vw, 168px);
  height: clamp(142px, 16vw, 168px);

  line {
    stroke: color-mix(in srgb, var(--accent) 18%, transparent);
    stroke-dasharray: 16;
    stroke-dashoffset: 16;
    stroke-linecap: round;
    stroke-width: 3;
    opacity: 0;
    animation: analytics-tick-in 460ms cubic-bezier(0.16, 1, 0.3, 1) both;

    &.active {
      stroke: var(--accent);
    }
  }

  @for $i from 1 through 40 {
    line:nth-child(#{$i}) {
      animation-delay: #{160 + ($i * 24) - ($i * $i * 0.28)}ms;
    }
  }

  @include mobile {
    width: 188px;
    height: 188px;
  }
}

.radial-value {
  position: absolute;
  display: grid;
  justify-items: center;
  color: var(--text);
  z-index: 1;
  opacity: 0;
  transform: scale(0.96);
  animation: analytics-value-in 420ms cubic-bezier(0.16, 1, 0.3, 1) 760ms both;

  strong {
    color: var(--accent);
    font-size: 1.65rem;
    line-height: 1;
  }

  span {
    color: var(--dim);
    font-size: 0.74rem;
  }
}

.volume-bars {
  display: grid;
  grid-template-columns: repeat(14, minmax(5px, 1fr));
  align-items: end;
  gap: 5px;
  min-height: clamp(92px, 13vw, 132px);

  span {
    height: var(--bar-level);
    min-height: 5px;
    border-radius: var(--border-radius-pill);
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    transform: scaleY(0.2);
    transform-origin: bottom;
    animation: analytics-bar-in 700ms ease both;

    &.active {
      background: var(--accent);
    }
  }

  @for $i from 1 through 14 {
    span:nth-child(#{$i}) {
      animation-delay: #{170 + ($i * 38) - ($i * $i * 1.05)}ms;
    }
  }
}

.axis-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.74rem;
}

.resource-lines,
.focus-list {
  display: grid;
  gap: 12px;
}

.resource-lines div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 10px;
  border-bottom: var(--ui-border);

  strong {
    color: var(--text);
  }
}

.big-number {
  margin: 0;
  color: var(--text);
  font-size: clamp(2.4rem, 8vw, 4.2rem);
  font-weight: 700;
  line-height: 0.95;
}

.muted {
  font-size: 0.82rem;
}

.line-chart {
  width: 100%;
  height: clamp(150px, 16vw, 190px);
  min-height: 150px;
  overflow: visible;

  .line-grid {
    fill: none;
    stroke: color-mix(in srgb, var(--accent) 10%, transparent);
    stroke-width: 1;
  }

  .line-fill {
    fill: color-mix(in srgb, var(--accent) 8%, transparent);
    stroke: none;
  }

  .line-path {
    fill: none;
    stroke: var(--accent);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
    stroke-dasharray: 720;
    stroke-dashoffset: 720;
    animation: analytics-line-in 950ms ease 260ms both;
  }

  circle {
    fill: var(--accent);
    opacity: 0;
    animation: analytics-dot-in 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @for $i from 1 through 24 {
    circle:nth-of-type(#{$i}) {
      animation-delay: #{520 + ($i * 26) - ($i * $i * 0.48)}ms;
    }
  }
}

.task-types,
.branch-map {
  display: grid;
  gap: 11px;
}

.type-row,
.branch-row {
  display: grid;
  grid-template-columns: minmax(72px, 0.8fr) minmax(90px, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: var(--text);
  font-size: 0.82rem;

  @include mobile {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 7px 10px;
  }
}

.type-track,
.branch-track {
  @include mobile {
    grid-column: 1 / -1;
    order: 3;
  }
}

.type-track,
.branch-track {
  height: 7px;
  overflow: hidden;
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--accent) 10%, transparent);

  i {
    display: block;
    height: 100%;
    min-width: 3px;
    border-radius: inherit;
    background: var(--accent);
  }
}

.branch-track i {
  background: var(--marker);
}

.status-stack {
  display: grid;
  gap: 8px;

  span {
    display: flex;
    align-items: center;
    min-height: 34px;
    width: var(--size);
    min-width: 128px;
    max-width: 100%;
    box-sizing: border-box;
    padding: 0 12px;
    border-radius: var(--border-radius-pill);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    color: var(--text);
    font-size: 0.8rem;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.focus-list {
  span {
    padding-bottom: 12px;
    border-bottom: var(--ui-border);
    color: var(--text);
    font-size: 0.88rem;
    line-height: 1.35;
  }
}

@keyframes analytics-cell-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes analytics-tick-in {
  from {
    opacity: 0;
    stroke-dashoffset: 16;
  }

  to {
    opacity: 1;
    stroke-dashoffset: 0;
  }
}

@keyframes analytics-value-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes analytics-bar-in {
  from {
    transform: scaleY(0.15);
  }

  to {
    transform: scaleY(1);
  }
}

@keyframes analytics-line-in {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes analytics-dot-in {
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .analytics-head,
  .metric-cell,
  .metric-cell::after,
  .radial-chart line,
  .radial-value,
  .volume-bars span,
  .line-path,
  .line-chart circle {
    animation: none;
  }

  .analytics-head,
  .metric-cell,
  .radial-chart line,
  .radial-value,
  .line-chart circle {
    opacity: 1;
    transform: none;
  }

  .radial-chart line,
  .line-path {
    stroke-dashoffset: 0;
  }

  .volume-bars span {
    transform: none;
  }
}
</style>
