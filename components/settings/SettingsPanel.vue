<template>
  <div class="settings-page">
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
              :class="['theme-option', { active: settingsStore.theme === 'dark' }]"
              @click="setTheme('dark')"
            >
              <Moon :size="18" />
            </button>
            <button
              :class="['theme-option', { active: settingsStore.theme === 'light' }]"
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
                :title="color.name"
                @click="setAccentColor(color.value, color.name)"
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

    <section class="settings-group">
      <div class="group-header">
        <Database :size="22" />
        <h3>Данные</h3>
      </div>
      <div class="group-body">
        <div class="setting-row">
          <div class="setting-info">
            <span class="label">Авто-бэкап при выходе</span>
            <span class="desc">Сохраняет профиль, авторизацию и прогресс</span>
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
  Bell,
  Clock,
  Database,
  Download,
  FileJson,
  Moon,
  Palette,
  RotateCcw,
  Sun,
  Trash2,
  Upload,
} from 'lucide-vue-next'
import { useNotification } from '~/composables/useNotification'
import { ACCENT_COLORS, useSettingsStore } from '~/stores/settings.store'
import {
  buildBackupPayload,
  readAutoBackup,
  restoreBackupPayload,
  saveAutoBackup,
} from '~/utils/backup'

const settingsStore = useSettingsStore()
const { addNotification } = useNotification()

const themeLabel = computed(() =>
  settingsStore.theme === 'dark' ? 'Тёмная' : 'Светлая'
)

const accentLabel = computed(() => {
  const found = ACCENT_COLORS.find((color) => color.value === settingsStore.accentColor)
  return found?.name ?? 'Пользовательский'
})

const lastBackupText = computed(() => {
  if (!settingsStore.lastBackupDate) return ''
  return new Date(settingsStore.lastBackupDate).toLocaleString('ru-RU')
})

function setTheme(theme: 'dark' | 'light') {
  settingsStore.setTheme(theme)
  addNotification({
    type: 'info',
    message: theme === 'dark' ? 'Тёмная тема включена' : 'Светлая тема включена',
  })
}

function setAccentColor(color: string, name: string) {
  settingsStore.setAccentColor(color)
  addNotification({ type: 'success', message: `Акцент: ${name}` })
}

function toggleAnimations(event: Event) {
  const value = (event.target as HTMLInputElement).checked
  settingsStore.setAnimationsEnabled(value)
  addNotification({
    type: 'info',
    message: value ? 'Анимации включены' : 'Анимации отключены',
  })
}

function toggleNotifications(event: Event) {
  const value = (event.target as HTMLInputElement).checked
  settingsStore.setNotificationsEnabled(value)

  if (value) {
    addNotification({ type: 'success', message: 'Уведомления включены' })
  }
}

function toggleSound(event: Event) {
  const value = (event.target as HTMLInputElement).checked
  settingsStore.setSoundEnabled(value)
  addNotification({
    type: 'info',
    message: value ? 'Звук включён' : 'Звук отключён',
  })
}

function toggleAutoBackup(event: Event) {
  const value = (event.target as HTMLInputElement).checked
  settingsStore.setAutoBackup(value)
  addNotification({
    type: 'info',
    message: value ? 'Авто-бэкап включён' : 'Авто-бэкап отключён',
  })
}

function createBackup() {
  saveAutoBackup()
  settingsStore.recordBackup()
  addNotification({ type: 'success', message: 'Резервная копия создана' })
}

function exportData() {
  const payload = buildBackupPayload()
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `cof-backup-${new Date().toISOString().split('T')[0]}.json`
  anchor.click()
  URL.revokeObjectURL(url)

  addNotification({ type: 'success', message: 'Данные экспортированы' })
}

function importData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const payload = JSON.parse(text)
      const restored = restoreBackupPayload(payload)
      if (!restored) throw new Error('restore failed')

      addNotification({
        type: 'success',
        message: 'Данные импортированы. Перезагрузка...',
      })

      setTimeout(() => window.location.reload(), 1000)
    } catch {
      addNotification({ type: 'error', message: 'Ошибка импорта' })
    }
  }

  input.click()
}

function restoreAutoBackup() {
  const backup = readAutoBackup()
  if (!backup) {
    addNotification({ type: 'warning', message: 'Нет сохранённой копии' })
    return
  }

  try {
    const restored = restoreBackupPayload(backup)
    if (!restored) throw new Error('restore failed')

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
  if (
    confirm('Удалить все данные? Это действие необратимо.')
  ) {
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
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(var(--dim-rgb, 136, 136, 136), 0.08);

  &:last-of-type {
    border-bottom: none;
  }

  @include mobile {
    align-items: flex-start;
    flex-direction: column;
  }
}

.setting-info {
  .label {
    display: block;
    color: var(--accent);
    font-weight: 500;
  }

  .desc {
    margin-top: 2px;
    color: var(--dim);
    font-size: 0.85rem;
  }
}

.theme-toggle {
  display: flex;
  gap: 6px;
}

.theme-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
  background: var(--surface);
  color: var(--dim);
  cursor: pointer;
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
  flex-wrap: wrap;
  gap: 10px;
}

.color-dot {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 50%;
  background: var(--dot-color);
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.15s;

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
    width: 0;
    height: 0;
    opacity: 0;
  }

  .slider {
    position: absolute;
    inset: 0;
    border-radius: 24px;
    background: var(--border);
    transition: background var(--transition-standard);

    &::before {
      content: '';
      position: absolute;
      left: 3px;
      bottom: 3px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition-standard);
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
  margin: 12px 0 16px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
  background: var(--surface);
  color: var(--dim);
  font-size: 0.85rem;
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
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
  background: var(--surface);
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-standard);

  &:hover {
    transform: translateY(-1px);
    background: var(--border);
  }

  &.danger {
    border-color: var(--error);
    color: var(--error);

    &:hover {
      background: rgba(var(--error-rgb, 255, 77, 77), 0.1);
    }
  }
}
</style>
