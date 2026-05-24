import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import {
  accessProfiles,
  automationScripts,
  automationVariableDefinitions,
  customerDevices,
  customers,
  customerServices,
  diagnosticRuns,
  importRuns,
  managementDrivers,
  networkEquipment,
  subscriptions,
  tariffs,
  type AutomationVariableDefinition
} from '../db/schema'
import { db } from './db'

export const automationSourceCatalog = {
  network_equipment: {
    label: 'Urządzenia',
    lookupColumns: ['id', 'inventoryId', 'hostname', 'managementIp', 'macAddress', 'serialNumber'],
    fields: ['id', 'inventoryId', 'hostname', 'managementIp', 'managementPort', 'managementProtocol', 'macAddress', 'serialNumber', 'equipmentRole', 'bridgeMode', 'onuPort', 'onuId', 'status']
  },
  customers: {
    label: 'Klienci',
    lookupColumns: ['id', 'fullName', 'taxId', 'contactEmail', 'contactPhone'],
    fields: ['id', 'fullName', 'customerType', 'firstName', 'lastName', 'companyName', 'taxId', 'contactEmail', 'contactPhone']
  },
  customer_services: {
    label: 'Usługi klientów',
    lookupColumns: ['id', 'customerId', 'equipmentId'],
    fields: ['id', 'customerId', 'profileId', 'equipmentId', 'serviceBuildingNumber', 'serviceApartmentNumber', 'status']
  },
  access_profiles: {
    label: 'Profile zarządzania',
    lookupColumns: ['id', 'name'],
    fields: ['id', 'name', 'defaultProtocol', 'defaultPort', 'username', 'apiBaseUrl', 'isActive']
  },
  management_drivers: {
    label: 'Drivery zarządzania',
    lookupColumns: ['id', 'code', 'label'],
    fields: ['id', 'code', 'label', 'transport', 'isActive']
  },
  customer_devices: {
    label: 'Urządzenia klienta',
    lookupColumns: ['id', 'hostname', 'ipAddress', 'macAddress'],
    fields: ['id', 'customerId', 'equipmentId', 'onuEquipmentId', 'hostname', 'ipAddress', 'macAddress', 'status', 'dhcpServer', 'dhcpInterface', 'oltPort', 'onuId']
  },
  tariffs: {
    label: 'Taryfy',
    lookupColumns: ['id', 'name', 'queueName', 'iptvPackageCode'],
    fields: ['id', 'name', 'serviceType', 'defaultNetPrice', 'vatRate', 'downloadMbps', 'uploadMbps', 'queueName', 'iptvPackageCode', 'isActive']
  },
  subscriptions: {
    label: 'Subskrypcje',
    lookupColumns: ['id', 'customerId', 'customerDeviceId'],
    fields: ['id', 'customerId', 'customerDeviceId', 'tariffId', 'status', 'billingPeriod', 'priceOverrideNet']
  },
  diagnostic_runs: {
    label: 'Wyniki diagnostyki',
    lookupColumns: ['id', 'customerDeviceId', 'driverCode', 'runType'],
    fields: ['id', 'customerDeviceId', 'equipmentId', 'driverCode', 'runType', 'target', 'success', 'createdAt']
  },
  import_runs: {
    label: 'Wyniki importów',
    lookupColumns: ['id', 'equipmentId', 'driverCode', 'importType'],
    fields: ['id', 'equipmentId', 'driverCode', 'importType', 'mode', 'success', 'createdAt']
  },
  automation_scripts: {
    label: 'Skrypty automatyzacji',
    lookupColumns: ['id', 'name'],
    fields: ['id', 'name', 'scope', 'triggerType', 'scriptLanguage', 'timeoutSeconds']
  }
} as const

type SourceTable = keyof typeof automationSourceCatalog

function isSourceTable(value?: string | null): value is SourceTable {
  return !!value && value in automationSourceCatalog
}

function getRecordValue(record: Record<string, unknown> | undefined, fieldName?: string | null) {
  if (!record || !fieldName) return undefined
  return record[fieldName]
}

