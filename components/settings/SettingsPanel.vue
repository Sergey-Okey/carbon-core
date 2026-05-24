<template>
  <div class="settings-page">
    <div class="settings-head">
      <div>
        <h2>Настройки</h2>
        <p>Интерфейс, звуковые сигналы и локальные данные приложения.</p>
      </div>
    </div>

    <div class="settings-layout">
      <aside class="settings-nav" aria-label="Разделы настроек">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="nav-option"
          :class="{ active: activeTab === tab.key }"
          :aria-label="tab.label"
          :title="tab.label"
          @click="activeTab = tab.key"
        >
          <component :is="tab.icon" :size="18" />
          <span class="nav-label">{{ tab.label }}</span>
        </button>
      </aside>

      <div class="settings-content">
      <!-- Интерфейс -->
      <section v-if="activeTab === 'appearance'" class="settings-group">
        <div class="group-header">
          <div>
            <Palette :size="22" />
            <h3>Интерфейс</h3>
          </div>
          <span>{{ themeLabel }} тема</span>
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
                type="button"
                @click="setTheme('dark', $event)"
              >
                <Moon :size="18" />
                <span>Тёмная</span>
              </button>
              <button
                :class="['theme-option', { active: settingsStore.theme === 'light' }]"
                type="button"
                @click="setTheme('light', $event)"
              >
                <Sun :size="18" />
                <span>Светлая</span>
              </button>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="label">Акцент</span>
              <span class="desc">{{ accentLabel }}</span>
            </div>
            <div class="accent-controls">
              <AppColorPicker
                :model-value="settingsStore.accentColor"
                :options="accentOptions"
                label="Акцент интерфейса"
                @update:model-value="setPresetAccent"
              />
              <label class="custom-color">
                <span>Свой</span>
                <input
                  type="color"
                  :value="settingsStore.accentColor"
                  aria-label="Выбрать свой цвет акцента"
                  @input="setCustomAccent"
                />
              </label>
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

          <div v-if="settingsStore.animationsEnabled" class="setting-row">
            <div class="setting-info">
              <span class="label">Скорость анимаций</span>
              <span class="desc">{{ animationSpeedLabel }}</span>
            </div>
            <div class="slider-container">
              <input
                class="speed-slider"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                :value="settingsStore.animationSpeed"
                @input="setAnimationSpeed"
              />
              <div class="slider-labels">
                <span>Медленно</span>
                <span>Быстро</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Режим -->
      <section v-if="activeTab === 'focus'" class="settings-group">
        <div class="group-header">
          <div>
            <Gauge :size="22" />
            <h3>Рабочий режим</h3>
          </div>
          <span>{{ settingsStore.showSettingsStats ? 'Подробный' : 'Спокойный' }}</span>
        </div>
        <div class="group-body">
          <div class="setting-row">
            <div class="setting-info">
              <span class="label">Прогресс в настройках</span>
              <span class="desc">Показывать верхнюю панель уровня и недельной активности.</span>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                :checked="settingsStore.showSettingsStats"
                @change="toggleSettingsStats"
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="label">Подтверждать опасные действия</span>
              <span class="desc">Перед сбросом данных приложение спросит подтверждение.</span>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                :checked="settingsStore.confirmDangerActions"
                @change="toggleDangerConfirm"
              />
              <span class="slider"></span>
            </label>
          </div>

          <div class="mode-summary">
            <ShieldCheck :size="18" />
            <div>
              <strong>Рекомендуемый баланс</strong>
              <span>Держите подтверждение включённым, а прогресс в настройках включайте только если хотите видеть контекст прямо здесь.</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Сигналы -->
      <section v-if="activeTab === 'notifications'" class="settings-group">
        <div class="group-header">
          <div>
            <Volume2 :size="22" />
            <h3>Сигналы</h3>
          </div>
          <span>{{ signalStatusLabel }}</span>
        </div>
        <div class="group-body">
          <div class="setting-row">
            <div class="setting-info">
              <span class="label">Сообщения</span>
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
              <span class="label">Звуковые уведомления</span>
              <span class="desc">Короткий сигнал на важные события</span>
            </div>
            <label class="switch">
              <input
                type="checkbox"
                :checked="settingsStore.soundEnabled"
                :disabled="!settingsStore.notificationsEnabled"
                @change="toggleSound"
              />
              <span class="slider"></span>
            </label>
          </div>

          <div v-if="settingsStore.soundEnabled" class="setting-row">
            <div class="setting-info">
              <span class="label">Громкость</span>
              <span class="desc">{{ soundVolumeLabel }}</span>
            </div>
            <div class="slider-container">
              <input
                class="speed-slider"
                type="range"
                min="0.02"
                max="0.12"
                step="0.01"
                :value="settingsStore.soundVolume"
                @input="setSoundVolume"
              />
              <div class="slider-labels">
                <span>Тише</span>
                <span>Громче</span>
              </div>
            </div>
          </div>

          <div v-if="settingsStore.soundEnabled" class="setting-row">
            <div class="setting-info">
              <span class="label">Характер сигнала</span>
              <span class="desc">{{ settingsStore.soundTone === 'soft' ? 'Мягкий' : 'Ясный' }}</span>
            </div>
            <div class="theme-toggle">
              <button
                :class="['theme-option', { active: settingsStore.soundTone === 'soft' }]"
                type="button"
                @click="setSoundTone('soft')"
              >
                <Volume2 :size="18" />
                <span>Мягкий</span>
              </button>
              <button
                :class="['theme-option', { active: settingsStore.soundTone === 'bright' }]"
                type="button"
                @click="setSoundTone('bright')"
              >
                <Volume2 :size="18" />
                <span>Ясный</span>
              </button>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="label">Длительность сообщений</span>
              <span class="desc">{{ toastDurationLabel }}</span>
            </div>
            <div class="slider-container">
              <input
                class="speed-slider"
                type="range"
                min="2"
                max="8"
                step="1"
                :value="settingsStore.toastDuration"
                @input="setToastDuration"
              />
              <div class="slider-labels">
                <span>2 сек.</span>
                <span>8 сек.</span>
              </div>
            </div>
          </div>

          <div class="sound-check">
            <div class="setting-info">
              <span class="label">Проверка сигнала</span>
              <span class="desc">Нажмите, чтобы услышать текущий звук уведомления.</span>
            </div>
            <AppButton
              class="action-btn"
              type="button"
              variant="secondary"
              :disabled="!settingsStore.notificationsEnabled || !settingsStore.soundEnabled"
              @click="previewSound"
            >
              <Volume2 :size="16" />
              Проверить звук
            </AppButton>
          </div>
        </div>
      </section>

      <!-- Данные -->
      <section v-if="activeTab === 'data'" class="settings-group">
        <div class="group-header">
          <div>
            <Database :size="22" />
            <h3>Данные</h3>
          </div>
          <span>{{ settingsStore.autoBackup ? 'Авто-бэкап включён' : 'Авто-бэкап отключён' }}</span>
        </div>
        <div class="group-body">
          <div class="data-note">
            <Database :size="16" />
            <span>Данные хранятся локально на этом устройстве.</span>
          </div>

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

          <div class="backup-info">
            <Clock :size="14" />
            <span>
              {{
                settingsStore.lastBackupDate
                  ? `Последний бэкап: ${lastBackupText}`
                  : 'Резервная копия ещё не создавалась'
              }}
            </span>
          </div>

          <div class="action-group">
            <AppButton class="action-btn" type="button" variant="secondary" @click="createBackup">
              <Download :size="16" />
              Создать бэкап
            </AppButton>
            <AppButton class="action-btn" type="button" variant="secondary" @click="exportData">
              <FileJson :size="16" />
              Экспорт JSON
            </AppButton>
            <AppButton class="action-btn" type="button" variant="secondary" @click="importData">
              <Upload :size="16" />
              Импорт JSON
            </AppButton>
            <AppButton class="action-btn" type="button" variant="secondary" @click="restoreAutoBackup">
              <RotateCcw :size="16" />
              Восстановить
            </AppButton>
          </div>

          <div class="danger-zone">
            <div class="setting-info">
              <span class="label">Сброс данных</span>
              <span class="desc">
                Удаляет профиль, задачи, прогресс и настройки.
                {{
                  settingsStore.confirmDangerActions
                    ? ' Перед сбросом будет подтверждение.'
                    : ' Подтверждение отключено.'
                }}
              </span>
            </div>
            <AppButton class="action-btn" type="button" variant="danger" @click="resetAllData">
              <Trash2 :size="16" />
              Сбросить всё
            </AppButton>
          </div>
        </div>
      </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Clock,
  Database,
  Download,
  FileJson,
  Gauge,
  Moon,
  Palette,
  RotateCcw,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
  Volume2,
} from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import AppColorPicker from '~/components/ui/AppColorPicker.vue'
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
const activeTab = ref<'appearance' | 'focus' | 'notifications' | 'data'>(
  'appearance'
)

