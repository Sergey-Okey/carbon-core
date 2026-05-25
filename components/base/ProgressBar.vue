<template>
  <div class="progress-bar-wrapper">
    <div v-if="label" class="label">
      {{ label }} <span v-if="showPercent">{{ percent }}%</span>
    </div>
    <div class="progress-bar" :style="{ height: height }">
      <div class="progress-fill" :style="{ width: percent + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    max: number
    label?: string
    showPercent?: boolean
    height?: string
  }>(),
  {
    height: '8px',
  }
)

const percent = computed(() => {
  if (props.max <= 0) return 0
  return Math.min(100, (props.value / props.max) * 100)
})
</script>

<style scoped lang="scss">
.progress-bar-wrapper {
  width: 100%;
}

.label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 4px;
  color: var(--dim);
}

.progress-bar {
  background: var(--border);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  width: 100%;
}

.progress-fill {
  background: var(--accent);
  height: 100%;
  border-radius: var(--border-radius-sm);
  transition: width 0.6s cubic-bezier(0.2, 0, 0, 1);
}
</style>
