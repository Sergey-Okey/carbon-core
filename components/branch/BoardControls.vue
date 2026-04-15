<template>
  <Panel position="top-right" class="board-controls">
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
    <button @click="$emit('rebuild')" title="Перестроить доску">
      <RefreshCw :size="18" />
    </button>
  </Panel>
</template>

<script setup lang="ts">
import { Panel } from '@vue-flow/core'
import { Maximize, ZoomIn, ZoomOut, RefreshCw } from 'lucide-vue-next'

defineEmits(['fit-view', 'zoom-in', 'zoom-out', 'rebuild'])
</script>

<style scoped lang="scss">
.board-controls {
  @include glass;
  display: flex;
  gap: 6px;
  padding: 8px;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border);
  margin: 12px;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--border-radius-sm);
    color: var(--accent);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background var(--transition-standard);

    &:hover {
      background: var(--surface);
    }
  }

  .divider {
    width: 1px;
    background: var(--border);
    margin: 0 4px;
  }
}
</style>
