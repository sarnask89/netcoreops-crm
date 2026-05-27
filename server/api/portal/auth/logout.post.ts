import { apiHandler } from '../../../utils/api-handler'
import { clearPortalSessionCookie } from '../../../utils/portal-auth'

export default apiHandler(async (event) => {
  clearPortalSessionCookie(event)
  return { success: true }
})
