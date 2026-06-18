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
      <button @click="$emit('export-png')" aria-label="Экспортировать доску в PNG" data-tooltip="Экспортировать доску в PNG">
        <ImageDown :size="18" />
      </button>
      <label class="handle-control" aria-label="Дистанция между узлами">
        <Route :size="16" />
        <span class="handle-track">
        <input
          :value="spacing"
          type="range"
          :min="120"
          :max="320"
          :step="10"
          @input="$emit('update:spacing', Number(($event.target as HTMLInputElement).value))"
        />
        </span>
      </label>
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
  ImageDown,
  Route,
} from 'lucide-vue-next'

const props = defineProps<{
  canUndo?: boolean
  canRedo?: boolean
  canAddBranch?: boolean
  canAddMilestone?: boolean
  hasSelection?: boolean
  selectionType?: 'branch' | 'milestone' | 'edge' | 'none'
  spacing?: number
}>()

defineEmits([
  'fit-view',
  'zoom-in',
  'zoom-out',
  'align-layout',
  'export-png',
  'update:spacing',
  'add-branch',
  'add-milestone',
  'delete-selected',
  'undo',
  'redo',
])

const spacing = computed(() => props.spacing ?? 170)

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
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border-radius: var(--border-radius-pill);
  border: var(--ui-border);
  background: color-mix(in srgb, var(--surface) 68%, transparent);
  backdrop-filter: var(--glass-strong-filter) !important;
  -webkit-backdrop-filter: var(--glass-strong-filter) !important;
  pointer-events: auto;
  transform: translateY(-16px);
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    background: var(--glass-surface);
    backdrop-filter: var(--glass-strong-filter);
    -webkit-backdrop-filter: var(--glass-strong-filter);
    pointer-events: none;
  }

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

  .handle-control {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 112px;
    padding-inline: 8px 6px;
    color: var(--dim);

    .handle-track {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 72px;
      height: 14px;

      &::before {
        content: '';
        position: absolute;
        inset: 50% 0 auto;
        height: 2px;
        transform: translateY(-50%);
        border-radius: 999px;
        background:
          linear-gradient(
            90deg,
            color-mix(in srgb, var(--accent) 72%, white 6%) 0%,
            color-mix(in srgb, var(--accent) 42%, transparent) 55%,
            color-mix(in srgb, var(--text) 14%, transparent) 100%
          );
        opacity: 0.95;
        pointer-events: none;
      }
    }

    input {
      position: relative;
      z-index: 1;
      width: 72px;
      height: 14px;
      margin: 0;
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      cursor: ew-resize;

      &::-webkit-slider-runnable-track {
        height: 2px;
        background: transparent;
      }

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 10px;
        height: 10px;
        margin-top: -4px;
        border: none;
        border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--bg) 80%, transparent);
        transition:
          transform var(--transition-standard),
          box-shadow var(--transition-standard),
          opacity var(--transition-standard);
      }

      &::-moz-range-track {
        height: 2px;
        background: transparent;
        border: none;
      }

      &::-moz-range-thumb {
        width: 10px;
        height: 10px;
        border: none;
        border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--bg) 80%, transparent);
        transition:
          transform var(--transition-standard),
          box-shadow var(--transition-standard),
          opacity var(--transition-standard);
      }

      &:hover::-webkit-slider-thumb,
      &:focus-visible::-webkit-slider-thumb {
        transform: scale(1.08);
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--bg) 78%, transparent),
          0 0 0 5px color-mix(in srgb, var(--accent) 12%, transparent);
      }

      &:hover::-moz-range-thumb,
      &:focus-visible::-moz-range-thumb {
        transform: scale(1.08);
        box-shadow:
          0 0 0 1px color-mix(in srgb, var(--bg) 78%, transparent),
          0 0 0 5px color-mix(in srgb, var(--accent) 12%, transparent);
      }
    }
  }
}
</style>
