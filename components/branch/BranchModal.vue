<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ branch ? 'Редактировать ветку' : 'Новая ветка' }}</h3>
          <button class="close-btn" @click="emit('close')">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Название</label>
            <input v-model="form.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea
              v-model="form.description"
              placeholder="Опишите направление..."
              rows="2"
            />
          </div>

          <div class="form-group">
            <label>Иконка</label>
            <div class="icon-section">
              <button
                type="button"
                class="toggle-icons-btn"
                @click="iconsExpanded = !iconsExpanded"
              >
                <div class="selected-icon">
                  <component :is="iconComponent(form.icon)" :size="20" />
                  <span>{{ form.icon }}</span>
                </div>
                <ChevronDown :size="16" :class="{ rotated: iconsExpanded }" />
              </button>
              <Transition name="expand">
                <div v-if="iconsExpanded" class="icons-grid">
                  <button
                    v-for="icon in iconOptions"
                    :key="icon"
                    type="button"
                    class="icon-option"
                    :class="{ active: form.icon === icon }"
                    @click="form.icon = icon"
                  >
                    <component :is="iconComponent(icon)" :size="20" />
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <div class="form-group">
            <label>Привязанные задачи (опционально)</label>
            <div class="tasks-section">
              <button
                type="button"
                class="toggle-tasks-btn"
                @click="tasksExpanded = !tasksExpanded"
              >
                <span>Выбрать задачи ({{ form.taskIds.length }})</span>
                <ChevronDown :size="16" :class="{ rotated: tasksExpanded }" />
              </button>
              <Transition name="expand">
                <div v-if="tasksExpanded" class="tasks-list">
                  <label
                    v-for="task in activeTasks"
                    :key="task.id"
                    class="task-checkbox"
                  >
                    <span class="custom-checkbox">
                      <input
                        type="checkbox"
                        :value="task.id"
                        v-model="form.taskIds"
                      />
                      <span class="checkmark"></span>
                    </span>
                    <span class="task-title">{{ task.title }}</span>
                    <span class="task-xp">+{{ task.xpReward || 50 }} XP</span>
                  </label>
                </div>
              </Transition>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="emit('close')">
              Отмена
            </button>
            <button
              v-if="branch"
              type="button"
              class="btn-danger"
              @click="deleteBranch"
            >
              Удалить
            </button>
            <button type="submit" class="btn-primary">
              {{ branch ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import {
  X,
  ChevronDown,
  TrendingUp,
  Dumbbell,
  Brain,
  Users,
  Target,
  Briefcase,
  Heart,
  BookOpen,
  Globe,
  Award,
  Coffee,
  Music,
  Camera,
  Code,
} from 'lucide-vue-next'
import { useTasksStore } from '~/stores/tasks.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useConfirm } from '~/composables/useConfirm'
import type { Branch } from '~/types/branch.types'

const props = defineProps<{ branch?: Branch | null }>()
const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'save',
    data: { name: string; icon: string; description: string; taskIds: string[] }
  ): void
}>()

const tasksStore = useTasksStore()
const branchesStore = useBranchesStore()
const { confirm } = useConfirm()
const iconsExpanded = ref(false)
const tasksExpanded = ref(false)

const iconOptions = [
  'trending-up',
  'dumbbell',
  'brain',
  'users',
  'target',
  'briefcase',
  'heart',
  'book-open',
  'globe',
  'award',
  'coffee',
  'music',
  'camera',
  'code',
]

const iconComponent = (name: string) => {
  const map: Record<string, any> = {
    'trending-up': TrendingUp,
    dumbbell: Dumbbell,
    brain: Brain,
    users: Users,
    target: Target,
    briefcase: Briefcase,
    heart: Heart,
    'book-open': BookOpen,
    globe: Globe,
    award: Award,
    coffee: Coffee,
    music: Music,
    camera: Camera,
    code: Code,
  }
  return map[name] || Target
}

const activeTasks = computed(() => {
  return tasksStore.tasks.filter((t) => !t.done || t.type === 'HABIT')
})

