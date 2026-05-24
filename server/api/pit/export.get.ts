import { setHeader } from 'h3'
import { db } from '../../utils/db'
import { toCsv } from '../../utils/csv'

export default defineEventHandler(async (event) => {
  const rows = await db.query.customerServices.findMany({
    with: {
      customer: true,
      profile: {
        with: {
          technology: true
        }
      },
      equipment: {
        with: {
          model: {
            with: {
              technology: true
            }
          },
          node: {
            with: {
              medium: true,
              terytArea: true,
              simcLocality: true,
              street: true
            }
          }
        }
      },
      serviceTerytArea: true,
      serviceSimcLocality: true,
      serviceStreet: true
    }
  })

  const csvRows = rows.map(row => ({
    service_id: row.id,
    customer_name: row.customer.fullName,
    customer_type: row.customer.customerType,
    service_status: row.status,
    service_teryt: row.serviceTerytArea?.terytCode || '',
    service_simc: row.serviceSimcLocality?.simcCode || '',
    service_ulic: row.serviceStreet?.ulicCode || '',
    service_address: [
      row.serviceStreet ? `${row.serviceStreet.streetType || 'ul.'} ${row.serviceStreet.name}` : '',
      row.serviceBuildingNumber,
      row.serviceApartmentNumber ? `/${row.serviceApartmentNumber}` : '',
      row.serviceSimcLocality?.name || ''
    ].filter(Boolean).join(' '),
    profile_name: row.profile.name,
    technology_code: row.profile.technology?.code || row.equipment?.model.technology?.code || '',
    download_mbps: row.profile.downloadSpeedMbps,
    upload_mbps: row.profile.uploadSpeedMbps,
    equipment_inventory_id: row.equipment?.inventoryId || '',
    equipment_role: row.equipment?.equipmentRole || '',
    powering_node_inventory_id: row.equipment?.node?.inventoryId || '',
    powering_node_name: row.equipment?.node?.name || '',
    powering_node_medium: row.equipment?.node?.medium?.code || '',
    powering_node_teryt: row.equipment?.node?.terytArea?.terytCode || '',
    powering_node_simc: row.equipment?.node?.simcLocality?.simcCode || '',
    powering_node_ulic: row.equipment?.node?.street?.ulicCode || ''
  }))

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', 'attachment; filename="pit-services-export.csv"')

  return toCsv(csvRows, [
    'service_id',
    'customer_name',
    'customer_type',
    'service_status',
    'service_teryt',
    'service_simc',
    'service_ulic',
    'service_address',
    'profile_name',
    'technology_code',
    'download_mbps',
    'upload_mbps',
    'equipment_inventory_id',
    'equipment_role',
    'powering_node_inventory_id',
    'powering_node_name',
    'powering_node_medium',
    'powering_node_teryt',
    'powering_node_simc',
    'powering_node_ulic'
  ])
})
