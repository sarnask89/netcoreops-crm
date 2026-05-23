import { and, eq, ilike } from 'drizzle-orm'
import {
  customerDevices,
  customers,
  deviceModels,
  deviceTypes,
  importRuns,
  networkEquipment,
  subscriptions,
  tariffs,
  ulicStreets
} from '../db/schema'
import type { DriverLease, DriverMacTableEntry, DriverOnu } from '../network-drivers/types'
import { parseMikrotikComment } from '../network-drivers/parsers/mikrotik-comment-parser'
import { parseRateLimit } from '../network-drivers/parsers/rate-limit-parser'
import { db } from './db'
import { enrichMikrotikLeaseImport, importMacSuffix, type ImportAddressMatch } from './import-enrichment'
import { filterLeasesBySelectedNetworks } from './ip-network'

export type ImportMode = 'preview' | 'apply' | 'dryRun'

export interface ImportAction {
  action: 'create' | 'link' | 'update' | 'skip' | 'conflict'
  entity: string
  key: string
  label: string
  data: Record<string, unknown>
  reason?: string
}

function stripNullBytes(value: unknown): unknown {
  if (typeof value === 'string') return value.replaceAll('\u0000', '')
  if (Array.isArray(value)) return value.map(stripNullBytes)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, rowValue]) => [key, stripNullBytes(rowValue)]))
  }
  return value
}

function withoutRaw(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutRaw)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => key !== 'raw')
      .map(([key, rowValue]) => [key, withoutRaw(rowValue)]))
  }
  return value
}

export function compactImportSummary(summary: { mode: ImportMode, leases?: number, onus?: number, macs?: number, actions: ImportAction[] }) {
  const actionCounts = summary.actions.reduce<Record<string, number>>((counts, action) => {
    const key = `${action.entity}:${action.action}`
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})

  return stripNullBytes({
    mode: summary.mode,
    leases: summary.leases,
    onus: summary.onus,
    macs: summary.macs,
    actionCounts,
    sampleActions: withoutRaw(summary.actions.slice(0, 100))
  })
}

function normalizeMac(mac?: string | null) {
  return mac?.trim().replaceAll('-', ':').replaceAll('.', ':').toUpperCase() || null
}

export async function getOrCreateOnuModelId() {
  const [type] = await db.insert(deviceTypes).values({
    name: 'ONU',
    category: 'KLIENCKIE',
    description: 'Jednostka ONU/ONT importowana z OLT.'
  }).onConflictDoNothing().returning()
  const existingType = type || await db.query.deviceTypes.findFirst({ where: eq(deviceTypes.name, 'ONU') })
  if (!existingType) throw createError({ statusCode: 500, statusMessage: 'Nie można utworzyć typu ONU' })

  const [model] = await db.insert(deviceModels).values({
    typeId: existingType.id,
    manufacturer: 'Generic',
    modelName: 'ONU VLAN400 management'
  }).onConflictDoNothing().returning()
  const existingModel = model || await db.query.deviceModels.findFirst({ where: eq(deviceModels.modelName, 'ONU VLAN400 management') })
  if (!existingModel) throw createError({ statusCode: 500, statusMessage: 'Nie można utworzyć modelu ONU' })

  return existingModel.id
}

function importedCustomerName(lease: DriverLease) {
  const parsed = parseMikrotikComment(lease.comment || '')
  return parsed?.lastName ? `Abonent ${parsed.lastName}` : `Abonent ${importMacSuffix(lease.macAddress) || 'import'}`
}

async function findAddressMatch(lease: DriverLease): Promise<ImportAddressMatch | null> {
  const parsed = parseMikrotikComment(lease.comment || '')
  if (!parsed) return null

  const street = await db.query.ulicStreets.findFirst({
    where: ilike(ulicStreets.name, `%${parsed.streetName}%`),
    with: {
      locality: {
        with: {
          terytArea: true
        }
      }
    }
  })

  if (!street) return null

  return {
    terytAreaId: street.locality.terytArea?.id ?? null,
    simcLocalityId: street.locality.id,
    streetId: street.id,
    label: `${street.streetType || 'ul.'} ${street.name} ${parsed.streetNumber}${parsed.apartmentNumber ? `/${parsed.apartmentNumber}` : ''}, ${street.locality.name}`
  }
}

async function findOrCreateCustomer(lease: DriverLease, mode: ImportMode, addressMatch: ImportAddressMatch | null, issues: string[]) {
  const parsed = parseMikrotikComment(lease.comment || '')
  const lastName = parsed?.lastName || null
  const mac = normalizeMac(lease.macAddress)

  const existing = parsed?.externalId
    ? await db.query.customers.findFirst({ where: eq(customers.importExternalId, parsed.externalId) })
    : lastName
      ? await db.query.customers.findFirst({ where: ilike(customers.lastName, lastName) })
      : undefined

  if (existing || mode !== 'apply') return existing

  const [customer] = await db.insert(customers).values({
    fullName: importedCustomerName(lease),
    customerType: 'INDIVIDUAL',
    firstName: 'Abonent',
    lastName: lastName || `Import ${importMacSuffix(lease.macAddress) || mac?.slice(-6) || 'MAC'}`,
    billingTerytAreaId: addressMatch?.terytAreaId ?? null,
    billingSimcLocalityId: addressMatch?.simcLocalityId ?? null,
    billingStreetId: addressMatch?.streetId ?? null,
    billingBuildingNumber: parsed?.streetNumber || null,
    billingApartmentNumber: parsed?.apartmentNumber || null,
    billingAddress: addressMatch?.label || lease.comment || null,
    importExternalId: parsed?.externalId || null,
    importIssues: issues
  }).returning()

  return customer
}

