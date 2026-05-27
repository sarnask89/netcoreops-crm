import { z } from 'zod'
import {
  addressReferenceSchema,
  createCustomerSchema,
  sevenDigitCodeSchema,
  updateCustomerSchema
} from '../../shared/schemas/customers'

export {
  addressReferenceSchema,
  createCustomerSchema,
  sevenDigitCodeSchema,
  updateCustomerSchema
}

const emptyToNull = (value: unknown) => value === '' ? null : value
const optionalText = z.preprocess(emptyToNull, z.string().trim().max(255).optional().nullable())
const optionalManagementIp = z.preprocess(emptyToNull, z.string().trim().max(45).regex(/^[0-9a-fA-F:.]+$/, 'Niepoprawny adres IP').optional().nullable())
const optionalHostname = z.preprocess(emptyToNull, z.string().trim().max(255).regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?$/, 'Niepoprawny hostname').optional().nullable())

export const createNodeSchema = z.object({
  inventoryId: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  nodeType: z.enum(['SZKIELETOWY', 'DYSTRYBUCYJNY']),
  mediumCode: z.string().max(50).nullable().optional(),
  address: addressReferenceSchema.nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'DECOMMISSIONED']).default('PLANNED')
})

export const createLineSchema = z.object({
  inventoryId: z.string().min(1).max(100),
  nodeStartId: z.string().uuid(),
  nodeEndId: z.string().uuid(),
  mediumCode: z.string().max(50).nullable().optional(),
  fiberCount: z.number().int().nonnegative().nullable().optional(),
  lengthMeters: z.number().nonnegative().nullable().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'DECOMMISSIONED']).default('ACTIVE')
})

export const createEquipmentSchema = z.object({
  inventoryId: z.string().min(1).max(100),
  modelId: z.number().int().positive(),
  nodeId: z.string().uuid().nullable().optional(),
  accessProfileId: z.number().int().positive().nullable().optional(),
  managementDriverId: z.number().int().positive().nullable().optional(),
  parentEquipmentId: z.string().uuid().nullable().optional(),
  hostname: optionalHostname,
  managementIp: optionalManagementIp,
  managementPort: z.number().int().positive().max(65535).nullable().optional(),
  managementProtocol: z.enum(['ssh', 'snmp', 'http', 'https', 'tr069', 'netconf']).nullable().optional(),
  loginUrl: z.preprocess(emptyToNull, z.string().url().nullable().optional()),
  macAddress: z.string().max(17).nullable().optional(),
  serialNumber: z.string().max(100).nullable().optional(),
  equipmentRole: z.enum(['BACKBONE', 'CLIENT_PE']),
  bridgeMode: z.boolean().default(false),
  onuPort: optionalText,
  onuId: optionalText,
  notes: z.preprocess(emptyToNull, z.string().nullable().optional()),
  status: z.enum(['IN_USE', 'SPARE', 'FAILED', 'DECOMMISSIONED']).default('IN_USE')
})

export const createServiceSchema = z.object({
  customerId: z.string().uuid(),
  profileId: z.number().int().positive(),
  equipmentId: z.string().uuid().nullable().optional(),
  address: addressReferenceSchema,
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED']).default('PENDING')
})

export const importDictionariesSchema = z.object({
  type: z.enum(['medium', 'technology', 'teryt', 'simc', 'ulic']),
  rows: z.array(z.record(z.string(), z.unknown())).min(1)
})

export const createAccessProfileSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.preprocess(emptyToNull, z.string().nullable().optional()),
  technologyTypeId: z.number().int().positive().nullable().optional(),
  downloadSpeedMbps: z.number().int().positive().nullable().optional(),
  uploadSpeedMbps: z.number().int().positive().nullable().optional(),
  isSymmetric: z.boolean().default(false),
  defaultProtocol: z.enum(['ssh', 'snmp', 'http', 'https', 'tr069', 'netconf', 'routeros']).default('ssh'),
  defaultPort: z.number().int().positive().max(65535).nullable().optional(),
  username: optionalText,
  passwordEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  snmpCommunityEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  apiBaseUrl: z.preprocess(emptyToNull, z.string().nullable().optional()),
  apiTokenEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  sshKeyEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  extraConfig: z.record(z.string(), z.unknown()).nullable().optional(),
  isActive: z.boolean().default(true)
})

