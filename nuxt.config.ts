export default defineNuxtConfig({
  compatibilityDate: '2026-04-08',

  devtools: { enabled: true },

  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@vercel/speed-insights'],

  css: ['~/assets/styles/reset.scss', '~/assets/styles/global.scss'],
  nitro: {
    preset: 'vercel',
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue-flow/core',
        '@vue-flow/background',
        '@vue-flow/controls',
        '@vue-flow/minimap',
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

  typescript: {
    strict: true,
    typeCheck: false,
  },

  ssr: false,

  app: {
    head: {
      title: 'Carbon Core',
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
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})
