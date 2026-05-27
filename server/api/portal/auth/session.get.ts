import { apiHandler } from '../../../utils/api-handler'
import { getPortalSession } from '../../../utils/portal-auth'

export default apiHandler((event) => {
  const session = getPortalSession(event)

  return {
    success: true,
    data: {
      authenticated: Boolean(session),
      login: session?.login || null,
      customerName: session?.customerName || null,
      customerId: session?.customerId || null
    }
  }
})
