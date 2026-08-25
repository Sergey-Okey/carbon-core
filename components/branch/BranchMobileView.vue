<template>
  <div class="branch-mobile-stub">
    <div class="stub-card">
      <div class="stub-icon" aria-hidden="true">
        <MonitorUp :size="28" />
      </div>
      <h2>Доска пока на компьютере</h2>
      <p>
        Мобильная версия в разработке. Откройте Core of Life на десктопе, чтобы
        работать с ветками, этапами и связями.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MonitorUp } from 'lucide-vue-next'
</script>

<style scoped lang="scss">
.branch-mobile-stub {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: calc(var(--space-12) + var(--space-10) + env(safe-area-inset-top, 0px))
    max(var(--space-5), env(safe-area-inset-right, 0px))
    calc(var(--space-16) + var(--space-2) + env(safe-area-inset-bottom, 0px))
    max(var(--space-5), env(safe-area-inset-left, 0px));
}

.stub-card {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  width: min(100%, 360px);
  padding: var(--space-7) var(--space-6);
  text-align: center;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background: var(--color-surface-1, var(--glass-surface));
}

.stub-icon {
  display: grid;
  place-items: center;
  width: var(--space-12);
  height: var(--space-12);
  margin-bottom: var(--space-1);
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--accent);
}

h2 {
  margin: 0;
  color: var(--text);
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.25;
}

p {
  margin: 0;
  color: var(--dim);
  font-size: var(--text-sm);
  line-height: 1.5;
}
</style>
