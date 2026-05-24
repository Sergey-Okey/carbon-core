<template>
  <div class="settings-page">
    <header class="settings-head">
      <div>
        <h2>Настройки</h2>
        <p>Коротко и по делу: внешний вид, поведение интерфейса, восстановление удалённого и резервные копии.</p>
      </div>
    </header>

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
          <span>{{ tab.label }}</span>
        </button>
      </aside>

      <section v-if="activeTab === 'appearance'" class="settings-panel">
        <div class="panel-head">
          <div>
            <Palette :size="22" />
            <h3>Внешний вид</h3>
          </div>
          <span>{{ themeLabel }}</span>
        </div>

        <div class="setting-row">
          <div>
            <strong>Тема</strong>
            <span>Переключение с мягкой анимацией из точки клика.</span>
          </div>
          <div class="segmented">
            <button
              type="button"
              :class="{ active: settingsStore.theme === 'dark' }"
              @click="setTheme('dark', $event)"
            >
              <Moon :size="18" />
              Тёмная
            </button>
            <button
              type="button"
              :class="{ active: settingsStore.theme === 'light' }"
              @click="setTheme('light', $event)"
            >
              <Sun :size="18" />
              Светлая
            </button>
          </div>
        </div>

        <div class="setting-row">
          <div>
            <strong>Цвет пользователя</strong>
            <span>{{ accentLabel }}</span>
          </div>
          <div class="accent-controls">
            <AppColorPicker
              :model-value="settingsStore.accentColor"
              :options="accentOptions"
              label="Акцент интерфейса"
              @update:model-value="setAccentColor"
            />
            <label class="custom-color">
              <span>Свой</span>
              <input
                type="color"
                :value="settingsStore.accentColor"
                aria-label="Выбрать свой цвет"
                @input="setCustomAccent"
              />
            </label>
          </div>
        </div>

        <div class="setting-row">
          <div>
            <strong>Анимации</strong>
            <span>Отключает переходы, всплытия и анимацию смены темы.</span>
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
      </section>

      <section v-if="activeTab === 'behavior'" class="settings-panel">
        <div class="panel-head">
          <div>
            <SlidersHorizontal :size="22" />
            <h3>Поведение</h3>
          </div>
          <span>{{ settingsStore.notificationsEnabled ? 'Обычный режим' : 'Тихий режим' }}</span>
        </div>

        <div class="setting-row">
          <div>
            <strong>Уведомления</strong>
            <span>Показывать только нужные сообщения и ошибки.</span>
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
          <div>
            <strong>Звук важных событий</strong>
            <span>Один короткий сигнал только для ошибок и предупреждений.</span>
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

        <div class="setting-row">
          <div>
            <strong>Защита от случайного сброса</strong>
            <span>Перед удалением всех данных приложение спросит подтверждение.</span>
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

        <div class="setting-row">
          <div>
            <strong>Статистика в настройках</strong>
            <span>Показывать верхнюю панель прогресса, если хочется видеть контекст.</span>
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
      </section>

      <section v-if="activeTab === 'recovery'" class="settings-panel">
        <div class="panel-head">
          <div>
            <History :size="22" />
            <h3>Восстановление</h3>
          </div>
          <span>{{ deletedCaption }}</span>
        </div>

        <div v-if="deletedTasks.length" class="recovery-list">
          <article
            v-for="task in deletedTasks"
            :key="task.id"
            class="recovery-item"
          >
            <div>
              <strong>{{ task.title }}</strong>
              <span>{{ task.type === 'HABIT' ? 'Привычка' : 'Задача' }} · удалено {{ formatDate(task.deletedAt) }}</span>
            </div>
            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              @click="restoreDeletedTask(task.id)"
            >
              <RotateCcw :size="15" />
              Вернуть
            </AppButton>
          </article>
        </div>

        <div v-else class="empty-state">
          <History :size="22" />
          <span>Удалённых задач и привычек пока нет.</span>
        </div>

        <div v-if="deletedTasks.length" class="panel-footer">
          <AppButton type="button" variant="ghost" size="sm" @click="clearDeletedTasks">
            Очистить список восстановления
          </AppButton>
        </div>
      </section>

      <section v-if="activeTab === 'data'" class="settings-panel">
        <div class="panel-head">
          <div>
            <Database :size="22" />
            <h3>Данные</h3>
          </div>
          <span>{{ settingsStore.autoBackup ? 'Авто-бэкап включён' : 'Авто-бэкап отключён' }}</span>
        </div>

        <div class="data-note">
          <Database :size="16" />
          <span>Данные хранятся на этом устройстве. Бэкап нужен перед очисткой браузера или переносом.</span>
        </div>

        <div class="setting-row">
          <div>
            <strong>Авто-бэкап</strong>
            <span>{{ lastBackupText }}</span>
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

        <div class="action-grid">
          <AppButton type="button" variant="secondary" @click="createBackup">
            <Download :size="16" />
            Создать бэкап
          </AppButton>
          <AppButton type="button" variant="secondary" @click="exportData">
            <FileJson :size="16" />
            Экспорт JSON
          </AppButton>
          <AppButton type="button" variant="secondary" @click="importData">
            <Upload :size="16" />
            Импорт JSON
          </AppButton>
          <AppButton type="button" variant="secondary" @click="restoreAutoBackup">
            <RotateCcw :size="16" />
            Восстановить
          </AppButton>
        </div>

        <div class="danger-zone">
          <div>
            <strong>Сброс данных</strong>
            <span>Удаляет профиль, задачи, прогресс, историю и настройки.</span>
          </div>
          <AppButton type="button" variant="danger" @click="resetAllData">
            <Trash2 :size="16" />
            Сбросить всё
          </AppButton>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Database,
  Download,
  FileJson,
  History,
  Moon,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Sun,
  Trash2,
  Upload,
} from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import AppColorPicker from '~/components/ui/AppColorPicker.vue'
import { useNotification } from '~/composables/useNotification'
import { ACCENT_COLORS, useSettingsStore } from '~/stores/settings.store'
import { useTasksStore } from '~/stores/tasks.store'
import {
  buildBackupPayload,
  readAutoBackup,
  restoreBackupPayload,
  saveAutoBackup,
} from '~/utils/backup'

