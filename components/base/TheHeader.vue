<template>
  <header class="header">
    <div class="logo">CARBON CORE</div>

    <div class="user-stats">
      <div class="stat">
        <Zap :size="18" />
        <span>Lv.{{ userStore.level }}</span>
      </div>
      <div class="stat league-stat" :class="leagueClass">
        <component :is="leagueIcon" :size="18" />
        <span>{{ userStore.league }}</span>
      </div>
      <div class="stat">
        <Coins :size="18" />
        <span>{{ userStore.gold }}</span>
      </div>

      <button class="action-btn" @click="openTaskForm" title="Добавить задачу">
        <Plus :size="20" />
      </button>

      <button
        class="settings-btn"
        @click="$emit('open-settings')"
        title="Настройки"
      >
        <Settings :size="20" />
      </button>
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
  Settings,
  Plus,
  Medal,
  Award,
  Gem,
  Crown,
} from 'lucide-vue-next'
import TaskForm from '~/components/task/TaskForm.vue'

const userStore = useUserStore()
const tasksStore = useTasksStore()
const { addNotification } = useNotification()
const showTaskForm = ref(false)

defineEmits<{ (e: 'open-settings'): void }>()

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
  padding: 12px 20px;
  @include glass;
  border-bottom: 1px solid var(--border);
  border-radius: 0 0 24px 24px;
  margin-bottom: 4px;

  .logo {
    font-weight: 700;
    font-size: 1.4rem;
    letter-spacing: 1px;
    color: var(--accent);
  }

  .user-stats {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    color: var(--accent);
    white-space: nowrap;
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
  }

  .action-btn,
  .settings-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
    transition: background var(--transition-standard);
    color: var(--dim);
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
