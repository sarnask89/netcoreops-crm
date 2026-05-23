import { db } from '../../../utils/db'

export default defineEventHandler(async () => {
  const profiles = await db.query.accessProfiles.findMany({
    with: {
      technology: true,
      equipment: {
        with: {
          managementDriver: true
        }
      },
      deviceBindings: {
        with: {
          model: {
            with: {
              type: true
            }
          },
          equipment: {
            with: {
              model: true,
              node: true
            }
          }
        }
      },
      automationScripts: true
    },
    orderBy: (table, { asc }) => [asc(table.name)]
  })

  return { success: true, data: profiles }
})
