import { apiHandler } from '../../utils/api-handler'
import { getCookie } from 'h3'
import {
  AUTH_COOKIE_NAME,
  getAuthConfig,
  validateAuthSessionToken
} from '../../utils/auth'

export default apiHandler((event) => {
  const config = getAuthConfig()
  const session = validateAuthSessionToken(getCookie(event, AUTH_COOKIE_NAME), config.sessionSecret)

  return {
    success: true,
    data: {
      enabled: config.enabled,
      authenticated: Boolean(session),
      username: session?.username || null
    }
  }
})