const tabs = [
  { key: 'appearance', label: 'Интерфейс', icon: Palette },
  { key: 'focus', label: 'Режим', icon: Gauge },
  { key: 'notifications', label: 'Сигналы', icon: Volume2 },
  { key: 'data', label: 'Данные', icon: Database },
]

const accentOptions = computed(() =>
  ACCENT_COLORS.map((color) => ({
    label: color.name,
    value: color.value,
  }))
)

const themeLabel = computed(() =>
  settingsStore.theme === 'dark' ? 'Тёмная' : 'Светлая'
)

const accentLabel = computed(() => {
  const found = ACCENT_COLORS.find(
    (color) => color.value === settingsStore.accentColor
  )
  return found?.name ?? 'Пользовательский'
})

const animationSpeedLabel = computed(() => {
  const speed = settingsStore.animationSpeed
  if (speed < 0.8) return 'Медленно'
  if (speed < 1.2) return 'Нормально'
  return 'Быстро'
})

const lastBackupText = computed(() => {
  if (!settingsStore.lastBackupDate) return ''
  return new Date(settingsStore.lastBackupDate).toLocaleString('ru-RU')
})

const signalStatusLabel = computed(() => {
  if (!settingsStore.notificationsEnabled) return 'Отключены'
  return settingsStore.soundEnabled ? 'Тосты и звук' : 'Только тосты'
})

