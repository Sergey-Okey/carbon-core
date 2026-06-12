<template>
  <div class="settings-page">
    <div class="settings-head">
      <div class="settings-title">
        <h2>Настройки</h2>
        <p>Тема, рабочее поведение, доска и локальные данные приложения.</p>
      </div>

      <nav class="settings-nav" aria-label="Разделы настроек">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="nav-option"
          :class="{ active: activeTab === tab.key }"
          :aria-label="tab.label"
          :data-tooltip="tab.label"
          @click="activeTab = tab.key"
        >
          <component :is="tab.icon" :size="18" />
          <span class="nav-label">{{ tab.label }}</span>
        </button>
      </nav>
    </div>

    <div class="settings-layout">
      <div class="settings-content">
        <section v-if="activeTab === 'appearance'" class="settings-group">
          <div class="group-header">
            <div>
              <Palette :size="22" />
              <h3>Оформление</h3>
            </div>
          </div>

          <div class="group-body">
            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Звуки действий</span>
                <span class="desc">Короткие сигналы при завершении задач, предупреждениях и окончании фокуса.</span>
              </div>
              <AppSwitch
                :model-value="settingsStore.soundEnabled"
                aria-label="Звуки действий"
                @update:model-value="toggleSounds"
              />
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Вибрация</span>
                <span class="desc">Тактильный отклик на поддерживаемых телефонах и в Android-приложении.</span>
              </div>
              <AppSwitch
                :model-value="settingsStore.hapticsEnabled"
                aria-label="Вибрация"
                @update:model-value="toggleHaptics"
              />
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Светлая тема</span>
                <span class="desc">{{ themeLabel }}</span>
              </div>
              <AppSwitch
                :model-value="settingsStore.theme === 'light'"
                aria-label="Светлая тема"
                @update:model-value="toggleTheme"
              >
                <template #off>
                  <Moon :size="14" />
                </template>
                <template #on>
                  <Sun :size="14" />
                </template>
              </AppSwitch>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Следовать системе</span>
                <span class="desc">Тема будет повторять настройки устройства.</span>
              </div>
              <AppSwitch
                :model-value="settingsStore.themeMode === 'system'"
                aria-label="Следовать системной теме"
                @update:model-value="toggleSystemTheme"
              />
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Тема по времени</span>
                <span class="desc">{{ scheduleDescription }}</span>
              </div>
              <AppSwitch
                :model-value="settingsStore.themeMode === 'schedule'"
                aria-label="Тема по времени"
                @update:model-value="toggleScheduleTheme"
              />
            </div>

            <div v-if="settingsStore.themeMode === 'schedule'" class="setting-row">
              <div class="setting-info">
                <span class="label">Расписание</span>
                <span class="desc">Когда включать светлую и темную тему.</span>
              </div>
              <div class="time-range">
                <label>
                  <span>Светлая</span>
                  <input
                    class="time-input"
                    type="time"
                    :value="settingsStore.lightThemeFrom"
                    @input="setLightThemeFrom"
                  />
                </label>
                <label>
                  <span>Темная</span>
                  <input
                    class="time-input"
                    type="time"
                    :value="settingsStore.darkThemeFrom"
                    @input="setDarkThemeFrom"
                  />
                </label>
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
                <AppCustomColorPicker
                  :model-value="settingsStore.accentColor"
                  @update:model-value="setAccentColor"
                />
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Сбросить оформление</span>
                <span class="desc">Вернуть темную тему и базовый белый акцент.</span>
              </div>
              <AppButton class="action-btn" type="button" variant="secondary" @click="resetAppearance">
                <RotateCcw :size="16" />
                Сбросить
              </AppButton>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'focus'" class="settings-group">
          <div class="group-header">
            <div>
              <Gauge :size="22" />
              <h3>Рабочий режим</h3>
            </div>
          </div>

          <div class="group-body">
            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Верхняя статистика</span>
                <span class="desc">Показывать уровень, лигу, активность и счетчики задач.</span>
              </div>
              <AppSwitch
                :model-value="settingsStore.showTopStats"
                @update:model-value="toggleTopStats"
              />
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Статистика на странице настроек</span>
                <span class="desc">Показывать верхнюю статистику и внутри настроек.</span>
              </div>
              <AppSwitch
                :model-value="settingsStore.showSettingsStats"
                @update:model-value="toggleSettingsStats"
              />
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Подтверждать опасные действия</span>
                <span class="desc">Перед сбросом данных приложение спросит подтверждение.</span>
              </div>
              <AppSwitch
                :model-value="settingsStore.confirmDangerActions"
                @update:model-value="toggleDangerConfirm"
              />
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'board'" class="settings-group">
          <div class="group-header">
            <div>
              <LayoutGrid :size="22" />
              <h3>Доска</h3>
            </div>
          </div>

          <div class="group-body">
            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Показывать типы узлов</span>
                <span class="desc">Подписи помогают отличать ветки от этапов на сложных схемах.</span>
              </div>
              <AppSwitch
                :model-value="settingsStore.boardShowNodeTypes"
                @update:model-value="toggleBoardShowNodeTypes"
              />
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Защищать связи от случайного удаления</span>
                <span class="desc">Перед разрывом линии между элементами появится подтверждение.</span>
              </div>
              <AppSwitch
                :model-value="settingsStore.boardConfirmEdgeDelete"
                @update:model-value="toggleBoardConfirmEdgeDelete"
              />
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Защищать ветки от удаления</span>
                <span class="desc">Полезно, если в ветке есть этапы и связанные задачи.</span>
              </div>
              <AppSwitch
                :model-value="settingsStore.boardConfirmBranchDelete"
                @update:model-value="toggleBoardConfirmBranchDelete"
              />
            </div>

            <div class="mode-summary">
              <LayoutGrid :size="18" />
              <div>
                <strong>Автораскладка остается умной</strong>
                <span>Доска сохраняет созданные связи, защищает важные действия и оставляет схему читаемой.</span>
              </div>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'tags'" class="settings-group">
          <div class="group-header">
            <div>
              <Tags :size="22" />
              <h3>Теги</h3>
            </div>
          </div>

          <div class="group-body">
            <div class="data-note">
              <Tags :size="16" />
              <span>Общие теги доступны задачам и привычкам. Изменение тега применяется везде.</span>
            </div>
            <TagManager />
          </div>
        </section>

        <section v-if="activeTab === 'data'" class="settings-group">
          <div class="group-header">
            <div>
              <Database :size="22" />
              <h3>Данные</h3>
            </div>
            <span>{{ settingsStore.autoBackup ? 'Авто-бэкап включен' : 'Авто-бэкап отключен' }}</span>
          </div>
          <div class="group-body">
            <div class="data-note">
              <Database :size="16" />
              <span>Данные хранятся локально на этом устройстве.</span>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Авто-бэкап при выходе</span>
                <span class="desc">Сохраняет профиль, авторизацию и прогресс.</span>
              </div>
              <AppSwitch
                :model-value="settingsStore.autoBackup"
                @update:model-value="toggleAutoBackup"
              />
            </div>

            <div class="backup-info">
              <Clock :size="14" />
              <span>
                {{
                  settingsStore.lastBackupDate
                    ? `Последний бэкап: ${lastBackupText}`
                    : 'Резервная копия еще не создавалась'
                }}
              </span>
            </div>

            <div class="action-group">
              <AppButton class="action-btn" type="button" variant="secondary" :disabled="accessStore.isDemo" @click="createBackup">
                <Download :size="16" />
                Создать бэкап
              </AppButton>
              <AppButton class="action-btn" type="button" variant="secondary" :disabled="accessStore.isDemo" @click="exportData">
                <FileJson :size="16" />
                Экспорт JSON
              </AppButton>
              <AppButton class="action-btn" type="button" variant="secondary" :disabled="accessStore.isDemo" @click="importData">
                <Upload :size="16" />
                Импорт JSON
              </AppButton>
              <AppButton class="action-btn" type="button" variant="secondary" :disabled="accessStore.isDemo" @click="restoreAutoBackup">
                <RotateCcw :size="16" />
                Восстановить
              </AppButton>
            </div>

            <div class="danger-zone">
              <div class="setting-info">
                <span class="label">Сброс данных</span>
                <span class="desc">
                  Удаляет профиль, задачи, прогресс и настройки. Перед сбросом потребуется
                  подтверждение.
                </span>
              </div>
              <AppButton class="action-btn" type="button" variant="danger" @click="resetAllData">
                <Trash2 :size="16" />
                Сбросить все
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
  LayoutGrid,
  Moon,
  Palette,
  RotateCcw,
  Sun,
  Tags,
  Trash2,
  Upload,
} from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import AppColorPicker from '~/components/ui/AppColorPicker.vue'
import AppCustomColorPicker from '~/components/ui/AppCustomColorPicker.vue'
import AppSwitch from '~/components/ui/AppSwitch.vue'
import { useConfirm } from '~/composables/useConfirm'
import TagManager from '~/components/settings/TagManager.vue'
import { useNotification } from '~/composables/useNotification'
import { useAccessStore } from '~/stores/access.store'
import { ACCESS_STORAGE_KEY } from '~/utils/accessStorage'
import { ACCENT_COLORS, useSettingsStore } from '~/stores/settings.store'
import {
  buildBackupPayload,
  readAutoBackup,
  restoreBackupPayload,
  saveAutoBackup,
} from '~/utils/backup'

