<template>
  <div v-if="siteKey" class="auth-turnstile">
    <div ref="host" class="auth-turnstile__widget" />
    <p v-if="failed" class="auth-turnstile__error" role="alert">
      Проверка не загрузилась. Обновите страницу и попробуйте снова.
    </p>
  </div>
</template>

<script setup lang="ts">
type TurnstileOptions = {
  sitekey: string
  theme: 'light' | 'dark'
  language: string
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
}

type TurnstileApi = {
  render: (target: HTMLElement, options: TurnstileOptions) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

const emit = defineEmits<{ (event: 'update:modelValue', token: string): void }>()

const siteKey = useRuntimeConfig().public.turnstileSiteKey || ''
const host = ref<HTMLElement | null>(null)
const failed = ref(false)
let widgetId = ''

function getApi() {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile
}

function loadScript() {
  if (getApi()) return Promise.resolve()

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${SCRIPT_SRC}"]`
  )
  const script = existing || document.createElement('script')

  const ready = new Promise<void>((resolve, reject) => {
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('turnstile')), {
      once: true,
    })
  })

  if (!existing) {
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }

  return ready
}

function render() {
  const api = getApi()
  if (!api || !host.value || widgetId) return

  widgetId = api.render(host.value, {
    sitekey: siteKey,
    theme: document.documentElement.classList.contains('light-theme')
      ? 'light'
      : 'dark',
    language: 'ru',
    callback: (token: string) => {
      failed.value = false
      emit('update:modelValue', token)
    },
    'expired-callback': () => emit('update:modelValue', ''),
    'error-callback': () => {
      failed.value = true
      emit('update:modelValue', '')
    },
  })
}

function reset() {
  emit('update:modelValue', '')
  getApi()?.reset(widgetId || undefined)
}

onMounted(async () => {
  if (!siteKey) return
  try {
    await loadScript()
  } catch {
    failed.value = true
    return
  }
  render()
})

onBeforeUnmount(() => {
  if (!widgetId) return
  getApi()?.remove(widgetId)
  widgetId = ''
})

defineExpose({ reset })
</script>

<style scoped lang="scss">
.auth-turnstile {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.auth-turnstile__widget {
  display: flex;
  justify-content: center;
  min-height: 65px;
}

.auth-turnstile__error {
  @include meta-text;
  color: var(--color-error);
  text-align: center;
}
</style>
