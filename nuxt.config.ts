const isProduction = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  compatibilityDate: '2026-04-08',
  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'true' },
  telemetry: false,
  devServer: { host: '0.0.0.0', port: 3000 },
  buildDir: 'C:/Users/Public/carbon-core-nuxt',
  experimental: { appManifest: false },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vueuse/motion',
    ...(isProduction ? ['@vercel/speed-insights', '@vercel/analytics'] : []),
  ],
  css: ['~/assets/styles/reset.scss', '~/assets/styles/global.scss'],
  nitro: { preset: 'vercel' },
  vite: {
    optimizeDeps: {
      include: [
        '@vue-flow/core',
        '@vue-flow/background',
        '@vue-flow/controls',
        '@vue-flow/minimap',
        'chart.js',
        'dagre',
        'lucide-vue-next',
        'pinia-plugin-persistedstate',
        'uuid',
        'vue-chartjs',
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "~/assets/styles/variables.scss" as *; @use "~/assets/styles/mixins.scss" as *;',
        },
      },
    },
  },
  typescript: { strict: true, typeCheck: false },
  ssr: false,
  app: {
    head: {
      title: 'COF',
      meta: [
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
        },
        { name: 'theme-color', content: '#050505' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap',
        },
      ],
      script: [
        {
          innerHTML: `(() => {
try {
  const raw = localStorage.getItem('carbon-settings')
  if (!raw) return
  const settings = JSON.parse(raw)
  const root = document.documentElement
  const mode = settings.themeMode || settings.theme || 'dark'
  const minutes = (value) => {
    const parts = String(value || '00:00').split(':')
    return Number(parts[0] || 0) * 60 + Number(parts[1] || 0)
  }
  let theme = settings.theme || 'dark'
  if (mode === 'light' || mode === 'dark') theme = mode
  if (mode === 'system') theme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  if (mode === 'schedule') {
    const now = new Date()
    const current = now.getHours() * 60 + now.getMinutes()
    const light = minutes(settings.lightThemeFrom || '08:00')
    const dark = minutes(settings.darkThemeFrom || '20:00')
    theme = light < dark
      ? (current >= light && current < dark ? 'light' : 'dark')
      : (current >= light || current < dark ? 'light' : 'dark')
  }
  root.classList.toggle('light-theme', theme === 'light')
  root.classList.toggle('compact-ui', settings.uiDensity === 'compact')
  root.dataset.backgroundMode = settings.appBackgroundMode || 'default'
  root.dataset.backgroundIntensity = settings.backgroundIntensity || 'normal'
  if (settings.appBackgroundMode === 'image' && settings.customBackgroundImage) {
    root.style.setProperty('--custom-bg-image', 'url("' + settings.customBackgroundImage + '")')
  }
} catch {}
})()`,
        },
      ],
    },
  },
})
