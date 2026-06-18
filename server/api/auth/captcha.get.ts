import { createCaptchaChallenge } from '../../utils/captcha'
import { enforceRateLimit } from '../../utils/rateLimit'

export default defineEventHandler((event) => {
  enforceRateLimit(event, 'captcha', 60, 15 * 60 * 1000)
  return createCaptchaChallenge()
})
