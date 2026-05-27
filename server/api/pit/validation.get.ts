import { apiHandler } from '../../utils/api-handler'
import { customerServices, networkEquipment, networkLines, networkNodes } from '../../db/schema'
import { db } from '../../utils/db'
import { formatPitValidationReport, validatePitReadiness } from '../../utils/pit-validation'

export default apiHandler(async () => {
  const [nodes, lines, equipment, services] = await Promise.all([
    db.select().from(networkNodes),
    db.select().from(networkLines),
    db.select().from(networkEquipment),
    db.select().from(customerServices)
  ])

  return {
    success: true,
    data: formatPitValidationReport(validatePitReadiness({
      nodes,
      lines,
      equipment,
      services
    }))
  }
})
