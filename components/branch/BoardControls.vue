<template>
  <Panel position="bottom-center" class="board-controls-panel">
    <div class="board-controls">
      <button @click="$emit('fit-view')" aria-label="Сбросить вид" data-tooltip="Сбросить вид">
        <Maximize :size="18" />
      </button>
      <button @click="$emit('zoom-in')" aria-label="Приблизить" data-tooltip="Приблизить">
        <ZoomIn :size="18" />
      </button>
      <button @click="$emit('zoom-out')" aria-label="Отдалить" data-tooltip="Отдалить">
        <ZoomOut :size="18" />
      </button>
      <div class="divider"></div>

      <button @click="$emit('align-layout')" aria-label="Выровнять доску" data-tooltip="Выровнять доску">
        <LayoutGrid :size="18" />
      </button>
      <div class="divider"></div>

      <button
        @click="$emit('add-branch')"
        aria-label="Добавить ветку"
        data-tooltip="Добавить ветку"
        data-tour="board-add-branch"
        :disabled="!canAddBranch"
      >
        <Plus :size="18" />
      </button>
      <button
        @click="$emit('add-milestone')"
        :aria-label="milestoneTooltip"
        :data-tooltip="milestoneTooltip"
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
        :data-tooltip="deleteTooltip"
        class="delete-btn"
      >
        <Unlink2 v-if="selectionType === 'edge'" :size="18" />
        <Trash2 v-else :size="18" />
      </button>
      <div v-if="hasSelection" class="divider"></div>

      <button @click="$emit('undo')" aria-label="Отменить" data-tooltip="Отменить" :disabled="!canUndo">
        <Undo :size="18" />
      </button>
      <button @click="$emit('redo')" aria-label="Повторить" data-tooltip="Повторить" :disabled="!canRedo">
        <Redo :size="18" />
      </button>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const milestoneTooltip = computed(() =>
  props.canAddMilestone ? 'Добавить этап' : 'Выберите ветку или этап'
)
const deleteTooltip = computed(() =>
  props.selectionType === 'edge' ? 'Разорвать связь' : 'Удалить выбранное'
)
</script>

<style scoped lang="scss">
.board-controls-panel {
  pointer-events: none;
  z-index: 10;
  overflow: visible;
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
  overflow: visible;

  button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--control-icon-size);
    height: var(--control-icon-size);
    padding: 0;
    border-radius: var(--border-radius-pill);
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
      background: var(--glass-surface);
      color: var(--text);
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
