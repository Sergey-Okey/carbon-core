<template>
  <Panel position="bottom-center" class="board-controls-panel">
    <div class="board-controls">
      <button @click="$emit('fit-view')" title="Сбросить вид">
        <Maximize :size="18" />
      </button>
      <button @click="$emit('zoom-in')" title="Приблизить">
        <ZoomIn :size="18" />
      </button>
      <button @click="$emit('zoom-out')" title="Отдалить">
        <ZoomOut :size="18" />
      </button>
      <div class="divider"></div>

      <button @click="$emit('align-layout')" title="Выровнять доску">
        <LayoutGrid :size="18" />
      </button>
      <div class="divider"></div>

      <button
        @click="$emit('add-branch')"
        title="Добавить ветку"
        :disabled="!canAddBranch"
      >
        <Plus :size="18" />
      </button>
      <button
        @click="$emit('add-milestone')"
        :title="canAddMilestone ? 'Добавить этап' : 'Выберите ветку или этап'"
        :disabled="!canAddMilestone"
      >
        <PlusCircle :size="18" />
      </button>
      <div class="divider"></div>

      <button
        v-if="hasSelection"
        @click="$emit('delete-selected')"
        :title="selectionType === 'edge' ? 'Разорвать связь' : 'Удалить выбранное'"
        class="delete-btn"
      >
        <Unlink2 v-if="selectionType === 'edge'" :size="18" />
        <Trash2 v-else :size="18" />
      </button>
      <div v-if="hasSelection" class="divider"></div>

      <button @click="$emit('undo')" title="Отменить" :disabled="!canUndo">
        <Undo :size="18" />
      </button>
      <button @click="$emit('redo')" title="Повторить" :disabled="!canRedo">
        <Redo :size="18" />
      </button>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { Panel } from '@vue-flow/core'
import {
  Maximize,
  ZoomIn,
  ZoomOut,
  Plus,
  PlusCircle,
  Trash2,
  Unlink2,
  Undo,
  Redo,
  LayoutGrid,
} from 'lucide-vue-next'

const props = defineProps<{
  canUndo?: boolean
  canRedo?: boolean
  canAddBranch?: boolean
  canAddMilestone?: boolean
  hasSelection?: boolean
  selectionType?: 'branch' | 'milestone' | 'edge' | 'none'
}>()

defineEmits([
  'fit-view',
  'zoom-in',
  'zoom-out',
  'align-layout',
  'add-branch',
  'add-milestone',
  'delete-selected',
  'undo',
  'redo',
])
</script>

<style scoped lang="scss">
.board-controls-panel {
  pointer-events: none;
  z-index: 10;
}

.board-controls {
  @include glass;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border-radius: var(--border-radius-pill);
  border: var(--ui-border);
  pointer-events: auto;
  transform: translateY(-16px);

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--control-icon-size);
    height: var(--control-icon-size);
    padding: 0;
    border-radius: var(--border-radius-pill);
    color: var(--accent);
    background: transparent;
    border: none;
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard),
      opacity var(--transition-standard),
      transform var(--transition-standard);

    &:hover {
      background: var(--glass-surface);
      transform: none;
    }

    &:active {
      transform: scale(0.96);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
    }
  }

  .delete-btn {
    color: var(--error);

    &:hover {
      background: var(--glass-surface);
      color: var(--accent);
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
