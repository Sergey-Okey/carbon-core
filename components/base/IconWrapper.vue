<template>
  <span class="icon-wrapper">
    <component :is="iconComponent" :size="size" />
  </span>
</template>

<script setup lang="ts">
import * as icons from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{ name: string; size?: number }>()
const iconComponent = computed(() => (icons as any)[props.name] || null)
</script>

<style scoped lang="scss">
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
