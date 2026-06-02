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

      <div class="visual-row">
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
                  :aria-label="icon"
                  @click="form.icon = icon"
                >
                  <component :is="iconComponent(icon)" :size="20" />
                </button>
              </div>
            </Transition>
          </div>
        </AppFormField>

        <AppFormField label="Цвет маркера">
          <AppCustomColorPicker v-model="form.markerColor" label="Выбрать цвет" />
        </AppFormField>
      </div>

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
import AppCustomColorPicker from '~/components/ui/AppCustomColorPicker.vue'
import AppFormField from '~/components/ui/AppFormField.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppModal from '~/components/ui/AppModal.vue'
import type { Branch } from '~/types/branch.types'

const props = defineProps<{ branch?: Branch | null }>()
const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'save',
    data: { name: string; icon: string; description: string; taskIds: string[]; markerColor: string }
  ): void
  (e: 'delete'): void
}>()

const iconsExpanded = ref(false)
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

const canSubmit = computed(() => form.name.trim().length > 0)

const form = reactive({
  name: '',
  icon: 'target',
  description: '',
  markerColor: '#d6d6d6',
  taskIds: [] as string[],
})

watch(
  () => props.branch,
  (newBranch) => {
    nameTouched.value = false
    iconsExpanded.value = false

    if (newBranch) {
      form.name = newBranch.displayName
      form.icon = newBranch.icon
      form.description = newBranch.description || ''
      form.markerColor = newBranch.markerColor || newBranch.backgroundColor || '#d6d6d6'
      form.taskIds = [...(newBranch.taskIds || [])]
    } else {
      form.name = ''
      form.icon = 'target'
      form.description = ''
      form.markerColor = '#d6d6d6'
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

.visual-row {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(180px, 0.65fr);
  align-items: start;
  gap: 14px;
}

.icon-section {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: var(--control-height-md);
  padding: 0 14px;
  color: var(--text);
  background: transparent;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--text);
  }

  .rotated {
    transform: rotate(180deg);
  }
}

.selected-icon {
  display: inline-flex;
  align-items: center;
  color: var(--text);
}

.icons-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(38px, 1fr));
  gap: 8px;
}

.icon-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  color: var(--dim);
  background: transparent;
  border: none;
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  transition:
    color var(--transition-standard),
    background var(--transition-standard);

  &:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
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
  .visual-row {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .footer-actions {
    width: 100%;
    flex-direction: column;
    margin-left: 0;
  }

  .toggle-btn,
  .icon-option {
    min-height: 44px;
  }

}
</style>
