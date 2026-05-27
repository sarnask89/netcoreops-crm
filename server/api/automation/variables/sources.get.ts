import { apiHandler } from '../../../utils/api-handler'
import { automationSourceCatalog } from '../../../utils/automation-render'

export default apiHandler(async () => ({
  success: true,
  data: automationSourceCatalog
}))
