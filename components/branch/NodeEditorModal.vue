<template>
  <AppModal
    :title="props.isCreateMode ? 'Новый этап' : 'Редактировать этап'"
    as-form
    size="lg"
    allow-overflow
    @close="emit('close')"
    @submit="handleSubmit"
  >
    <div class="board-form">
      <AppFormField
        label="Название"
        for-id="milestone-name"
        :error="nameTouched && !canSubmit ? 'Укажите название этапа' : undefined"
      >
        <AppInput
          id="milestone-name"
          v-model="form.name"
          placeholder="Название этапа"
          :invalid="nameTouched && !canSubmit"
          @blur="nameTouched = true"
        />
      </AppFormField>

      <AppFormField label="Описание" for-id="milestone-description">
        <AppInput
          id="milestone-description"
          v-model="form.description"
          multiline
          placeholder="Краткое описание этапа..."
          :rows="3"
        />
      </AppFormField>

      <div class="visual-row">
        <AppFormField label="Иконка">
          <div class="icon-section">
              <TransitionGroup name="reveal-item" tag="div" class="icons-grid">
                <button
                  v-for="icon in visibleIconOptions"
                  :key="icon"
                  type="button"
                  class="icon-option"
                  :class="{ active: form.icon === icon }"
                  :aria-label="icon"
                  @click="form.icon = icon"
                >
                  <component :is="iconComponent(icon)" :size="20" />
                </button>
              </TransitionGroup>
              <button type="button" class="icons-toggle" @click="iconsExpanded = !iconsExpanded">
                {{ iconsExpanded ? 'Скрыть иконки' : `Ещё ${iconOptions.length - 9}` }}
                <ChevronDown :size="15" :class="{ rotated: iconsExpanded }" />
              </button>
          </div>
        </AppFormField>

        <AppFormField label="Цвет маркера">
          <AppCustomColorPicker v-model="form.markerColor" label="Выбрать цвет" />
        </AppFormField>
      </div>

      <AppFormField label="Привязанные задачи">
        <BoardTaskPicker
          v-model="form.taskIds"
          :tasks="activeTasks"
          :elsewhere-ids="elsewhereIds"
          show-type
          @create="showQuickTask = true"
        />
      </AppFormField>
    </div>

    <template #footer>
      <AppButton
        v-if="!props.isCreateMode"
        type="button"
        variant="danger"
        @click="handleDelete"
      >
        Удалить
      </AppButton>
      <div class="footer-actions">
        <AppButton type="button" variant="secondary" @click="emit('close')">
          Отмена
        </AppButton>
        <AppButton type="submit" variant="primary" :disabled="!canSubmit" data-tour="milestone-save">
          {{ props.isCreateMode ? 'Создать' : 'Сохранить' }}
        </AppButton>
      </div>
    </template>
  </AppModal>
  <TaskForm v-if="showQuickTask" default-type="TASK_DAY" @close="showQuickTask = false" @save="handleQuickTask" />
</template>

<script setup lang="ts">
import {
  Award,
  Bell,
  BookOpen,
  Brain,
  Briefcase,
  CalendarDays,
  ChevronDown,
  Code,
  Compass,
  Dumbbell,
  Flag,
  FolderKanban,
  GraduationCap,
  Heart,
  Home,
  Lightbulb,
  Map,
  Plane,
  Rocket,
  Target,
  TrendingUp,
  Trophy,
  Users,
  WalletCards,
} from 'lucide-vue-next'
import type { Milestone } from '~/types/branch.types'
import type { TaskFormData } from '~/types/task.types'

const props = defineProps<{ milestone: Milestone; isCreateMode?: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', updates: Partial<Milestone>): void
  (e: 'delete'): void
}>()

const tasksStore = useTasksStore()
const branchesStore = useBranchesStore()
const { confirm } = useConfirm()
const iconsExpanded = ref(false)
const nameTouched = ref(false)
const showQuickTask = ref(false)

const iconOptions = [
  'trending-up',
  'dumbbell',
  'brain',
  'users',
  'target',
  'briefcase',
  'heart',
  'book-open',
  'award',
  'code',
  'rocket',
  'flag',
  'compass',
  'map',
  'plane',
  'home',
  'graduation-cap',
  'lightbulb',
  'trophy',
  'wallet-cards',
  'folder-kanban',
  'calendar-days',
]
const visibleIconOptions = computed(() => (iconsExpanded.value ? iconOptions : iconOptions.slice(0, 9)))

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
    award: Award,
    code: Code,
    rocket: Rocket,
    flag: Flag,
    compass: Compass,
    map: Map,
    plane: Plane,
    home: Home,
    'graduation-cap': GraduationCap,
    lightbulb: Lightbulb,
    trophy: Trophy,
    'wallet-cards': WalletCards,
    'folder-kanban': FolderKanban,
    'calendar-days': CalendarDays,
  }
  return map[name] || Target
}

