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
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  padding: calc(88px + env(safe-area-inset-top, 0px))
    max(20px, env(safe-area-inset-right, 0px))
    calc(96px + env(safe-area-inset-bottom, 0px))
    max(20px, env(safe-area-inset-left, 0px));
  box-sizing: border-box;
}

.stub-card {
  display: grid;
  justify-items: center;
  gap: 12px;
  width: min(100%, 360px);
  padding: 28px 22px;
  text-align: center;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background: var(--color-surface-1, var(--glass-surface));
}

.stub-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin-bottom: 4px;
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--accent);
}

h2 {
  margin: 0;
  color: var(--text);
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.25;
}

p {
  margin: 0;
  color: var(--dim);
  font-size: 0.88rem;
  line-height: 1.5;
}
</style>
