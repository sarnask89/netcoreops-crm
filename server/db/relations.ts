import { relations } from 'drizzle-orm'
import {
  accessProfiles,
  operatorCities,
  accessProfileDeviceBindings,
  automationScripts,
  customerDevices,
  customerServices,
  customers,
  diagnosticRuns,
  deviceModels,
  deviceTypes,
  documentItems,
  documents,
  ticketCategories,
  ticketMessages,
  tickets,
  smtpConfigs,
  emailTemplates,
  notificationRules,
  emailLogs,
  ftthOlts,
  ftthOnuIpHosts,
  ftthOnuMacs,
  ftthOnus,
  ftthPonPorts,
  ftthTransparentLinks,
  importRuns,
  ipAddresses,
  ipNetworks,
  macAddresses,
  managementDrivers,
  networkEquipment,
  networkLines,
  networkNodes,
  numberPlans,
  payments,
  netflowRawFlows,
  netflowFlowRollups,
  netflowInterfaceSamples,
  dhcpActiveUserSnapshots,
  dhcpActiveUserScopeCounts,
  authGroups,
  authUsers,
  simcLocalities,
  terytAreas,
  ukeMediumTypes,
  ukeTechnologyTypes,
  ulicStreets,
  subscriptions,
  tariffs,
  portalUsers
} from './schema'

export const ukeMediumTypesRelations = relations(ukeMediumTypes, ({ many }) => ({
  nodes: many(networkNodes),
  lines: many(networkLines)
}))

export const ukeTechnologyTypesRelations = relations(ukeTechnologyTypes, ({ many }) => ({
  models: many(deviceModels),
  accessProfiles: many(accessProfiles)
}))

export const terytAreasRelations = relations(terytAreas, ({ many }) => ({
  localities: many(simcLocalities),
  nodes: many(networkNodes),
  services: many(customerServices)
}))

export const simcLocalitiesRelations = relations(simcLocalities, ({ one, many }) => ({
  terytArea: one(terytAreas, {
    fields: [simcLocalities.terytAreaId],
    references: [terytAreas.id]
  }),
  streets: many(ulicStreets),
  nodes: many(networkNodes),
  services: many(customerServices)
}))

export const ulicStreetsRelations = relations(ulicStreets, ({ one, many }) => ({
  locality: one(simcLocalities, {
    fields: [ulicStreets.simcLocalityId],
    references: [simcLocalities.id]
  }),
  nodes: many(networkNodes),
  services: many(customerServices)
}))

export const deviceTypesRelations = relations(deviceTypes, ({ many }) => ({
  models: many(deviceModels)
}))

export const deviceModelsRelations = relations(deviceModels, ({ one, many }) => ({
  type: one(deviceTypes, {
    fields: [deviceModels.typeId],
    references: [deviceTypes.id]
  }),
  technology: one(ukeTechnologyTypes, {
    fields: [deviceModels.technologyTypeId],
    references: [ukeTechnologyTypes.id]
  }),
  equipment: many(networkEquipment),
  profileBindings: many(accessProfileDeviceBindings)
}))

export const accessProfilesRelations = relations(accessProfiles, ({ one, many }) => ({
  technology: one(ukeTechnologyTypes, {
    fields: [accessProfiles.technologyTypeId],
    references: [ukeTechnologyTypes.id]
  }),
  equipment: many(networkEquipment),
  deviceBindings: many(accessProfileDeviceBindings),
  automationScripts: many(automationScripts)
}))

export const managementDriversRelations = relations(managementDrivers, ({ many }) => ({
  equipment: many(networkEquipment)
}))

