import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  date,
  doublePrecision,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn
} from 'drizzle-orm/pg-core'

const sevenDigitCode = (column: AnyPgColumn) =>
  sql`${column} ~ '^[0-9]{7}$'`

const optionalShortDictionaryCode = (column: AnyPgColumn) =>
  sql`${column} ~ '^[0-9]{5,7}$'`

export const ukeMediumTypes = pgTable('uke_medium_types', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  label: varchar('label', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  importedAt: timestamp('imported_at').defaultNow().notNull()
})

export const ukeTechnologyTypes = pgTable('uke_technology_types', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  label: varchar('label', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  importedAt: timestamp('imported_at').defaultNow().notNull()
})

export const terytAreas = pgTable('teryt_areas', {
  id: serial('id').primaryKey(),
  terytCode: varchar('teryt_code', { length: 7 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  areaType: varchar('area_type', { length: 100 }),
  voivodeship: varchar('voivodeship', { length: 120 }),
  county: varchar('county', { length: 120 }),
  commune: varchar('commune', { length: 120 }),
  importedAt: timestamp('imported_at').defaultNow().notNull()
}, table => [
  check('teryt_areas_code_check', sevenDigitCode(table.terytCode))
])

export const simcLocalities = pgTable('simc_localities', {
  id: serial('id').primaryKey(),
  simcCode: varchar('simc_code', { length: 7 }).notNull().unique(),
  terytAreaId: integer('teryt_area_id').references(() => terytAreas.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  localityType: varchar('locality_type', { length: 120 }),
  importedAt: timestamp('imported_at').defaultNow().notNull()
}, table => [
  check('simc_localities_code_check', sevenDigitCode(table.simcCode))
])

export const ulicStreets = pgTable('ulic_streets', {
  id: serial('id').primaryKey(),
  ulicCode: varchar('ulic_code', { length: 7 }).notNull(),
  simcLocalityId: integer('simc_locality_id').references(() => simcLocalities.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  streetType: varchar('street_type', { length: 80 }),
  importedAt: timestamp('imported_at').defaultNow().notNull()
}, table => [
  uniqueIndex('ulic_streets_simc_code_idx').on(table.simcLocalityId, table.ulicCode),
  check('ulic_streets_code_check', optionalShortDictionaryCode(table.ulicCode))
])

export const deviceTypes = pgTable('device_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description')
})

export const deviceModels = pgTable('device_models', {
  id: serial('id').primaryKey(),
  typeId: integer('type_id').references(() => deviceTypes.id, { onDelete: 'restrict' }).notNull(),
  manufacturer: varchar('manufacturer', { length: 100 }).notNull(),
  modelName: varchar('model_name', { length: 100 }).notNull(),
  technologyTypeId: integer('technology_type_id').references(() => ukeTechnologyTypes.id, { onDelete: 'set null' }),
  portsUpstream: integer('ports_upstream').default(0).notNull(),
  portsDownstream: integer('ports_downstream').default(0).notNull(),
  powerConsumptionWatt: doublePrecision('power_consumption_watt'),
  throughputCapabilities: jsonb('throughput_capabilities')
}, table => [
  uniqueIndex('device_models_manufacturer_model_idx').on(table.manufacturer, table.modelName)
])

export const accessProfiles = pgTable('access_profiles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  technologyTypeId: integer('technology_type_id').references(() => ukeTechnologyTypes.id, { onDelete: 'set null' }),
  downloadSpeedMbps: integer('download_speed_mbps'),
  uploadSpeedMbps: integer('upload_speed_mbps'),
  isSymmetric: boolean('is_symmetric').default(false).notNull(),
  defaultProtocol: varchar('default_protocol', { length: 30 }).default('ssh').notNull(),
  defaultPort: integer('default_port'),
  username: varchar('username', { length: 120 }),
  passwordEncrypted: text('password_encrypted'),
  snmpCommunityEncrypted: text('snmp_community_encrypted'),
  apiBaseUrl: text('api_base_url'),
  apiTokenEncrypted: text('api_token_encrypted'),
  sshKeyEncrypted: text('ssh_key_encrypted'),
  extraConfig: jsonb('extra_config'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const managementDrivers = pgTable('management_drivers', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 60 }).notNull().unique(),
  label: varchar('label', { length: 160 }).notNull(),
  transport: varchar('transport', { length: 50 }).notNull(),
  capabilities: jsonb('capabilities'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const networkNodes = pgTable('network_nodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  inventoryId: varchar('inventory_id', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nodeType: varchar('node_type', { length: 50 }).notNull(),
  mediumTypeId: integer('medium_type_id').references(() => ukeMediumTypes.id, { onDelete: 'set null' }),
  terytAreaId: integer('teryt_area_id').references(() => terytAreas.id, { onDelete: 'set null' }),
  simcLocalityId: integer('simc_locality_id').references(() => simcLocalities.id, { onDelete: 'set null' }),
  streetId: integer('street_id').references(() => ulicStreets.id, { onDelete: 'set null' }),
  buildingNumber: varchar('building_number', { length: 30 }),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  status: varchar('status', { length: 50 }).default('PLANNED').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const networkLines = pgTable('network_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  inventoryId: varchar('inventory_id', { length: 100 }).notNull().unique(),
  nodeStartId: uuid('node_start_id').references(() => networkNodes.id, { onDelete: 'restrict' }).notNull(),
  nodeEndId: uuid('node_end_id').references(() => networkNodes.id, { onDelete: 'restrict' }).notNull(),
  mediumTypeId: integer('medium_type_id').references(() => ukeMediumTypes.id, { onDelete: 'set null' }),
  fiberCount: integer('fiber_count'),
  lengthMeters: doublePrecision('length_meters'),
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull()
})

export const networkEquipment = pgTable('network_equipment', {
  id: uuid('id').defaultRandom().primaryKey(),
  inventoryId: varchar('inventory_id', { length: 100 }).notNull().unique(),
  modelId: integer('model_id').references(() => deviceModels.id, { onDelete: 'restrict' }).notNull(),
  nodeId: uuid('node_id').references(() => networkNodes.id, { onDelete: 'set null' }),
  accessProfileId: integer('access_profile_id').references(() => accessProfiles.id, { onDelete: 'set null' }),
  managementDriverId: integer('management_driver_id').references(() => managementDrivers.id, { onDelete: 'set null' }),
  parentEquipmentId: uuid('parent_equipment_id').references((): AnyPgColumn => networkEquipment.id, { onDelete: 'set null' }),
  hostname: varchar('hostname', { length: 255 }).unique(),
  managementIp: varchar('management_ip', { length: 45 }).unique(),
  managementPort: integer('management_port'),
  managementProtocol: varchar('management_protocol', { length: 30 }),
  loginUrl: text('login_url'),
  macAddress: varchar('mac_address', { length: 17 }).unique(),
  serialNumber: varchar('serial_number', { length: 100 }).unique(),
  equipmentRole: varchar('equipment_role', { length: 50 }).notNull(),
  bridgeMode: boolean('bridge_mode').default(false).notNull(),
  onuPort: varchar('onu_port', { length: 32 }),
  onuId: varchar('onu_id', { length: 32 }),
  notes: text('notes'),
  lastSeenAt: timestamp('last_seen_at'),
  isOnline: boolean('is_online').default(false).notNull(),
  status: varchar('status', { length: 50 }).default('IN_USE').notNull()
})

export const ipNetworks = pgTable('ip_networks', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 128 }).notNull().unique(),
  cidr: varchar('cidr', { length: 64 }).notNull().unique(),
  gateway: varchar('gateway', { length: 45 }),
  vlanId: integer('vlan_id'),
  ownerNodeId: uuid('owner_node_id').references(() => networkNodes.id, { onDelete: 'set null' }),
  ownerEquipmentId: uuid('owner_equipment_id').references(() => networkEquipment.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const ftthOlts = pgTable('ftth_olts', {
  id: uuid('id').defaultRandom().primaryKey(),
  networkEquipmentId: uuid('network_equipment_id').references(() => networkEquipment.id, { onDelete: 'cascade' }).notNull().unique(),
  vendor: varchar('vendor', { length: 80 }).default('Dasan').notNull(),
  model: varchar('model', { length: 120 }),
  managementVlanId: integer('management_vlan_id').default(400).notNull(),
  description: text(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const ftthPonPorts = pgTable('ftth_pon_ports', {
  id: uuid('id').defaultRandom().primaryKey(),
  oltId: uuid('olt_id').references(() => ftthOlts.id, { onDelete: 'cascade' }).notNull(),
  portCode: varchar('port_code', { length: 32 }).notNull(),
  label: varchar('label', { length: 160 }),
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, table => [
  uniqueIndex('ftth_pon_ports_olt_port_idx').on(table.oltId, table.portCode)
])

export const ftthOnus = pgTable('ftth_onus', {
  id: uuid('id').defaultRandom().primaryKey(),
  ponPortId: uuid('pon_port_id').references(() => ftthPonPorts.id, { onDelete: 'cascade' }).notNull(),
  networkEquipmentId: uuid('network_equipment_id').references(() => networkEquipment.id, { onDelete: 'set null' }),
  onuIdentifier: varchar('onu_identifier', { length: 32 }).notNull(),
  serialNumber: varchar('serial_number', { length: 100 }),
  status: varchar('status', { length: 50 }).default('UNKNOWN').notNull(),
  signalRx: varchar('signal_rx', { length: 50 }),
  transparentCandidate: boolean('transparent_candidate').default(false).notNull(),
  lastSeenAt: timestamp('last_seen_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, table => [
  uniqueIndex('ftth_onus_pon_identifier_idx').on(table.ponPortId, table.onuIdentifier),
  uniqueIndex('ftth_onus_serial_idx').on(table.serialNumber)
])

export const ftthOnuIpHosts = pgTable('ftth_onu_ip_hosts', {
  id: uuid('id').defaultRandom().primaryKey(),
  onuId: uuid('onu_id').references(() => ftthOnus.id, { onDelete: 'cascade' }).notNull(),
  hostId: varchar('host_id', { length: 32 }).notNull(),
  ipOption: varchar('ip_option', { length: 80 }),
  macAddress: varchar('mac_address', { length: 17 }),
  currentIp: varchar('current_ip', { length: 45 }),
  currentMask: varchar('current_mask', { length: 45 }),
  currentGateway: varchar('current_gateway', { length: 45 }),
  primaryDns: varchar('primary_dns', { length: 45 }),
  secondaryDns: varchar('secondary_dns', { length: 45 }),
  hostName: varchar('host_name', { length: 255 }),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull()
}, table => [
  uniqueIndex('ftth_onu_ip_hosts_onu_host_idx').on(table.onuId, table.hostId)
])

export const ftthOnuMacs = pgTable('ftth_onu_macs', {
  id: uuid('id').defaultRandom().primaryKey(),
  onuId: uuid('onu_id').references(() => ftthOnus.id, { onDelete: 'cascade' }).notNull(),
  macAddress: varchar('mac_address', { length: 17 }).notNull(),
  vlanId: integer('vlan_id'),
  gemId: varchar('gem_id', { length: 32 }),
  sourceCommand: varchar('source_command', { length: 120 }).notNull(),
  status: varchar('status', { length: 50 }).default('dynamic').notNull(),
  firstSeenAt: timestamp('first_seen_at').defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull()
}, table => [
  uniqueIndex('ftth_onu_macs_onu_mac_idx').on(table.onuId, table.macAddress)
])

export const customerDevices = pgTable('customer_devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  equipmentId: uuid('equipment_id').references(() => networkEquipment.id, { onDelete: 'set null' }),
  onuEquipmentId: uuid('onu_equipment_id').references(() => networkEquipment.id, { onDelete: 'set null' }),
  ftthOnuId: uuid('ftth_onu_id').references(() => ftthOnus.id, { onDelete: 'set null' }),
  hostname: varchar('hostname', { length: 255 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  macAddress: varchar('mac_address', { length: 17 }).unique(),
  login: varchar('login', { length: 120 }),
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
  ipNetworkName: varchar('ip_network_name', { length: 128 }),
  dhcpServer: varchar('dhcp_server', { length: 128 }),
  dhcpInterface: varchar('dhcp_interface', { length: 128 }),
  oltPort: varchar('olt_port', { length: 32 }),
  onuId: varchar('onu_id', { length: 32 }),
  importExternalId: varchar('import_external_id', { length: 80 }),
  importIssues: jsonb('import_issues').$type<string[]>().default([]).notNull(),
  notes: text('notes'),
  archivedAt: timestamp('archived_at'),
  archiveReason: text('archive_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const ftthTransparentLinks = pgTable('ftth_transparent_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  onuId: uuid('onu_id').references(() => ftthOnus.id, { onDelete: 'cascade' }).notNull(),
  macAddress: varchar('mac_address', { length: 17 }).notNull(),
  linkType: varchar('link_type', { length: 60 }).notNull(),
  customerDeviceId: uuid('customer_device_id').references(() => customerDevices.id, { onDelete: 'set null' }),
  backboneEquipmentId: uuid('backbone_equipment_id').references(() => networkEquipment.id, { onDelete: 'set null' }),
  confidence: integer('confidence').default(100).notNull(),
  firstSeenAt: timestamp('first_seen_at').defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull()
}, table => [
  uniqueIndex('ftth_transparent_links_onu_mac_idx').on(table.onuId, table.macAddress)
])

export const tariffs = pgTable('tariffs', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }).notNull().unique(),
  serviceType: varchar('service_type', { length: 50 }).default('internet').notNull(),
  defaultNetPrice: numeric('default_net_price', { precision: 12, scale: 2 }).default('0').notNull(),
  vatRate: numeric('vat_rate', { precision: 5, scale: 2 }).default('23').notNull(),
  downloadMbps: integer('download_mbps'),
  uploadMbps: integer('upload_mbps'),
  queueName: varchar('queue_name', { length: 128 }),
  iptvPackageCode: varchar('iptv_package_code', { length: 128 }),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  customerDeviceId: uuid('customer_device_id').references(() => customerDevices.id, { onDelete: 'set null' }),
  tariffId: integer('tariff_id').references(() => tariffs.id, { onDelete: 'restrict' }).notNull(),
  startDate: date('start_date').defaultNow().notNull(),
  endDate: date('end_date'),
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
  billingPeriod: varchar('billing_period', { length: 30 }).default('monthly').notNull(),
  priceOverrideNet: numeric('price_override_net', { precision: 12, scale: 2 }),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }).default('0').notNull(),
  activationFee: numeric('activation_fee', { precision: 12, scale: 2 }).default('0').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const diagnosticRuns = pgTable('diagnostic_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerDeviceId: uuid('customer_device_id').references(() => customerDevices.id, { onDelete: 'set null' }),
  equipmentId: uuid('equipment_id').references(() => networkEquipment.id, { onDelete: 'set null' }),
  driverCode: varchar('driver_code', { length: 60 }).notNull(),
  runType: varchar('run_type', { length: 60 }).notNull(),
  target: varchar('target', { length: 255 }),
  success: boolean('success').default(false).notNull(),
  result: jsonb('result').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const netflowInterfaceSamples = pgTable('netflow_interface_samples', {
  id: uuid('id').defaultRandom().primaryKey(),
  equipmentId: uuid('equipment_id').references(() => networkEquipment.id, { onDelete: 'set null' }),
  exporterAddress: varchar('exporter_address', { length: 45 }).notNull(),
  version: integer('version').notNull(),
  ifIndex: integer('if_index'),
  interfaceName: varchar('interface_name', { length: 128 }),
  role: varchar('role', { length: 32 }).default('unknown').notNull(),
  sourceInterface: varchar('source_interface', { length: 128 }),
  direction: varchar('direction', { length: 16 }).notNull(),
  bytes: doublePrecision('bytes').default(0).notNull(),
  packets: doublePrecision('packets').default(0).notNull(),
  records: doublePrecision('records').default(0).notNull(),
  bps: doublePrecision('bps').default(0).notNull(),
  speedBps: doublePrecision('speed_bps'),
  sampleWindowSeconds: doublePrecision('sample_window_seconds').default(10).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const netflowRawFlows = pgTable('netflow_raw_flows', {
  id: uuid('id').defaultRandom().primaryKey(),
  exporterAddress: varchar('exporter_address', { length: 45 }).notNull(),
  exporterPort: integer('exporter_port').notNull(),
  version: integer('version').notNull(),
  sourceId: integer('source_id').notNull(),
  sequence: doublePrecision('sequence').default(0).notNull(),
  exportedAt: timestamp('exported_at').notNull(),
  firstSeenAt: timestamp('first_seen_at'),
  lastSeenAt: timestamp('last_seen_at'),
  srcIp: varchar('src_ip', { length: 45 }),
  dstIp: varchar('dst_ip', { length: 45 }),
  srcPort: integer('src_port'),
  dstPort: integer('dst_port'),
  protocol: integer('protocol'),
  tcpFlags: integer('tcp_flags'),
  tos: integer('tos'),
  bytes: doublePrecision('bytes').default(0).notNull(),
  packets: doublePrecision('packets').default(0).notNull(),
  inputIfIndex: integer('input_if_index'),
  outputIfIndex: integer('output_if_index'),
  srcMac: varchar('src_mac', { length: 17 }),
  dstMac: varchar('dst_mac', { length: 17 }),
  natSrcIp: varchar('nat_src_ip', { length: 45 }),
  natDstIp: varchar('nat_dst_ip', { length: 45 }),
  natSrcPort: integer('nat_src_port'),
  natDstPort: integer('nat_dst_port'),
  flowDirection: varchar('flow_direction', { length: 16 }).default('unknown').notNull(),
  localIp: varchar('local_ip', { length: 45 }),
  remoteIp: varchar('remote_ip', { length: 45 }),
  userKey: varchar('user_key', { length: 160 }).default('unknown').notNull(),
  customerDeviceId: uuid('customer_device_id').references(() => customerDevices.id, { onDelete: 'set null' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  confidence: varchar('confidence', { length: 32 }).default('unknown').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const netflowFlowRollups = pgTable('netflow_flow_rollups', {
  id: uuid('id').defaultRandom().primaryKey(),
  bucket: timestamp('bucket').notNull(),
  bucketSeconds: integer('bucket_seconds').notNull(),
  exporterAddress: varchar('exporter_address', { length: 45 }).notNull(),
  scope: varchar('scope', { length: 32 }).notNull(),
  ifIndex: integer('if_index'),
  userKey: varchar('user_key', { length: 160 }),
  customerDeviceId: uuid('customer_device_id').references(() => customerDevices.id, { onDelete: 'set null' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  localIp: varchar('local_ip', { length: 45 }),
  direction: varchar('direction', { length: 16 }).notNull(),
  bytes: doublePrecision('bytes').default(0).notNull(),
  packets: doublePrecision('packets').default(0).notNull(),
  flows: doublePrecision('flows').default(0).notNull(),
  bps: doublePrecision('bps').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const netflowCollectorTemplates = pgTable('netflow_collector_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  exporterAddress: varchar('exporter_address', { length: 45 }).notNull(),
  version: integer('version').notNull(),
  sourceId: integer('source_id').notNull(),
  templateId: integer('template_id').notNull(),
  fields: jsonb('fields').$type<Array<{ type: number, length: number, enterpriseId?: number }>>().default([]).notNull(),
  refreshedAt: timestamp('refreshed_at').defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull()
})

export const netflowExporterHealth = pgTable('netflow_exporter_health', {
  id: uuid('id').defaultRandom().primaryKey(),
  exporterAddress: varchar('exporter_address', { length: 45 }).notNull(),
  version: integer('version').notNull(),
  sourceId: integer('source_id').notNull(),
  packetCount: doublePrecision('packet_count').default(0).notNull(),
  flowRecords: doublePrecision('flow_records').default(0).notNull(),
  unknownTemplateRecords: doublePrecision('unknown_template_records').default(0).notNull(),
  sequenceGaps: doublePrecision('sequence_gaps').default(0).notNull(),
  templatesRefreshed: doublePrecision('templates_refreshed').default(0).notNull(),
  lastSequence: doublePrecision('last_sequence').default(0).notNull(),
  lastPacketAt: timestamp('last_packet_at').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const dhcpActiveUserSnapshots = pgTable('dhcp_active_user_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  equipmentId: uuid('equipment_id').references(() => networkEquipment.id, { onDelete: 'cascade' }).notNull(),
  inventoryId: varchar('inventory_id', { length: 100 }).notNull(),
  totalLeases: integer('total_leases').default(0).notNull(),
  candidateLeases: integer('candidate_leases').default(0).notNull(),
  activeUsers: integer('active_users').default(0).notNull(),
  joinedUsers: integer('joined_users').default(0).notNull(),
  leftUsers: integer('left_users').default(0).notNull(),
  activeKeys: jsonb('active_keys').$type<string[]>().default([]).notNull(),
  evidenceCounts: jsonb('evidence_counts').$type<Record<string, number>>().default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const dhcpActiveUserScopeCounts = pgTable('dhcp_active_user_scope_counts', {
  id: uuid('id').defaultRandom().primaryKey(),
  snapshotId: uuid('snapshot_id').references(() => dhcpActiveUserSnapshots.id, { onDelete: 'cascade' }).notNull(),
  scope: varchar('scope', { length: 32 }).notNull(),
  name: varchar('name', { length: 160 }).notNull(),
  count: integer('count').default(0).notNull()
})

export const importRuns = pgTable('import_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  equipmentId: uuid('equipment_id').references(() => networkEquipment.id, { onDelete: 'set null' }),
  driverCode: varchar('driver_code', { length: 60 }).notNull(),
  importType: varchar('import_type', { length: 60 }).notNull(),
  mode: varchar('mode', { length: 30 }).default('preview').notNull(),
  success: boolean('success').default(false).notNull(),
  summary: jsonb('summary').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const ipAddresses = pgTable('ip_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  networkId: uuid('network_id').references(() => ipNetworks.id, { onDelete: 'set null' }),
  ipAddress: varchar('ip_address', { length: 45 }).notNull(),
  assignmentType: varchar('assignment_type', { length: 50 }).default('UNASSIGNED').notNull(),
  customerDeviceId: uuid('customer_device_id').references(() => customerDevices.id, { onDelete: 'set null' }),
  equipmentId: uuid('equipment_id').references(() => networkEquipment.id, { onDelete: 'set null' }),
  importRunId: uuid('import_run_id').references(() => importRuns.id, { onDelete: 'set null' }),
  source: varchar('source', { length: 80 }).default('manual').notNull(),
  firstSeenAt: timestamp('first_seen_at').defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
  notes: text()
}, table => [
  uniqueIndex('ip_addresses_network_ip_idx').on(table.networkId, table.ipAddress)
])

export const macAddresses = pgTable('mac_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  macAddress: varchar('mac_address', { length: 17 }).notNull().unique(),
  ownerType: varchar('owner_type', { length: 50 }).default('UNKNOWN').notNull(),
  customerDeviceId: uuid('customer_device_id').references(() => customerDevices.id, { onDelete: 'set null' }),
  equipmentId: uuid('equipment_id').references(() => networkEquipment.id, { onDelete: 'set null' }),
  importRunId: uuid('import_run_id').references(() => importRuns.id, { onDelete: 'set null' }),
  source: varchar('source', { length: 80 }).default('manual').notNull(),
  firstSeenAt: timestamp('first_seen_at').defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull()
})

export const accessProfileDeviceBindings = pgTable('access_profile_device_bindings', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').references(() => accessProfiles.id, { onDelete: 'cascade' }).notNull(),
  modelId: integer('model_id').references(() => deviceModels.id, { onDelete: 'cascade' }),
  equipmentId: uuid('equipment_id').references(() => networkEquipment.id, { onDelete: 'cascade' }),
  managementProtocol: varchar('management_protocol', { length: 30 }).default('ssh').notNull(),
  configTemplate: text('config_template'),
  configPayload: jsonb('config_payload'),
  priority: integer('priority').default(100).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, table => [
  uniqueIndex('access_profile_bindings_profile_model_idx').on(table.profileId, table.modelId),
  uniqueIndex('access_profile_bindings_profile_equipment_idx').on(table.profileId, table.equipmentId),
  check('access_profile_device_bindings_target_check', sql`${table.modelId} is not null or ${table.equipmentId} is not null`)
])

export const automationScripts = pgTable('automation_scripts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull().unique(),
  scope: varchar('scope', { length: 50 }).default('DEVICE').notNull(),
  triggerType: varchar('trigger_type', { length: 50 }).default('MANUAL').notNull(),
  scriptLanguage: varchar('script_language', { length: 50 }).default('bash').notNull(),
  scriptBody: text('script_body').notNull(),
  profileId: integer('profile_id').references(() => accessProfiles.id, { onDelete: 'set null' }),
  equipmentId: uuid('equipment_id').references(() => networkEquipment.id, { onDelete: 'set null' }),
  isEnabled: boolean('is_enabled').default(false).notNull(),
  timeoutSeconds: integer('timeout_seconds').default(60).notNull(),
  lastRunAt: timestamp('last_run_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const automationVariableDefinitions = pgTable('automation_variable_definitions', {
  id: serial('id').primaryKey(),
  variableName: varchar('variable_name', { length: 80 }).notNull().unique(),
  label: varchar('label', { length: 160 }),
  valueType: varchar('value_type', { length: 30 }).default('string').notNull(),
  sourceType: varchar('source_type', { length: 30 }).default('DATABASE').notNull(),
  tableName: varchar('table_name', { length: 80 }),
  rowLookupColumn: varchar('row_lookup_column', { length: 80 }),
  rowLookupValue: varchar('row_lookup_value', { length: 255 }),
  fieldName: varchar('field_name', { length: 80 }),
  staticValue: text('static_value'),
  fallbackValue: text('fallback_value'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const authGroups = pgTable('auth_groups', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 160 }).notNull(),
  description: text('description'),
  isAdmin: boolean('is_admin').default(false).notNull(),
  permissions: jsonb('permissions').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const authUsers = pgTable('auth_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 120 }).notNull().unique(),
  displayName: varchar('display_name', { length: 160 }).notNull(),
  email: varchar('email', { length: 255 }),
  passwordHash: text('password_hash').notNull(),
  groupId: integer('group_id').references(() => authGroups.id, { onDelete: 'restrict' }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  mustChangePassword: boolean('must_change_password').default(false).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  customerType: varchar('customer_type', { length: 50 }).notNull(),
  firstName: varchar('first_name', { length: 120 }),
  lastName: varchar('last_name', { length: 120 }),
  pesel: varchar('pesel', { length: 11 }).unique(),
  identityDocumentNumber: varchar('identity_document_number', { length: 50 }),
  companyName: varchar('company_name', { length: 255 }),
  taxId: varchar('tax_id', { length: 50 }).unique(),
  regon: varchar('regon', { length: 14 }).unique(),
  krs: varchar('krs', { length: 20 }),
  representativeName: varchar('representative_name', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  billingTerytAreaId: integer('billing_teryt_area_id').references(() => terytAreas.id, { onDelete: 'set null' }),
  billingSimcLocalityId: integer('billing_simc_locality_id').references(() => simcLocalities.id, { onDelete: 'set null' }),
  billingStreetId: integer('billing_street_id').references(() => ulicStreets.id, { onDelete: 'set null' }),
  billingBuildingNumber: varchar('billing_building_number', { length: 30 }),
  billingApartmentNumber: varchar('billing_apartment_number', { length: 30 }),
  billingAddress: text('billing_address'),
  importExternalId: varchar('import_external_id', { length: 80 }),
  importIssues: jsonb('import_issues').$type<string[]>().default([]).notNull(),
  archivedAt: timestamp('archived_at'),
  archiveReason: text('archive_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const customerServices = pgTable('customer_services', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  profileId: integer('profile_id').references(() => accessProfiles.id, { onDelete: 'restrict' }).notNull(),
  equipmentId: uuid('equipment_id').references(() => networkEquipment.id, { onDelete: 'set null' }).unique(),
  serviceTerytAreaId: integer('service_teryt_area_id').references(() => terytAreas.id, { onDelete: 'set null' }),
  serviceSimcLocalityId: integer('service_simc_locality_id').references(() => simcLocalities.id, { onDelete: 'set null' }),
  serviceStreetId: integer('service_street_id').references(() => ulicStreets.id, { onDelete: 'set null' }),
  serviceBuildingNumber: varchar('service_building_number', { length: 30 }),
  serviceApartmentNumber: varchar('service_apartment_number', { length: 30 }),
  activationDate: timestamp('activation_date'),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(),
  importIssues: jsonb('import_issues').$type<string[]>().default([]).notNull(),
  archivedAt: timestamp('archived_at'),
  archiveReason: text('archive_reason')
})

export type TerytArea = typeof terytAreas.$inferSelect
export type SimcLocality = typeof simcLocalities.$inferSelect
export type UlicStreet = typeof ulicStreets.$inferSelect
export type NetworkNode = typeof networkNodes.$inferSelect
export type NetworkLine = typeof networkLines.$inferSelect
export type NetworkEquipment = typeof networkEquipment.$inferSelect
export type IpNetwork = typeof ipNetworks.$inferSelect
export type IpAddress = typeof ipAddresses.$inferSelect
export type MacAddress = typeof macAddresses.$inferSelect
export type FtthOlt = typeof ftthOlts.$inferSelect
export type FtthPonPort = typeof ftthPonPorts.$inferSelect
export type FtthOnu = typeof ftthOnus.$inferSelect
export type FtthOnuIpHost = typeof ftthOnuIpHosts.$inferSelect
export type FtthOnuMac = typeof ftthOnuMacs.$inferSelect
export type FtthTransparentLink = typeof ftthTransparentLinks.$inferSelect
export type CustomerDevice = typeof customerDevices.$inferSelect
export type AccessProfileDeviceBinding = typeof accessProfileDeviceBindings.$inferSelect
export type AutomationScript = typeof automationScripts.$inferSelect
export type AutomationVariableDefinition = typeof automationVariableDefinitions.$inferSelect
export type AuthGroup = typeof authGroups.$inferSelect
export type AuthUser = typeof authUsers.$inferSelect
export type Customer = typeof customers.$inferSelect
export type CustomerService = typeof customerServices.$inferSelect
export type ManagementDriver = typeof managementDrivers.$inferSelect
export type Tariff = typeof tariffs.$inferSelect
export type Subscription = typeof subscriptions.$inferSelect
export type NetflowRawFlow = typeof netflowRawFlows.$inferSelect
export type NetflowFlowRollup = typeof netflowFlowRollups.$inferSelect
export type NetflowCollectorTemplate = typeof netflowCollectorTemplates.$inferSelect
export type NetflowExporterHealth = typeof netflowExporterHealth.$inferSelect
