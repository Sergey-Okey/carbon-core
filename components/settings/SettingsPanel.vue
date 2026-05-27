<template>
  <div class="settings-page">
    <div class="settings-head">
      <div>
        <h2>Настройки</h2>
        <p>Интерфейс, рабочий режим, доска и локальные данные приложения.</p>
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
                <span class="label">Режим темы</span>
                <span class="desc">{{ themeModeDescription }}</span>
              </div>
              <div class="option-grid theme-mode-grid">
                <button
                  v-for="option in themeModeOptions"
                  :key="option.value"
                  type="button"
                  :class="{ active: settingsStore.themeMode === option.value }"
                  @click="setThemeMode(option.value)"
                >
                  <component :is="option.icon" :size="16" />
                </button>
              </div>
            </div>

            <div v-if="settingsStore.themeMode === 'schedule'" class="setting-row">
              <div class="setting-info">
                <span class="label">Расписание темы</span>
                <span class="desc">Светлая тема днём, тёмная вечером.</span>
              </div>
              <div class="time-range">
                <label>
                  <span>Светлая</span>
                  <input
                    type="time"
                    :value="settingsStore.lightThemeFrom"
                    @input="setLightThemeFrom"
                  />
                </label>
                <label>
                  <span>Тёмная</span>
                  <input
                    type="time"
                    :value="settingsStore.darkThemeFrom"
                    @input="setDarkThemeFrom"
                  />
                </label>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Быстрая смена темы</span>
                <span class="desc">{{ themeLabel }}</span>
              </div>
              <label class="theme-slider" :class="{ light: settingsStore.theme === 'light' }">
                <input
                  type="checkbox"
                  :checked="settingsStore.theme === 'light'"
                  aria-label="Сменить тему"
                  @change="toggleTheme"
                />
                <span class="theme-slider__track">
                  <span class="theme-slider__icon dark">
                    <Moon :size="15" />
                  </span>
                  <span class="theme-slider__icon light">
                    <Sun :size="15" />
                  </span>
                  <span class="theme-slider__thumb" />
                </span>
              </label>
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
                <span class="label">Плотность интерфейса</span>
                <span class="desc">{{ settingsStore.uiDensity === 'compact' ? 'Компактнее списки и панели.' : 'Комфортные отступы по умолчанию.' }}</span>
              </div>
              <div class="option-grid two">
                <button
                  type="button"
                  :class="{ active: settingsStore.uiDensity === 'comfortable' }"
                  @click="settingsStore.setUiDensity('comfortable')"
                >
                  Обычная
                </button>
                <button
                  type="button"
                  :class="{ active: settingsStore.uiDensity === 'compact' }"
                  @click="settingsStore.setUiDensity('compact')"
                >
                  Компактная
                </button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Фон приложения</span>
                <span class="desc">{{ backgroundModeLabel }}</span>
              </div>
              <div class="option-grid three">
                <button
                  type="button"
                  :class="{ active: settingsStore.appBackgroundMode === 'default' }"
                  @click="settingsStore.setAppBackgroundMode('default')"
                >
                  Базовый
                </button>
                <button
                  type="button"
                  :class="{ active: settingsStore.appBackgroundMode === 'glass' }"
                  @click="settingsStore.setAppBackgroundMode('glass')"
                >
                  Стекло
                </button>
                <button
                  type="button"
                  :class="{ active: settingsStore.appBackgroundMode === 'image' }"
                  @click="chooseImageBackground"
                >
                  Свой
                </button>
              </div>
            </div>

            <div v-if="settingsStore.appBackgroundMode === 'image'" class="setting-row">
              <div class="setting-info">
                <span class="label">Изображение фона</span>
                <span class="desc">{{ settingsStore.customBackgroundImage ? 'Фон загружен и сохранён локально.' : 'Загрузите изображение, оно сохранится вместе с настройками.' }}</span>
              </div>
              <div class="background-control">
                <div
                  v-if="settingsStore.customBackgroundImage"
                  class="background-preview"
                  :style="{ backgroundImage: `url(${settingsStore.customBackgroundImage})` }"
                  aria-label="Текущий фон"
                />
                <AppButton class="action-btn" type="button" variant="secondary" @click="selectBackgroundImage">
                  <ImageIcon :size="16" />
                  {{ settingsStore.customBackgroundImage ? 'Заменить' : 'Загрузить' }}
                </AppButton>
                <AppButton
                  class="action-btn"
                  type="button"
                  variant="ghost"
                  :disabled="!settingsStore.customBackgroundImage"
                  @click="clearBackgroundImage"
                >
                  Очистить
                </AppButton>
              </div>
            </div>

            <div v-if="settingsStore.appBackgroundMode !== 'default'" class="setting-row">
              <div class="setting-info">
                <span class="label">Интенсивность фона</span>
                <span class="desc">{{ backgroundIntensityLabel }}</span>
              </div>
              <div class="option-grid three">
                <button
                  type="button"
                  :class="{ active: settingsStore.backgroundIntensity === 'soft' }"
                  @click="settingsStore.setBackgroundIntensity('soft')"
                >
                  Мягко
                </button>
                <button
                  type="button"
                  :class="{ active: settingsStore.backgroundIntensity === 'normal' }"
                  @click="settingsStore.setBackgroundIntensity('normal')"
                >
                  Обычно
                </button>
                <button
                  type="button"
                  :class="{ active: settingsStore.backgroundIntensity === 'contrast' }"
                  @click="settingsStore.setBackgroundIntensity('contrast')"
                >
                  Контраст
                </button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Сброс внешнего вида</span>
                <span class="desc">Вернуть тему, цвет, плотность и фон к базовым значениям.</span>
              </div>
              <AppButton class="action-btn" type="button" variant="secondary" @click="resetAppearance">
                <RotateCcw :size="16" />
                Сбросить вид
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
            <span>{{ settingsStore.showTopStats ? 'С панелью' : 'Без панели' }}</span>
          </div>

          <div class="group-body">
            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Верхняя статистика</span>
                <span class="desc">Показывать панель уровня, лиги, активности и счётчиков задач.</span>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="settingsStore.showTopStats"
                  @change="toggleTopStats"
                />
                <span class="slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Прогресс в настройках</span>
                <span class="desc">Показывать верхнюю статистику и на странице настроек.</span>
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
                <span>Оставьте подтверждения включёнными, а верхнюю статистику скрывайте только если нужен максимально спокойный экран.</span>
              </div>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'board'" class="settings-group">
          <div class="group-header">
            <div>
              <LayoutGrid :size="22" />
              <h3>Доска</h3>
            </div>
            <span>{{ settingsStore.boardColumns }} колонки</span>
          </div>

          <div class="group-body">
            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Фокус доски при открытии</span>
                <span class="desc">Доска сразу готова к горячим клавишам и созданию веток.</span>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="settingsStore.boardAutoFocus"
                  @change="toggleBoardAutoFocus"
                />
                <span class="slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Возвращать фокус после действий</span>
                <span class="desc">После создания, редактирования и удаления фокус снова возвращается на доску.</span>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="settingsStore.boardFocusAfterAction"
                  @change="toggleBoardFocusAfterAction"
                />
                <span class="slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Подтверждать разрыв связи</span>
                <span class="desc">Защита от случайного отсоединения цепочки этапов.</span>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="settingsStore.boardConfirmEdgeDelete"
                  @change="toggleBoardConfirmEdgeDelete"
                />
                <span class="slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Подтверждать удаление ветки</span>
                <span class="desc">Особенно важно, если в ветке есть этапы и связанные задачи.</span>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="settingsStore.boardConfirmBranchDelete"
                  @change="toggleBoardConfirmBranchDelete"
                />
                <span class="slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Режим автораскладки</span>
                <span class="desc">{{ boardDensityLabel }}</span>
              </div>
              <div class="option-grid three">
                <button
                  type="button"
                  :class="{ active: settingsStore.boardLayoutDensity === 'compact' }"
                  @click="settingsStore.setBoardLayoutDensity('compact')"
                >
                  Компактно
                </button>
                <button
                  type="button"
                  :class="{ active: settingsStore.boardLayoutDensity === 'normal' }"
                  @click="settingsStore.setBoardLayoutDensity('normal')"
                >
                  Обычно
                </button>
                <button
                  type="button"
                  :class="{ active: settingsStore.boardLayoutDensity === 'wide' }"
                  @click="settingsStore.setBoardLayoutDensity('wide')"
                >
                  Широко
                </button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Колонки веток</span>
                <span class="desc">Сколько веток помещать в ряд при автораскладке.</span>
              </div>
              <div class="option-grid three">
                <button
                  v-for="count in [3, 4, 5]"
                  :key="count"
                  type="button"
                  :class="{ active: settingsStore.boardColumns === count }"
                  @click="settingsStore.setBoardColumns(count)"
                >
                  {{ count }}
                </button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="label">Обозначения узлов</span>
                <span class="desc">Показывать подписи типа “ветка” и “этап”, если они нужны для ориентира.</span>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="settingsStore.boardShowNodeTypes"
                  @change="toggleBoardShowNodeTypes"
                />
                <span class="slider"></span>
              </label>
            </div>

            <div class="mode-summary">
              <LayoutGrid :size="18" />
              <div>
                <strong>Ручные связи защищены</strong>
                <span>Автораскладка меняет позиции, но не должна пересобирать специально созданные связи.</span>
              </div>
            </div>
          </div>
        </section>

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
                <span class="desc">Сохраняет профиль, авторизацию и прогресс.</span>
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
  Image as ImageIcon,
  LayoutGrid,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
} from 'lucide-vue-next'
import AppButton from '~/components/ui/AppButton.vue'
import AppColorPicker from '~/components/ui/AppColorPicker.vue'
import AppCustomColorPicker from '~/components/ui/AppCustomColorPicker.vue'
import { useNotification } from '~/composables/useNotification'
import { ACCENT_COLORS, useSettingsStore } from '~/stores/settings.store'
import {
  buildBackupPayload,
  readAutoBackup,
  restoreBackupPayload,
  saveAutoBackup,
} from '~/utils/backup'