export const networkNodesRelations = relations(networkNodes, ({ one, many }) => ({
  medium: one(ukeMediumTypes, {
    fields: [networkNodes.mediumTypeId],
    references: [ukeMediumTypes.id]
  }),
  terytArea: one(terytAreas, {
    fields: [networkNodes.terytAreaId],
    references: [terytAreas.id]
  }),
  simcLocality: one(simcLocalities, {
    fields: [networkNodes.simcLocalityId],
    references: [simcLocalities.id]
  }),
  street: one(ulicStreets, {
    fields: [networkNodes.streetId],
    references: [ulicStreets.id]
  }),
  startingLines: many(networkLines, { relationName: 'startNode' }),
  endingLines: many(networkLines, { relationName: 'endNode' }),
  equipment: many(networkEquipment),
  ipNetworks: many(ipNetworks)
}))

export const networkLinesRelations = relations(networkLines, ({ one }) => ({
  startNode: one(networkNodes, {
    fields: [networkLines.nodeStartId],
    references: [networkNodes.id],
    relationName: 'startNode'
  }),
  endNode: one(networkNodes, {
    fields: [networkLines.nodeEndId],
    references: [networkNodes.id],
    relationName: 'endNode'
  }),
  medium: one(ukeMediumTypes, {
    fields: [networkLines.mediumTypeId],
    references: [ukeMediumTypes.id]
  })
}))

export const networkEquipmentRelations = relations(networkEquipment, ({ one, many }) => ({
  model: one(deviceModels, {
    fields: [networkEquipment.modelId],
    references: [deviceModels.id]
  }),
  node: one(networkNodes, {
    fields: [networkEquipment.nodeId],
    references: [networkNodes.id]
  }),
  accessProfile: one(accessProfiles, {
    fields: [networkEquipment.accessProfileId],
    references: [accessProfiles.id]
  }),
  managementDriver: one(managementDrivers, {
    fields: [networkEquipment.managementDriverId],
    references: [managementDrivers.id]
  }),
  parentEquipment: one(networkEquipment, {
    fields: [networkEquipment.parentEquipmentId],
    references: [networkEquipment.id],
    relationName: 'equipmentParent'
  }),
  childEquipment: many(networkEquipment, { relationName: 'equipmentParent' }),
  service: one(customerServices, {
    fields: [networkEquipment.id],
    references: [customerServices.equipmentId]
  }),
  customerDevices: many(customerDevices, { relationName: 'customerDeviceBackbone' }),
  onuCustomerDevices: many(customerDevices, { relationName: 'customerDeviceOnu' }),
  profileBindings: many(accessProfileDeviceBindings),
  automationScripts: many(automationScripts),
  diagnosticRuns: many(diagnosticRuns),
  importRuns: many(importRuns),
  netflowInterfaceSamples: many(netflowInterfaceSamples),
  dhcpActiveUserSnapshots: many(dhcpActiveUserSnapshots),
  ownedIpNetworks: many(ipNetworks),
  ipAddresses: many(ipAddresses),
  macAddresses: many(macAddresses),
  ftthOlt: one(ftthOlts, {
    fields: [networkEquipment.id],
    references: [ftthOlts.networkEquipmentId]
  }),
  ftthOnus: many(ftthOnus),
  transparentBackboneLinks: many(ftthTransparentLinks)
}))

export const ipNetworksRelations = relations(ipNetworks, ({ one, many }) => ({
  ownerNode: one(networkNodes, {
    fields: [ipNetworks.ownerNodeId],
    references: [networkNodes.id]
  }),
  ownerEquipment: one(networkEquipment, {
    fields: [ipNetworks.ownerEquipmentId],
    references: [networkEquipment.id]
  }),
  addresses: many(ipAddresses)
}))

export const ftthOltsRelations = relations(ftthOlts, ({ one, many }) => ({
  equipment: one(networkEquipment, {
    fields: [ftthOlts.networkEquipmentId],
    references: [networkEquipment.id]
  }),
  ponPorts: many(ftthPonPorts)
}))

export const ftthPonPortsRelations = relations(ftthPonPorts, ({ one, many }) => ({
  olt: one(ftthOlts, {
    fields: [ftthPonPorts.oltId],
    references: [ftthOlts.id]
  }),
  onus: many(ftthOnus)
}))