export const createTariffSchema = z.object({
  name: z.string().min(1).max(128),
  serviceType: z.enum(['internet', 'iptv', 'voip', 'other']).default('internet'),
  defaultNetPrice: z.coerce.number().nonnegative().default(0),
  vatRate: z.coerce.number().nonnegative().max(100).default(23),
  downloadMbps: z.number().int().positive().nullable().optional(),
  uploadMbps: z.number().int().positive().nullable().optional(),
  queueName: optionalText,
  iptvPackageCode: optionalText,
  description: z.preprocess(emptyToNull, z.string().nullable().optional()),
  isActive: z.boolean().default(true)
})

export const createCustomerDeviceSchema = z.object({
  customerId: z.string().uuid(),
  equipmentId: z.string().uuid().nullable().optional(),
  onuEquipmentId: z.string().uuid().nullable().optional(),
  hostname: z.string().min(1).max(255),
  ipAddress: optionalManagementIp,
  macAddress: z.preprocess(emptyToNull, z.string().max(17).nullable().optional()),
  login: optionalText,
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).default('ACTIVE'),
  ipNetworkName: optionalText,
  dhcpServer: optionalText,
  dhcpInterface: optionalText,
  oltPort: optionalText,
  onuId: optionalText,
  importExternalId: optionalText,
  importIssues: z.array(z.string()).optional(),
  notes: z.preprocess(emptyToNull, z.string().nullable().optional())
})

export const archiveSchema = z.object({
  archiveReason: z.preprocess(emptyToNull, z.string().max(500).nullable().optional())
})

export const updateCustomerDeviceSchema = createCustomerDeviceSchema.partial()
export const updateServiceSchema = createServiceSchema.partial()
export const updateNodeSchema = z.object({
  inventoryId: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(255).optional(),
  nodeType: z.enum(['SZKIELETOWY', 'DYSTRYBUCYJNY']).optional(),
  mediumCode: z.string().max(50).nullable().optional(),
  address: addressReferenceSchema.nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'DECOMMISSIONED']).optional()
})
export const updateLineSchema = z.object({
  inventoryId: z.string().min(1).max(100).optional(),
  nodeStartId: z.string().uuid().optional(),
  nodeEndId: z.string().uuid().optional(),
  mediumCode: z.string().max(50).nullable().optional(),
  fiberCount: z.number().int().nonnegative().nullable().optional(),
  lengthMeters: z.number().nonnegative().nullable().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'DECOMMISSIONED']).optional()
})
export const updateEquipmentSchema = z.object({
  inventoryId: z.string().min(1).max(100).optional(),
  modelId: z.number().int().positive().optional(),
  nodeId: z.string().uuid().nullable().optional(),
  accessProfileId: z.number().int().positive().nullable().optional(),
  managementDriverId: z.number().int().positive().nullable().optional(),
  parentEquipmentId: z.string().uuid().nullable().optional(),
  hostname: optionalHostname,
  managementIp: optionalManagementIp,
  managementPort: z.number().int().positive().max(65535).nullable().optional(),
  managementProtocol: z.enum(['ssh', 'snmp', 'http', 'https', 'tr069', 'netconf']).nullable().optional(),
  loginUrl: z.preprocess(emptyToNull, z.string().url().nullable().optional()),
  macAddress: z.string().max(17).nullable().optional(),
  serialNumber: z.string().max(100).nullable().optional(),
  equipmentRole: z.enum(['BACKBONE', 'CLIENT_PE']).optional(),
  bridgeMode: z.boolean().optional(),
  onuPort: optionalText,
  onuId: optionalText,
  notes: z.preprocess(emptyToNull, z.string().nullable().optional()),
  status: z.enum(['IN_USE', 'SPARE', 'FAILED', 'DECOMMISSIONED']).optional()
})
export const updateAccessProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.preprocess(emptyToNull, z.string().nullable().optional()),
  technologyTypeId: z.number().int().positive().nullable().optional(),
  downloadSpeedMbps: z.number().int().positive().nullable().optional(),
  uploadSpeedMbps: z.number().int().positive().nullable().optional(),
  isSymmetric: z.boolean().optional(),
  defaultProtocol: z.enum(['ssh', 'snmp', 'http', 'https', 'tr069', 'netconf', 'routeros']).optional(),
  defaultPort: z.number().int().positive().max(65535).nullable().optional(),
  username: optionalText,
  passwordEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  snmpCommunityEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  apiBaseUrl: z.preprocess(emptyToNull, z.string().nullable().optional()),
  apiTokenEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  sshKeyEncrypted: z.preprocess(emptyToNull, z.string().nullable().optional()),
  extraConfig: z.record(z.string(), z.unknown()).nullable().optional(),
  isActive: z.boolean().optional()
})
export const updateTariffSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  serviceType: z.enum(['internet', 'iptv', 'voip', 'other']).optional(),
  defaultNetPrice: z.coerce.number().nonnegative().optional(),
  vatRate: z.coerce.number().nonnegative().max(100).optional(),
  downloadMbps: z.number().int().positive().nullable().optional(),
  uploadMbps: z.number().int().positive().nullable().optional(),
  queueName: optionalText,
  iptvPackageCode: optionalText,
  description: z.preprocess(emptyToNull, z.string().nullable().optional()),
  isActive: z.boolean().optional()
})