const soundVolumeLabel = computed(() => {
  if (settingsStore.soundVolume < 0.05) return 'Тихо'
  if (settingsStore.soundVolume < 0.1) return 'Нормально'
  return 'Громко'
})

const toastDurationLabel = computed(
  () => `${settingsStore.toastDuration.toFixed(0)} сек.`
)

function setTheme(theme: 'dark' | 'light', event?: MouseEvent) {
  if (settingsStore.theme === theme) return

  if (!import.meta.client) {
    settingsStore.setTheme(theme)
    return
  }

  const x = event?.clientX ?? window.innerWidth - 32
  const y = event?.clientY ?? 32
  document.documentElement.style.setProperty('--theme-transition-x', `${x}px`)
  document.documentElement.style.setProperty('--theme-transition-y', `${y}px`)

  const transitionDocument = document as Document & {
    startViewTransition?: (callback: () => void) => {
      finished: Promise<void>
    }
  }

  if (!transitionDocument.startViewTransition) {
    settingsStore.setTheme(theme)
    return
  }

  const transition = transitionDocument.startViewTransition(() => {
    settingsStore.setTheme(theme)
  })

  transition.finished.finally(() => {
    document.documentElement.style.removeProperty('--theme-transition-x')
    document.documentElement.style.removeProperty('--theme-transition-y')
  })
}

function setAccentColor(color: string) {
  settingsStore.setAccentColor(color)
}

function setPresetAccent(color: string) {
  setAccentColor(color)
}

function setCustomAccent(event: Event) {
  const target = event.target as HTMLInputElement
  setAccentColor(target.value)
}

function toggleAnimations(event: Event) {
  const target = event.target as HTMLInputElement
  settingsStore.setAnimationsEnabled(target.checked)
}

function setAnimationSpeed(event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  settingsStore.setAnimationSpeed(value)
}

function toggleNotifications(event: Event) {
  const target = event.target as HTMLInputElement
  settingsStore.setNotificationsEnabled(target.checked)
}

function toggleSound(event: Event) {
  const target = event.target as HTMLInputElement
  settingsStore.setSoundEnabled(target.checked)
}

function setSoundVolume(event: Event) {
  const target = event.target as HTMLInputElement
  settingsStore.setSoundVolume(parseFloat(target.value))
}

function setSoundTone(tone: 'soft' | 'bright') {
  settingsStore.setSoundTone(tone)
}

function setToastDuration(event: Event) {
  const target = event.target as HTMLInputElement
  settingsStore.setToastDuration(parseFloat(target.value))
}

