<template>
  <section class="settings" aria-label="Настройки">
    <div class="settings-bento">
      <!-- Appearance -->
      <article class="card card--appearance">
        <header class="card-head">
          <h2>Оформление</h2>
          <span class="card-head__aside">{{ accentLabel }}</span>
        </header>

        <div class="rows">
          <div class="row">
            <span class="row-icon" aria-hidden="true">
              <component :is="settingsStore.theme === 'light' ? Sun : Moon" :size="18" />
            </span>
            <div class="row-copy">
              <span>Светлая тема</span>
              <em>{{ themeLabel }}</em>
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

          <div class="row">
            <span class="row-icon" aria-hidden="true">
              <Monitor :size="18" />
            </span>
            <div class="row-copy">
              <span>Следовать системе</span>
              <em>Тема повторяет настройки устройства</em>
            </div>
            <AppSwitch
              :model-value="settingsStore.themeMode === 'system'"
              aria-label="Следовать системной теме"
              @update:model-value="toggleSystemTheme"
            />
          </div>

          <div class="row">
            <span class="row-icon" aria-hidden="true">
              <Clock :size="18" />
            </span>
            <div class="row-copy">
              <span>Тема по времени</span>
              <em>{{ scheduleDescription }}</em>
            </div>
            <AppSwitch
              :model-value="settingsStore.themeMode === 'schedule'"
              aria-label="Тема по времени"
              @update:model-value="toggleScheduleTheme"
            />
          </div>

          <div v-if="settingsStore.themeMode === 'schedule'" class="row row--stack">
            <div class="row-main">
              <span class="row-icon" aria-hidden="true">
                <Clock :size="18" />
              </span>
              <div class="row-copy">
                <span>Расписание</span>
                <em>Когда включать светлую и тёмную тему</em>
              </div>
            </div>
            <div class="time-range">
              <label>
                <span>Светлая</span>
                <AppTimePicker
                  :model-value="settingsStore.lightThemeFrom"
                  label="Время включения светлой темы"
                  @update:model-value="setLightThemeFrom"
                />
              </label>
              <label>
                <span>Тёмная</span>
                <AppTimePicker
                  :model-value="settingsStore.darkThemeFrom"
                  label="Время включения тёмной темы"
                  @update:model-value="setDarkThemeFrom"
                />
              </label>
            </div>
          </div>

          <div class="row row--stack">
            <div class="row-main">
              <span class="row-icon" aria-hidden="true">
                <Palette :size="18" />
              </span>
              <div class="row-copy">
                <span>Акцент</span>
                <em>{{ accentLabel }}</em>
              </div>
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
        </div>

        <div class="card-foot">
          <AppButton type="button" variant="secondary" @click="resetAppearance">
            <RotateCcw :size="16" />
            Сбросить оформление
          </AppButton>
        </div>
      </article>

      <!-- Feedback + Interface (one column matching appearance height) -->
      <div class="settings-side">
        <article class="card card--feedback">
          <header class="card-head">
            <h2>Отклик</h2>
          </header>

          <div class="rows">
            <div class="row">
              <span class="row-icon" aria-hidden="true">
                <Volume2 :size="18" />
              </span>
              <div class="row-copy">
                <span>Звуки действий</span>
                <em>Сигналы при задачах, предупреждениях и фокусе</em>
              </div>
              <AppSwitch
                :model-value="settingsStore.soundEnabled"
                aria-label="Звуки действий"
                @update:model-value="toggleSounds"
              />
            </div>

            <div class="row">
              <span class="row-icon" aria-hidden="true">
                <Vibrate :size="18" />
              </span>
              <div class="row-copy">
                <span>Вибрация</span>
                <em>Тактильный отклик на поддерживаемых устройствах</em>
              </div>
              <AppSwitch
                :model-value="settingsStore.hapticsEnabled"
                aria-label="Вибрация"
                @update:model-value="toggleHaptics"
              />
            </div>
          </div>
        </article>

        <article class="card card--interface">
          <header class="card-head">
            <h2>Интерфейс</h2>
          </header>

          <div class="rows">
            <div class="row">
              <span class="row-icon" aria-hidden="true">
                <BarChart3 :size="18" />
              </span>
              <div class="row-copy">
                <span>Верхняя статистика</span>
                <em>Уровень, лига и счётчики задач</em>
              </div>
              <AppSwitch
                :model-value="settingsStore.showTopStats"
                aria-label="Верхняя статистика"
                @update:model-value="toggleTopStats"
              />
            </div>

            <div class="row">
              <span class="row-icon" aria-hidden="true">
                <LayoutDashboard :size="18" />
              </span>
              <div class="row-copy">
                <span>Статистика в настройках</span>
                <em>Показывать верхнюю статистику здесь</em>
              </div>
              <AppSwitch
                :model-value="settingsStore.showSettingsStats"
                aria-label="Статистика на странице настроек"
                @update:model-value="toggleSettingsStats"
              />
            </div>

            <div class="row">
              <span class="row-icon" aria-hidden="true">
                <ShieldAlert :size="18" />
              </span>
              <div class="row-copy">
                <span>Подтверждать опасные действия</span>
                <em>Спрашивать перед сбросом данных</em>
              </div>
              <AppSwitch
                :model-value="settingsStore.confirmDangerActions"
                aria-label="Подтверждать опасные действия"
                @update:model-value="toggleDangerConfirm"
              />
            </div>
          </div>
        </article>
      </div>

      <!-- Tags -->
      <article class="card card--tags">
        <header class="card-head">
          <h2>Теги</h2>
          <span class="card-head__aside">общие</span>
        </header>
        <p class="card-lead">Общие теги для задач и привычек. Изменение применяется везде.</p>
        <TagManager />
      </article>

      <!-- Data -->
      <article class="card card--data">
        <header class="card-head">
          <h2>Данные</h2>
          <span class="card-head__aside">
            {{ settingsStore.autoBackup ? 'авто-бэкап' : 'без бэкапа' }}
          </span>
        </header>

        <div class="rows">
          <div class="row">
            <span class="row-icon" aria-hidden="true">
              <HardDrive :size="18" />
            </span>
            <div class="row-copy">
              <span>Авто-бэкап при выходе</span>
              <em>Сохраняет профиль, авторизацию и прогресс</em>
            </div>
            <AppSwitch
              :model-value="settingsStore.autoBackup"
              aria-label="Авто-бэкап при выходе"
              @update:model-value="toggleAutoBackup"
            />
          </div>

          <div class="row">
            <span class="row-icon" aria-hidden="true">
              <Clock :size="18" />
            </span>
            <div class="row-copy">
              <span>Последний бэкап</span>
              <em>
                {{
                  settingsStore.lastBackupDate
                    ? lastBackupText
                    : 'Резервная копия ещё не создавалась'
                }}
              </em>
            </div>
          </div>
        </div>

        <div class="action-grid">
          <AppButton
            type="button"
            variant="secondary"
            :disabled="accessStore.isDemo"
            @click="createBackup"
          >
            <Download :size="16" />
            Создать бэкап
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            :disabled="accessStore.isDemo"
            @click="exportData"
          >
            <FileJson :size="16" />
            Экспорт JSON
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            :disabled="accessStore.isDemo"
            @click="importData"
          >
            <Upload :size="16" />
            Импорт JSON
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            :disabled="accessStore.isDemo"
            @click="restoreAutoBackup"
          >
            <RotateCcw :size="16" />
            Восстановить
          </AppButton>
        </div>

        <div class="danger-row">
          <div class="danger-main">
            <span class="row-icon row-icon--danger" aria-hidden="true">
              <Trash2 :size="18" />
            </span>
            <div class="row-copy">
              <span>Сброс данных</span>
              <em>Удаляет профиль, задачи, прогресс и настройки</em>
            </div>
          </div>
          <AppButton type="button" variant="danger" @click="resetAllData">
            <Trash2 :size="16" />
            Сбросить всё
          </AppButton>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  BarChart3,
  Clock,
  Download,
  FileJson,
  HardDrive,
  LayoutDashboard,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  ShieldAlert,
  Sun,
  Trash2,
  Upload,
  Vibrate,
  Volume2,
} from 'lucide-vue-next'
import AppButton from '~/components/ui/primitives/AppButton.vue'
import AppColorPicker from '~/components/ui/forms/AppColorPicker.vue'
import AppCustomColorPicker from '~/components/ui/forms/AppCustomColorPicker.vue'
import AppSwitch from '~/components/ui/primitives/AppSwitch.vue'
import AppTimePicker from '~/components/ui/forms/AppTimePicker.vue'
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

