<template>
  <div class="stats-bar">
    <!-- Уровень и XP -->
    <div class="stat-block level-block">
      <div class="stat-row">
        <Zap :size="18" class="stat-icon" />
        <span class="stat-label">Ур. {{ userStore.level }}</span>
        <span class="stat-value"
          >{{ userStore.currentXP }}/{{ userStore.neededXPForNextLevel }}</span
        >
      </div>
      <ProgressBar
        :value="userStore.currentXP"
        :max="userStore.neededXPForNextLevel"
        height="4px"
        class="stat-progress"
      />
    </div>

    <!-- Лига -->
    <div class="stat-block league-block">
      <div class="stat-row">
        <component
          :is="leagueIcon"
          :size="18"
          class="stat-icon"
          :class="leagueClass"
        />
        <span class="stat-label">{{ userStore.league }}</span>
        <span class="stat-value">{{ nextLeagueProgress }}%</span>
      </div>
      <div class="league-progress">
        <div
          class="league-progress-fill"
          :style="{ width: nextLeagueProgress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Монеты -->
    <div class="stat-block coins-block">
      <div class="stat-row">
        <Coins :size="18" class="stat-icon" />
        <span class="stat-label">Монеты</span>
        <span class="stat-value">{{ userStore.coins }}</span>
      </div>
    </div>

    <!-- Задачи -->
    <div class="stat-block tasks-block">
      <div class="tasks-indicators">
        <div class="task-indicator" :class="{ done: completedTasks.day === 3 }">
          <span class="task-label">Д</span>
          <span class="task-count">{{ completedTasks.day }}/3</span>
        </div>
        <div
          class="task-indicator"
          :class="{ done: completedTasks.week === 3 }"
        >
          <span class="task-label">Н</span>
          <span class="task-count">{{ completedTasks.week }}/3</span>
        </div>
        <div
          class="task-indicator"
          :class="{ done: completedTasks.month === 3 }"
        >
          <span class="task-label">М</span>
          <span class="task-count">{{ completedTasks.month }}/3</span>
        </div>
        <div
          class="task-indicator"
          :class="{ done: completedTasks.year === 3 }"
        >
          <span class="task-label">Г</span>
          <span class="task-count">{{ completedTasks.year }}/3</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Zap, Coins, Medal, Award, Gem, Crown } from 'lucide-vue-next'
import { useUserStore } from '~/stores/user.store'
import { useTasksStore } from '~/stores/tasks.store'
import ProgressBar from '~/components/base/ProgressBar.vue'

const userStore = useUserStore()
const tasksStore = useTasksStore()

const leagueIcon = computed(() => {
  const league = userStore.league
  if (league === 'Бронза') return Medal
  if (league === 'Серебро') return Award
  if (league === 'Золото') return Gem
  return Crown
})

const leagueClass = computed(() => userStore.league.toLowerCase())

const nextLeagueProgress = computed(() => {
  const points = userStore.leaguePoints
  if (points < 1000) return Math.floor((points / 1000) * 100)
  if (points < 3000) return Math.floor(((points - 1000) / 2000) * 100)
  if (points < 6000) return Math.floor(((points - 3000) / 3000) * 100)
  return 100
})

const completedTasks = computed(() => {
  const day = tasksStore.tasks.filter(
    (t) => t.type === 'TASK_DAY' && t.done
  ).length
  const week = tasksStore.tasks.filter(
    (t) => t.type === 'TASK_WEEK' && t.done
  ).length
  const month = tasksStore.tasks.filter(
    (t) => t.type === 'TASK_MONTH' && t.done
  ).length
  const year = tasksStore.tasks.filter(
    (t) => t.type === 'TASK_YEAR' && t.done
  ).length
  return { day, week, month, year }
})
</script>

<style scoped lang="scss">
.stats-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px 20px;
  @include glass;
  border-radius: 20px;
  padding: 14px 20px;
  border: 1px solid var(--border);
  background: var(--surface);

  @include mobile {
    padding: 16px;
    gap: 16px 12px;
  }
}

.stat-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 0 180px;
  min-width: 160px;

  @include mobile {
    flex: 1 0 calc(50% - 12px);
    min-width: 130px;
  }
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  color: var(--dim);
  flex-shrink: 0;
}

.stat-label {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--accent);
}

.stat-value {
  margin-left: auto;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent);
}

.stat-progress,
.league-progress {
  width: 100%;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
}

.league-progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.coins-block {
  .stat-value {
    margin-left: 8px;
  }
}

.tasks-block {
  flex: 0 0 auto;
  margin-left: 0;

  @include mobile {
    flex: 1 0 100%;
    margin-top: 4px;
  }
}

.tasks-indicators {
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  @include mobile {
    justify-content: space-around;
    gap: 8px;
  }
}

.task-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);

  .task-label {
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--dim);
  }

  .task-count {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--accent);
  }

  &.done {
    background: var(--accent);
    border-color: var(--accent);
    .task-label,
    .task-count {
      color: var(--bg);
    }
  }

  @include mobile {
    padding: 6px 8px;
    flex-direction: column;
    gap: 2px;
    min-width: 50px;
  }
}

.бронза {
  color: #cd7f32;
}
.серебро {
  color: #c0c0c0;
}
.золото {
  color: #ffd700;
}
.платина {
  color: #e5e4e2;
}
</style>
