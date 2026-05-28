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

export const createNumberPlanSchema = z.object({
  name: z.string().min(1).max(128),
  template: z.string().min(1).max(255),
  period: z.enum(['yearly', 'monthly', 'daily', 'continuous']).default('yearly'),
  doctype: z.enum(['invoice', 'proforma', 'credit_note', 'receipt']),
  isDefault: z.boolean().default(false),
  nextNumber: z.number().int().positive().default(1),
  isActive: z.boolean().default(true)
})

export const updateNumberPlanSchema = createNumberPlanSchema.partial()

export const createDocumentItemSchema = z.object({
  ordinal: z.number().int().nonnegative(),
  description: z.string().min(1),
  quantity: z.coerce.number().positive().default(1),
  unitNetPrice: z.coerce.number().nonnegative(),
  vatRate: z.coerce.number().nonnegative().max(100),
  netAmount: z.coerce.number().nonnegative(),
  vatAmount: z.coerce.number().nonnegative(),
  grossAmount: z.coerce.number().nonnegative(),
  subscriptionId: z.string().uuid().nullable().optional(),
  tariffId: z.number().int().positive().nullable().optional()
})

export const createDocumentSchema = z.object({
  type: z.enum(['invoice', 'proforma', 'credit_note', 'receipt']),
  numberPlanId: z.number().int().positive().nullable().optional(),
  customerId: z.string().uuid(),
  issueDate: z.string().date(),
  saleDate: z.string().date(),
  dueDate: z.string().date().nullable().optional(),
  paymentMethod: z.string().max(50).default('transfer'),
  totalNet: z.coerce.number().nonnegative(),
  totalVat: z.coerce.number().nonnegative(),
  totalGross: z.coerce.number().nonnegative(),
  notes: z.preprocess(emptyToNull, z.string().nullable().optional()),
  items: z.array(createDocumentItemSchema).min(1)
})

export const updateDocumentSchema = z.object({
  paymentMethod: z.string().max(50).optional(),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid']).optional(),
  dueDate: z.string().date().nullable().optional(),
  notes: z.preprocess(emptyToNull, z.string().nullable().optional()),
  isCancelled: z.boolean().optional()
})

export const createPaymentSchema = z.object({
  customerId: z.string().uuid(),
  documentId: z.string().uuid().nullable().optional(),
  amount: z.coerce.number().positive(),
  paymentDate: z.string().date(),
  paymentMethod: z.string().max(50).nullable().optional(),
  reference: z.preprocess(emptyToNull, z.string().max(255).nullable().optional()),
  notes: z.preprocess(emptyToNull, z.string().nullable().optional())
})

export const updatePaymentSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  paymentDate: z.string().date().optional(),
  paymentMethod: z.string().max(50).nullable().optional(),
  reference: z.preprocess(emptyToNull, z.string().max(255).nullable().optional()),
  notes: z.preprocess(emptyToNull, z.string().nullable().optional())
})

export const generateInvoiceSchema = z.object({
  customerId: z.string().uuid(),
  subscriptionIds: z.array(z.string().uuid()).min(1),
  issueDate: z.string().date(),
  saleDate: z.string().date(),
  dueDate: z.string().date().nullable().optional(),
  numberPlanId: z.number().int().positive().nullable().optional()
})

// ── Helpdesk / Tickets ──

export const createTicketCategorySchema = z.object({
  name: z.string().min(1).max(128),
  description: z.preprocess(emptyToNull, z.string().nullable().optional()),
  color: z.preprocess(emptyToNull, z.string().max(20).nullable().optional()),
  sortOrder: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true)
})

export const updateTicketCategorySchema = z.object({
  name: z.string().min(1).max(128).optional(),
  description: z.preprocess(emptyToNull, z.string().nullable().optional()),
  color: z.preprocess(emptyToNull, z.string().max(20).nullable().optional()),
  sortOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional()
})

export const createTicketSchema = z.object({
  subject: z.string().min(1).max(255),
  status: z.enum(['open', 'in_progress', 'waiting', 'resolved', 'closed']).default('open'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  customerId: z.string().uuid(),
  categoryId: z.number().int().positive().nullable().optional(),
  assignedTo: z.preprocess(emptyToNull, z.string().max(255).nullable().optional()),
  source: z.enum(['admin', 'portal', 'email']).default('admin'),
  message: z.string().min(1).describe('First message content')
})

export const updateTicketSchema = z.object({
  subject: z.string().min(1).max(255).optional(),
  status: z.enum(['open', 'in_progress', 'waiting', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  assignedTo: z.preprocess(emptyToNull, z.string().max(255).nullable().optional())
})

export const addTicketMessageSchema = z.object({
  author: z.string().min(1).max(255),
  content: z.string().min(1),
  isInternal: z.boolean().default(false),
  attachments: z.array(z.object({
    filename: z.string(),
    url: z.string()
  })).default([]).optional()
})

// ── Email & Notifications ──

export const createSmtpConfigSchema = z.object({
  name: z.string().min(1).max(128),
  host: z.string().min(1).max(255),
  port: z.number().int().positive().default(587),
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(512),
  fromName: z.preprocess(emptyToNull, z.string().max(255).nullable().optional()),
  fromEmail: z.string().email().max(255),
  encryption: z.enum(['tls', 'ssl', 'none']).default('tls'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true)
})

export const updateSmtpConfigSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  host: z.string().min(1).max(255).optional(),
  port: z.number().int().positive().optional(),
  username: z.string().min(1).max(255).optional(),
  password: z.string().min(1).max(512).optional(),
  fromName: z.preprocess(emptyToNull, z.string().max(255).nullable().optional()),
  fromEmail: z.string().email().max(255).optional(),
  encryption: z.enum(['tls', 'ssl', 'none']).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional()
})

export const createEmailTemplateSchema = z.object({
  name: z.string().min(1).max(128),
  code: z.string().min(1).max(64),
  subject: z.string().min(1).max(255),
  bodyHtml: z.string().min(1),
  variables: z.array(z.object({
    name: z.string(),
    label: z.string()
  })).default([]).optional(),
  smtpConfigId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true)
})

export const updateEmailTemplateSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  code: z.string().min(1).max(64).optional(),
  subject: z.string().min(1).max(255).optional(),
  bodyHtml: z.string().min(1).optional(),
  variables: z.array(z.object({
    name: z.string(),
    label: z.string()
  })).optional(),
  smtpConfigId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional()
})

export const createNotificationRuleSchema = z.object({
  name: z.string().min(1).max(128),
  eventType: z.enum(['ticket_created', 'ticket_reply', 'invoice_issued', 'payment_received', 'payment_overdue', 'subscription_expiring']),
  templateId: z.number().int().positive().nullable().optional(),
  recipients: z.array(z.object({
    type: z.enum(['customer', 'admin', 'email']),
    value: z.string().optional()
  })).min(1),
  conditions: z.object({}).passthrough().default({}).optional(),
  enabled: z.boolean().default(true)
})

export const updateNotificationRuleSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  eventType: z.enum(['ticket_created', 'ticket_reply', 'invoice_issued', 'payment_received', 'payment_overdue', 'subscription_expiring']).optional(),
  templateId: z.number().int().positive().nullable().optional(),
  recipients: z.array(z.object({
    type: z.enum(['customer', 'admin', 'email']),
    value: z.string().optional()
  })).min(1).optional(),
  conditions: z.object({}).passthrough().optional(),
  enabled: z.boolean().optional()
})