const settingsStore = useSettingsStore()
const accessStore = useAccessStore()
const { confirm } = useConfirm()
const { success, warning, error: notifyError } = useNotification()

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
  settingsStore.theme === 'dark' ? 'Сейчас тёмная тема' : 'Сейчас светлая тема'
)

const scheduleDescription = computed(
  () => `Светлая с ${settingsStore.lightThemeFrom}, тёмная с ${settingsStore.darkThemeFrom}`
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

function setLightThemeFrom(value: string) {
  settingsStore.setThemeSchedule(value, settingsStore.darkThemeFrom)
}

function setDarkThemeFrom(value: string) {
  settingsStore.setThemeSchedule(settingsStore.lightThemeFrom, value)
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

function resetAppearance() {
  settingsStore.setTheme('dark')
  settingsStore.setAccentColor(ACCENT_COLORS[0].value)
  settingsStore.setUiDensity('comfortable')
  settingsStore.setAppBackgroundMode('default')
  settingsStore.setCustomBackgroundImage('')
  settingsStore.setBackgroundIntensity('normal')
  success('Оформление сброшено')
}

function createBackup() {
  saveAutoBackup()
  settingsStore.recordBackup()
  success('Резервная копия создана')
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
    success('Данные экспортированы')
  } catch (err) {
    console.error(err)
    notifyError('Ошибка экспорта')
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
      success('Данные импортированы. Перезагрузка...')
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      console.error(err)
      notifyError('Ошибка импорта')
    }
  }
  input.click()
}

