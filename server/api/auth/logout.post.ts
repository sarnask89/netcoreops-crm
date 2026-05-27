import { apiHandler } from '../../utils/api-handler'
import { deleteCookie } from 'h3'
import { AUTH_COOKIE_NAME } from '../../utils/auth'

export default apiHandler((event) => {
  deleteCookie(event, AUTH_COOKIE_NAME, { path: '/' })

  return { success: true }
})