export const ftthOnusRelations = relations(ftthOnus, ({ one, many }) => ({
  ponPort: one(ftthPonPorts, {
    fields: [ftthOnus.ponPortId],
    references: [ftthPonPorts.id]
  }),
  equipment: one(networkEquipment, {
    fields: [ftthOnus.networkEquipmentId],
    references: [networkEquipment.id]
  }),
  ipHosts: many(ftthOnuIpHosts),
  macs: many(ftthOnuMacs),
  transparentLinks: many(ftthTransparentLinks),
  customerDevices: many(customerDevices)
}))

export const ftthOnuIpHostsRelations = relations(ftthOnuIpHosts, ({ one }) => ({
  onu: one(ftthOnus, {
    fields: [ftthOnuIpHosts.onuId],
    references: [ftthOnus.id]
  })
}))

export const ftthOnuMacsRelations = relations(ftthOnuMacs, ({ one }) => ({
  onu: one(ftthOnus, {
    fields: [ftthOnuMacs.onuId],
    references: [ftthOnus.id]
  })
}))

export const accessProfileDeviceBindingsRelations = relations(accessProfileDeviceBindings, ({ one }) => ({
  profile: one(accessProfiles, {
    fields: [accessProfileDeviceBindings.profileId],
    references: [accessProfiles.id]
  }),
  model: one(deviceModels, {
    fields: [accessProfileDeviceBindings.modelId],
    references: [deviceModels.id]
  }),
  equipment: one(networkEquipment, {
    fields: [accessProfileDeviceBindings.equipmentId],
    references: [networkEquipment.id]
  })
}))

export const automationScriptsRelations = relations(automationScripts, ({ one }) => ({
  profile: one(accessProfiles, {
    fields: [automationScripts.profileId],
    references: [accessProfiles.id]
  }),
  equipment: one(networkEquipment, {
    fields: [automationScripts.equipmentId],
    references: [networkEquipment.id]
  })
}))

export const customersRelations = relations(customers, ({ one, many }) => ({
  services: many(customerServices),
  customerDevices: many(customerDevices),
  subscriptions: many(subscriptions),
  documents: many(documents),
  payments: many(payments),
  netflowRawFlows: many(netflowRawFlows),
  netflowFlowRollups: many(netflowFlowRollups),
  billingTerytArea: one(terytAreas, {
    fields: [customers.billingTerytAreaId],
    references: [terytAreas.id]
  }),
  billingSimcLocality: one(simcLocalities, {
    fields: [customers.billingSimcLocalityId],
    references: [simcLocalities.id]
  }),
  billingStreet: one(ulicStreets, {
    fields: [customers.billingStreetId],
    references: [ulicStreets.id]
  }),
  portalUser: one(portalUsers, {
    fields: [customers.id],
    references: [portalUsers.customerId]
  })
}))

export const customerDevicesRelations = relations(customerDevices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [customerDevices.customerId],
    references: [customers.id]
  }),
  equipment: one(networkEquipment, {
    fields: [customerDevices.equipmentId],
    references: [networkEquipment.id],
    relationName: 'customerDeviceBackbone'
  }),
  onuEquipment: one(networkEquipment, {
    fields: [customerDevices.onuEquipmentId],
    references: [networkEquipment.id],
    relationName: 'customerDeviceOnu'
  }),
  ftthOnu: one(ftthOnus, {
    fields: [customerDevices.ftthOnuId],
    references: [ftthOnus.id]
  }),
  subscriptions: many(subscriptions),
  diagnosticRuns: many(diagnosticRuns),
  netflowRawFlows: many(netflowRawFlows),
  netflowFlowRollups: many(netflowFlowRollups),
  ipAddresses: many(ipAddresses),
  macAddresses: many(macAddresses),
  transparentLinks: many(ftthTransparentLinks)
}))

export const ftthTransparentLinksRelations = relations(ftthTransparentLinks, ({ one }) => ({
  onu: one(ftthOnus, {
    fields: [ftthTransparentLinks.onuId],
    references: [ftthOnus.id]
  }),
  customerDevice: one(customerDevices, {
    fields: [ftthTransparentLinks.customerDeviceId],
    references: [customerDevices.id]
  }),
  backboneEquipment: one(networkEquipment, {
    fields: [ftthTransparentLinks.backboneEquipmentId],
    references: [networkEquipment.id]
  })
}))

