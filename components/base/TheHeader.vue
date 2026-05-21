<template>
  <header class="header">
    <div class="logo">
      <span class="logo-text">CORE OF LIFE</span>
      <span class="logo-icon">COF</span>
    </div>

    <div class="actions">
      <button class="action-btn" title="Обучение" @click="openOnboarding">
        <HelpCircle :size="20" />
      </button>
      <button class="action-btn" title="Добавить задачу" @click="openTaskForm">
        <Plus :size="20" />
      </button>
      <button class="profile-btn" title="Профиль" @click="openProfile">
        <div v-if="userStore.profile.avatar" class="avatar-small">
          <img :src="userStore.profile.avatar" alt="avatar" />
        </div>
        <UserCircle v-else :size="20" />
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
import { ref } from 'vue'
import { HelpCircle, Plus, UserCircle } from 'lucide-vue-next'
import { useTaskActions } from '~/composables/useTaskActions'
import TaskForm from '~/components/task/TaskForm.vue'
import { useUserStore } from '~/stores/user.store'

const userStore = useUserStore()
const { saveTask } = useTaskActions()
const showTaskForm = ref(false)

function openTaskForm() {
  showTaskForm.value = true
}

function openProfile() {
  navigateTo('/profile')
}

function openOnboarding() {
  navigateTo('/onboarding')
}

function handleTaskSave(taskData: any) {
  const saved = saveTask(taskData)
  if (saved) showTaskForm.value = false
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
  margin: 12px 12px 4px;
  padding: 8px 20px;
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow-sm);
  @include glass;

  @include mobile {
    margin: 8px;
    padding: 8px 16px;
    border-radius: 20px;
  }
}

.logo {
  color: var(--accent);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;

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
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  transition: all var(--transition-standard);

  &:hover {
    background: var(--surface);
    color: var(--accent);
  }
}

.avatar-small {
  width: 28px;
  height: 28px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 50%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
