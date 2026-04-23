<template>
  <div class="settings-page">
    <div class="settings-grid">
      <!-- Внешний вид -->
      <GlassCard class="settings-card">
        <h3>Внешний вид</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="label">Тема</span>
            <span class="desc">Светлая или тёмная</span>
          </div>
          <div class="theme-toggle">
            <button
              class="theme-option"
              :class="{ active: settingsStore.theme === 'dark' }"
              @click="settingsStore.setTheme('dark')"
            >
              <Moon :size="18" />
            </button>
            <button
              class="theme-option"
              :class="{ active: settingsStore.theme === 'light' }"
              @click="settingsStore.setTheme('light')"
            >
              <Sun :size="18" />
            </button>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="label">Акцентный цвет</span>
            <span class="desc">Выберите оттенок</span>
          </div>
          <div class="color-options">
            <button
              v-for="color in ACCENT_COLORS"
              :key="color.value"
              class="color-dot"
              :style="{ backgroundColor: color.value }"
              :class="{ active: settingsStore.accentColor === color.value }"
              @click="settingsStore.setAccentColor(color.value)"
              :title="color.name"
            />
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="label">Анимации</span>
            <span class="desc">Плавные переходы</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="settingsStore.animationsEnabled" />
            <span class="slider"></span>
          </label>
        </div>
      </GlassCard>

      <!-- Уведомления -->
      <GlassCard class="settings-card">
        <h3>Уведомления</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="label">Звук</span>
            <span class="desc">Короткий сигнал</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="settingsStore.soundEnabled" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="label">Всплывающие сообщения</span>
            <span class="desc">Показывать тосты</span>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              v-model="settingsStore.notificationsEnabled"
            />
            <span class="slider"></span>
          </label>
        </div>
      </GlassCard>

      <!-- Данные и бэкап -->
      <GlassCard class="settings-card">
        <h3>Данные</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="label">Авто-бэкап при выходе</span>
            <span class="desc">Сохранять копию</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="settingsStore.autoBackup" />
            <span class="slider"></span>
          </label>
        </div>
        <div v-if="settingsStore.lastBackupDate" class="backup-info">
          Последний:
          {{ new Date(settingsStore.lastBackupDate).toLocaleString() }}
        </div>
        <div class="action-group">
          <button class="action-btn" @click="createBackup">
            <Download :size="16" /> Бэкап
          </button>
          <button class="action-btn" @click="exportData">
            <FileJson :size="16" /> Экспорт
          </button>
          <button class="action-btn" @click="importData">
            <Upload :size="16" /> Импорт
          </button>
          <button class="action-btn" @click="restoreAutoBackup">
            <RotateCcw :size="16" /> Восстановить
          </button>
          <button class="action-btn danger" @click="resetAllData">
            <Trash2 :size="16" /> Сброс
          </button>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Moon,
  Sun,
  Download,
  FileJson,
  Upload,
  Trash2,
  RotateCcw,
} from 'lucide-vue-next'
import { ACCENT_COLORS, useSettingsStore } from '~/stores/settings.store'
import { useNotification } from '~/composables/useNotification'
import GlassCard from '~/components/base/GlassCard.vue'

const settingsStore = useSettingsStore()
const { addNotification } = useNotification()

function createBackup() {
  const data = {
    user: JSON.parse(localStorage.getItem('carbon-user') || '{}'),
    tasks: JSON.parse(localStorage.getItem('carbon-tasks') || '[]'),
    branches: JSON.parse(localStorage.getItem('carbon-branches') || '[]'),
    rewards: JSON.parse(localStorage.getItem('carbon-rewards') || '[]'),
    tags: JSON.parse(localStorage.getItem('carbon-tags') || '[]'),
    ui: JSON.parse(localStorage.getItem('carbon-ui') || '{}'),
    settings: JSON.parse(localStorage.getItem('carbon-settings') || '{}'),
  }
  localStorage.setItem('carbon-autobackup-latest', JSON.stringify(data))
  settingsStore.recordBackup()
  addNotification({ type: 'success', message: 'Резервная копия создана' })
}