export const netflowRawFlowsRelations = relations(netflowRawFlows, ({ one }) => ({
  customerDevice: one(customerDevices, {
    fields: [netflowRawFlows.customerDeviceId],
    references: [customerDevices.id]
  }),
  customer: one(customers, {
    fields: [netflowRawFlows.customerId],
    references: [customers.id]
  })
}))

export const netflowFlowRollupsRelations = relations(netflowFlowRollups, ({ one }) => ({
  customerDevice: one(customerDevices, {
    fields: [netflowFlowRollups.customerDeviceId],
    references: [customerDevices.id]
  }),
  customer: one(customers, {
    fields: [netflowFlowRollups.customerId],
    references: [customers.id]
  })
}))

export const netflowInterfaceSamplesRelations = relations(netflowInterfaceSamples, ({ one }) => ({
  equipment: one(networkEquipment, {
    fields: [netflowInterfaceSamples.equipmentId],
    references: [networkEquipment.id]
  })
}))

export const dhcpActiveUserSnapshotsRelations = relations(dhcpActiveUserSnapshots, ({ one, many }) => ({
  equipment: one(networkEquipment, {
    fields: [dhcpActiveUserSnapshots.equipmentId],
    references: [networkEquipment.id]
  }),
  scopeCounts: many(dhcpActiveUserScopeCounts)
}))

export const dhcpActiveUserScopeCountsRelations = relations(dhcpActiveUserScopeCounts, ({ one }) => ({
  snapshot: one(dhcpActiveUserSnapshots, {
    fields: [dhcpActiveUserScopeCounts.snapshotId],
    references: [dhcpActiveUserSnapshots.id]
  })
}))

export const authGroupsRelations = relations(authGroups, ({ many }) => ({
  users: many(authUsers)
}))

export const authUsersRelations = relations(authUsers, ({ one }) => ({
  group: one(authGroups, {
    fields: [authUsers.groupId],
    references: [authGroups.id]
  })
}))

export const tariffsRelations = relations(tariffs, ({ many }) => ({
  subscriptions: many(subscriptions),
  documentItems: many(documentItems)
}))

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  documentItems: many(documentItems),
  customer: one(customers, {
    fields: [subscriptions.customerId],
    references: [customers.id]
  }),
  customerDevice: one(customerDevices, {
    fields: [subscriptions.customerDeviceId],
    references: [customerDevices.id]
  }),
  tariff: one(tariffs, {
    fields: [subscriptions.tariffId],
    references: [tariffs.id]
  })
}))

export const customerServicesRelations = relations(customerServices, ({ one }) => ({
  customer: one(customers, {
    fields: [customerServices.customerId],
    references: [customers.id]
  }),
  profile: one(accessProfiles, {
    fields: [customerServices.profileId],
    references: [accessProfiles.id]
  }),
  equipment: one(networkEquipment, {
    fields: [customerServices.equipmentId],
    references: [networkEquipment.id]
  }),
  serviceTerytArea: one(terytAreas, {
    fields: [customerServices.serviceTerytAreaId],
    references: [terytAreas.id]
  }),
  serviceSimcLocality: one(simcLocalities, {
    fields: [customerServices.serviceSimcLocalityId],
    references: [simcLocalities.id]
  }),
  serviceStreet: one(ulicStreets, {
    fields: [customerServices.serviceStreetId],
    references: [ulicStreets.id]
  })
}))

export const diagnosticRunsRelations = relations(diagnosticRuns, ({ one }) => ({
  customerDevice: one(customerDevices, {
    fields: [diagnosticRuns.customerDeviceId],
    references: [customerDevices.id]
  }),
  equipment: one(networkEquipment, {
    fields: [diagnosticRuns.equipmentId],
    references: [networkEquipment.id]
  })
}))

