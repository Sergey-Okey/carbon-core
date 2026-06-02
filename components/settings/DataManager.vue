<template>
  <GlassCard>
    <h4>Управление данными</h4>
    <div class="actions">
      <button @click="exportData">Экспорт JSON</button>
      <label class="import-btn">
        Импорт JSON
        <input type="file" accept=".json" @change="importData" />
      </label>
      <button class="danger" @click="resetData">Сбросить всё</button>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '~/components/base/GlassCard.vue'

function exportData() {
  const data = {
    user: JSON.parse(localStorage.getItem('carbon-user') || '{}'),
    quests: JSON.parse(localStorage.getItem('carbon-quests') || '[]'),
    branches: JSON.parse(localStorage.getItem('carbon-branches') || '[]'),
    rewards: JSON.parse(localStorage.getItem('carbon-rewards') || '[]'),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `carbon-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importData(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target?.result as string)
      if (data.user)
        localStorage.setItem('carbon-user', JSON.stringify(data.user))
      if (data.quests)
        localStorage.setItem('carbon-quests', JSON.stringify(data.quests))
      if (data.branches)
        localStorage.setItem('carbon-branches', JSON.stringify(data.branches))
      if (data.rewards)
        localStorage.setItem('carbon-rewards', JSON.stringify(data.rewards))
      window.location.reload()
    } catch {
      alert('Ошибка импорта')
    }
  }
  reader.readAsText(file)
}

function resetData() {
  if (confirm('Удалить все данные? Это действие необратимо.')) {
    localStorage.clear()
    window.location.reload()
  }
}
</script>

<style scoped lang="scss">
h4 {
  color: var(--accent);
  margin-bottom: 16px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  button,
  .import-btn {
    padding: 10px 16px;
    min-height: var(--control-height-md);
    background: transparent;
    border-radius: var(--border-radius-pill);
    cursor: pointer;
    color: var(--accent);
    border: var(--ui-border);
    &:hover {
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      border-color: var(--ui-border-color);
    }
    &.danger {
      color: var(--bg);
      background: var(--error);
      border-color: transparent;

      &:hover {
        color: var(--bg);
        background: var(--error);
      }
    }
  }
  .import-btn {
    position: relative;
    input {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      cursor: pointer;
    }
  }

  @include mobile {
    button,
    .import-btn {
      min-height: 44px;
    }
  }
}
</style>
