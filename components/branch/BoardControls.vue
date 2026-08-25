<template>
  <Panel position="bottom-center">
    <div class="board-controls-shell">
      <div class="board-controls-surface">
        <div class="board-controls">
          <AppSearch
            class="board-search"
            :model-value="searchQuery"
            :results="searchResults"
            :active-id="searchActiveId"
            variant="compact"
            size="sm"
            placeholder="Поиск"
            aria-label="Поиск на доске"
            @update:model-value="emit('update:searchQuery', $event)"
            @update:active-id="emit('update:searchActiveId', $event)"
            @select="emit('select-search', $event)"
            @enter="emit('search-next')"
            @clear="onClear"
          />
          <div class="divider"></div>

          <button @click="$emit('fit-view')" aria-label="Сбросить вид">
            <Maximize :size="18" />
          </button>
          <button @click="$emit('align-layout')" aria-label="Выровнять доску">
            <LayoutGrid :size="18" />
          </button>
          <button @click="$emit('export-png')" aria-label="Экспортировать доску в PNG">
            <ImageDown :size="18" />
          </button>
          <div class="divider"></div>

          <button
            @click="$emit('add-branch')"
            aria-label="Добавить ветку"
            data-tour="board-add-branch"
            :disabled="!canAddBranch"
          >
            <Plus :size="18" />
          </button>
          <button
            @click="$emit('add-milestone')"
            :aria-label="milestoneTooltip"
            data-tour="board-add-milestone"
            :disabled="!canAddMilestone"
          >
            <PlusCircle :size="18" />
          </button>
          <div class="divider"></div>

          <button
            v-if="hasSelection"
            @click="$emit('delete-selected')"
            :aria-label="deleteTooltip"
            class="delete-btn"
          >
            <Unlink2 v-if="selectionType === 'edge'" :size="18" />
            <Trash2 v-else :size="18" />
          </button>
          <div v-if="hasSelection" class="divider"></div>

          <button @click="$emit('undo')" aria-label="Отменить" :disabled="!canUndo">
            <Undo :size="18" />
          </button>
          <button @click="$emit('redo')" aria-label="Повторить" :disabled="!canRedo">
            <Redo :size="18" />
          </button>
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { Panel } from '@vue-flow/core'
import {
  Maximize,
  Plus,
  PlusCircle,
  Trash2,
  Unlink2,
  Undo,
  Redo,
  LayoutGrid,
  ImageDown,
} from 'lucide-vue-next'
import type { AppSearchResult } from '~/components/ui/forms/AppSearch.vue'

const props = defineProps<{
  canUndo?: boolean
  canRedo?: boolean
  canAddBranch?: boolean
  canAddMilestone?: boolean
  hasSelection?: boolean
  selectionType?: 'branch' | 'milestone' | 'edge' | 'none'
  searchQuery?: string
  searchResults?: AppSearchResult[]
  searchActiveId?: string | null
}>()

const emit = defineEmits([
  'fit-view',
  'align-layout',
  'export-png',
  'add-branch',
  'add-milestone',
  'delete-selected',
  'undo',
  'redo',
  'update:searchQuery',
  'update:searchActiveId',
  'select-search',
  'search-next',
])

const searchQuery = computed(() => props.searchQuery ?? '')
const searchResults = computed(() => props.searchResults ?? [])
const searchActiveId = computed(() => props.searchActiveId ?? null)

const milestoneTooltip = computed(() =>
  props.canAddMilestone ? 'Добавить этап' : 'Выберите ветку или этап'
)
const deleteTooltip = computed(() =>
  props.selectionType === 'edge' ? 'Разорвать связь' : 'Удалить выбранное'
)

function onClear() {
  emit('update:searchQuery', '')
  emit('update:searchActiveId', null)
}
</script>

<style scoped lang="scss">
:global(.vue-flow__panel.bottom.center:has(.board-controls-shell)) {
  overflow: visible;
  pointer-events: none;
  z-index: 10;
}


.board-controls-shell {
  position: relative;
  pointer-events: auto;
  transform: translateY(-16px);
}

.board-controls-surface {
  @include surface-panel;
  @include nest-shell(var(--border-radius-pill), 6px);
  background: var(--color-surface-1);
  overflow: visible;
}

.board-controls {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  pointer-events: auto;
  overflow: visible;

  .board-search {
    flex: 0 0 auto;
    z-index: 2;
  }

  button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--control-icon-size);
    height: var(--control-icon-size);
    padding: 0;
    @include nest-item;
    color: var(--text);
    background: transparent;
    border: none;
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard),
      opacity var(--transition-standard);

    &:hover {
      background: color-mix(in srgb, var(--accent) 8%, transparent);
    }

    &:active {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  @include mobile {
    button {
      width: 44px;
      height: 44px;
    }
  }

  .delete-btn {
    color: var(--error);

    &:hover {
      background: color-mix(in srgb, var(--error) 12%, transparent);
      color: var(--error);
      transform: none;
    }
  }

  .divider {
    width: 1px;
    height: 20px;
    background: var(--ui-border-color);
    margin: 0 2px;
  }
}
</style>
