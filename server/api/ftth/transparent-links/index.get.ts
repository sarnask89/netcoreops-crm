import { db } from '../../../utils/db'

export default defineEventHandler(async () => {
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
