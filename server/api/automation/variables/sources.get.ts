import { automationSourceCatalog } from '../../../utils/automation-render'

export default defineEventHandler(async () => ({
  success: true,
  data: automationSourceCatalog
}))
