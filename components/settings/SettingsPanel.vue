<template>
  <section class="settings" aria-label="Настройки">
    <div class="settings-bento">
      <!-- Appearance -->
      <article class="tile tile--appearance">
        <header class="tile-head">
          <h2>Оформление</h2>
          <span class="tile-head__aside">{{ accentLabel }}</span>
        </header>

        <div class="stat-rows">
          <div class="stat-row">
            <div class="stat-copy">
              <span>Звуки действий</span>
              <em>Сигналы при задачах, предупреждениях и фокусе</em>
            </div>
            <AppSwitch
              :model-value="settingsStore.soundEnabled"
              aria-label="Звуки действий"
              @update:model-value="toggleSounds"
            />
          </div>

          <div class="stat-row">
            <div class="stat-copy">
              <span>Вибрация</span>
              <em>Тактильный отклик на поддерживаемых устройствах</em>
            </div>
            <AppSwitch
              :model-value="settingsStore.hapticsEnabled"
              aria-label="Вибрация"
              @update:model-value="toggleHaptics"
            />
          </div>

          <div class="stat-row">
            <div class="stat-copy">
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

          <div class="stat-row">
            <div class="stat-copy">
              <span>Следовать системе</span>
              <em>Тема повторяет настройки устройства</em>
            </div>
            <AppSwitch
              :model-value="settingsStore.themeMode === 'system'"
              aria-label="Следовать системной теме"
              @update:model-value="toggleSystemTheme"
            />
          </div>

          <div class="stat-row">
            <div class="stat-copy">
              <span>Тема по времени</span>
              <em>{{ scheduleDescription }}</em>
            </div>
            <AppSwitch
              :model-value="settingsStore.themeMode === 'schedule'"
              aria-label="Тема по времени"
              @update:model-value="toggleScheduleTheme"
            />
          </div>

          <div v-if="settingsStore.themeMode === 'schedule'" class="stat-row stat-row--stack">
            <div class="stat-copy">
              <span>Расписание</span>
              <em>Когда включать светлую и тёмную тему</em>
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

          <div class="stat-row stat-row--stack">
            <div class="stat-copy">
              <span>Акцент</span>
              <em>{{ accentLabel }}</em>
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

        <div class="tile-foot">
          <AppButton type="button" variant="secondary" @click="resetAppearance">
            <RotateCcw :size="16" />
            Сбросить оформление
          </AppButton>
        </div>
      </article>

      <!-- Work mode -->
      <article class="tile tile--focus">
        <header class="tile-head">
          <h2>Рабочий режим</h2>
          <span class="tile-head__aside">поведение</span>
        </header>

        <div class="stat-rows">
          <div class="stat-row">
            <div class="stat-copy">
              <span>Верхняя статистика</span>
              <em>Уровень, лига и счётчики задач</em>
            </div>
            <AppSwitch
              :model-value="settingsStore.showTopStats"
              aria-label="Верхняя статистика"
              @update:model-value="toggleTopStats"
            />
          </div>

          <div class="stat-row">
            <div class="stat-copy">
              <span>Статистика в настройках</span>
              <em>Показывать верхнюю статистику здесь</em>
            </div>
            <AppSwitch
              :model-value="settingsStore.showSettingsStats"
              aria-label="Статистика на странице настроек"
              @update:model-value="toggleSettingsStats"
            />
          </div>

          <div class="stat-row">
            <div class="stat-copy">
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

      <!-- Board -->
      <article class="tile tile--board">
        <header class="tile-head">
          <h2>Доска</h2>
          <span class="tile-head__aside">связи</span>
        </header>

        <div class="stat-rows">
          <div class="stat-row">
            <div class="stat-copy">
              <span>Типы узлов</span>
              <em>Подписи веток и этапов</em>
            </div>
            <AppSwitch
              :model-value="settingsStore.boardShowNodeTypes"
              aria-label="Показывать типы узлов"
              @update:model-value="toggleBoardShowNodeTypes"
            />
          </div>

          <div class="stat-row">
            <div class="stat-copy">
              <span>Защита связей</span>
              <em>Подтверждение перед удалением линии</em>
            </div>
            <AppSwitch
              :model-value="settingsStore.boardConfirmEdgeDelete"
              aria-label="Защищать связи от случайного удаления"
              @update:model-value="toggleBoardConfirmEdgeDelete"
            />
          </div>

          <div class="stat-row">
            <div class="stat-copy">
              <span>Защита веток</span>
              <em>Подтверждение перед удалением ветки</em>
            </div>
            <AppSwitch
              :model-value="settingsStore.boardConfirmBranchDelete"
              aria-label="Защищать ветки от удаления"
              @update:model-value="toggleBoardConfirmBranchDelete"
            />
          </div>
        </div>

        <p class="tile-note">
          Автораскладка сохраняет связи и оставляет схему читаемой.
        </p>
      </article>

      <!-- Tags -->
      <article class="tile tile--tags">
        <header class="tile-head">
          <h2>Теги</h2>
          <span class="tile-head__aside">общие</span>
        </header>
        <p class="tile-lead">Общие теги для задач и привычек. Изменение применяется везде.</p>
        <TagManager />
      </article>

      <!-- Data -->
      <article class="tile tile--data">
        <header class="tile-head">
          <h2>Данные</h2>
          <span class="tile-head__aside">
            {{ settingsStore.autoBackup ? 'авто-бэкап' : 'без бэкапа' }}
          </span>
        </header>

        <div class="stat-rows">
          <div class="stat-row">
            <div class="stat-copy">
              <span>Авто-бэкап при выходе</span>
              <em>Сохраняет профиль, авторизацию и прогресс</em>
            </div>
            <AppSwitch
              :model-value="settingsStore.autoBackup"
              aria-label="Авто-бэкап при выходе"
              @update:model-value="toggleAutoBackup"
            />
          </div>

          <div class="stat-row">
            <div class="stat-copy">
              <span>Последний бэкап</span>
              <em>
                {{
                  settingsStore.lastBackupDate
                    ? lastBackupText
                    : 'Резервная копия ещё не создавалась'
                }}
              </em>
            </div>
            <Clock :size="16" class="stat-icon" aria-hidden="true" />
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
          <div class="stat-copy">
            <span>Сброс данных</span>
            <em>Удаляет профиль, задачи, прогресс и настройки</em>
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
  Clock,
  Download,
  FileJson,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
  Upload,
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-areas:
    'appearance appearance appearance'
    'focus      board      tags'
    'data       data       data';
  gap: var(--space-3);
  width: 100%;
  align-items: stretch;
}

