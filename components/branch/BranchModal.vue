<template>
  <AppModal
    :title="branch ? 'Редактировать ветку' : 'Новая ветка'"
    kicker="Ветка"
    as-form
    size="md"
    allow-overflow
    @close="emit('close')"
    @submit="handleSubmit"
  >
    <div class="board-form">
      <AppFormField
        label="Название"
        for-id="branch-name"
        :error="nameTouched && !canSubmit ? 'Укажите название ветки' : undefined"
      >
        <AppInput
          id="branch-name"
          v-model="form.name"
          placeholder="Название ветки"
          :invalid="nameTouched && !canSubmit"
          @blur="nameTouched = true"
        />
      </AppFormField>

      <AppFormField label="Описание" for-id="branch-description">
        <AppInput
          id="branch-description"
          v-model="form.description"
          multiline
          placeholder="Опишите направление..."
          :rows="3"
        />
      </AppFormField>

      <AppFormField label="Иконка">
        <div class="icon-section">
          <button type="button" class="toggle-btn" @click="iconsExpanded = !iconsExpanded">
            <span class="selected-icon">
              <component :is="iconComponent(form.icon)" :size="20" />
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
      </AppFormField>

      <AppFormField label="Привязанные задачи">
        <div class="tasks-section">
          <button type="button" class="toggle-btn" @click="tasksExpanded = !tasksExpanded">
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
      </AppFormField>
    </div>

    <template #footer>
      <AppButton v-if="branch" type="button" variant="danger" @click="emit('delete')">
        Удалить
      </AppButton>
      <div class="footer-actions">
        <AppButton type="button" variant="secondary" @click="emit('close')">
          Отмена
        </AppButton>
        <AppButton type="submit" variant="primary" :disabled="!canSubmit">
          {{ branch ? 'Сохранить' : 'Создать' }}
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  Award,
  BookOpen,
  Brain,
  Briefcase,
  Camera,
  ChevronDown,
  Code,
  Coffee,
  Dumbbell,
  Globe,
  Heart,
  Music,
  Target,
  TrendingUp,
  Users,
} from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import AppFormField from '~/components/ui/AppFormField.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppModal from '~/components/ui/AppModal.vue'
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
.board-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.icon-section,
.tasks-section {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toggle-btn {
  @include glass;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  color: var(--accent);
  border: none;
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:hover {
    background: var(--glass-surface);
    color: var(--accent);
  }

  .rotated {
    transform: rotate(180deg);
  }
}

.selected-icon {
  display: inline-flex;
  align-items: center;
  color: var(--accent);
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(38px, 1fr));
  gap: 8px;
}

.icon-option {
  @include glass;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  color: var(--dim);
  border: none;
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  transition:
    color var(--transition-standard),
    background var(--transition-standard);

  &:hover {
    color: var(--accent);
    background: var(--glass-surface);
  }

  &.active {
    color: var(--bg);
    background: var(--accent);
  }

  &.active:hover {
    color: var(--bg);
    background: var(--accent);
  }
}

.tasks-list {
  @include glass;
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 8px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  padding: 8px;
  overflow-y: auto;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
}

.task-row {
  @include glass;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: var(--accent);
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;

  &.selected {
    background: var(--accent);
    color: var(--bg);

    .task-xp {
      color: color-mix(in srgb, var(--bg) 72%, transparent);
    }
  }

  &.selected:hover {
    background: var(--accent);
    color: var(--bg);
  }
}

.custom-checkbox {
  position: relative;
  width: 18px;
  height: 18px;

  input {
    position: absolute;
    opacity: 0;
    inset: 0;
  }
}

.checkmark {
  display: block;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: var(--border-radius-sm);
  background: var(--glass-surface);

  input:checked + & {
    background: var(--accent);
    border-color: var(--accent);
  }
}

.task-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-xp,
.empty-list {
  color: var(--dim);
  font-size: 0.85rem;
}

.empty-list {
  padding: 12px;
  text-align: center;
  background: var(--glass-surface);
  border: none;
  border-radius: var(--border-radius-lg);
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-left: auto;
}

.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .footer-actions {
    width: 100%;
    flex-direction: column;
    margin-left: 0;
  }

  .task-row {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .task-xp {
    grid-column: 2;
  }
}
</style>