export const importRunsRelations = relations(importRuns, ({ one }) => ({
  equipment: one(networkEquipment, {
    fields: [importRuns.equipmentId],
    references: [networkEquipment.id]
  })
}))

export const ipAddressesRelations = relations(ipAddresses, ({ one }) => ({
  network: one(ipNetworks, {
    fields: [ipAddresses.networkId],
    references: [ipNetworks.id]
  }),
  customerDevice: one(customerDevices, {
    fields: [ipAddresses.customerDeviceId],
    references: [customerDevices.id]
  }),
  equipment: one(networkEquipment, {
    fields: [ipAddresses.equipmentId],
    references: [networkEquipment.id]
  }),
  importRun: one(importRuns, {
    fields: [ipAddresses.importRunId],
    references: [importRuns.id]
  })
}))

export const macAddressesRelations = relations(macAddresses, ({ one }) => ({
  customerDevice: one(customerDevices, {
    fields: [macAddresses.customerDeviceId],
    references: [customerDevices.id]
  }),
  equipment: one(networkEquipment, {
    fields: [macAddresses.equipmentId],
    references: [networkEquipment.id]
  }),
  importRun: one(importRuns, {
    fields: [macAddresses.importRunId],
    references: [importRuns.id]
  })
}))

export const portalUsersRelations = relations(portalUsers, ({ one }) => ({
  customer: one(customers, {
    fields: [portalUsers.customerId],
    references: [customers.id]
  })
}))

export const operatorCitiesRelations = relations(operatorCities, () => ({}))

export const numberPlansRelations = relations(numberPlans, ({ many }) => ({
  documents: many(documents)
}))

export const documentsRelations = relations(documents, ({ one, many }) => ({
  numberPlan: one(numberPlans, {
    fields: [documents.numberPlanId],
    references: [numberPlans.id]
  }),
  customer: one(customers, {
    fields: [documents.customerId],
    references: [customers.id]
  }),
  referenceDocument: one(documents, {
    fields: [documents.referenceDocumentId],
    references: [documents.id],
    relationName: 'documentReference'
  }),
  referencedBy: many(documents, { relationName: 'documentReference' }),
  items: many(documentItems),
  payments: many(payments)
}))

export const documentItemsRelations = relations(documentItems, ({ one }) => ({
  document: one(documents, {
    fields: [documentItems.documentId],
    references: [documents.id]
  }),
  subscription: one(subscriptions, {
    fields: [documentItems.subscriptionId],
    references: [subscriptions.id]
  }),
  tariff: one(tariffs, {
    fields: [documentItems.tariffId],
    references: [tariffs.id]
  })
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  customer: one(customers, {
    fields: [payments.customerId],
    references: [customers.id]
  }),
  document: one(documents, {
    fields: [payments.documentId],
    references: [documents.id]
  })
}))

export const ticketCategoriesRelations = relations(ticketCategories, ({ many }) => ({
  tickets: many(tickets)
}))

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  customer: one(customers, {
    fields: [tickets.customerId],
    references: [customers.id]
  }),
  category: one(ticketCategories, {
    fields: [tickets.categoryId],
    references: [ticketCategories.id]
  }),
  messages: many(ticketMessages)
}))

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id]
  })
}))

export const smtpConfigsRelations = relations(smtpConfigs, ({ many }) => ({
  templates: many(emailTemplates)
}))

export const emailTemplatesRelations = relations(emailTemplates, ({ one, many }) => ({
  smtpConfig: one(smtpConfigs, {
    fields: [emailTemplates.smtpConfigId],
    references: [smtpConfigs.id]
  }),
  notificationRules: many(notificationRules),
  emailLogs: many(emailLogs)
}))

export const notificationRulesRelations = relations(notificationRules, ({ one }) => ({
  template: one(emailTemplates, {
    fields: [notificationRules.templateId],
    references: [emailTemplates.id]
  })
}))

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  template: one(emailTemplates, {
    fields: [emailLogs.templateId],
    references: [emailTemplates.id]
  })
}))