function previewSound() {
  addNotification({ type: 'success', message: 'Звуковой сигнал работает' })
}

function toggleSettingsStats(event: Event) {
  const target = event.target as HTMLInputElement
  settingsStore.setShowSettingsStats(target.checked)
}

function toggleDangerConfirm(event: Event) {
  const target = event.target as HTMLInputElement
  settingsStore.setConfirmDangerActions(target.checked)
}

function toggleAutoBackup(event: Event) {
  const target = event.target as HTMLInputElement
  settingsStore.setAutoBackup(target.checked)
}

function createBackup() {
  saveAutoBackup()
  settingsStore.recordBackup()
  addNotification({ type: 'success', message: 'Резервная копия создана' })
}

function exportData() {
  try {
    const payload = buildBackupPayload()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `cof-backup-${new Date().toISOString().split('T')[0]}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    addNotification({ type: 'success', message: 'Данные экспортированы' })
  } catch (error) {
    console.error(error)
    addNotification({ type: 'error', message: 'Ошибка экспорта' })
  }
}

function importData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const payload = JSON.parse(text)
      const restored = restoreBackupPayload(payload)
      if (!restored) throw new Error('Некорректный формат бэкапа')
      addNotification({
        type: 'success',
        message: 'Данные импортированы. Перезагрузка...',
      })
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      console.error(err)
      addNotification({ type: 'error', message: 'Ошибка импорта' })
    }
  }
  input.click()
}

function restoreAutoBackup() {
  try {
    const backup = readAutoBackup()
    if (!backup) {
      addNotification({ type: 'warning', message: 'Нет сохранённой копии' })
      return
    }
    const restored = restoreBackupPayload(backup)
    if (!restored) throw new Error('Восстановление не удалось')
    addNotification({
      type: 'success',
      message: 'Данные восстановлены. Перезагрузка...',
    })
    setTimeout(() => window.location.reload(), 1000)
  } catch (err) {
    console.error(err)
    addNotification({ type: 'error', message: 'Ошибка восстановления' })
  }
}

function resetAllData() {
  if (
    !settingsStore.confirmDangerActions ||
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
  display: grid;
  gap: 18px;
  padding-bottom: 24px;

  @include mobile {
    padding-bottom: 112px;
  }
}

.settings-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;

  h2 {
    margin: 0 0 6px;
    color: var(--accent);
    font-size: 1.35rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: var(--dim);
    line-height: 1.5;
  }

  @include mobile {
    align-items: flex-start;
    flex-direction: column;
  }
}

.settings-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 18px;
  align-items: start;

  @include mobile {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

.settings-nav {
  display: grid;
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-md);

  @include mobile {
    display: inline-grid;
    grid-template-columns: repeat(4, 44px);
    justify-self: center;
    justify-content: center;
    gap: 6px;
    width: fit-content;
    padding: 6px;
    border-radius: 40px;
  }
}

.nav-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: var(--border-radius-md);
  background: transparent;
  color: var(--dim);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-standard);

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background: var(--bg);
    color: var(--accent);
  }

  &.active {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--bg);
  }

  @include mobile {
    justify-content: center;
    width: 44px;
    min-width: 44px;
    height: 44px;
    min-height: 44px;
    padding: 0;
    border-radius: 50%;
  }
}

.nav-label {
  @include mobile {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    white-space: nowrap;
    clip-path: inset(50%);
  }
}

.settings-content {
  min-width: 0;
}

.settings-group {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  border-bottom: 1px solid var(--border);
  color: var(--accent);

  > div {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  span {
    color: var(--dim);
    font-size: 0.85rem;
    font-weight: 600;
    text-align: right;
  }

  svg {
    opacity: 0.7;
  }

  @include mobile {
    align-items: center;
    flex-direction: column;
    padding: 20px;
    text-align: center;

    span {
      text-align: center;
    }

    > div {
      justify-content: center;
      width: 100%;
    }
  }
}

.group-body {
  padding: 6px 24px 24px;

  @include mobile {
    padding: 4px 20px 22px;
  }
}

.setting-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, auto);
  align-items: center;
  gap: 20px;
  min-height: 78px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(var(--dim-rgb, 136, 136, 136), 0.08);

  &:last-of-type {
    border-bottom: none;
  }

  @include mobile {
    align-items: center;
    grid-template-columns: 1fr;
    gap: 12px;
    min-height: 0;
    text-align: center;
  }
}

.setting-info {
  min-width: 0;

  .label {
    display: block;
    color: var(--accent);
    font-weight: 600;
  }

  .desc {
    display: block;
    margin-top: 4px;
    color: var(--dim);
    font-size: 0.85rem;
    line-height: 1.45;
  }

  @include mobile {
    width: 100%;
  }
}

.theme-toggle {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;

  @include mobile {
    width: 100%;
  }
}

.theme-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 112px;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  background: var(--surface);
  color: var(--dim);
  font-size: 0.88rem;
  font-weight: 600;
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

  @include mobile {
    flex: 1;
    min-width: 0;
  }
}

.accent-picker {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;

  @include mobile {
    width: 100%;
  }
}

.accent-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;

  @include mobile {
    justify-content: center;
    width: 100%;
  }
}

.custom-color {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 4px 8px 4px 12px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  background: color-mix(in srgb, var(--surface) 42%, transparent);
  color: var(--dim);
  font-size: 0.82rem;
  font-weight: 600;

  input {
    width: 28px;
    height: 28px;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
  }

  input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  input::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }
}

.switch {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  justify-self: end;
  cursor: pointer;

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
    cursor: pointer;
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
      cursor: pointer;
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

  input:disabled + .slider {
    opacity: 0.45;
    cursor: not-allowed;

    &::before {
      cursor: not-allowed;
    }
  }

  @include mobile {
    justify-self: end;
  }
}

.slider-container {
  display: grid;
  gap: 8px;
  min-width: 220px;

  @include mobile {
    width: 100%;
    min-width: 0;
  }
}

.speed-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    cursor: pointer;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition: transform 0.1s;

    &:hover {
      transform: scale(1.1);
    }
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: none;
    box-shadow: var(--shadow-sm);
  }

  &::-moz-range-track {
    cursor: pointer;
  }
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  color: var(--dim);
  font-size: 0.76rem;
}

.backup-info,
.data-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0 18px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  background: var(--bg);
  color: var(--dim);
  font-size: 0.85rem;

  svg {
    flex-shrink: 0;
    color: var(--accent);
  }
}

.data-note {
  margin-top: 12px;
  margin-bottom: 0;
}

.action-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.sound-check .action-btn,
.danger-zone .action-btn {
  min-width: 180px;

  @include mobile {
    width: 100%;
  }
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  background: var(--surface);
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-standard);

  &:hover {
    transform: translateY(-1px);
    border-color: var(--accent);
    background: var(--surface);
    box-shadow: inset 0 0 0 1px var(--accent);
  }

  &:disabled {
    transform: none;
    border-color: var(--border);
    background: var(--surface);
    box-shadow: none;
  }

  &.danger {
    border-color: var(--error);
    color: var(--error);

    &:hover {
      background: rgba(var(--error-rgb, 255, 77, 77), 0.1);
    }
  }
}

.sound-check {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  margin-top: 6px;
  padding: 16px 0 0;
  border-top: 1px solid rgba(var(--dim-rgb, 136, 136, 136), 0.08);

  @include mobile {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

.mode-summary {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  background: var(--bg);
  color: var(--dim);

  svg {
    flex-shrink: 0;
    color: var(--accent);
  }

  strong,
  span {
    display: block;
  }

  strong {
    margin-bottom: 4px;
    color: var(--accent);
    font-size: 0.9rem;
  }

  span {
    font-size: 0.85rem;
    line-height: 1.45;
  }
}

.danger-zone {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--border);

  @include mobile {
    grid-template-columns: 1fr;
  }
}

:global(::view-transition-old(root)),
:global(::view-transition-new(root)) {
  animation-duration: 520ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
  mix-blend-mode: normal;
}

:global(::view-transition-old(root)) {
  animation-name: theme-fade-out;
}

:global(::view-transition-new(root)) {
  animation-name: theme-corner-reveal;
}

@keyframes theme-corner-reveal {
  from {
    clip-path: circle(0 at var(--theme-transition-x, 100%) var(--theme-transition-y, 0));
  }

  to {
    clip-path: circle(150vmax at var(--theme-transition-x, 100%) var(--theme-transition-y, 0));
  }
}

@keyframes theme-fade-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  :global(::view-transition-old(root)),
  :global(::view-transition-new(root)) {
    animation: none;
  }
}
</style>
