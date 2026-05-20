<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <form class="modal" @submit.prevent="handleSubmit">
        <header class="modal-header">
          <div>
            <span class="modal-kicker">Ветка</span>
            <h3>{{ branch ? 'Редактировать ветку' : 'Новая ветка' }}</h3>
          </div>
          <button type="button" class="icon-btn" title="Закрыть" @click="emit('close')">
            <X :size="20" />
          </button>
        </header>

        <div class="modal-body">
          <div class="form-group">
            <label for="branch-name">Название</label>
            <input
              id="branch-name"
              v-model.trim="form.name"
              type="text"
              placeholder="Название ветки"
              :class="{ invalid: nameTouched && !canSubmit }"
              @blur="nameTouched = true"
            />
            <span v-if="nameTouched && !canSubmit" class="field-error">
              Укажите название ветки
            </span>
          </div>

          <div class="form-group">
            <label for="branch-description">Описание</label>
            <textarea
              id="branch-description"
              v-model="form.description"
              placeholder="Опишите направление..."
              rows="3"
            />
          </div>

          <div class="form-group">
            <label>Иконка</label>
            <div class="icon-section">
              <button
                type="button"
                class="toggle-btn"
                @click="iconsExpanded = !iconsExpanded"
              >
                <span class="selected-icon">
                  <component :is="iconComponent(form.icon)" :size="20" />
                  <span>Иконка</span>
                </span>
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
                    :title="icon"
                    @click="form.icon = icon"
                  >
                    <component :is="iconComponent(icon)" :size="20" />
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <div class="form-group">
            <label>Привязанные задачи</label>
            <div class="tasks-section">
              <button
                type="button"
                class="toggle-btn"
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
                    class="task-row"
                    :class="{ selected: form.taskIds.includes(task.id) }"
                  >
                    <span class="custom-checkbox">
                      <input v-model="form.taskIds" type="checkbox" :value="task.id" />
                      <span class="checkmark"></span>
                    </span>
                    <span class="task-title">{{ task.title }}</span>
                    <span class="task-xp">+{{ task.xpReward || 50 }} XP</span>
                  </label>
                  <div v-if="activeTasks.length === 0" class="empty-list">
                    Нет доступных задач
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button
            v-if="branch"
            type="button"
            class="btn-danger"
            @click="emit('delete')"
          >
            Удалить
          </button>
          <div class="footer-actions">
            <button type="button" class="btn-secondary" @click="emit('close')">
              Отмена
            </button>
            <button type="submit" class="btn-primary" :disabled="!canSubmit">
              {{ branch ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </footer>
      </form>
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
import type { Branch } from '~/types/branch.types'

const props = defineProps<{ branch?: Branch | null }>()
const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'save',
    data: { name: string; icon: string; description: string; taskIds: string[] }
  ): void
  (e: 'delete'): void
}>()

const tasksStore = useTasksStore()
const iconsExpanded = ref(false)
const tasksExpanded = ref(false)
const nameTouched = ref(false)

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

const activeTasks = computed(() => tasksStore.tasks.filter((task) => task.type !== 'HABIT'))
const canSubmit = computed(() => form.name.trim().length > 0)

const form = reactive({
  name: '',
  icon: 'target',
  description: '',
  taskIds: [] as string[],
})

watch(
  () => props.branch,
  (newBranch) => {
    nameTouched.value = false
    iconsExpanded.value = false
    tasksExpanded.value = false

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
  nameTouched.value = true
  if (!canSubmit.value) return
  emit('save', { ...form, name: form.name.trim() })
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--bg) 70%, transparent);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  @include glass;
  width: min(460px, 100%);
  max-height: min(86vh, 760px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-lg);
  color: var(--accent);
  overflow: hidden;
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
}

.modal-header {
  border-bottom: 1px solid var(--border);

  h3 {
    margin: 2px 0 0;
    font-size: 1.05rem;
    font-weight: 600;
  }
}

.modal-kicker {
  display: block;
  color: var(--dim);
  font-size: 0.72rem;
  text-transform: uppercase;
}

.modal-body {
  padding: 18px;
  overflow-y: auto;
}

.modal-footer {
  border-top: 1px solid var(--border);
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--dim);
  background: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    background: var(--surface);
    color: var(--accent);
  }
}

.form-group {
  margin-bottom: 18px;

  label {
    display: block;
    margin-bottom: 7px;
    color: var(--dim);
    font-size: 0.78rem;
    font-weight: 500;
    text-transform: uppercase;
  }

  input,
  textarea {
    width: 100%;
    padding: 10px 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-sm);
    color: var(--accent);
    font-size: 0.95rem;

    &:focus {
      border-color: var(--accent);
      outline: none;
    }

    &.invalid {
      border-color: var(--error);
    }
  }

  textarea {
    min-height: 76px;
    resize: vertical;
  }
}

.field-error {
  display: block;
  margin-top: 6px;
  color: var(--error);
  font-size: 0.78rem;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
  color: var(--accent);
  cursor: pointer;

  &:hover {
    border-color: var(--accent);
  }

  .rotated {
    transform: rotate(180deg);
  }
}

.selected-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icons-grid {
  margin-top: 8px;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
}

.icon-option {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border-radius: var(--border-radius-sm);
  background: transparent;
  border: 1px solid var(--border);
  color: var(--dim);
  cursor: pointer;

  &:hover,
  &.active {
    border-color: var(--accent);
    color: var(--accent);
  }

  &.active {
    background: color-mix(in srgb, var(--accent) 14%, transparent);
  }
}

.tasks-list {
  margin-top: 8px;
  max-height: 260px;
  overflow-y: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
}

.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  padding: 9px 12px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover,
  &.selected {
    background: color-mix(in srgb, var(--surface) 65%, var(--border));
  }
}

.custom-checkbox {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  flex-shrink: 0;

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
}

.checkmark {
  position: absolute;
  inset: 0;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
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

.task-title {
  flex: 1;
  min-width: 0;
  color: var(--accent);
  font-size: 0.88rem;
  line-height: 1.35;
}

.task-xp,
.empty-list {
  color: var(--dim);
  font-size: 0.78rem;
}

.empty-list {
  padding: 14px 12px;
}

.btn-secondary,
.btn-primary,
.btn-danger {
  min-height: 36px;
  padding: 0 16px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--dim);

  &:hover {
    color: var(--accent);
    background: var(--surface);
  }
}

.btn-primary {
  background: var(--accent);
  border: 1px solid var(--accent);
  color: var(--bg);

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.btn-danger {
  margin-right: auto;
  background: transparent;
  border: 1px solid var(--error);
  color: var(--error);

  &:hover {
    background: var(--error);
    color: var(--bg);
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.1s;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .modal-overlay {
    align-items: stretch;
    padding: 8px;
  }

  .modal {
    max-height: none;
  }
}
</style>
