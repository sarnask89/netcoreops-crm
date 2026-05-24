import { db } from '../../../utils/db'

export default defineEventHandler(async () => {
  const rows = await db.query.ftthOnuMacs.findMany({
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
          },
          transparentLinks: {
            with: {
              customerDevice: {
                with: {
                  customer: true
                }
              },
              backboneEquipment: true
            }
          }
        }
      }
    },
    orderBy: (table, { desc }) => [desc(table.lastSeenAt)]
  })

  return {
    success: true,
    data: rows.map((row) => {
      const transparentLink = row.onu.transparentLinks.find(link => link.macAddress === row.macAddress) || null

      return {
        id: row.id,
        macAddress: row.macAddress,
        vlanId: row.vlanId,
        gemId: row.gemId,
        sourceCommand: row.sourceCommand,
        status: row.status,
        firstSeenAt: row.firstSeenAt,
        lastSeenAt: row.lastSeenAt,
        onu: {
          id: row.onu.id,
          onuIdentifier: row.onu.onuIdentifier,
          status: row.onu.status,
          transparentCandidate: row.onu.transparentCandidate,
          ponPort: {
            portCode: row.onu.ponPort.portCode,
            olt: {
              equipment: {
                inventoryId: row.onu.ponPort.olt.equipment.inventoryId
              }
            }
          }
        },
        transparentLink: transparentLink
          ? {
              id: transparentLink.id,
              linkType: transparentLink.linkType,
              confidence: transparentLink.confidence,
              lastSeenAt: transparentLink.lastSeenAt,
              customerDevice: transparentLink.customerDevice
                ? {
                    hostname: transparentLink.customerDevice.hostname,
                    customer: {
                      fullName: transparentLink.customerDevice.customer.fullName
                    }
                  }
                : null,
              backboneEquipment: transparentLink.backboneEquipment
                ? {
                    inventoryId: transparentLink.backboneEquipment.inventoryId,
                    hostname: transparentLink.backboneEquipment.hostname
                  }
                : null
            }
          : null
      }
    })
  }
})
