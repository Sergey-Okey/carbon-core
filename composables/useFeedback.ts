import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { useSettingsStore } from '~/stores/settings.store'

export type FeedbackType = 'selection' | 'success' | 'warning' | 'error' | 'focusComplete'

const tones: Record<FeedbackType, Array<[number, number]>> = {
  selection: [[440, 0.05]],
  success: [[620, 0.08], [820, 0.1]],
  warning: [[330, 0.16]],
  error: [[180, 0.2]],
  focusComplete: [[520, 0.12], [660, 0.12], [840, 0.2]],
}

export function useFeedback() {
  const settingsStore = useSettingsStore()

  async function trigger(type: FeedbackType) {
    if (!import.meta.client) return

    await Promise.allSettled([
      settingsStore.hapticsEnabled ? playHaptic(type) : Promise.resolve(),
      settingsStore.soundEnabled ? playTone(type, settingsStore.soundVolume) : Promise.resolve(),
    ])
  }

  return { trigger }
}

async function playHaptic(type: FeedbackType) {
  if (type === 'selection') {
    await Haptics.impact({ style: ImpactStyle.Light })
    return
  }

  const notificationType = {
    success: NotificationType.Success,
    warning: NotificationType.Warning,
    error: NotificationType.Error,
    focusComplete: NotificationType.Success,
  }[type]

  await Haptics.notification({ type: notificationType })
}

async function playTone(type: FeedbackType, volume: number) {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return

  const context = new AudioContextClass()
  let offset = 0

  for (const [frequency, duration] of tones[type]) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(Math.max(0.001, volume * 0.12), context.currentTime + offset)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + offset + duration)
    oscillator.start(context.currentTime + offset)
    oscillator.stop(context.currentTime + offset + duration)
    offset += duration + 0.035
  }

  window.setTimeout(() => void context.close(), Math.ceil((offset + 0.1) * 1000))
}