export const createSubscriptionSchema = z.object({
  customerId: z.string().uuid(),
  customerDeviceId: z.string().uuid().nullable().optional(),
  tariffId: z.number().int().positive(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().nullable().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'TERMINATED']).default('ACTIVE'),
  billingPeriod: z.enum(['monthly', 'quarterly', 'yearly']).default('monthly'),
  priceOverrideNet: z.coerce.number().nonnegative().nullable().optional(),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  activationFee: z.coerce.number().nonnegative().default(0),
  notes: z.preprocess(emptyToNull, z.string().nullable().optional())
})

export const updateSubscriptionSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerDeviceId: z.string().uuid().nullable().optional(),
  tariffId: z.number().int().positive().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().nullable().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'TERMINATED']).optional(),
  billingPeriod: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  priceOverrideNet: z.coerce.number().nonnegative().nullable().optional(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  activationFee: z.coerce.number().nonnegative().optional(),
  notes: z.preprocess(emptyToNull, z.string().nullable().optional())
})

export const importModeSchema = z.object({
  mode: z.enum(['preview', 'apply', 'dryRun']).default('preview'),
  activeOnly: z.boolean().default(true),
  limit: z.coerce.number().int().positive().max(500).optional(),
  rangeFrom: z.coerce.number().int().positive().max(10000).optional(),
  rangeTo: z.coerce.number().int().positive().max(10000).optional()
})

export const createAccessProfileBindingSchema = z.object({
  profileId: z.number().int().positive(),
  modelId: z.number().int().positive().nullable().optional(),
  equipmentId: z.string().uuid().nullable().optional(),
  managementProtocol: z.enum(['ssh', 'snmp', 'http', 'https', 'tr069', 'netconf']).default('ssh'),
  configTemplate: z.string().nullable().optional(),
  configPayload: z.record(z.string(), z.unknown()).nullable().optional(),
  priority: z.number().int().min(0).max(10000).default(100),
  isActive: z.boolean().default(true)
}).refine(value => value.modelId || value.equipmentId, {
  path: ['modelId'],
  message: 'Powiązanie wymaga modelu albo konkretnego urządzenia'
})

export const createAutomationScriptSchema = z.object({
  name: z.string().min(1).max(120),
  scope: z.enum(['DEVICE', 'PROFILE', 'CUSTOMER_SERVICE']).default('DEVICE'),
  triggerType: z.enum(['MANUAL', 'PROFILE_APPLIED', 'SERVICE_ACTIVATED', 'DEVICE_DISCOVERED', 'SCHEDULED_30_MIN']).default('MANUAL'),
  scriptLanguage: z.enum(['bash', 'python', 'ansible', 'expect', 'typescript', 'tsx']).default('bash'),
  scriptBody: z.string().min(1),
  profileId: z.number().int().positive().nullable().optional(),
  equipmentId: z.string().uuid().nullable().optional(),
  isEnabled: z.boolean().default(false),
  timeoutSeconds: z.number().int().positive().max(3600).default(60)
})

