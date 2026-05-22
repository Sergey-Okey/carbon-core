<template>
  <header class="header">
    <div class="brand">
      <img class="brand-mark" src="/favicon.svg" alt="" aria-hidden="true" />
      <div class="brand-text">
        <span class="logo-text">CORE OF LIFE</span>
        <span class="logo-icon">COF</span>
      </div>
    </div>

    <div class="section-title" aria-live="polite">
      {{ currentSectionTitle }}
    </div>

    <div class="actions">
      <button
        class="action-btn"
        type="button"
        title="Обучение"
        aria-label="Открыть обучение"
        @click="openOnboarding"
      >
        <HelpCircle :size="20" />
      </button>
      <button
        class="action-btn action-btn--primary"
        type="button"
        title="Добавить задачу"
        aria-label="Добавить задачу"
        @click="openTaskForm"
      >
        <Plus :size="20" />
      </button>
      <button
        class="profile-btn"
        type="button"
        title="Профиль"
        aria-label="Открыть профиль"
        @click="openProfile"
      >
        <div v-if="userStore.profile.avatar" class="avatar-small">
          <img :src="userStore.profile.avatar" alt="" />
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
import { computed, ref } from 'vue'
import { HelpCircle, Plus, UserCircle } from 'lucide-vue-next'
import { useTaskActions } from '~/composables/useTaskActions'
import TaskForm from '~/components/task/TaskForm.vue'
import { useUserStore } from '~/stores/user.store'
import { useUIStore, type NavSection } from '~/stores/ui.store'

const userStore = useUserStore()
const uiStore = useUIStore()
const { saveTask } = useTaskActions()
const showTaskForm = ref(false)

const sectionTitles: Record<NavSection, string> = {
  board: 'Доска',
  tasks: 'Задачи',
  shop: 'Магазин',
  analytics: 'Аналитика',
  settings: 'Настройки',
}

const currentSectionTitle = computed(() => sectionTitles[uiStore.activeNav])

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
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  @include glass;

  @include mobile {
    margin: 8px;
    padding: 8px 10px;
  }
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand-mark {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);

  @include mobile {
    width: 30px;
    height: 30px;
  }
}

.brand-text {
  min-width: 0;
  color: var(--accent);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0;

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
      font-size: 0.95rem;
      font-weight: 700;
    }
  }
}

.section-title {
  position: absolute;
  left: 50%;
  max-width: 36%;
  overflow: hidden;
  color: var(--accent);
  font-size: 0.9rem;
  font-weight: 600;
  text-overflow: ellipsis;
  transform: translateX(-50%);
  white-space: nowrap;

  @include mobile {
    position: static;
    max-width: none;
    margin-left: 10px;
    margin-right: auto;
    transform: none;
  }
}

.actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.action-btn,
.profile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: var(--border-radius-md);
  background: color-mix(in srgb, var(--surface) 26%, transparent);
  color: var(--dim);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    color var(--transition-standard),
    transform var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--surface) 70%, transparent);
    color: var(--accent);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--accent);
  }
}

.action-btn--primary {
  border-color: color-mix(in srgb, var(--accent) 34%, var(--border));
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, transparent);

  &:hover {
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
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
