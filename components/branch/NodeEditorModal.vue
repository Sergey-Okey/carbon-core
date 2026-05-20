<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <form class="modal" @submit.prevent="handleSubmit" @keydown.stop>
        <header class="modal-header">
          <div>
            <span class="modal-kicker">Этап</span>
            <h3>{{ props.isCreateMode ? 'Новый этап' : 'Редактировать этап' }}</h3>
          </div>
          <button type="button" class="icon-btn" title="Закрыть" @click="emit('close')">
            <X :size="20" />
          </button>
        </header>

        <div class="modal-body">
          <div class="form-group">
            <label for="milestone-name">Название</label>
            <input
              id="milestone-name"
              v-model.trim="form.name"
              type="text"
              placeholder="Название этапа"
              :class="{ invalid: nameTouched && !canSubmit }"
              @blur="nameTouched = true"
            />
            <span v-if="nameTouched && !canSubmit" class="field-error">
              Укажите название этапа
            </span>
          </div>

          <div class="form-group">
            <label for="milestone-description">Описание</label>
            <textarea
              id="milestone-description"
              v-model="form.description"
              placeholder="Краткое описание этапа..."
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
            v-if="!props.isCreateMode"
            type="button"
            class="btn-danger"
            @click="handleDelete"
          >
            Удалить
          </button>
          <div class="footer-actions">
            <button type="button" class="btn-secondary" @click="emit('close')">
              Отмена
            </button>
            <button type="submit" class="btn-primary" :disabled="!canSubmit">
              {{ props.isCreateMode ? 'Создать' : 'Сохранить' }}
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
import { useConfirm } from '~/composables/useConfirm'
import type { Milestone } from '~/types/branch.types'

const props = defineProps<{ milestone: Milestone; isCreateMode?: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', updates: Partial<Milestone>): void
  (e: 'delete'): void
}>()

const tasksStore = useTasksStore()
const { confirm } = useConfirm()
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

const activeTasks = computed(() => tasksStore.tasks.filter((task) => !task.done))
const canSubmit = computed(() => form.name.trim().length > 0)

const form = reactive({
  name: '',
  description: '',
  icon: 'target',
  taskIds: [] as string[],
})

watch(
  () => props.milestone,
  (newVal) => {
    nameTouched.value = false
    iconsExpanded.value = false
    tasksExpanded.value = false

    if (newVal) {
      form.name = newVal.name
      form.description = newVal.description || ''
      form.icon = newVal.icon || 'target'
      form.taskIds = [...(newVal.taskIds || [])]
    }
  },
  { immediate: true }
)

function handleSubmit() {
  nameTouched.value = true
  if (!canSubmit.value) return
  emit('save', {
    name: form.name.trim(),
    description: form.description,
    icon: form.icon,
    taskIds: form.taskIds,
  })
}

async function handleDelete() {
  const ok = await confirm('Удалить этот этап?')
  if (!ok) return
  emit('delete')
  emit('close')
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--bg) 62%, transparent);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  @include glass;
  width: min(520px, 100%);
  max-height: min(88vh, 760px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-lg);
  background: color-mix(in srgb, var(--surface) 78%, transparent);
  box-shadow: var(--shadow-lg);
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
  background: color-mix(in srgb, var(--surface) 55%, transparent);

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
  letter-spacing: 0.04em;
}

.modal-body {
  padding: 18px;
  overflow-y: auto;
}

.modal-footer {
  border-top: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 50%, transparent);
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
    padding: 12px 14px;
    background: color-mix(in srgb, var(--surface) 82%, transparent);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-sm);
    color: var(--accent);
    font-size: 0.95rem;

    &:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 14%, transparent);
      outline: none;
    }

    &.invalid {
      border-color: var(--error);
    }
  }

  textarea {
    min-height: 88px;
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
  min-height: 44px;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--surface) 82%, transparent);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
  color: var(--accent);
  cursor: pointer;

  &:hover {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--surface) 92%, transparent);
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
  background: color-mix(in srgb, var(--surface) 82%, transparent);
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
  background: color-mix(in srgb, var(--surface) 82%, transparent);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
}

.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 46px;
  padding: 10px 12px;
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
  background: color-mix(in srgb, var(--bg) 72%, transparent);
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
  min-height: 40px;
  padding: 0 18px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    color var(--transition-standard),
    transform var(--transition-standard);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
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
    padding: 10px;
  }

  .modal {
    width: 100%;
    height: calc(100dvh - 20px);
    max-height: none;
    border-radius: var(--border-radius-lg);
  }

  .modal-header,
  .modal-footer {
    position: sticky;
    z-index: 2;
    padding: 14px;
  }

  .modal-header {
    top: 0;
  }

  .modal-footer {
    bottom: 0;
    align-items: stretch;
    flex-direction: column;
  }

  .footer-actions {
    width: 100%;
    margin-left: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .btn-danger {
    width: 100%;
    margin-right: 0;
  }

  .modal-body {
    padding: 14px;
  }

  .icons-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .task-row {
    align-items: flex-start;
  }

  .task-xp {
    flex-shrink: 0;
  }
}

@media (max-width: 420px) {
  .modal-overlay {
    padding: 0;
  }

  .modal {
    height: 100dvh;
    min-height: 100dvh;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .footer-actions {
    grid-template-columns: 1fr;
  }
}
</style>
