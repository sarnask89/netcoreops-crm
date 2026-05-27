import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'

export default apiHandler(async () => {
  const links = await db.query.ftthTransparentLinks.findMany({
    with: {
      onu: {
        with: {
          ponPort: {
            with: {
              olt: {
                with: {
                  equipment: true
                }
              }
            }
          }
        }
      },
      customerDevice: {
        with: {
          customer: true
        }
      },
      backboneEquipment: true
    },
    orderBy: (table, { desc }) => [desc(table.lastSeenAt)]
  })

  return { success: true, data: links }
})