const settingsStore = useSettingsStore()
const tasksStore = useTasksStore()
const { addNotification } = useNotification()
const activeTab = ref<'appearance' | 'behavior' | 'recovery' | 'data'>('appearance')

const tabs = [
  { key: 'appearance', label: 'Вид', icon: Palette },
  { key: 'behavior', label: 'Работа', icon: SlidersHorizontal },
  { key: 'recovery', label: 'Возврат', icon: History },
  { key: 'data', label: 'Данные', icon: Database },
] as const

const accentOptions = computed(() =>
  ACCENT_COLORS.map((color) => ({
    label: color.name,
    value: color.value,
  }))
)
const deletedTasks = computed(() => tasksStore.deletedTasks)
const themeLabel = computed(() =>
  settingsStore.theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'
)
const accentLabel = computed(() => {
  const found = ACCENT_COLORS.find((color) => color.value === settingsStore.accentColor)
  return found?.name ?? 'Свой цвет'
})
const deletedCaption = computed(() =>
  deletedTasks.value.length
    ? `${deletedTasks.value.length} можно вернуть`
    : 'Корзина пуста'
)
const lastBackupText = computed(() => {
  if (!settingsStore.lastBackupDate) return 'Резервная копия ещё не создавалась'
  return `Последний бэкап: ${new Date(settingsStore.lastBackupDate).toLocaleString('ru-RU')}`
})

function setTheme(theme: 'dark' | 'light', event?: MouseEvent) {
  if (settingsStore.theme === theme) return
  if (!import.meta.client || !settingsStore.animationsEnabled) {
    settingsStore.setTheme(theme)
    return
  }

  const x = event?.clientX ?? window.innerWidth - 32
  const y = event?.clientY ?? 32
  document.documentElement.style.setProperty('--theme-transition-x', `${x}px`)
  document.documentElement.style.setProperty('--theme-transition-y', `${y}px`)

  const transitionDocument = document as Document & {
    startViewTransition?: (callback: () => void) => { finished: Promise<void> }
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

function setCustomAccent(event: Event) {
  settingsStore.setAccentColor((event.target as HTMLInputElement).value)
}

function toggleAnimations(event: Event) {
  settingsStore.setAnimationsEnabled((event.target as HTMLInputElement).checked)
}

function toggleNotifications(event: Event) {
  settingsStore.setNotificationsEnabled((event.target as HTMLInputElement).checked)
}

function toggleSound(event: Event) {
  settingsStore.setSoundEnabled((event.target as HTMLInputElement).checked)
}

function toggleSettingsStats(event: Event) {
  settingsStore.setShowSettingsStats((event.target as HTMLInputElement).checked)
}

function toggleDangerConfirm(event: Event) {
  settingsStore.setConfirmDangerActions((event.target as HTMLInputElement).checked)
}

function toggleAutoBackup(event: Event) {
  settingsStore.setAutoBackup((event.target as HTMLInputElement).checked)
}

function restoreDeletedTask(id: string) {
  const restored = tasksStore.restoreTask(id)
  addNotification(
    restored
      ? { type: 'success', category: 'user', history: true, message: `«${restored.title}» восстановлено` }
      : { type: 'warning', category: 'user', message: 'Не удалось восстановить: лимит активных задач заполнен' }
  )
}

function clearDeletedTasks() {
  tasksStore.clearDeletedTasks()
  addNotification({ type: 'info', message: 'Список восстановления очищен', history: false })
}

function createBackup() {
  saveAutoBackup()
  settingsStore.recordBackup()
  addNotification({ type: 'success', category: 'system', history: true, message: 'Резервная копия создана' })
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
    addNotification({ type: 'success', category: 'system', history: true, message: 'Данные экспортированы' })
  } catch (error) {
    console.error(error)
    addNotification({ type: 'error', category: 'system', message: 'Ошибка экспорта' })
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
      if (!restored) throw new Error('Invalid backup')
      addNotification({ type: 'success', category: 'system', history: true, message: 'Данные импортированы. Перезагрузка...' })
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error(error)
      addNotification({ type: 'error', category: 'system', message: 'Ошибка импорта' })
    }
  }
  input.click()
}