type SettingsTab = 'appearance' | 'focus' | 'board' | 'tags' | 'data'

const settingsStore = useSettingsStore()
const accessStore = useAccessStore()
const { confirm } = useConfirm()
const { addNotification } = useNotification()
const activeTab = ref<SettingsTab>('appearance')

const tabs = [
  { key: 'appearance' as const, label: 'Оформление', icon: Palette },
  { key: 'focus' as const, label: 'Режим', icon: Gauge },
  { key: 'board' as const, label: 'Доска', icon: LayoutGrid },
  { key: 'tags' as const, label: 'Теги', icon: Tags },
  { key: 'data' as const, label: 'Данные', icon: Database },
]

const accentOptions = computed(() =>
  ACCENT_COLORS.map((color, index) => ({
    label: index === 0 ? adaptiveAccentName.value : color.name,
    value: color.value,
    color: index === 0 ? adaptiveAccentColor.value : color.value,
  }))
)

const adaptiveAccentName = computed(() =>
  settingsStore.theme === 'dark' ? 'Белый' : 'Графитовый'
)
const adaptiveAccentColor = computed(() =>
  settingsStore.theme === 'dark' ? '#ffffff' : '#2b2b2b'
)

const themeLabel = computed(() =>
  settingsStore.theme === 'dark' ? 'Сейчас включена темная тема.' : 'Сейчас включена светлая тема.'
)

