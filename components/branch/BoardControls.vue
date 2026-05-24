<template>
  <Panel position="bottom-center" class="board-controls-panel">
    <div class="board-controls">
      <!-- Группа 1: вид и зум -->
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

      <!-- Группа 2: выравнивание (только по кнопке) -->
      <button @click="$emit('align-layout')" title="Выровнить положение">
        <RefreshCw :size="18" />
      </button>
      <div class="divider"></div>

      <!-- Группа 3: создание элементов -->
      <button
        @click="$emit('add-branch')"
        title="Добавить ветку"
        :disabled="!canAddBranch"
      >
        <Plus :size="18" />
      </button>
      <button
        @click="$emit('add-milestone')"
        title="Добавить этап"
        :disabled="!canAddMilestone"
      >
        <PlusCircle :size="18" />
      </button>
      <div class="divider"></div>

      <!-- Группа 4: действия с выбранным элементом -->
      <button
        v-if="selectedEdgeId"
        @click="$emit('delete-selected')"
        title="Разорвать связь"
        class="unlink-btn"
      >
        <Unlink :size="18" />
      </button>
      <button
        v-else-if="selectedNodeId"
        @click="$emit('delete-selected')"
        title="Удалить выбранное"
        class="delete-btn"
      >
        <Trash2 :size="18" />
      </button>
      <div v-if="selectedEdgeId || selectedNodeId" class="divider"></div>

      <!-- Группа 5: история -->
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
  Unlink,
  Undo,
  Redo,
  RefreshCw,
} from 'lucide-vue-next'

defineProps<{
  canUndo?: boolean
  canRedo?: boolean
  canAddBranch?: boolean
  canAddMilestone?: boolean
  selectedNodeId?: string | null
  selectedEdgeId?: string | null
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
  gap: 6px;
  padding: 8px 12px;
  border-radius: 40px;
  border: 1px solid var(--border);
  background: transparent;
  pointer-events: auto;
  backdrop-filter: blur(16px);
  transform: translateY(-16px);

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--accent);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--surface);
      transform: scale(1.08);
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
      background: transparent;
    }
  }

  .unlink-btn {
    color: var(--warning);
    &:hover {
      background: transparent;
    }
  }

  .divider {
    width: 1px;
    height: 24px;
    background: var(--border);
    margin: 0 4px;
  }
}
</style>