export const updateAutomationScriptSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  scope: z.enum(['DEVICE', 'PROFILE', 'CUSTOMER_SERVICE']).optional(),
  triggerType: z.enum(['MANUAL', 'PROFILE_APPLIED', 'SERVICE_ACTIVATED', 'DEVICE_DISCOVERED', 'SCHEDULED_30_MIN']).optional(),
  scriptLanguage: z.enum(['bash', 'python', 'ansible', 'expect', 'typescript', 'tsx']).optional(),
  scriptBody: z.string().min(1).optional(),
  profileId: z.number().int().positive().nullable().optional(),
  equipmentId: z.string().uuid().nullable().optional(),
  isEnabled: z.boolean().optional(),
  timeoutSeconds: z.number().int().positive().max(3600).optional()
})

const automationVariableDefinitionBaseSchema = z.object({
  variableName: z.string().trim().regex(/^[A-Za-z_][A-Za-z0-9_]*$/, 'Nazwa zmiennej może zawierać litery, cyfry i _'),
  label: optionalText,
  valueType: z.enum(['string', 'int', 'date', 'bool']).default('string'),
  sourceType: z.enum(['STATIC', 'DATABASE']).default('DATABASE'),
  tableName: optionalText,
  rowLookupColumn: optionalText,
  rowLookupValue: optionalText,
  fieldName: optionalText,
  staticValue: z.preprocess(emptyToNull, z.string().nullable().optional()),
  fallbackValue: z.preprocess(emptyToNull, z.string().nullable().optional()),
  isActive: z.boolean().default(true)
})

function validateAutomationVariableDefinition(value: z.output<typeof automationVariableDefinitionBaseSchema>, ctx: z.RefinementCtx) {
  if (value.sourceType === 'STATIC' && !value.staticValue) {
    ctx.addIssue({
      code: 'custom',
      path: ['staticValue'],
      message: 'Zmienna statyczna wymaga wartości'
    })
  }

  if (value.sourceType === 'DATABASE' && (!value.tableName || !value.rowLookupColumn || !value.rowLookupValue || !value.fieldName)) {
    ctx.addIssue({
      code: 'custom',
      path: ['tableName'],
      message: 'Zmienna z bazy wymaga tabeli, wiersza i pola'
    })
  }
}

export const createAutomationVariableDefinitionSchema = automationVariableDefinitionBaseSchema.superRefine(validateAutomationVariableDefinition)

export const updateAutomationVariableDefinitionSchema = automationVariableDefinitionBaseSchema.partial().superRefine((value, ctx) => {
  if (!value.sourceType) return
  validateAutomationVariableDefinition({
    variableName: value.variableName || '_',
    label: value.label,
    valueType: value.valueType || 'string',
    sourceType: value.sourceType,
    tableName: value.tableName,
    rowLookupColumn: value.rowLookupColumn,
    rowLookupValue: value.rowLookupValue,
    fieldName: value.fieldName,
    staticValue: value.staticValue,
    fallbackValue: value.fallbackValue,
    isActive: value.isActive ?? true
  }, ctx)
})

export const renderAutomationScriptSchema = z.object({
  variables: z.record(z.string(), z.string()).optional().default({})
})

export const createSearchCatalogSchema = z.object({
  label: z.string().trim().min(1).max(255),
  suffix: optionalText,
  icon: z.preprocess(emptyToNull, z.string().trim().max(100).nullable().optional()),
  to: z.string().trim().min(1).max(255),
  target: z.preprocess(emptyToNull, z.string().trim().max(20).nullable().optional()),
  aliases: z.preprocess(emptyToNull, z.string().nullable().optional()),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0)
})

export const updateSearchCatalogSchema = createSearchCatalogSchema.partial()
