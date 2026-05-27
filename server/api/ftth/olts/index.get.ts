import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const olts = await db.query.ftthOlts.findMany({
    with: {
      equipment: {
        with: {
          model: true,
          node: true,
          managementDriver: true
        }
      },
      ponPorts: {
        with: {
          onus: true
        }
      }
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  })

  return {
    success: true,
    data: olts.map(olt => ({
      ...olt,
      ponPortCount: olt.ponPorts.length,
      onuCount: olt.ponPorts.reduce((count, port) => count + port.onus.length, 0),
      activeOnuCount: olt.ponPorts.reduce((count, port) => count + port.onus.filter(onu => onu.status.toLowerCase() === 'active').length, 0)
    }))
  }
})
