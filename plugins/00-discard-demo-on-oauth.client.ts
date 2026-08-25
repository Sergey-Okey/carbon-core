import { discardDemoWorkspace, readAccessMode } from '~/utils/accessStorage'
import { markWelcomeRegistrationPending } from '~/utils/registrationWelcome'

/**
 * OAuth returns with a full page load while access mode may still be `demo`.
 * Clear demo storage before Pinia hydrates so demo tasks never enter the session.
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const params = new URLSearchParams(window.location.search)
  const oauthOk = params.get('oauth') === 'success'
  const exitPending = sessionStorage.getItem('cof-exit-demo') === '1'

  if (params.get('welcome') === '1') {
    markWelcomeRegistrationPending()
  }

  if ((oauthOk || exitPending) && readAccessMode() === 'demo') {
    discardDemoWorkspace()
  }

  if (exitPending) {
    sessionStorage.removeItem('cof-exit-demo')
  }
})
