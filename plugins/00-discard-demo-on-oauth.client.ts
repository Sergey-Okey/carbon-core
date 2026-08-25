import { discardDemoWorkspace, readAccessMode } from '~/utils/accessStorage'

/**
 * OAuth returns with a full page load while access mode may still be `demo`.
 * Clear demo storage before Pinia hydrates so demo tasks never enter the session.
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const oauthOk =
    new URLSearchParams(window.location.search).get('oauth') === 'success'
  const exitPending = sessionStorage.getItem('cof-exit-demo') === '1'

  if ((oauthOk || exitPending) && readAccessMode() === 'demo') {
    discardDemoWorkspace()
  }

  if (exitPending) {
    sessionStorage.removeItem('cof-exit-demo')
  }
})
