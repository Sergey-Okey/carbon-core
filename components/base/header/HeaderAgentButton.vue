<template>
  <div class="header-agent-button">
    <svg class="header-agent-button__defs" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="header-agent-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8ec5ff" />
          <stop offset="55%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </linearGradient>
      </defs>
    </svg>
    <AppButton
      class="header-agent-trigger"
      variant="ghost"
      icon-only
      aria-label="Открыть агента"
      aria-haspopup="dialog"
      :aria-expanded="expanded"
      @click.stop="emit('toggle')"
    >
      <Sparkles :size="20" aria-hidden="true" />
    </AppButton>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

defineProps<{
  expanded?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<style scoped lang="scss">
.header-agent-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @include mobile {
    display: none;
  }
}

.header-agent-button__defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

.header-agent-trigger {
  position: relative;
}

.header-agent-trigger :deep(svg) {
  color: #3b82f6;
  stroke: url(#header-agent-gradient);
}
</style>