.tile {
  @include surface-panel;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
  min-height: 0;
  padding: var(--space-4);
  border: var(--ui-border);
  border-radius: var(--radius-lg);
}

.tile--appearance {
  grid-area: appearance;
}

.tile--focus {
  grid-area: focus;
}

.tile--board {
  grid-area: board;
}

.tile--tags {
  grid-area: tags;
}

.tile--data {
  grid-area: data;
}

.tile-head {
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

.tile-head__aside {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: 0.02em;
  text-transform: lowercase;
}

.tile-lead {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: 1.45;
}

.stat-rows {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-height: 48px;
  padding-block: var(--space-2);
  border-bottom: var(--ui-border);

  &:last-child {
    border-bottom: none;
  }

  &--stack {
    flex-direction: column;
    align-items: stretch;
  }
}

.stat-copy {
  display: grid;
  gap: 2px;
  min-width: 0;

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

.stat-icon {
  flex: 0 0 auto;
  color: var(--color-text-muted);
}

.tile-foot {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  flex: 0 0 auto;
  padding-top: var(--space-3);
  border-top: var(--ui-border);
}

.tile-note {
  margin: 0;
  margin-top: auto;
  padding-top: var(--space-3);
  border-top: var(--ui-border);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: 1.45;
}

.time-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);

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
  gap: var(--space-2);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-2);

  :deep(.app-button) {
    width: 100%;
  }
}

.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-top: var(--space-3);
  border-top: var(--ui-border);
}

@media (max-width: 1100px) {
  .settings-bento {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'appearance appearance'
      'focus      board'
      'tags       tags'
      'data       data';
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
      'focus'
      'board'
      'tags'
      'data';
    gap: var(--space-3);
  }

  .tile {
    padding: var(--space-3);
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
  .tile-foot :deep(.app-button),
  .action-grid :deep(.app-button) {
    width: 100%;
    min-height: 44px;
  }
}
</style>
