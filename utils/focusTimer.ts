import { accessAwareStorage } from '~/utils/accessStorage'

export type FocusPresetKey = 'focus' | 'short' | 'long'

export type FocusTimerState = {
  preset: FocusPresetKey
  remainingSeconds: number
  isRunning: boolean
  endsAt: number | null
}

export type FocusTimerSnapshot = FocusTimerState & {
  label: string
}

export const FOCUS_STATE_KEY = 'cof-focus-state'

const focusPresetLabels: Record<FocusPresetKey, string> = {
  focus: 'Фокус',
  short: 'Пауза',
  long: 'Отдых',
}

export function getFocusPresetLabel(preset: FocusPresetKey) {
  return focusPresetLabels[preset] || focusPresetLabels.focus
}

export function getFocusPresetSeconds(preset: FocusPresetKey) {
  return (
    {
      focus: 25 * 60,
      short: 5 * 60,
      long: 15 * 60,
    } satisfies Record<FocusPresetKey, number>
  )[preset]
}

export function readFocusTimerState(): FocusTimerState | null {
  if (!import.meta.client) return null

  try {
    const raw = accessAwareStorage.getItem(FOCUS_STATE_KEY)
    if (!raw) return null

    const state = JSON.parse(raw) as Partial<FocusTimerState>
    const preset = state.preset === 'short' || state.preset === 'long' ? state.preset : 'focus'
    const remainingSeconds = Number.isFinite(state.remainingSeconds)
      ? Math.max(0, Number(state.remainingSeconds))
      : getFocusPresetSeconds(preset)

    return {
      preset,
      remainingSeconds,
      isRunning: state.isRunning === true,
      endsAt: typeof state.endsAt === 'number' ? state.endsAt : null,
    }
  } catch {
    return null
  }
}

export function writeFocusTimerState(state: FocusTimerState) {
  if (!import.meta.client) return

  accessAwareStorage.setItem(FOCUS_STATE_KEY, JSON.stringify(state))
}

export function clearFocusTimerState() {
  if (!import.meta.client) return

  accessAwareStorage.removeItem(FOCUS_STATE_KEY)
}

export function createFocusSnapshot(state: FocusTimerState | null): FocusTimerSnapshot | null {
  if (!state) return null

  return {
    ...state,
    label: getFocusPresetLabel(state.preset),
  }
}

export function emitFocusTimerUpdate(state?: FocusTimerState | null) {
  if (!import.meta.client) return

  const snapshot = createFocusSnapshot(state ?? readFocusTimerState())
  window.dispatchEvent(new CustomEvent('cof:focus-timer-update', { detail: snapshot }))
}

export function emitFocusTimerAction(action: 'toggle' | 'reset') {
  if (!import.meta.client) return

  window.dispatchEvent(new CustomEvent('cof:focus-timer-action', { detail: { action } }))
}