const scheduleDescription = computed(() =>
  `Светлая с ${settingsStore.lightThemeFrom}, темная с ${settingsStore.darkThemeFrom}.`
)

const accentLabel = computed(() => {
  const found = ACCENT_COLORS.find((color) => color.value === settingsStore.accentColor)
  if (found === ACCENT_COLORS[0]) return adaptiveAccentName.value
  return found?.name ?? 'Пользовательский'
})

const lastBackupText = computed(() => {
  if (!settingsStore.lastBackupDate) return ''
  return new Date(settingsStore.lastBackupDate).toLocaleString('ru-RU')
})

function setTheme(theme: 'dark' | 'light') {
  settingsStore.setTheme(theme)
}

function toggleTheme(checked: boolean) {
  setTheme(checked ? 'light' : 'dark')
}

function toggleSystemTheme(checked: boolean) {
  if (checked) {
    settingsStore.setThemeMode('system')
    return
  }
  settingsStore.setTheme(settingsStore.theme)
}

function toggleScheduleTheme(checked: boolean) {
  if (checked) {
    settingsStore.setThemeMode('schedule')
    return
  }
  settingsStore.setTheme(settingsStore.theme)
}

function setLightThemeFrom(event: Event) {
  settingsStore.setThemeSchedule(
    (event.target as HTMLInputElement).value,
    settingsStore.darkThemeFrom
  )
}

function setDarkThemeFrom(event: Event) {
  settingsStore.setThemeSchedule(
    settingsStore.lightThemeFrom,
    (event.target as HTMLInputElement).value
  )
}

