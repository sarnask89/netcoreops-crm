import { apiHandler } from '../../../utils/api-handler'
import { asc, eq } from 'drizzle-orm'
import { ftthOlts, ftthOnus, ftthPonPorts, networkEquipment } from '../../../db/schema'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const onus = await db
    .select({
      status: ftthOnus.status,
      oltInventoryId: networkEquipment.inventoryId,
      ponPortCode: ftthPonPorts.portCode,
      onuIdentifier: ftthOnus.onuIdentifier
    })
    .from(ftthOnus)
    .innerJoin(ftthPonPorts, eq(ftthOnus.ponPortId, ftthPonPorts.id))
    .innerJoin(ftthOlts, eq(ftthPonPorts.oltId, ftthOlts.id))
    .innerJoin(networkEquipment, eq(ftthOlts.networkEquipmentId, networkEquipment.id))
    .orderBy(asc(networkEquipment.inventoryId), asc(ftthPonPorts.portCode), asc(ftthOnus.onuIdentifier))

  return {
    success: true,
    data: onus
  }
})