async function findOrCreateTariff(rateLimit: string | undefined, mode: ImportMode) {
  const parsed = parseRateLimit(rateLimit)
  if (!parsed.uploadMbps || !parsed.downloadMbps) return null

  const existing = await db.query.tariffs.findFirst({
    where: and(
      eq(tariffs.uploadMbps, parsed.uploadMbps),
      eq(tariffs.downloadMbps, parsed.downloadMbps),
      eq(tariffs.serviceType, 'internet')
    )
  })
  if (existing || mode !== 'apply') return existing

  const [tariff] = await db.insert(tariffs).values({
    name: `Import ${parsed.downloadMbps}/${parsed.uploadMbps} Mbps`,
    serviceType: 'internet',
    defaultNetPrice: '0',
    vatRate: '23',
    uploadMbps: parsed.uploadMbps,
    downloadMbps: parsed.downloadMbps,
    description: `Automatycznie zaimportowana z MikroTik (${rateLimit})`
  }).returning()

  return tariff
}

export async function buildMikrotikLeaseActions(
  equipmentId: string,
  leases: DriverLease[],
  mode: ImportMode,
  selectedNetworks: string[] = []
): Promise<ImportAction[]> {
  const actions: ImportAction[] = []

  for (const lease of filterLeasesBySelectedNetworks(leases, selectedNetworks)) {
    const mac = normalizeMac(lease.macAddress)
    if (!mac || !lease.address) continue

    const existingDevice = await db.query.customerDevices.findFirst({ where: eq(customerDevices.macAddress, mac) })
    const addressMatch = await findAddressMatch(lease)
    const enriched = enrichMikrotikLeaseImport(lease, addressMatch, existingDevice?.id)
    const parsed = parseMikrotikComment(lease.comment || '')

    if (existingDevice) {
      actions.push({
        action: 'conflict',
        entity: 'customerDevice',
        key: mac,
        label: `${mac} / ${lease.address}`,
        reason: 'MAC już istnieje w bazie',
        data: { existingDeviceId: existingDevice.id, lease, parsed, enriched }
      })
      continue
    }

    const customer = await findOrCreateCustomer(lease, mode, addressMatch, enriched.issues)
    const tariff = await findOrCreateTariff(lease.rateLimit, mode)

    actions.push({
      action: mode === 'apply' ? 'create' : 'link',
      entity: 'customerDevice',
      key: mac,
      label: `${mac} / ${lease.address}`,
      data: { lease, parsed, enriched, addressMatch, customerId: customer?.id, tariffId: tariff?.id }
    })

    if (mode === 'apply' && customer) {
      const [device] = await db.insert(customerDevices).values({
        customerId: customer.id,
        equipmentId,
        hostname: enriched.hostname,
        ipAddress: lease.address,
        macAddress: mac,
        status: lease.disabled || lease.blocked ? 'INACTIVE' : 'ACTIVE',
        dhcpServer: lease.server || null,
        dhcpInterface: lease.interface || null,
        importExternalId: parsed?.externalId || null,
        importIssues: enriched.issues,
        notes: lease.comment || null
      }).returning()
      if (!device) continue

      if (tariff) {
        await db.insert(subscriptions).values({
          customerId: customer.id,
          customerDeviceId: device.id,
          tariffId: tariff.id,
          status: 'ACTIVE'
        })
      }
    }
  }

  return actions
}