const taskIdsLinkedToOtherMilestones = computed(
  () =>
    new Set(
      branchesStore.branches.flatMap((branch) =>
        [
          ...(branch.directTaskIds || branch.taskIds || []),
          ...branch.milestones
            .filter((milestone) => milestone.id !== props.milestone.id)
            .flatMap((milestone) => milestone.taskIds),
        ]
      )
    )
)

const activeTasks = computed(() =>
  tasksStore.tasks.filter((task) => !task.done && task.type !== 'HABIT' && task.type !== 'PURCHASE')
)
const elsewhereIds = computed(() => [...taskIdsLinkedToOtherMilestones.value])
const canSubmit = computed(() => form.name.trim().length > 0)

const form = reactive({
  name: '',
  description: '',
  icon: 'target',
  markerColor: '#d6d6d6',
  taskIds: [] as string[],
})

watch(
  () => props.milestone,
  (newVal) => {
    nameTouched.value = false
    iconsExpanded.value = false

    if (newVal) {
      form.name = newVal.name
      form.description = newVal.description || ''
      form.icon = newVal.icon || 'target'
      form.markerColor = newVal.markerColor || newVal.backgroundColor || '#d6d6d6'
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
    markerColor: form.markerColor,
    taskIds: form.taskIds,
  })
}

async function handleDelete() {
  const ok = await confirm('Удалить этот этап?')
  if (!ok) return
  emit('delete')
  emit('close')
}

function handleQuickTask(data: TaskFormData) {
  const task = tasksStore.addTask({
    title: data.title || 'Новая задача',
    description: data.description,
    type: data.type || 'TASK_DAY',
    targetDate: data.targetDate,
    targetTime: data.targetTime,
    tagIds: data.tagIds || [],
    tags: data.tags || [],
  })
  if (!task) return
  form.taskIds.push(task.id)
  showQuickTask.value = false
}
</script>

<style scoped lang="scss">
.board-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.visual-row {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) 1px minmax(180px, 0.65fr);
  align-items: start;
  column-gap: var(--space-4);

  > :last-child {
    grid-column: 3;
  }

  &::after {
    content: '';
    grid-column: 2;
    grid-row: 1;
    align-self: stretch;
    width: 1px;
    background: var(--ui-border-color);
  }
}

.icon-section {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.selected-icon {
  display: inline-flex;
  align-items: center;
  color: var(--text);
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--control-icon-size), 1fr));
  align-items: center;
  justify-items: center;
  width: 100%;
  gap: var(--space-1);
}

.icons-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  align-self: flex-start;
  padding: var(--space-1) var(--space-2);
  color: var(--dim);
  font-size: var(--text-xs);
  background: transparent;
  border: none;
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;

  svg {
    transition: transform var(--transition-standard);
  }

  .rotated {
    transform: rotate(180deg);
  }
}

.icon-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  min-width: var(--control-icon-size);
  aspect-ratio: 1;
  color: var(--dim);
  background: transparent;
  border: none;
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  transition:
    color 0.16s ease,
    background 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;

  &:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    transform: translateY(-1px);
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

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-left: auto;
}

.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 160ms ease,
    transform 180ms cubic-bezier(0.2, 0, 0, 1);
  will-change: opacity, transform;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.reveal-item-enter-active,
.reveal-item-leave-active,
.reveal-item-move {
  transition:
    opacity 0.16s ease,
    transform 0.18s ease;
}

.reveal-item-enter-from,
.reveal-item-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.88);
}

.reveal-item-leave-active {
  position: absolute;
}
@media (max-width: 640px) {
  .board-form {
    gap: var(--space-3);
  }

  .visual-row {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1px auto;
    row-gap: var(--space-4);

    > :last-child {
      grid-column: 1;
      grid-row: 3;
    }

    &::after {
      grid-column: 1;
      grid-row: 2;
      width: auto;
      height: 1px;
    }
  }

  .icons-grid {
    grid-template-columns: repeat(auto-fit, minmax(var(--space-10), 1fr));
    gap: var(--space-2);
  }

  .icons-toggle {
    width: 100%;
    justify-content: center;
    white-space: normal;
    text-align: center;
  }

  .footer-actions {
    width: 100%;
    flex-direction: column;
    margin-left: 0;

    :deep(.app-button) {
      width: 100%;
    }
  }

  .icon-option {
    width: var(--space-10);
    height: var(--space-10);
    min-width: var(--space-10);
    min-height: var(--space-10);
  }
}
</style>
