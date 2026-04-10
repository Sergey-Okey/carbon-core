<template>
  <header class="header">
    <div class="logo">
      <span class="logo-text">CORE OF LIFE</span>
      <span class="logo-icon">COF</span>
    </div>

    <div class="actions">
      <button class="action-btn" @click="openOnboarding" title="Обучение">
        <HelpCircle :size="20" />
      </button>
      <button class="action-btn" @click="openTaskForm" title="Добавить задачу">
        <Plus :size="20" />
      </button>
      <button class="profile-btn" @click="openProfile" title="Профиль">
        <div v-if="userStore.profile.avatar" class="avatar-small">
          <img :src="userStore.profile.avatar" alt="avatar" />
        </div>
        <UserCircle v-else :size="20" />
      </button>
    </div>

    <!-- Модалки -->
    <Teleport to="body">
      <TaskForm
        v-if="showTaskForm"
        @close="showTaskForm = false"
        @save="handleTaskSave"
      />
    </Teleport>
    <Teleport to="body">
      <ProfileModal v-if="showProfileModal" @close="showProfileModal = false" />
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, UserCircle } from 'lucide-vue-next'
import { useUserStore } from '~/stores/user.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useNotification } from '~/composables/useNotification'
import TaskForm from '~/components/task/TaskForm.vue'
import ProfileModal from '~/components/profile/ProfileModal.vue'

const userStore = useUserStore()
const tasksStore = useTasksStore()
const { addNotification } = useNotification()
const showTaskForm = ref(false)
const showProfileModal = ref(false)

function openTaskForm() {
  showTaskForm.value = true
}

function openProfile() {
  showProfileModal.value = true
}

function handleTaskSave(taskData: any) {
  const result = tasksStore.addTask(taskData)
  if (result) {
    addNotification({ type: 'success', message: `«${result.title}» добавлено` })
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
  padding: 8px 20px;
  @include glass;
  border: 1px solid var(--border);
  margin: 12px 12px 4px;
  border-radius: 24px;
  box-shadow: var(--shadow-sm);

  @include mobile {
    margin: 8px;
    padding: 8px 16px;
    border-radius: 20px;
  }

  .logo {
    font-weight: 700;
    font-size: 1.2rem;
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
        font-size: 1.1rem;
        font-weight: 700;
      }
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .action-btn,
  .profile-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
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

  .avatar-small {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid var(--border);
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
