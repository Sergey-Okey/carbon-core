<template>
  <div class="tag-manager">
    <form class="tag-create" @submit.prevent="createTag">
      <AppInput v-model="newTagName" placeholder="Новый тег" aria-label="Название нового тега" />
      <AppCustomColorPicker v-model="newTagColor" label="Цвет нового тега" />
      <AppButton type="submit" variant="primary" :disabled="!newTagName.trim()">
        <Plus :size="16" />
        Создать
      </AppButton>
    </form>

    <div v-if="sortedTags.length" class="tag-list">
      <div v-for="tag in sortedTags" :key="tag.id" class="tag-row">
        <template v-if="editingId === tag.id">
          <div class="tag-edit">
            <AppInput v-model="draftName" aria-label="Название тега" @keydown.enter.prevent="saveEdit(tag.id)" />
            <AppCustomColorPicker v-model="draftColor" label="Цвет тега" />
          </div>
          <div class="tag-actions">
            <button type="button" aria-label="Отменить" data-tooltip="Отменить" @click="cancelEdit">
              <X :size="16" />
            </button>
            <button type="button" aria-label="Сохранить" data-tooltip="Сохранить" @click="saveEdit(tag.id)">
              <Check :size="16" />
            </button>
          </div>
        </template>

        <template v-else>
          <div class="tag-summary">
            <span class="tag-marker" :style="{ '--tag-color': tag.color || 'var(--accent)' }" />
            <div>
              <strong>{{ tag.name }}</strong>
              <span>{{ usageLabel(tag.id) }}</span>
            </div>
          </div>
          <div class="tag-actions">
            <button type="button" aria-label="Редактировать тег" data-tooltip="Редактировать" @click="startEdit(tag)">
              <Pencil :size="16" />
            </button>
            <button
              type="button"
              class="danger"
              aria-label="Удалить тег"
              data-tooltip="Удалить"
              @click="removeTag(tag.id, tag.name)"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </template>
      </div>
    </div>

    <EmptyState
      v-else
      size="sm"
      title="Тегов пока нет"
      description="Создайте первый, чтобы группировать задачи и привычки."
    >
      <template #icon>
        <Tags :size="18" />
      </template>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Pencil, Plus, Tags, Trash2, X } from 'lucide-vue-next'
import AppButton from '~/components/ui/primitives/AppButton.vue'
import AppCustomColorPicker from '~/components/ui/forms/AppCustomColorPicker.vue'
import AppInput from '~/components/ui/primitives/AppInput.vue'
import EmptyState from '~/components/ui/feedback/EmptyState.vue'
import { useConfirm } from '~/composables/useConfirm'
import { useNotification } from '~/composables/useNotification'
import { useTagsStore } from '~/stores/tags.store'
import { useTasksStore } from '~/stores/tasks.store'
import type { Tag } from '~/types/tag.types'

const tagsStore = useTagsStore()
const tasksStore = useTasksStore()
const { confirm } = useConfirm()
const { success, warning } = useNotification()

const newTagName = ref('')
const newTagColor = ref('var(--accent)')
const editingId = ref<string | null>(null)
const draftName = ref('')
const draftColor = ref('var(--accent)')

const sortedTags = computed(() => [...tagsStore.tags].sort((a, b) => a.order - b.order))

function createTag() {
  const name = newTagName.value.trim()
  if (!name) return

  const existing = tagsStore.findTagByName(name)
  if (existing) {
    warning('Такой тег уже существует')
    return
  }

  tagsStore.addTag({
    name,
    color: newTagColor.value,
    branchId: '',
    order: tagsStore.tags.length,
  })
  newTagName.value = ''
  newTagColor.value = 'var(--accent)'
  success(`Тег «${name}» создан`)
}

function startEdit(tag: Tag) {
  editingId.value = tag.id
  draftName.value = tag.name
  draftColor.value = tag.color || 'var(--accent)'
}

function cancelEdit() {
  editingId.value = null
}

function saveEdit(id: string) {
  const name = draftName.value.trim()
  if (!name) return

  tagsStore.updateTag(id, { name, color: draftColor.value }, tasksStore.tasks)
  editingId.value = null
  success('Тег обновлён')
}

async function removeTag(id: string, name: string) {
  const usage = usageCount(id)
  const message = usage
    ? `Удалить тег «${name}» и отвязать его от ${usage} элементов?`
    : `Удалить тег «${name}»?`
  if (!(await confirm(message))) return

  tagsStore.deleteTag(id, tasksStore.tasks)
  success('Тег удалён')
}

function usageCount(id: string) {
  return tasksStore.tasks.filter((task) => {
    return task.tagIds.includes(id) || task.tags?.some((tag) => tag.id === id)
  }).length
}

function usageLabel(id: string) {
  const count = usageCount(id)
  return count ? `Используется: ${count}` : 'Не используется'
}
</script>

<style scoped lang="scss">
.tag-manager {
  display: grid;
  gap: 14px;
}

.tag-create {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 10px;
}

.tag-list {
  display: grid;
}

.tag-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 62px;
  padding: 10px 0;
  border-bottom: var(--ui-border);

  &:last-child {
    border-bottom: 0;
  }
}

.tag-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  div {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  strong {
    overflow: hidden;
    color: var(--text);
    font-size: 0.9rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: var(--dim);
    font-size: 0.75rem;
  }
}

.tag-marker {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  border-radius: var(--border-radius-pill);
  background: var(--tag-color);
}

.tag-edit {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.tag-actions {
  display: flex;
  align-items: center;
  gap: 4px;

  button {
    display: inline-grid;
    place-items: center;
    width: var(--control-icon-size);
    height: var(--control-icon-size);
    padding: 0;
    border: 0;
    border-radius: var(--border-radius-pill);
    background: transparent;
    color: var(--dim);
    cursor: pointer;

    &:hover {
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      color: var(--text);
    }

    &.danger:hover {
      background: color-mix(in srgb, var(--error) 10%, transparent);
      color: var(--error);
    }
  }
}

@include mobile {
  .tag-create {
    grid-template-columns: minmax(0, 1fr) auto;

    :deep(.app-button) {
      grid-column: 1 / -1;
      width: 100%;
      min-height: 44px;
    }
  }

  .tag-row {
    min-height: 68px;
  }

  .tag-actions button {
    width: 44px;
    height: 44px;
  }
}
</style>