function restoreAutoBackup() {
  try {
    const backup = readAutoBackup()
    if (!backup) {
      addNotification({ type: 'warning', category: 'system', message: 'Нет сохранённой копии' })
      return
    }
    const restored = restoreBackupPayload(backup)
    if (!restored) throw new Error('Restore failed')
    addNotification({ type: 'success', category: 'system', history: true, message: 'Данные восстановлены. Перезагрузка...' })
    setTimeout(() => window.location.reload(), 1000)
  } catch (error) {
    console.error(error)
    addNotification({ type: 'error', category: 'system', message: 'Ошибка восстановления' })
  }
}

function resetAllData() {
  if (
    !settingsStore.confirmDangerActions ||
    confirm('Удалить все данные? Это действие необратимо.')
  ) {
    localStorage.clear()
    addNotification({ type: 'success', category: 'system', history: true, message: 'Данные сброшены. Перезагрузка...' })
    setTimeout(() => window.location.reload(), 1000)
  }
}

function formatDate(value: number) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  h2 {
    margin: 0 0 6px;
    color: var(--accent);
    font-size: 1.35rem;
    font-weight: 700;
  }

  p {
    max-width: 760px;
    margin: 0;
    color: var(--dim);
    line-height: 1.5;
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
    grid-template-columns: repeat(4, 44px);
    justify-self: center;
    width: fit-content;
    padding: 6px;
    border-radius: 40px;
  }
}

.nav-option {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 10px 12px;
  border: none;
  border-radius: var(--border-radius-md);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-standard);

  &:hover,
  &.active {
    background: var(--bg);
    color: var(--accent);
  }

  &.active {
    box-shadow: inset 0 0 0 1px var(--accent);
  }

  @include mobile {
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: 50%;

    span {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      white-space: nowrap;
      clip-path: inset(50%);
    }
  }
}

.settings-panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-md);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  border-bottom: 1px solid var(--border);

  > div {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h3 {
    margin: 0;
    color: var(--accent);
    font-size: 1.1rem;
  }

  span {
    color: var(--dim);
    font-size: 0.85rem;
    font-weight: 600;
    text-align: right;
  }

  @include mobile {
    align-items: center;
    flex-direction: column;
    text-align: center;

    span {
      text-align: center;
    }
  }
}

.setting-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(190px, auto);
  align-items: center;
  gap: 20px;
  min-height: 78px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(var(--dim-rgb, 136, 136, 136), 0.08);

  > div:first-child {
    min-width: 0;
  }

  strong,
  span {
    display: block;
  }

  strong {
    color: var(--accent);
    font-weight: 600;
  }

  span {
    margin-top: 4px;
    color: var(--dim);
    font-size: 0.85rem;
    line-height: 1.45;
  }

  @include mobile {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px 20px;
    text-align: center;
  }
}

.segmented,
.accent-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;

  @include mobile {
    justify-content: center;
  }
}

.segmented button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  min-width: 112px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  background: var(--surface);
  color: var(--dim);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-standard);

  &:hover,
  &.active {
    border-color: var(--accent);
    color: var(--accent);
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
}

.switch {
  position: relative;
  width: 44px;
  height: 24px;
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
    transition: background var(--transition-standard);

    &::before {
      position: absolute;
      left: 3px;
      bottom: 3px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition-standard);
      content: '';
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
  }

  @include mobile {
    justify-self: center;
  }
}

.data-note,
.empty-state {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 24px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  background: var(--bg);
  color: var(--dim);
  font-size: 0.85rem;
}

.empty-state {
  justify-content: center;
  min-height: 120px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 16px 24px 0;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.recovery-list {
  display: grid;
  gap: 8px;
  padding: 16px 24px 0;
}

.recovery-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  background: var(--bg);

  strong,
  span {
    display: block;
  }

  strong {
    color: var(--accent);
  }

  span {
    margin-top: 3px;
    color: var(--dim);
    font-size: 0.8rem;
  }

  @include mobile {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

.panel-footer,
.danger-zone {
  margin: 18px 24px 24px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.danger-zone {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;

  strong,
  span {
    display: block;
  }

  strong {
    color: var(--accent);
  }

  span {
    margin-top: 4px;
    color: var(--dim);
    font-size: 0.85rem;
  }

  @include mobile {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

:global(::view-transition-old(root)),
:global(::view-transition-new(root)) {
  animation-duration: 520ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
  mix-blend-mode: normal;
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
</style>
