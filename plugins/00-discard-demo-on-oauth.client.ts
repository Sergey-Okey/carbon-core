import { discardDemoWorkspace } from '~/utils/accessStorage'
import { markWelcomeRegistrationPending } from '~/utils/registrationWelcome'

/**
 * OAuth / post-demo auth returns with a full page load. Clear any leftover
 * workspace keys before Pinia hydrates so demo tasks never enter the session.
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const params = new URLSearchParams(window.location.search)
  const oauthOk = params.get('oauth') === 'success'
  const exitPending = sessionStorage.getItem('cof-exit-demo') === '1'
  const workspaceFresh = sessionStorage.getItem('cof-workspace-fresh') === '1'

  if (params.get('welcome') === '1') {
    markWelcomeRegistrationPending()
  }

  if (oauthOk || exitPending || workspaceFresh) {
    discardDemoWorkspace()
  }

  if (exitPending) {
    sessionStorage.removeItem('cof-exit-demo')
  }
})
