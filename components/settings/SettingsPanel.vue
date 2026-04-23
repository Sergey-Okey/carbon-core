<template>
  <div class="settings-page">
    <!-- Группа: Внешний вид -->
    <section class="settings-group">
      <div class="group-header">
        <Palette :size="22" />
        <h3>Внешний вид</h3>
      </div>
      <div class="group-body">
        <div class="setting-row">
          <div class="setting-info">
            <span class="label">Тема</span>
            <span class="desc">{{ themeLabel }}</span>
          </div>
          <div class="theme-toggle">
            <button
              :class="[
                'theme-option',
                { active: settingsStore.theme === 'dark' },
              ]"
              @click="setTheme('dark')"
            >
              <Moon :size="18" />
            </button>
            <button
              :class="[
                'theme-option',
                { active: settingsStore.theme === 'light' },
              ]"
              @click="setTheme('light')"
            >
              <Sun :size="18" />
            </button>
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="label">Акцент</span>
            <span class="desc">{{ accentLabel }}</span>
          </div>
          <div class="accent-picker">
            <div class="color-dots">
              <button
                v-for="color in ACCENT_COLORS"
                :key="color.value"
                class="color-dot"
                :style="{ '--dot-color': color.value }"
                :class="{ active: settingsStore.accentColor === color.value }"
                @click="setAccentColor(color.value, color.name)"
                :title="color.name"
              />
            </div>
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="label">Анимации</span>
            <span class="desc">Плавные переходы интерфейса</span>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              :checked="settingsStore.animationsEnabled"
              @change="toggleAnimations"
            />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </section>

    <!-- Группа: Уведомления -->
    <section class="settings-group">
      <div class="group-header">
        <Bell :size="22" />
        <h3>Уведомления</h3>
      </div>
      <div class="group-body">
        <div class="setting-row">
          <div class="setting-info">
            <span class="label">Всплывающие сообщения</span>
            <span class="desc">Тосты при действиях</span>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              :checked="settingsStore.notificationsEnabled"
              @change="toggleNotifications"
            />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="label">Звук</span>
            <span class="desc">Короткий сигнал на события</span>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              :checked="settingsStore.soundEnabled"
              @change="toggleSound"
            />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </section>

    <!-- Группа: Данные -->
    <section class="settings-group">
      <div class="group-header">
        <Database :size="22" />
        <h3>Данные</h3>
      </div>
      <div class="group-body">
        <div class="setting-row">
          <div class="setting-info">
            <span class="label">Авто-бэкап при выходе</span>
            <span class="desc">Автоматическая резервная копия</span>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              :checked="settingsStore.autoBackup"
              @change="toggleAutoBackup"
            />
            <span class="slider"></span>
          </label>
        </div>
        <div v-if="settingsStore.lastBackupDate" class="backup-info">
          <Clock :size="14" />
          Последний бэкап: {{ lastBackupText }}
        </div>
        <div class="action-group">
          <button class="action-btn" @click="createBackup">
            <Download :size="16" />
            Создать бэкап
          </button>
          <button class="action-btn" @click="exportData">
            <FileJson :size="16" />
            Экспорт JSON
          </button>
          <button class="action-btn" @click="importData">
            <Upload :size="16" />
            Импорт JSON
          </button>
          <button class="action-btn" @click="restoreAutoBackup">
            <RotateCcw :size="16" />
            Восстановить
          </button>
          <button class="action-btn danger" @click="resetAllData">
            <Trash2 :size="16" />
            Сбросить всё
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Moon,
  Sun,
  Download,
  FileJson,
  Upload,
  Trash2,
  RotateCcw,
  Palette,
  Bell,
  Database,
  Clock,
} from 'lucide-vue-next'
import { ACCENT_COLORS, useSettingsStore } from '~/stores/settings.store'
import { useNotification } from '~/composables/useNotification'

const settingsStore = useSettingsStore()
const { addNotification } = useNotification()

const themeLabel = computed(() =>
  settingsStore.theme === 'dark' ? 'Тёмная' : 'Светлая'
)
const accentLabel = computed(() => {
  const found = ACCENT_COLORS.find((c) => c.value === settingsStore.accentColor)
  return found?.name ?? 'Пользовательский'
})
const lastBackupText = computed(() => {
  if (!settingsStore.lastBackupDate) return ''
  return new Date(settingsStore.lastBackupDate).toLocaleString('ru')
})

function setTheme(theme: 'dark' | 'light') {
  settingsStore.setTheme(theme)
  addNotification({
    type: 'info',
    message:
      theme === 'dark' ? 'Тёмная тема включена' : 'Светлая тема включена',
  })
}

function setAccentColor(color: string, name: string) {
  settingsStore.setAccentColor(color)
  addNotification({ type: 'success', message: `Акцент: ${name}` })
}

function toggleAnimations(e: Event) {
  const val = (e.target as HTMLInputElement).checked
  settingsStore.setAnimationsEnabled(val)
  addNotification({
    type: 'info',
    message: val ? 'Анимации включены' : 'Анимации отключены',
  })
}

function toggleNotifications(e: Event) {
  const val = (e.target as HTMLInputElement).checked
  settingsStore.setNotificationsEnabled(val)
  if (val) addNotification({ type: 'success', message: 'Уведомления включены' })
}

function toggleSound(e: Event) {
  const val = (e.target as HTMLInputElement).checked
  settingsStore.setSoundEnabled(val)
  addNotification({
    type: 'info',
    message: val ? 'Звук включён' : 'Звук отключён',
  })
}

function toggleAutoBackup(e: Event) {
  const val = (e.target as HTMLInputElement).checked
  settingsStore.setAutoBackup(val)
  addNotification({
    type: 'info',
    message: val ? 'Авто-бэкап включён' : 'Авто-бэкап отключён',
  })
}

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
  a.download = `cof-backup-${new Date().toISOString().split('T')[0]}.json`
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
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-group {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px 0;
  margin-bottom: 16px;
  color: var(--accent);

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
  }

  svg {
    opacity: 0.7;
  }
}

.group-body {
  padding: 0 24px 24px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid rgba(var(--dim-rgb, 136, 136, 136), 0.08);
  gap: 16px;

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
    font-size: 0.85rem;
    color: var(--dim);
    margin-top: 2px;
  }
}

.theme-toggle {
  display: flex;
  gap: 6px;
}

.theme-option {
  width: 38px;
  height: 38px;
  border-radius: var(--border-radius-sm);
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-standard);

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  &.active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--bg);
  }
}

.accent-picker .color-dots {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--dot-color);
  border: 2px solid transparent;
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.15s;
  padding: 0;

  &:hover {
    transform: scale(1.15);
  }

  &.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--bg);
    transform: scale(1.15);
  }
}

.switch {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    inset: 0;
    background: var(--border);
    border-radius: 24px;
    transition: background var(--transition-standard);

    &::before {
      content: '';
      position: absolute;
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background: var(--surface);
      border-radius: 50%;
      transition: transform var(--transition-standard);
      box-shadow: var(--shadow-sm);
    }
  }

  input:checked + .slider {
    background: var(--accent);
  }

  input:checked + .slider::before {
    transform: translateX(20px);
    background: var(--bg);
  }
}

.backup-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--dim);
  margin: 12px 0 16px;
  padding: 8px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
}

.action-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-standard);

  &:hover {
    background: var(--border);
    transform: translateY(-1px);
  }

  &.danger {
    color: var(--error);
    border-color: var(--error);

    &:hover {
      background: rgba(var(--error-rgb, 255, 77, 77), 0.1);
    }
  }
}
</style>