async function resolveSourceRow(definition: AutomationVariableDefinition) {
  const tableName = definition.tableName
  const lookupColumn = definition.rowLookupColumn
  const lookupValue = definition.rowLookupValue

  if (!isSourceTable(tableName) || !lookupColumn || !lookupValue) return undefined

  switch (tableName) {
    case 'network_equipment':
      if (lookupColumn === 'id') return db.query.networkEquipment.findFirst({ where: eq(networkEquipment.id, lookupValue) })
      if (lookupColumn === 'inventoryId') return db.query.networkEquipment.findFirst({ where: eq(networkEquipment.inventoryId, lookupValue) })
      if (lookupColumn === 'hostname') return db.query.networkEquipment.findFirst({ where: eq(networkEquipment.hostname, lookupValue) })
      if (lookupColumn === 'managementIp') return db.query.networkEquipment.findFirst({ where: eq(networkEquipment.managementIp, lookupValue) })
      if (lookupColumn === 'macAddress') return db.query.networkEquipment.findFirst({ where: eq(networkEquipment.macAddress, lookupValue) })
      if (lookupColumn === 'serialNumber') return db.query.networkEquipment.findFirst({ where: eq(networkEquipment.serialNumber, lookupValue) })
      return undefined
    case 'customers':
      if (lookupColumn === 'id') return db.query.customers.findFirst({ where: eq(customers.id, lookupValue) })
      if (lookupColumn === 'fullName') return db.query.customers.findFirst({ where: eq(customers.fullName, lookupValue) })
      if (lookupColumn === 'taxId') return db.query.customers.findFirst({ where: eq(customers.taxId, lookupValue) })
      if (lookupColumn === 'contactEmail') return db.query.customers.findFirst({ where: eq(customers.contactEmail, lookupValue) })
      if (lookupColumn === 'contactPhone') return db.query.customers.findFirst({ where: eq(customers.contactPhone, lookupValue) })
      return undefined
    case 'customer_services':
      if (lookupColumn === 'id') return db.query.customerServices.findFirst({ where: eq(customerServices.id, lookupValue) })
      if (lookupColumn === 'customerId') return db.query.customerServices.findFirst({ where: eq(customerServices.customerId, lookupValue) })
      if (lookupColumn === 'equipmentId') return db.query.customerServices.findFirst({ where: eq(customerServices.equipmentId, lookupValue) })
      return undefined
    case 'access_profiles':
      if (lookupColumn === 'id') return db.query.accessProfiles.findFirst({ where: eq(accessProfiles.id, Number(lookupValue)) })
      if (lookupColumn === 'name') return db.query.accessProfiles.findFirst({ where: eq(accessProfiles.name, lookupValue) })
      return undefined
    case 'management_drivers':
      if (lookupColumn === 'id') return db.query.managementDrivers.findFirst({ where: eq(managementDrivers.id, Number(lookupValue)) })
      if (lookupColumn === 'code') return db.query.managementDrivers.findFirst({ where: eq(managementDrivers.code, lookupValue) })
      if (lookupColumn === 'label') return db.query.managementDrivers.findFirst({ where: eq(managementDrivers.label, lookupValue) })
      return undefined
    case 'customer_devices':
      if (lookupColumn === 'id') return db.query.customerDevices.findFirst({ where: eq(customerDevices.id, lookupValue) })
      if (lookupColumn === 'hostname') return db.query.customerDevices.findFirst({ where: eq(customerDevices.hostname, lookupValue) })
      if (lookupColumn === 'ipAddress') return db.query.customerDevices.findFirst({ where: eq(customerDevices.ipAddress, lookupValue) })
      if (lookupColumn === 'macAddress') return db.query.customerDevices.findFirst({ where: eq(customerDevices.macAddress, lookupValue) })
      return undefined
    case 'tariffs':
      if (lookupColumn === 'id') return db.query.tariffs.findFirst({ where: eq(tariffs.id, Number(lookupValue)) })
      if (lookupColumn === 'name') return db.query.tariffs.findFirst({ where: eq(tariffs.name, lookupValue) })
      if (lookupColumn === 'queueName') return db.query.tariffs.findFirst({ where: eq(tariffs.queueName, lookupValue) })
      if (lookupColumn === 'iptvPackageCode') return db.query.tariffs.findFirst({ where: eq(tariffs.iptvPackageCode, lookupValue) })
      return undefined
    case 'subscriptions':
      if (lookupColumn === 'id') return db.query.subscriptions.findFirst({ where: eq(subscriptions.id, lookupValue) })
      if (lookupColumn === 'customerId') return db.query.subscriptions.findFirst({ where: eq(subscriptions.customerId, lookupValue) })
      if (lookupColumn === 'customerDeviceId') return db.query.subscriptions.findFirst({ where: eq(subscriptions.customerDeviceId, lookupValue) })
      return undefined
    case 'diagnostic_runs':
      if (lookupColumn === 'id') return db.query.diagnosticRuns.findFirst({ where: eq(diagnosticRuns.id, lookupValue) })
      if (lookupColumn === 'customerDeviceId') return db.query.diagnosticRuns.findFirst({ where: eq(diagnosticRuns.customerDeviceId, lookupValue) })
      if (lookupColumn === 'driverCode') return db.query.diagnosticRuns.findFirst({ where: eq(diagnosticRuns.driverCode, lookupValue) })
      if (lookupColumn === 'runType') return db.query.diagnosticRuns.findFirst({ where: eq(diagnosticRuns.runType, lookupValue) })
      return undefined
    case 'import_runs':
      if (lookupColumn === 'id') return db.query.importRuns.findFirst({ where: eq(importRuns.id, lookupValue) })
      if (lookupColumn === 'equipmentId') return db.query.importRuns.findFirst({ where: eq(importRuns.equipmentId, lookupValue) })
      if (lookupColumn === 'driverCode') return db.query.importRuns.findFirst({ where: eq(importRuns.driverCode, lookupValue) })
      if (lookupColumn === 'importType') return db.query.importRuns.findFirst({ where: eq(importRuns.importType, lookupValue) })
      return undefined
    case 'automation_scripts':
      if (lookupColumn === 'id') return db.query.automationScripts.findFirst({ where: eq(automationScripts.id, Number(lookupValue)) })
      if (lookupColumn === 'name') return db.query.automationScripts.findFirst({ where: eq(automationScripts.name, lookupValue) })
      return undefined
  }
}