function setAccentColor(color: string) {
  settingsStore.setAccentColor(color)
}

function setPresetAccent(color: string) {
  setAccentColor(color)
}

function toggleTopStats(checked: boolean) {
  settingsStore.setShowTopStats(checked)
}

function toggleSounds(checked: boolean) {
  settingsStore.setSoundEnabled(checked)
}

function toggleHaptics(checked: boolean) {
  settingsStore.setHapticsEnabled(checked)
}

function toggleSettingsStats(checked: boolean) {
  settingsStore.setShowSettingsStats(checked)
}

function toggleDangerConfirm(checked: boolean) {
  settingsStore.setConfirmDangerActions(checked)
}

function toggleAutoBackup(checked: boolean) {
  settingsStore.setAutoBackup(checked)
}

function toggleBoardConfirmEdgeDelete(checked: boolean) {
  settingsStore.setBoardConfirmEdgeDelete(checked)
}

function toggleBoardConfirmBranchDelete(checked: boolean) {
  settingsStore.setBoardConfirmBranchDelete(checked)
}

function toggleBoardShowNodeTypes(checked: boolean) {
  settingsStore.setBoardShowNodeTypes(checked)
}

function resetAppearance() {
  settingsStore.setTheme('dark')
  settingsStore.setAccentColor(ACCENT_COLORS[0].value)
  settingsStore.setUiDensity('comfortable')
  settingsStore.setAppBackgroundMode('default')
  settingsStore.setCustomBackgroundImage('')
  settingsStore.setBackgroundIntensity('normal')
  addNotification({ type: 'success', message: 'Оформление сброшено' })
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
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
      const payload = JSON.parse(await file.text())
      const restored = restoreBackupPayload(payload)
      if (!restored) throw new Error('Restore failed')
      addNotification({ type: 'success', message: 'Данные импортированы. Перезагрузка...' })
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
      addNotification({ type: 'warning', message: 'Нет сохраненной копии' })
      return
    }
    const restored = restoreBackupPayload(backup)
    if (!restored) throw new Error('Restore failed')
    addNotification({ type: 'success', message: 'Данные восстановлены. Перезагрузка...' })
    setTimeout(() => window.location.reload(), 1000)
  } catch (err) {
    console.error(err)
    addNotification({ type: 'error', message: 'Ошибка восстановления' })
  }
}

async function resetAllData() {
  const confirmed = await confirm(
    'Удалить профиль, задачи, прогресс и настройки? Это действие нельзя отменить.'
  )
  if (!confirmed) return

  if (accessStore.isDemo) {
    sessionStorage.clear()
  } else {
    const accessState = localStorage.getItem(ACCESS_STORAGE_KEY)
    localStorage.clear()
    if (accessState) localStorage.setItem(ACCESS_STORAGE_KEY, accessState)
  }
  addNotification({ type: 'success', message: 'Данные сброшены. Перезагрузка...' })
  setTimeout(() => window.location.reload(), 1000)
}
</script>

<style scoped lang="scss">
.settings-page {
  display: grid;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  gap: 14px;
  margin: 0;
  padding-bottom: 24px;
  box-sizing: border-box;

  @include mobile {
    padding-bottom: 112px;
  }
}

.settings-head {
  @include glass;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  align-items: center;
  gap: 18px;
  padding: 16px;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);

  h2 {
    margin: 0 0 6px;
    color: var(--text);
    font-size: 1.35rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  @include mobile {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 14px;
    text-align: left;
  }
}

.settings-title {
  min-width: 0;
}

.settings-layout {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.settings-nav {
  @include glass;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
  padding: 5px;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);

  @include mobile {
    justify-self: stretch;
    width: 100%;
    min-width: 0;
    padding: 6px;
    border-radius: var(--border-radius-pill);
  }
}

.nav-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: auto;
  min-height: 44px;
  padding: 0 14px;
  border: none;
  border-radius: var(--border-radius-pill);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  font: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--accent) 7%, transparent);
    color: var(--text);
  }

  &.active,
  &.active:hover {
    background: var(--accent);
    color: var(--bg);
  }

  @include mobile {
    flex: 1 1 0;
    justify-content: center;
    min-width: 44px;
    height: 44px;
    min-height: 44px;
    padding: 0;
    border-radius: var(--border-radius-pill);
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
  width: 100%;
  min-width: 0;
  max-width: 100%;
  margin: 0;
  box-sizing: border-box;
}

