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

      <!-- Группа 2: правка и расположение -->
      <button @click="$emit('auto-layout')" title="Авто-расположение">
        <Layout :size="18" />
      </button>
      <button @click="$emit('add-branch')" title="Добавить ветку">
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

      <!-- Группа 3: действия с выбранным элементом -->
      <button
        v-if="hasSelection"
        @click="$emit('delete-selected')"
        title="Удалить выбранное"
      >
        <Trash2 :size="18" />
      </button>
      <div v-if="hasSelection" class="divider"></div>

      <!-- Группа 4: история -->
      <button @click="$emit('undo')" title="Отменить" :disabled="!canUndo">
        <Undo :size="18" />
      </button>
      <button @click="$emit('redo')" title="Повторить" :disabled="!canRedo">
        <Redo :size="18" />
      </button>
      <div class="divider"></div>

      <!-- Группа 5: перестроение -->
      <button @click="$emit('rebuild')" title="Перестроить доску">
        <RefreshCw :size="18" />
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
  Layout,
  Plus,
  PlusCircle,
  Trash2,
  Undo,
  Redo,
  RefreshCw,
} from 'lucide-vue-next'

defineProps<{
  canUndo?: boolean
  canRedo?: boolean
  canAddMilestone?: boolean
  hasSelection?: boolean
}>()

defineEmits([
  'fit-view',
  'zoom-in',
  'zoom-out',
  'auto-layout',
  'add-branch',
  'add-milestone',
  'delete-selected',
  'undo',
  'redo',
  'rebuild',
])
</script>

<style scoped lang="scss">
.board-controls-panel {
  pointer-events: none; // чтобы панель не перехватывала клики на канвас
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
  background: transparent; // убираем фоновый цвет – только glass и размытие
  pointer-events: auto; // кнопки кликабельны
  backdrop-filter: blur(16px);
  transform: translateY(-16px); // маленький отступ от нижнего края

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

  .divider {
    width: 1px;
    height: 24px;
    background: var(--border);
    margin: 0 4px;
  }
}
</style>