type SettingsTab = 'appearance' | 'focus' | 'board' | 'data'
type ThemeMode = 'dark' | 'light' | 'system' | 'schedule'

const settingsStore = useSettingsStore()
const { addNotification } = useNotification()
const activeTab = ref<SettingsTab>('appearance')

const tabs = [
  { key: 'appearance' as const, label: 'Оформление', icon: Palette },
  { key: 'focus' as const, label: 'Режим', icon: Gauge },
  { key: 'board' as const, label: 'Доска', icon: LayoutGrid },
  { key: 'data' as const, label: 'Данные', icon: Database },
]

const themeModeOptions = [
  { value: 'dark' as const, label: 'Тёмная', icon: Moon },
  { value: 'light' as const, label: 'Светлая', icon: Sun },
  { value: 'system' as const, label: 'Система', icon: Monitor },
  { value: 'schedule' as const, label: 'По времени', icon: Clock },
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

const themeModeLabel = computed(() => {
  const found = themeModeOptions.find((option) => option.value === settingsStore.themeMode)
  return found?.label ?? 'Тёмная'
})

const themeModeDescription = computed(() => {
  if (settingsStore.themeMode === 'system') return 'Повторяет тему операционной системы.'
  if (settingsStore.themeMode === 'schedule') return `Светлая с ${settingsStore.lightThemeFrom}, тёмная с ${settingsStore.darkThemeFrom}.`
  return `${themeLabel.value} тема включена вручную.`
})

const accentLabel = computed(() => {
  const found = ACCENT_COLORS.find((color) => color.value === settingsStore.accentColor)
  return found?.name ?? 'Пользовательский'
})

const backgroundModeLabel = computed(() => {
  if (settingsStore.appBackgroundMode === 'glass') return 'Стеклянный фон поверх базовой темы.'
  if (settingsStore.appBackgroundMode === 'image') return 'Пользовательское изображение фона.'
  return 'Базовый фон приложения.'
})

const backgroundIntensityLabel = computed(() => {
  if (settingsStore.backgroundIntensity === 'soft') return 'Фон мягко приглушён.'
  if (settingsStore.backgroundIntensity === 'contrast') return 'Фон заметнее и контрастнее.'
  return 'Сбалансированная интенсивность.'
})

const boardDensityLabel = computed(() => {
  if (settingsStore.boardLayoutDensity === 'compact') return 'Меньше отступы между ветками и этапами.'
  if (settingsStore.boardLayoutDensity === 'wide') return 'Больше воздуха между цепочками.'
  return 'Стандартные отступы автораскладки.'
})

const lastBackupText = computed(() => {
  if (!settingsStore.lastBackupDate) return ''
  return new Date(settingsStore.lastBackupDate).toLocaleString('ru-RU')
})

function setTheme(theme: 'dark' | 'light', event?: MouseEvent) {
  if (settingsStore.theme === theme && settingsStore.themeMode === theme) return

  if (!import.meta.client) {
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

function setThemeMode(mode: ThemeMode) {
  if (mode === 'dark' || mode === 'light') {
    setTheme(mode)
    return
  }
  settingsStore.setThemeMode(mode)
}

function toggleTheme(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  setTheme(checked ? 'light' : 'dark')
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

function toggleTopStats(event: Event) {
  settingsStore.setShowTopStats((event.target as HTMLInputElement).checked)
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

function toggleBoardAutoFocus(event: Event) {
  settingsStore.setBoardAutoFocus((event.target as HTMLInputElement).checked)
}

function toggleBoardFocusAfterAction(event: Event) {
  settingsStore.setBoardFocusAfterAction((event.target as HTMLInputElement).checked)
}

function toggleBoardConfirmEdgeDelete(event: Event) {
  settingsStore.setBoardConfirmEdgeDelete((event.target as HTMLInputElement).checked)
}

function toggleBoardConfirmBranchDelete(event: Event) {
  settingsStore.setBoardConfirmBranchDelete((event.target as HTMLInputElement).checked)
}

function toggleBoardShowNodeTypes(event: Event) {
  settingsStore.setBoardShowNodeTypes((event.target as HTMLInputElement).checked)
}

function selectBackgroundImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    if (file.size > 1_500_000) {
      addNotification({ type: 'warning', message: 'Фон слишком большой. Выберите изображение до 1.5 МБ.' })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      settingsStore.setCustomBackgroundImage(String(reader.result || ''))
      settingsStore.setAppBackgroundMode('image')
      addNotification({ type: 'success', message: 'Фон приложения обновлён' })
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

function chooseImageBackground() {
  settingsStore.setAppBackgroundMode('image')
  if (!settingsStore.customBackgroundImage) selectBackgroundImage()
}

function clearBackgroundImage() {
  settingsStore.setCustomBackgroundImage('')
  settingsStore.setAppBackgroundMode('default')
}

function resetAppearance() {
  settingsStore.setTheme('dark')
  settingsStore.setAccentColor(ACCENT_COLORS[0].value)
  settingsStore.setUiDensity('comfortable')
  settingsStore.setAppBackgroundMode('default')
  settingsStore.setCustomBackgroundImage('')
  settingsStore.setBackgroundIntensity('normal')
  addNotification({ type: 'success', message: 'Внешний вид сброшен' })
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
      if (!restored) throw new Error('Invalid backup')
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
      addNotification({ type: 'warning', message: 'Нет сохранённой копии' })
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

function resetAllData() {
  if (
    !settingsStore.confirmDangerActions ||
    confirm('Удалить все данные? Это действие необратимо.')
  ) {
    localStorage.clear()
    addNotification({ type: 'success', message: 'Данные сброшены. Перезагрузка...' })
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
  @include glass;
  display: grid;
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);

  @include mobile {
    display: inline-grid;
    grid-template-columns: repeat(4, 44px);
    justify-self: center;
    justify-content: center;
    width: fit-content;
    padding: 6px;
    border-radius: var(--border-radius-lg);
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
  cursor: pointer;
  font: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  transition: all var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--accent);
  }

  &.active {
    border-color: color-mix(in srgb, var(--accent) 28%, var(--glass-border));
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
  }

  @include mobile {
    justify-content: center;
    width: 44px;
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
  min-width: 0;
}

.settings-group {
  @include glass;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  border-bottom: 1px solid var(--glass-border);
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
  border-bottom: 1px solid color-mix(in srgb, var(--dim) 8%, transparent);

  &:last-of-type {
    border-bottom: none;
  }

  @include mobile {
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
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  min-width: 220px;

  &.two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &.three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 38px;
    padding: 0 10px;
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-md);
    background: var(--glass-surface);
    color: var(--dim);
    cursor: pointer;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    transition: all var(--transition-standard);

    &:hover,
    &.active {
      border-color: var(--glass-border);
      color: var(--accent);
    }

    &.active {
      background: var(--glass-surface);
      color: var(--accent);
    }
  }

  @include mobile {
    width: 100%;
    min-width: 0;
  }
}

.theme-mode-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.time-range,
.action-inline,
.accent-controls,
.background-control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;

  @include mobile {
    justify-content: center;
  }
}

.background-preview {
  width: 86px;
  height: 48px;
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.time-range label {
  display: grid;
  gap: 4px;
  color: var(--dim);
  font-size: 0.75rem;
  font-weight: 600;

  input {
    min-height: 36px;
    padding: 0 10px;
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-md);
    background: var(--glass-surface);
    color: var(--accent);
  }
}

.theme-slider {
  position: relative;
  justify-self: end;
  cursor: pointer;

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  @include mobile {
    justify-self: center;
  }
}

.theme-slider__track {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 84px;
  height: 38px;
  padding: 3px;
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-pill);
  background: var(--glass-surface);
  color: var(--dim);
  transition:
    border-color var(--transition-standard),
    background var(--transition-standard),
    color var(--transition-standard);
}

.theme-slider__icon {
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: inherit;
  transition:
    color var(--transition-standard),
    opacity var(--transition-standard);
}

.theme-slider__thumb {
  position: absolute;
  left: 3px;
  top: 3px;
  display: inline-flex;
  width: 30px;
  height: 30px;
  border-radius: var(--border-radius-pill);
  background: var(--accent);
  transition: transform var(--transition-standard);
}

.theme-slider.light .theme-slider__thumb {
  transform: translateX(47px);
}

.theme-slider:not(.light) .theme-slider__icon.dark,
.theme-slider.light .theme-slider__icon.light {
  color: var(--bg);
}

.theme-slider:not(.light) .theme-slider__icon.light,
.theme-slider.light .theme-slider__icon.dark {
  opacity: 0.72;
}

.theme-slider:hover .theme-slider__track {
  border-color: var(--accent);
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
    border-radius: var(--border-radius-pill);
    background: var(--glass-surface);
    cursor: pointer;
    transition: background var(--transition-standard);

    &::before {
      content: '';
      position: absolute;
      left: 3px;
      bottom: 3px;
      width: 18px;
      height: 18px;
      border-radius: var(--border-radius-pill);
      background: var(--glass-surface);
      transition: transform var(--transition-standard);
    }
  }

  input:checked + .slider {
    background: var(--accent);
  }

  input:checked + .slider::before {
    transform: translateX(20px);
    background: var(--glass-surface);
  }

  @include mobile {
    justify-self: center;
  }
}

.backup-info,
.data-note,
.mode-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0 18px;
  padding: 12px 14px;
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  background: var(--glass-surface);
  color: var(--dim);
  font-size: 0.85rem;

  svg {
    flex-shrink: 0;
    color: var(--accent);
  }
}

.mode-summary {
  align-items: flex-start;
  margin-top: 12px;
  margin-bottom: 0;

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
    line-height: 1.45;
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

.danger-zone .action-btn {
  min-width: 180px;

  @include mobile {
    width: 100%;
  }
}

.action-btn {
  min-height: 42px;
}

.danger-zone {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--glass-border);

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