export async function resolveAutomationVariables(overrides: Record<string, string> = {}) {
  const definitions = await db.query.automationVariableDefinitions.findMany({
    where: eq(automationVariableDefinitions.isActive, true),
    orderBy: (table, { asc }) => [asc(table.variableName)]
  })

  const values: Record<string, string> = {}

  for (const definition of definitions) {
    if (definition.variableName in overrides) {
      values[definition.variableName] = overrides[definition.variableName] ?? ''
      continue
    }

    if (definition.sourceType === 'STATIC') {
      values[definition.variableName] = formatVariableValue(definition, definition.staticValue)
      continue
    }

    const row = await resolveSourceRow(definition)
    const rawValue = getRecordValue(row as Record<string, unknown> | undefined, definition.fieldName)
    values[definition.variableName] = formatVariableValue(definition, rawValue)
  }

  return values
}

function formatVariableValue(definition: AutomationVariableDefinition, rawValue: unknown) {
  const fallback = definition.fallbackValue ?? ''
  if (rawValue == null || rawValue === '') return fallback

  if (definition.valueType === 'int') {
    const numericValue = Number.parseInt(String(rawValue), 10)
    return Number.isNaN(numericValue) ? fallback : String(numericValue)
  }

  if (definition.valueType === 'date') {
    const date = new Date(String(rawValue))
    return Number.isNaN(date.getTime()) ? fallback : date.toISOString().slice(0, 10)
  }

  if (definition.valueType === 'bool') {
    return ['1', 'true', 'tak', 'yes', 'on'].includes(String(rawValue).trim().toLowerCase()) ? 'true' : 'false'
  }

  return String(rawValue)
}

export function renderAutomationTemplate(template: string, variables: Record<string, string>) {
  const renderedConditionBlocks = template
    .replace(/\{\{#if\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s*=\s*([^}]+?))?\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (_match, variableName: string, expectedValue: string | undefined, body: string) =>
      shouldRenderConditional(variableName, expectedValue, variables) ? body : '')
    .replace(/if\s+\$([A-Za-z_][A-Za-z0-9_]*)(?:\s*=\s*([^\]\s]+))?\s*\[\s*([\s\S]*?)\s*\]/g, (_match, variableName: string, expectedValue: string | undefined, body: string) =>
      shouldRenderConditional(variableName, expectedValue, variables) ? body : '')

  return renderedConditionBlocks.replace(/\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g, (_match, variableName: string) => variables[variableName] ?? '')
}

function shouldRenderConditional(variableName: string, expectedValue: string | undefined, variables: Record<string, string>) {
  const actualValue = variables[variableName] ?? ''

  if (expectedValue == null) {
    return ['1', 'true', 'tak', 'yes', 'on'].includes(actualValue.trim().toLowerCase())
  }

  return actualValue.trim().toLowerCase() === expectedValue.trim().replace(/^["']|["']$/g, '').toLowerCase()
}

export async function renderAutomationScript(scriptId: number, overrides: Record<string, string> = {}) {
  const script = await db.query.automationScripts.findFirst({
    where: eq(automationScripts.id, scriptId)
  })

  if (!script) {
    throw createError({ statusCode: 404, statusMessage: 'Script not found' })
  }

  const variables = await resolveAutomationVariables(overrides)
  return {
    script,
    variables,
    renderedBody: renderAutomationTemplate(script.scriptBody, variables)
  }
}