function restoreAutoBackup() {
  try {
    const backup = readAutoBackup()
    if (!backup) {
      warning('Нет сохранённой копии')
      return
    }
    const restored = restoreBackupPayload(backup)
    if (!restored) throw new Error('Restore failed')
    success('Данные восстановлены. Перезагрузка...')
    setTimeout(() => window.location.reload(), 1000)
  } catch (err) {
    console.error(err)
    notifyError('Ошибка восстановления')
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
  success('Данные сброшены. Перезагрузка...')
  setTimeout(() => window.location.reload(), 1000)
}
</script>

<style scoped lang="scss">
.settings {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.settings-bento {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-template-areas:
    'appearance appearance appearance appearance appearance appearance appearance appearance side side side side'
    'tags tags tags tags tags tags data data data data data data';
  gap: var(--space-4);
  width: 100%;
  align-items: start;
}

.settings-side {
  grid-area: side;
  display: grid;
  grid-template-rows: auto auto;
  gap: var(--space-4);
  min-width: 0;
  min-height: 0;
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  box-sizing: border-box;
  min-width: 0;
  height: auto;
  padding: var(--space-5);
  background: var(--color-surface-1);
  border: var(--ui-border);
  border-radius: var(--radius-lg);
}

.card--appearance {
  grid-area: appearance;
}

.card--feedback,
.card--interface {
  min-height: 0;
}

.card--tags {
  grid-area: tags;
}

.card--data {
  grid-area: data;
}

.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  flex: 0 0 auto;

  h2 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: var(--text-md);
    font-weight: var(--weight-bold);
    line-height: 1.25;
  }
}

.card-head__aside {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: 0.02em;
  text-transform: lowercase;
}

.card-lead {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: 1.45;
}

.card-foot {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  flex: 0 0 auto;
  margin-top: auto;
  padding-top: var(--space-3);
  border-top: var(--ui-border);
}

.rows {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  min-height: 0;
  margin: 0 calc(var(--space-5) * -1);
}

.row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 52px;
  padding: var(--space-3) var(--space-5);
  border-bottom: var(--ui-border);

  &:last-child {
    border-bottom: none;
  }

  &--stack {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }
}

.row-main,
.danger-main {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  flex: 1;
}

.row-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  color: var(--color-text-secondary);
  background: var(--color-surface-2);
  border-radius: var(--radius-sm);

  &--danger {
    color: var(--color-danger, var(--color-text-secondary));
  }
}

.row-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
  flex: 1;

  span {
    color: var(--color-text-primary);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    line-height: 1.3;
  }

  em {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-style: normal;
    line-height: 1.35;
  }
}

.time-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  width: 100%;

  label {
    display: grid;
    gap: var(--space-2);
    min-width: 0;

    > span {
      color: var(--color-text-muted);
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
  }
}

.accent-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-2);

  :deep(.app-button) {
    width: 100%;
    min-height: 44px;
  }
}

.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: var(--ui-border);
}

@media (max-width: 1100px) {
  .settings-bento {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'appearance appearance'
      'side       side'
      'tags       data';
    gap: var(--space-3);
  }

  .settings-side {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    align-items: start;
  }

  .action-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 767px) {
  .settings-bento {
    grid-template-columns: 1fr;
    grid-template-areas:
      'appearance'
      'side'
      'tags'
      'data';
    gap: var(--space-3);
  }

  .settings-side {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }

  .card {
    padding: var(--space-4);
  }

  .rows {
    margin: 0 calc(var(--space-4) * -1);
  }

  .row {
    min-height: 44px;
    padding: var(--space-3) var(--space-4);
  }

  .time-range,
  .action-grid {
    grid-template-columns: 1fr;
  }

  .danger-row {
    flex-direction: column;
    align-items: stretch;
  }

  .danger-row :deep(.app-button),
  .card-foot :deep(.app-button),
  .action-grid :deep(.app-button) {
    width: 100%;
    min-height: 44px;
  }
}
</style>