const form = reactive({
  name: '',
  icon: 'target',
  description: '',
  taskIds: [] as string[],
})

watch(
  () => props.branch,
  (newBranch) => {
    if (newBranch) {
      form.name = newBranch.displayName
      form.icon = newBranch.icon
      form.description = newBranch.description || ''
      form.taskIds = [...(newBranch.taskIds || [])]
    } else {
      form.name = ''
      form.icon = 'target'
      form.description = ''
      form.taskIds = []
    }
  },
  { immediate: true }
)

function handleSubmit() {
  emit('save', { ...form })
}

async function deleteBranch() {
  if (!props.branch) return
  const ok = await confirm(`Удалить ветку "${props.branch.displayName}"?`)
  if (ok) {
    branchesStore.deleteBranch(props.branch.id)
    emit('close')
  }
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}
.modal {
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  @include glass;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border);
  color: var(--accent);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0;
  h3 {
    font-weight: 600;
  }
  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--dim);
    &:hover {
      background: var(--surface);
      color: var(--accent);
    }
  }
}
form {
  padding: 20px;
}
.form-group {
  margin-bottom: 20px;
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--dim);
  }
  input,
  textarea {
    width: 100%;
    padding: 10px 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-sm);
    color: var(--accent);
    font-size: 1rem;
    &:focus {
      border-color: var(--accent);
      outline: none;
    }
  }
  textarea {
    resize: vertical;
    min-height: 60px;
  }
}
.icon-section {
  .toggle-icons-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-sm);
    color: var(--accent);
    font-size: 0.9rem;
    cursor: pointer;
    transition: border-color 0.2s;
    &:hover {
      border-color: var(--accent);
    }
    .rotated {
      transform: rotate(180deg);
    }
    .selected-icon {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  .icons-grid {
    margin-top: 8px;
    padding: 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-sm);
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
  }
  .icon-option {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: var(--border-radius-sm);
    background: transparent;
    border: 1px solid var(--border);
    color: var(--dim);
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    &.active {
      border-color: var(--accent);
      background: var(--accent);
      color: var(--bg);
    }
  }
}
.tasks-section {
  .toggle-tasks-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-sm);
    color: var(--accent);
    font-size: 0.9rem;
    cursor: pointer;
    transition: border-color 0.2s;
    &:hover {
      border-color: var(--accent);
    }
    .rotated {
      transform: rotate(180deg);
    }
  }
  .tasks-list {
    margin-top: 8px;
    padding: 4px 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-sm);
    max-height: 260px;
    overflow-y: auto;

    .task-checkbox {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      margin: 0;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      transition: background 0.15s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: var(--border);
      }

      .custom-checkbox {
        position: relative;
        display: inline-block;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
          margin: 0;
        }
        .checkmark {
          position: absolute;
          top: 0;
          left: 0;
          width: 18px;
          height: 18px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 4px;
          transition: all 0.2s;
        }
        input:checked + .checkmark {
          background: var(--accent);
          border-color: var(--accent);
          &::after {
            content: '';
            position: absolute;
            left: 5px;
            top: 2px;
            width: 5px;
            height: 10px;
            border: solid var(--bg);
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
          }
        }
      }

      .task-title {
        flex: 1;
        font-size: 0.9rem;
        line-height: 1.4;
        color: var(--accent);
      }

      .task-xp {
        font-size: 0.8rem;
        color: var(--dim);
        flex-shrink: 0;
      }
    }
  }
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  button {
    padding: 10px 20px;
    border-radius: var(--border-radius-sm);
    border: none;
    cursor: pointer;
  }
  .btn-secondary {
    background: transparent;
    color: var(--dim);
    &:hover {
      background: var(--surface);
    }
  }
  .btn-primary {
    background: var(--accent);
    color: var(--bg);
    &:hover {
      opacity: 0.9;
    }
  }
  .btn-danger {
    background: transparent;
    color: var(--error);
    border: 1px solid var(--error);
    margin-right: auto;
    &:hover {
      background: var(--error);
      color: var(--bg);
    }
  }
}
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
