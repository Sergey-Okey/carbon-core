<template>
  <header class="header">
    <div class="logo">
      <span class="logo-text">CARBON CORE</span>
      <span class="logo-icon">CC</span>
    </div>

    <div class="user-stats">
      <!-- Уровень с прогресс-баром -->
      <div class="stat level-stat">
        <Zap :size="18" />
        <div class="level-info">
          <span class="value">{{ userStore.level }}</span>
          <span class="label">ур.</span>
        </div>
        <ProgressBar
          class="xp-bar"
          :value="userStore.currentXP"
          :max="userStore.neededXPForNextLevel"
          height="4px"
        />
      </div>

      <!-- Лига -->
      <div class="stat league-stat" :class="leagueClass">
        <component :is="leagueIcon" :size="18" />
        <span class="value">{{ userStore.league }}</span>
      </div>

      <!-- Золото -->
      <div class="stat gold-stat">
        <Coins :size="18" />
        <span class="value">{{ userStore.gold }}</span>
      </div>

      <!-- Кнопки действий -->
      <div class="actions">
        <button
          class="action-btn"
          @click="openTaskForm"
          title="Добавить задачу"
        >
          <Plus :size="20" />
        </button>
        <button class="action-btn" @click="openSettings" title="Настройки">
          <Settings :size="20" />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <TaskForm
        v-if="showTaskForm"
        @close="showTaskForm = false"
        @save="handleTaskSave"
      />
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '~/stores/user.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useNotification } from '~/composables/useNotification'
import {
  Zap,
  Coins,
  Plus,
  Settings,
  Medal,
  Award,
  Gem,
  Crown,
} from 'lucide-vue-next'
import ProgressBar from './ProgressBar.vue'
import TaskForm from '~/components/task/TaskForm.vue'

const userStore = useUserStore()
const tasksStore = useTasksStore()
const { addNotification } = useNotification()
const showTaskForm = ref(false)

const emit = defineEmits<{ (e: 'open-settings'): void }>()

const leagueIcon = computed(() => {
  const league = userStore.league
  if (league === 'Бронза') return Medal
  if (league === 'Серебро') return Award
  if (league === 'Золото') return Gem
  return Crown
})

const leagueClass = computed(() => userStore.league.toLowerCase())

function openTaskForm() {
  showTaskForm.value = true
}

function openSettings() {
  emit('open-settings')
}

function handleTaskSave(taskData: any) {
  const result = tasksStore.addTask(taskData)
  if (result) {
    addNotification({
      type: 'success',
      message: `«${result.title}» добавлено`,
    })
    showTaskForm.value = false
  } else {
    addNotification({
      type: 'warning',
      message: 'Лимит задач на этот период исчерпан',
    })
  }
}
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  @include glass;
  border: 1px solid var(--border);
  margin: 12px 12px 4px;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @include mobile {
    margin: 8px;
    padding: 12px 16px;
    border-radius: 20px;
  }

  .logo {
    font-weight: 700;
    font-size: 1.3rem;
    letter-spacing: -0.02em;
    color: var(--accent);

    .logo-text {
      display: inline;
    }
    .logo-icon {
      display: none;
    }

    @include mobile {
      .logo-text {
        display: none;
      }
      .logo-icon {
        display: inline;
        font-size: 1.2rem;
        font-weight: 700;
      }
    }
  }

  .user-stats {
    display: flex;
    align-items: center;
    gap: 20px;

    @include mobile {
      gap: 12px;
    }
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--accent);
    white-space: nowrap;

    .value {
      font-weight: 600;
    }

    .label {
      color: var(--dim);
      font-weight: 400;
      margin-left: 2px;
    }
  }

  .level-stat {
    min-width: 140px;

    .level-info {
      display: flex;
      align-items: baseline;
    }

    .xp-bar {
      width: 80px;
      margin-left: 8px;
    }

    @include mobile {
      min-width: auto;
      .xp-bar {
        display: none;
      }
    }
  }

  .league-stat {
    &.бронза {
      color: #cd7f32;
    }
    &.серебро {
      color: #c0c0c0;
    }
    &.золото {
      color: #ffd700;
    }
    &.платина {
      color: #e5e4e2;
    }

    @include mobile {
      display: none;
    }
  }

  .gold-stat {
    @include mobile {
      display: none;
    }
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    color: var(--dim);
    transition: all var(--transition-standard);
    background: transparent;
    border: none;
    cursor: pointer;

    &:hover {
      background: var(--surface);
      color: var(--accent);
    }
  }
}
</style>
