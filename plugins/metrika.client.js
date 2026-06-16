export default defineNuxtPlugin(() => {
  if (process.client) {
    window.ym = window.ym || function() {
      (window.ym.a = window.ym.a || []).push(arguments)
    }
    window.ym.l = 1 * new Date()

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://mc.yandex.ru/metrika/tag.js?id=109905993'
    document.head.appendChild(script)

    setTimeout(() => {
      ym(109905993, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
      })
    }, 0)
  }
})