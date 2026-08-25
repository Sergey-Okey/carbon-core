<template>
  <section class="settings" :class="{ 'is-entered': entered }" aria-label="Настройки">
    <div v-if="accessStore.isDemo" class="demo-note" style="--enter-i: 0">
      <div class="demo-note__copy">
        <strong>Демо-режим</strong>
        <span>Данные не синхронизируются с сервером</span>
      </div>
      <AppButton type="button" variant="secondary" size="sm" @click="exitDemoToRegister">
        Завершить
      </AppButton>
    </div>
    <div class="settings-bento">
      <article class="card card--appearance" style="--enter-i: 1">
        <header class="card-head">
          <h2>Оформление</h2>
          <span class="card-head__aside">{{ accentLabel }}</span>
        </header>

        <div class="rows">
          <div class="row">
            <span class="row-icon" aria-hidden="true">
              <component :is="settingsStore.theme === 'light' ? Sun : Moon" :size="20" />
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
              <Monitor :size="20" />
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
              <Clock :size="20" />
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
                <Clock :size="20" />
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
                <Palette :size="20" />
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
                :active="isCustomAccent"
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

      <!-- Behavior: feedback + interface -->
      <article class="card card--prefs" style="--enter-i: 2">
        <header class="card-head">
          <h2>Поведение</h2>
          <span class="card-head__aside">отклик и интерфейс</span>
        </header>

        <div class="rows">
          <p class="group-label">Отклик</p>

          <div class="row">
            <span class="row-icon" aria-hidden="true">
              <Volume2 :size="20" />
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
              <Vibrate :size="20" />
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

          <p class="group-label">Интерфейс</p>

          <div class="row">
            <span class="row-icon" aria-hidden="true">
              <BarChart3 :size="20" />
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
              <LayoutDashboard :size="20" />
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
              <ShieldAlert :size="20" />
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

      <!-- Tags -->
      <article class="card card--tags" style="--enter-i: 3">
        <header class="card-head">
          <h2>Теги</h2>
          <span class="card-head__aside">общие</span>
        </header>
        <p class="card-lead">Общие теги для задач и привычек. Изменение применяется везде.</p>
        <TagManager />
      </article>

      <!-- Data -->
      <article class="card card--data" style="--enter-i: 4">
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
import { ACCESS_STORAGE_KEY } from '~/utils/accessStorage'
import { ACCENT_COLORS } from '~/stores/settings.store'
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
const router = useRouter()
const entered = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    entered.value = true
  })
})

async function exitDemoToRegister() {
  const ok = await confirm(
    'Завершить демо-режим и перейти к регистрации? Локальные демо-данные будут сброшены.'
  )
  if (!ok) return
  accessStore.leaveDemo()
  sessionStorage.clear()
  sessionStorage.setItem('cof-workspace-fresh', '1')
  window.location.assign('/register')
}

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

const isCustomAccent = computed(
  () => !ACCENT_COLORS.some((color) => color.value === settingsStore.accentColor)
)

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
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.demo-note {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-3) var(--space-4);
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-1);
  opacity: 0;
  transform: translateY(10px);

  &__copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    strong {
      color: var(--color-text-primary);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
    }

    span {
      color: var(--color-text-muted);
      font-size: var(--text-xs);
      @include text-ellipsis;
    }
  }
}

.settings-bento {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-template-areas:
    'appearance appearance appearance appearance appearance appearance appearance prefs prefs prefs prefs prefs'
    'tags tags tags tags tags tags data data data data data data';
  gap: var(--space-4);
  width: 100%;
  align-items: start;
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  box-sizing: border-box;
  min-width: 0;
  height: auto;
  padding: var(--space-6);
  background: var(--color-surface-1);
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  opacity: 0;
  transform: translateY(10px);
}

.settings.is-entered .demo-note,
.settings.is-entered .card {
  animation: settings-panel-in 380ms ease-out both;
  animation-delay: calc(var(--enter-i, 0) * 50ms);
}

@keyframes settings-panel-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-note,
  .card {
    opacity: 1;
    transform: none;
  }

  .settings.is-entered .demo-note,
  .settings.is-entered .card {
    animation: none;
  }
}

.card--appearance {
  grid-area: appearance;
}

.card--prefs {
  grid-area: prefs;
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
    font-size: clamp(1.15rem, 1.5vw, 1.35rem);
    font-weight: var(--weight-bold);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
}

.card-head__aside {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
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
  margin-top: 0;
  padding-top: var(--space-4);
  border-top: var(--ui-border);

  :deep(.app-button) {
    min-height: 44px;
  }
}

.group-label {
  margin: 0;
  padding: var(--space-3) var(--space-6) var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.rows {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  margin: 0 calc(var(--space-6) * -1);
}

.row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-width: 0;
  min-height: 64px;
  padding: var(--space-4) var(--space-6);
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
  gap: var(--space-4);
  min-width: 0;
  flex: 1;
}

.row-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  color: var(--color-text-secondary);
  background: var(--color-surface-2);
  border-radius: var(--radius-md);

  &--danger {
    color: var(--color-danger, var(--color-text-secondary));
  }
}

.row-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
  flex: 1 1 auto;

  span {
    overflow: hidden;
    color: var(--color-text-primary);
    font-size: var(--text-md);
    font-weight: var(--weight-semibold);
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  em {
    display: -webkit-box;
    overflow: hidden;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-style: normal;
    line-height: 1.35;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);

  :deep(.app-button) {
    width: 100%;
    min-height: 48px;
  }
}

.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: 0;
  padding-top: var(--space-4);
  border-top: var(--ui-border);

  :deep(.app-button) {
    flex-shrink: 0;
    min-height: 44px;
  }
}

@media (max-width: 1100px) {
  .settings-bento {
    grid-template-columns: 1fr;
    grid-template-areas:
      'appearance'
      'prefs'
      'tags'
      'data';
    gap: var(--space-3);
  }

  .card {
    height: auto;
  }
}

@include mobile {
  .card {
    gap: var(--space-4);
    padding: var(--space-5);
  }

  .rows {
    margin: 0 calc(var(--space-5) * -1);
  }

  .group-label {
    padding-inline: var(--space-5);
  }

  .row {
    min-height: 56px;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
  }

  .row-icon {
    width: 36px;
    height: 36px;
  }

  .row-copy span {
    font-size: var(--text-sm);
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
