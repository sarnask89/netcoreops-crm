import { apiHandler } from '../utils/api-handler'
import { and, eq, ilike, or } from 'drizzle-orm'
import { getQuery } from 'h3'
import {
  accessProfiles,
  automationScripts,
  customerDevices,
  customers,
  networkEquipment,
  searchCatalog,
  subscriptions,
  tariffs
} from '../db/schema'
import { db } from '../utils/db'

export default apiHandler(async (event) => {
  const query = getQuery(event)
  const rawTerm = typeof query.q === 'string' ? query.q.trim() : ''
  const term = rawTerm.startsWith('@') ? rawTerm.slice(1).trim() : rawTerm

  if (term.length < 1) {
    return { success: true, data: [] }
  }

  const pattern = `%${term}%`

  const [catalogItems, customerRows, equipmentRows, customerDeviceRows, tariffRows, subscriptionRows, profileRows, scriptRows] = await Promise.all([
    // Search catalog entries from DB instead of hardcoded array
    db.query.searchCatalog.findMany({
      where: and(
        eq(searchCatalog.isActive, true),
        or(
          ilike(searchCatalog.label, pattern),
          ilike(searchCatalog.suffix, pattern),
          ilike(searchCatalog.to, pattern),
          ilike(searchCatalog.aliases, pattern)
        )
      ),
      orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.label)],
      limit: 12
    }),
    db.query.customers.findMany({
      where: or(ilike(customers.fullName, pattern), ilike(customers.taxId, pattern), ilike(customers.contactEmail, pattern)),
      limit: 8
    }),
    db.query.networkEquipment.findMany({
      where: or(ilike(networkEquipment.inventoryId, pattern), ilike(networkEquipment.hostname, pattern), ilike(networkEquipment.managementIp, pattern), ilike(networkEquipment.macAddress, pattern)),
      limit: 8
    }),
    db.query.customerDevices.findMany({
      where: or(ilike(customerDevices.hostname, pattern), ilike(customerDevices.ipAddress, pattern), ilike(customerDevices.macAddress, pattern)),
      limit: 8
    }),
    db.query.tariffs.findMany({
      where: or(ilike(tariffs.name, pattern), ilike(tariffs.queueName, pattern), ilike(tariffs.iptvPackageCode, pattern)),
      limit: 8
    }),
    db.query.subscriptions.findMany({
      with: { customer: true, tariff: true },
      where: ilike(subscriptions.status, pattern),
      limit: 8
    }),
    db.query.accessProfiles.findMany({
      where: ilike(accessProfiles.name, pattern),
      limit: 8
    }),
    db.query.automationScripts.findMany({
      where: ilike(automationScripts.name, pattern),
      limit: 8
    })
  ])

  return {
    success: true,
    data: [
      // Catalog entries (previously hardcoded function search items)
      ...catalogItems.map(item => ({
        label: item.label,
        suffix: item.suffix || undefined,
        icon: item.icon || undefined,
        to: item.to,
        target: item.target || undefined
      })),
      ...customerRows.map(customer => ({
        label: `@ ${customer.fullName}`,
        suffix: customer.customerType === 'BUSINESS' ? 'CRM firma' : 'CRM klient',
        icon: 'i-lucide-user',
        to: '/crm/customers'
      })),
      ...equipmentRows.map(equipment => ({
        label: `@ ${equipment.inventoryId}`,
        suffix: equipment.hostname || equipment.managementIp || 'Urządzenie',
        icon: 'i-lucide-server',
        to: '/network/equipment'
      })),
      ...customerDeviceRows.map(device => ({
        label: `@ ${device.hostname}`,
        suffix: [device.ipAddress, device.macAddress].filter(Boolean).join(' / ') || 'Urządzenie klienta',
        icon: 'i-lucide-router',
        to: '/crm/customer-devices'
      })),
      ...tariffRows.map(tariff => ({
        label: `@ ${tariff.name}`,
        suffix: 'Taryfa',
        icon: 'i-lucide-receipt',
        to: '/billing/tariffs'
      })),
      ...subscriptionRows.map(subscription => ({
        label: `@ ${subscription.customer?.fullName || subscription.id}`,
        suffix: subscription.tariff?.name || 'Subskrypcja',
        icon: 'i-lucide-badge-dollar-sign',
        to: '/billing/assignments'
      })),
      ...profileRows.map(profile => ({
        label: `@ ${profile.name}`,
        suffix: 'Profil dostępowy',
        icon: 'i-lucide-sliders-horizontal',
        to: '/network/access-profiles'
      })),
      ...scriptRows.map(script => ({
        label: `@ ${script.name}`,
        suffix: 'Skrypt',
        icon: 'i-lucide-file-terminal',
        to: '/automation/scripts'
      }))
    ]
  }
})