function exportData() {
  const data = {
    user: JSON.parse(localStorage.getItem('carbon-user') || '{}'),
    tasks: JSON.parse(localStorage.getItem('carbon-tasks') || '[]'),
    branches: JSON.parse(localStorage.getItem('carbon-branches') || '[]'),
    rewards: JSON.parse(localStorage.getItem('carbon-rewards') || '[]'),
    tags: JSON.parse(localStorage.getItem('carbon-tags') || '[]'),
    ui: JSON.parse(localStorage.getItem('carbon-ui') || '{}'),
    settings: JSON.parse(localStorage.getItem('carbon-settings') || '{}'),
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
  addNotification({ type: 'success', message: 'Данные экспортированы' })
}

function importData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      if (data.user)
        localStorage.setItem('carbon-user', JSON.stringify(data.user))
      if (data.tasks)
        localStorage.setItem('carbon-tasks', JSON.stringify(data.tasks))
      if (data.branches)
        localStorage.setItem('carbon-branches', JSON.stringify(data.branches))
      if (data.rewards)
        localStorage.setItem('carbon-rewards', JSON.stringify(data.rewards))
      if (data.tags)
        localStorage.setItem('carbon-tags', JSON.stringify(data.tags))
      if (data.ui) localStorage.setItem('carbon-ui', JSON.stringify(data.ui))
      if (data.settings)
        localStorage.setItem('carbon-settings', JSON.stringify(data.settings))
      addNotification({
        type: 'success',
        message: 'Данные импортированы. Перезагрузка...',
      })
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      addNotification({ type: 'error', message: 'Ошибка импорта' })
    }
  }
  input.click()
}

function restoreAutoBackup() {
  const backup = localStorage.getItem('carbon-autobackup-latest')
  if (!backup) {
    addNotification({ type: 'warning', message: 'Нет сохранённой копии' })
    return
  }
  try {
    const data = JSON.parse(backup)
    if (data.user)
      localStorage.setItem('carbon-user', JSON.stringify(data.user))
    if (data.tasks)
      localStorage.setItem('carbon-tasks', JSON.stringify(data.tasks))
    if (data.branches)
      localStorage.setItem('carbon-branches', JSON.stringify(data.branches))
    if (data.rewards)
      localStorage.setItem('carbon-rewards', JSON.stringify(data.rewards))
    if (data.tags)
      localStorage.setItem('carbon-tags', JSON.stringify(data.tags))
    if (data.ui) localStorage.setItem('carbon-ui', JSON.stringify(data.ui))
    if (data.settings)
      localStorage.setItem('carbon-settings', JSON.stringify(data.settings))
    addNotification({
      type: 'success',
      message: 'Данные восстановлены. Перезагрузка...',
    })
    setTimeout(() => window.location.reload(), 1000)
  } catch {
    addNotification({ type: 'error', message: 'Ошибка восстановления' })
  }
}

function resetAllData() {
  if (confirm('Удалить все данные? Это действие необратимо.')) {
    localStorage.clear()
    addNotification({
      type: 'success',
      message: 'Данные сброшены. Перезагрузка...',
    })
    setTimeout(() => window.location.reload(), 1000)
  }
}
</script>

<style scoped lang="scss">
.settings-page {
  padding: 8px 0 32px;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @include desktop {
    grid-template-columns: repeat(2, 1fr);
  }
}

.settings-card {
  padding: 20px;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--accent);
    letter-spacing: -0.01em;
    border-bottom: 1px solid var(--border);
    padding-bottom: 10px;
  }
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--dim) 20%, transparent);

  &:last-of-type {
    border-bottom: none;
  }
}

.setting-info {
  .label {
    font-weight: 500;
    color: var(--accent);
    display: block;
  }
  .desc {
    font-size: 0.8rem;
    color: var(--dim);
  }
}

.theme-toggle {
  display: flex;
  gap: 6px;

  .theme-option {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--border-radius-sm);
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--dim);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--border);
      color: var(--accent);
    }

    &.active {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--bg);
    }
  }
}

.color-options {
  display: flex;
  gap: 8px;

  .color-dot {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: scale(1.1);
    }

    &.active {
      border-color: var(--bg);
      box-shadow: 0 0 0 2px var(--accent);
    }
  }
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--border);
    transition: 0.2s;
    border-radius: 22px;

    &:before {
      position: absolute;
      content: '';
      height: 16px;
      width: 16px;
      left: 3px;
      bottom: 3px;
      background-color: var(--surface);
      transition: 0.2s;
      border-radius: 50%;
    }
  }

  input:checked + .slider {
    background-color: var(--accent);
  }

  input:checked + .slider:before {
    transform: translateX(18px);
  }
}

.backup-info {
  font-size: 0.8rem;
  color: var(--dim);
  margin: 8px 0 12px;
}

.action-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-sm);
    color: var(--accent);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--border);
    }

    &.danger {
      color: var(--error);
      border-color: var(--error);
      &:hover {
        background: color-mix(in srgb, var(--error) 10%, transparent);
      }
    }
  }
}
</style>