.settings-group {
  @include glass;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  box-sizing: border-box;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 68px;
  padding: 16px 18px;
  color: var(--text);

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
}

.group-body {
  display: grid;
  padding: 0 16px 10px;
}

.setting-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, auto);
  align-items: center;
  gap: var(--panel-gap);
  min-height: 64px;
  padding: 14px 0;

  + .setting-row,
  + .backup-info,
  + .action-group,
  + .danger-zone,
  + .mode-summary {
    border-top: var(--ui-border);
  }

  @include mobile {
    grid-template-columns: minmax(0, 1fr) auto;
    min-width: 0;
    max-width: 100%;
    gap: 12px;
    min-height: 0;
    align-items: center;
    text-align: left;
  }
}

.setting-row:has(.time-range),
.setting-row:has(.accent-controls),
.setting-row:has(.action-btn) {
  @include mobile {
    grid-template-columns: 1fr;
  }
}

.setting-info {
  min-width: 0;

  .label {
    display: block;
    color: var(--text);
    font-size: 0.92rem;
    font-weight: 600;
  }

  .desc {
    display: block;
    margin-top: 4px;
    color: var(--dim);
    font-size: 0.82rem;
    line-height: 1.45;
  }
}

.time-range,
.accent-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-width: 0;
  max-width: 100%;
  min-height: var(--control-height-md);

  @include mobile {
    justify-content: flex-start;
    width: 100%;
  }
}

.background-preview {
  width: 86px;
  height: 48px;
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.time-range label {
  display: grid;
  min-width: 0;
  gap: 4px;
  color: var(--dim);
  font-size: 0.75rem;
  font-weight: 600;

  input {
    min-height: 36px;
    width: 100%;
    padding: 0 10px;
    border: var(--ui-border);
    border-radius: var(--border-radius-sm);
    background: var(--glass-surface);
    color: var(--text);
    color-scheme: dark;
    font: inherit;
    font-variant-numeric: tabular-nums;

    &:focus-visible {
      border-color: color-mix(in srgb, var(--accent) 38%, transparent);
      outline: 2px solid color-mix(in srgb, var(--accent) 12%, transparent);
      outline-offset: 2px;
    }

    &::-webkit-calendar-picker-indicator {
      padding: 4px;
      border-radius: var(--border-radius-sm);
      background-color: color-mix(in srgb, var(--accent) 9%, transparent);
      cursor: pointer;
      filter: invert(1);
    }

    :global(.light-theme) & {
      color-scheme: light;

      &::-webkit-calendar-picker-indicator {
        filter: none;
      }
    }
  }
}

@media (pointer: coarse), (max-width: 767px) {
  .time-range {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .time-range label {
    width: 100%;
  }

  .time-range input {
    min-height: 44px;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
    font-size: 16px;
  }

  @media (max-width: 380px) {
    .time-range {
      grid-template-columns: 1fr;
    }
  }
}

.backup-info,
.data-note,
.mode-summary {
  display: flex;
  min-width: 0;
  max-width: 100%;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  color: var(--dim);
  font-size: 0.85rem;

  svg {
    flex-shrink: 0;
    color: var(--text);
  }
}

.mode-summary {
  align-items: flex-start;
  margin-top: 0;

  strong,
  span {
    display: block;
  }

  strong {
    margin-bottom: 4px;
    color: var(--text);
    font-size: 0.9rem;
  }

  span {
    line-height: 1.45;
  }
}

.data-note + .setting-row,
.backup-info + .action-group {
  border-top: var(--ui-border);
}

.action-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-width: 0;
  max-width: 100%;
  gap: 10px;
  padding-top: 14px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.danger-zone {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding-top: 18px;

  @include mobile {
    grid-template-columns: 1fr;
    min-width: 0;
  }
}

.action-btn {
  min-height: 42px;

  @include mobile {
    width: 100%;
    min-height: 44px;
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
