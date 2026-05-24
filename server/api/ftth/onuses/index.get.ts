import { db } from '../../../utils/db'

export default defineEventHandler(async () => {
  const onus = await db.query.ftthOnus.findMany({
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
      equipment: true,
      ipHosts: true,
      macs: true,
      transparentLinks: {
        with: {
          customerDevice: {
            with: {
              customer: true
            }
          },
          backboneEquipment: true
        }
      },
      customerDevices: {
        with: {
          customer: true
        }
      }
    },
    orderBy: (table, { desc }) => [desc(table.lastSeenAt), desc(table.createdAt)]
  })

  return {
    success: true,
    data: onus.map(onu => ({
      ...onu,
      oltInventoryId: onu.ponPort.olt.equipment.inventoryId,
      ponPortCode: onu.ponPort.portCode,
      managementIpHosts: onu.ipHosts.filter(host => host.currentIp),
      accessMacs: onu.macs.filter(mac => mac.vlanId !== 400),
      managementMacs: onu.macs.filter(mac => mac.vlanId === 400),
      linkedCustomerNames: onu.customerDevices.map(device => device.customer.fullName)
    }))
  }
})
