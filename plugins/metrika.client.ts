declare global {
  interface Window {
    ym: any;
  }
}

export default defineNuxtPlugin(() => {
  const counterId = 109905993

  window.ym = window.ym || function () {
    (window.ym.a = window.ym.a || []).push(arguments)
  }
  window.ym.l = 1 * new Date()

  const script = document.createElement('script')
  script.async = true
  script.src = `https://yandex.ru{counterId}`
    const scripts = document.getElementsByTagName('script')
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src === script.src) return
  }
  
  document.head.appendChild(script)

  window.ym(counterId, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: window.location.href,
    accurateTrackBounce: true,
    trackLinks: true
  })

  const router = useRouter()
  router.afterEach((to) => {
    const fullUrl = window.location.origin + to.fullPath
    window.ym(counterId, 'hit', fullUrl, {
      referer: window.location.href
    })
  })
})