export async function buildDasanOnuActions(equipmentId: string, onus: DriverOnu[], mode: ImportMode): Promise<ImportAction[]> {
  const olt = await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.id, equipmentId) })
  if (!olt) throw createError({ statusCode: 404, statusMessage: 'OLT nie istnieje' })
  const onuModelId = mode === 'apply' ? await getOrCreateOnuModelId() : olt.modelId

  const actions: ImportAction[] = []

  for (const onu of onus) {
    const inventoryId = `${olt.inventoryId}-ONU-${onu.oltPort}-${onu.onuId}`
    const existing = await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.inventoryId, inventoryId) })

    actions.push({
      action: existing ? 'update' : 'create',
      entity: 'networkEquipment',
      key: inventoryId,
      label: `ONU ${onu.oltPort}/${onu.onuId}`,
      data: { onu, existingId: existing?.id }
    })

    if (mode === 'apply') {
      const existingWithSerial = onu.serialNumber
        ? await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.serialNumber, onu.serialNumber) })
        : null
      const serialNumber = !existingWithSerial || existingWithSerial.id === existing?.id ? onu.serialNumber || null : null

      if (existing) {
        await db.update(networkEquipment).set({
          parentEquipmentId: equipmentId,
          onuPort: onu.oltPort,
          onuId: onu.onuId,
          serialNumber: serialNumber || existing.serialNumber,
          isOnline: onu.status.toLowerCase() === 'active',
          status: onu.status.toLowerCase() === 'active' ? 'IN_USE' : 'FAILED'
        }).where(eq(networkEquipment.id, existing.id))
      } else {
        await db.insert(networkEquipment).values({
          inventoryId,
          modelId: onuModelId,
          parentEquipmentId: equipmentId,
          hostname: inventoryId.toLowerCase(),
          serialNumber,
          equipmentRole: 'CLIENT_PE',
          bridgeMode: false,
          onuPort: onu.oltPort,
          onuId: onu.onuId,
          isOnline: onu.status.toLowerCase() === 'active',
          status: onu.status.toLowerCase() === 'active' ? 'IN_USE' : 'FAILED',
          notes: `Auto-import z OLT ${olt.inventoryId}. Zarządzanie ONU: VLAN 400.`
        })
      }
    }
  }

  return actions
}

export async function buildDasanMacMapActions(equipmentId: string, entries: DriverMacTableEntry[], mode: ImportMode): Promise<ImportAction[]> {
  const olt = await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.id, equipmentId) })
  if (!olt) throw createError({ statusCode: 404, statusMessage: 'OLT nie istnieje' })

  const childOnus = await db.query.networkEquipment.findMany({ where: eq(networkEquipment.parentEquipmentId, equipmentId) })
  const onuByKey = new Map(childOnus.map(onu => [`${onu.onuPort}-${onu.onuId}`, onu]))
  const actions: ImportAction[] = []

  for (const entry of entries) {
    const mac = normalizeMac(entry.macAddress)
    if (!mac) continue

    const onu = entry.oltPort && entry.onuId ? onuByKey.get(`${entry.oltPort}-${entry.onuId}`) : undefined
    if (entry.vlanId === '400' && onu) {
      const equipmentWithMac = await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.macAddress, mac) })
      const shouldSetMac = !equipmentWithMac || equipmentWithMac.id === onu.id
      actions.push({
        action: 'update',
        entity: 'networkEquipment',
        key: mac,
        label: `${mac} -> zarządzanie ONU ${entry.oltPort}/${entry.onuId} VLAN 400`,
        data: {
          onuEquipmentId: onu.id,
          macAddress: shouldSetMac ? mac : onu.macAddress,
          managementIpSource: 'show onu ip-host',
          entry
        }
      })
      if (mode === 'apply') {
        await db.update(networkEquipment).set({
          macAddress: shouldSetMac ? mac : onu.macAddress,
          managementProtocol: onu.managementProtocol || 'http',
          notes: `${onu.notes || ''}\nVLAN 400: MAC zarządzania ONU; IP odczytuj przez show onu ip-host ${entry.oltPort} ${entry.onuId}.`.trim()
        }).where(eq(networkEquipment.id, onu.id))
      }
      continue
    }

    const customerDevice = await db.query.customerDevices.findFirst({ where: eq(customerDevices.macAddress, mac) })
    const backbone = await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.macAddress, mac) })

    if (customerDevice && onu) {
      actions.push({
        action: 'link',
        entity: 'customerDevice',
        key: mac,
        label: `${mac} -> ONU ${entry.oltPort}/${entry.onuId}`,
        data: { customerDeviceId: customerDevice.id, onuEquipmentId: onu.id, entry }
      })
      if (mode === 'apply') await db.update(customerDevices).set({ onuEquipmentId: onu.id }).where(eq(customerDevices.id, customerDevice.id))
      continue
    }

    if (backbone && onu) {
      actions.push({
        action: 'link',
        entity: 'networkEquipment',
        key: mac,
        label: `${mac} -> bridge za ONU ${entry.oltPort}/${entry.onuId}`,
        data: { equipmentId: backbone.id, parentEquipmentId: onu.id, entry }
      })
      if (mode === 'apply') await db.update(networkEquipment).set({ parentEquipmentId: onu.id, bridgeMode: true }).where(eq(networkEquipment.id, backbone.id))
      continue
    }

    actions.push({
      action: 'skip',
      entity: 'macTable',
      key: mac,
      label: mac,
      reason: 'Brak urządzenia z takim MAC w NetCoreOps',
      data: { entry }
    })
  }

  return actions
}

export async function recordImportRun(equipmentId: string, driverCode: string, importType: string, mode: ImportMode, summary: unknown) {
  await db.insert(importRuns).values({
    equipmentId,
    driverCode,
    importType,
    mode: mode === 'dryRun' ? 'preview' : mode,
    success: true,
    summary: stripNullBytes(withoutRaw(summary))
  })
}
