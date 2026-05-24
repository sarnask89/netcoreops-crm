import 'dotenv/config'
import { and, eq } from 'drizzle-orm'
import { GPON_RX_REFRESH_SCRIPT_BODY } from '../automation/gpon-rx-script-template'
import { db, pool } from '../utils/db'
import {
  accessProfileDeviceBindings,
  accessProfiles,
  automationScripts,
  automationVariableDefinitions,
  customerDevices,
  customers,
  customerServices,
  deviceModels,
  deviceTypes,
  managementDrivers,
  networkEquipment,
  networkLines,
  networkNodes,
  simcLocalities,
  subscriptions,
  tariffs,
  terytAreas,
  ukeMediumTypes,
  ukeTechnologyTypes,
  ulicStreets
} from './schema'
import { encryptAccessProfileSecrets } from '../utils/secrets'

async function seed() {
  const [fiber] = await db.insert(ukeMediumTypes).values({
    code: 'FO',
    label: 'Światłowód',
    description: 'Medium transmisyjne raportowane do PIT.'
  }).onConflictDoNothing().returning()
  const existingFiber = fiber || await db.query.ukeMediumTypes.findFirst({ where: eq(ukeMediumTypes.code, 'FO') })

  const [ftth] = await db.insert(ukeTechnologyTypes).values({
    code: 'FTTH',
    label: 'FTTH',
    description: 'Dostęp światłowodowy do lokalu abonenta.'
  }).onConflictDoNothing().returning()
  const existingFtth = ftth || await db.query.ukeTechnologyTypes.findFirst({ where: eq(ukeTechnologyTypes.code, 'FTTH') })

  const existingArea = await db.query.terytAreas.findFirst({ where: eq(terytAreas.terytCode, '2609011') })
  const existingLocality = await db.query.simcLocalities.findFirst({ where: eq(simcLocalities.simcCode, '0980926') })
  const existingStreet = await db.query.ulicStreets.findFirst({ where: eq(ulicStreets.ulicCode, '11205') })

  if (!existingFiber || !existingFtth) throw new Error('Unable to seed dictionary data')
  if (!existingArea || !existingLocality || !existingStreet) {
    throw new Error('Run db:import:sandomierz before db:seed to load local TERYT/SIMC/ULIC definitions')
  }

  const [oltType] = await db.insert(deviceTypes).values({
    name: 'OLT',
    category: 'SZKIELETOWE',
    description: 'Urządzenie agregujące sieć PON.'
  }).onConflictDoNothing().returning()
  const existingOltType = oltType || await db.query.deviceTypes.findFirst({ where: eq(deviceTypes.name, 'OLT') })

  const [cpeType] = await db.insert(deviceTypes).values({
    name: 'ONT/CPE',
    category: 'KLIENCKIE',
    description: 'Punkt elastyczności po stronie abonenta.'
  }).onConflictDoNothing().returning()
  const existingCpeType = cpeType || await db.query.deviceTypes.findFirst({ where: eq(deviceTypes.name, 'ONT/CPE') })

  if (!existingOltType || !existingCpeType) throw new Error('Unable to seed device types')

  const [oltModel] = await db.insert(deviceModels).values({
    typeId: existingOltType.id,
    technologyTypeId: existingFtth.id,
    manufacturer: 'Ubiquiti',
    modelName: 'UFiber OLT',
    portsUpstream: 2,
    portsDownstream: 8,
    throughputCapabilities: { downstreamGbps: 10, upstreamGbps: 10 }
  }).onConflictDoNothing().returning()
  const existingOltModel = oltModel || await db.query.deviceModels.findFirst({ where: eq(deviceModels.modelName, 'UFiber OLT') })

  const [ontModel] = await db.insert(deviceModels).values({
    typeId: existingCpeType.id,
    technologyTypeId: existingFtth.id,
    manufacturer: 'Huawei',
    modelName: 'EG8145V5',
    portsUpstream: 1,
    portsDownstream: 4,
    throughputCapabilities: { downstreamMbps: 1000, upstreamMbps: 300 }
  }).onConflictDoNothing().returning()
  const existingOntModel = ontModel || await db.query.deviceModels.findFirst({ where: eq(deviceModels.modelName, 'EG8145V5') })

  const driverSeeds = [
    { code: 'mock', label: 'Mock / testowy', transport: 'mock', capabilities: { diagnostics: true, imports: true } },
    { code: 'mikrotik_v7', label: 'MikroTik RouterOS v7', transport: 'routeros-api', capabilities: { ping: true, arpPing: true, dhcp: true, bridgeHost: true } },
    { code: 'dasan_nos', label: 'Dasan NOS OLT', transport: 'ssh', capabilities: { onuInfo: true, macTable: true } },
    { code: 'snmp_generic', label: 'SNMP generic', transport: 'snmp', capabilities: { fdb: true } },
    { code: 'ssh_generic', label: 'SSH generic', transport: 'ssh', capabilities: { commands: true } },
    { code: 'http_api', label: 'HTTP API', transport: 'http', capabilities: { api: true } },
    { code: 'tr069', label: 'TR-069', transport: 'cwmp', capabilities: { cpe: true } },
    { code: 'netconf', label: 'NETCONF', transport: 'netconf', capabilities: { config: true } }
  ]

  for (const driver of driverSeeds) {
    await db.insert(managementDrivers).values(driver).onConflictDoNothing()
  }

  const existingMikrotikDriver = await db.query.managementDrivers.findFirst({ where: eq(managementDrivers.code, 'mikrotik_v7') })
  const existingDasanDriver = await db.query.managementDrivers.findFirst({ where: eq(managementDrivers.code, 'dasan_nos') })

  const [profile] = await db.insert(accessProfiles).values(encryptAccessProfileSecrets({
    name: 'MikroTik API default',
    description: 'Profil dostępu do RouterOS API używany przez importy i diagnostykę.',
    defaultProtocol: 'routeros',
    defaultPort: 8728,
    username: 'admin',
    passwordEncrypted: 'admin',
    isActive: true
  })).onConflictDoNothing().returning()
  const existingProfile = profile || await db.query.accessProfiles.findFirst({ where: eq(accessProfiles.name, 'MikroTik API default') })

  if (!existingOltModel || !existingOntModel || !existingProfile) throw new Error('Unable to seed models/profile')

  await db.update(accessProfiles).set(encryptAccessProfileSecrets({
    description: 'Profil dostępu do RouterOS API używany przez importy i diagnostykę.',
    defaultProtocol: 'routeros',
    defaultPort: 8728,
    username: 'admin',
    passwordEncrypted: 'admin',
    isActive: true
  })).where(eq(accessProfiles.id, existingProfile.id))

  const [tariff] = await db.insert(tariffs).values({
    name: 'FTTH 1000/300',
    serviceType: 'internet',
    defaultNetPrice: '0',
    vatRate: '23',
    downloadMbps: 1000,
    uploadMbps: 300,
    queueName: 'FTTH_1000_300',
    description: 'Taryfa internetowa przeniesiona z dawnego profilu prędkości.'
  }).onConflictDoNothing().returning()
  const existingTariff = tariff || await db.query.tariffs.findFirst({ where: eq(tariffs.name, 'FTTH 1000/300') })
  if (!existingTariff) throw new Error('Unable to seed tariff')

  const [coreNode] = await db.insert(networkNodes).values({
    inventoryId: 'NODE-CORE-001',
    name: 'POP Sandomierz Core',
    nodeType: 'SZKIELETOWY',
    mediumTypeId: existingFiber.id,
    terytAreaId: existingArea.id,
    simcLocalityId: existingLocality.id,
    streetId: existingStreet.id,
    buildingNumber: '1',
    latitude: 50.6827,
    longitude: 21.7489,
    status: 'ACTIVE'
  }).onConflictDoNothing().returning()
  const existingCoreNode = coreNode || await db.query.networkNodes.findFirst({ where: eq(networkNodes.inventoryId, 'NODE-CORE-001') })

  const [distNode] = await db.insert(networkNodes).values({
    inventoryId: 'NODE-DIST-001',
    name: 'Szafa dystrybucyjna Sandomierz',
    nodeType: 'DYSTRYBUCYJNY',
    mediumTypeId: existingFiber.id,
    terytAreaId: existingArea.id,
    simcLocalityId: existingLocality.id,
    streetId: existingStreet.id,
    buildingNumber: '10',
    latitude: 50.6817,
    longitude: 21.7468,
    status: 'ACTIVE'
  }).onConflictDoNothing().returning()
  const existingDistNode = distNode || await db.query.networkNodes.findFirst({ where: eq(networkNodes.inventoryId, 'NODE-DIST-001') })

  if (!existingCoreNode || !existingDistNode) throw new Error('Unable to seed nodes')

  await db.update(networkNodes).set({
    name: 'POP Sandomierz Core',
    terytAreaId: existingArea.id,
    simcLocalityId: existingLocality.id,
    streetId: existingStreet.id,
    buildingNumber: '1',
    latitude: 50.6827,
    longitude: 21.7489,
    status: 'ACTIVE'
  }).where(eq(networkNodes.inventoryId, 'NODE-CORE-001'))

  await db.update(networkNodes).set({
    name: 'Szafa dystrybucyjna Sandomierz',
    terytAreaId: existingArea.id,
    simcLocalityId: existingLocality.id,
    streetId: existingStreet.id,
    buildingNumber: '10',
    latitude: 50.6817,
    longitude: 21.7468,
    status: 'ACTIVE'
  }).where(eq(networkNodes.inventoryId, 'NODE-DIST-001'))

  await db.insert(networkLines).values({
    inventoryId: 'LINE-FO-001',
    nodeStartId: existingCoreNode.id,
    nodeEndId: existingDistNode.id,
    mediumTypeId: existingFiber.id,
    fiberCount: 24,
    lengthMeters: 1850,
    status: 'ACTIVE'
  }).onConflictDoNothing()

  const [olt] = await db.insert(networkEquipment).values({
    inventoryId: 'OLT-001',
    modelId: existingOltModel.id,
    nodeId: existingCoreNode.id,
    hostname: 'olt-core-001.sandomierz.local',
    managementIp: '10.0.0.2',
    managementPort: 22,
    managementProtocol: 'ssh',
    accessProfileId: existingProfile.id,
    managementDriverId: existingDasanDriver?.id || existingMikrotikDriver?.id,
    serialNumber: 'OLT001',
    equipmentRole: 'BACKBONE',
    status: 'IN_USE'
  }).onConflictDoNothing().returning()
  const existingOlt = olt || await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.inventoryId, 'OLT-001') })

  const [cpe] = await db.insert(networkEquipment).values({
    inventoryId: 'CPE-001',
    modelId: existingOntModel.id,
    nodeId: existingDistNode.id,
    hostname: 'cpe-001.sandomierz.local',
    managementIp: '10.0.10.2',
    managementPort: 22,
    managementProtocol: 'ssh',
    macAddress: '00:11:22:33:44:55',
    serialNumber: 'ONT001',
    equipmentRole: 'CLIENT_PE',
    status: 'IN_USE'
  }).onConflictDoNothing().returning()
  const existingCpe = cpe || await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.inventoryId, 'CPE-001') })

  if (existingOlt) {
    await db.update(networkEquipment).set({
      modelId: existingOltModel.id,
      nodeId: existingCoreNode.id,
      hostname: 'olt-core-001.sandomierz.local',
      managementIp: '10.0.0.2',
      managementPort: 22,
      managementProtocol: 'ssh',
      accessProfileId: existingProfile.id,
      managementDriverId: existingDasanDriver?.id || existingMikrotikDriver?.id,
      equipmentRole: 'BACKBONE',
      status: 'IN_USE'
    }).where(eq(networkEquipment.id, existingOlt.id))
  }

  if (existingCpe) {
    await db.update(networkEquipment).set({
      modelId: existingOntModel.id,
      nodeId: existingDistNode.id,
      hostname: 'cpe-001.sandomierz.local',
      managementIp: '10.0.10.2',
      managementPort: 22,
      managementProtocol: 'ssh',
      equipmentRole: 'CLIENT_PE',
      status: 'IN_USE'
    }).where(eq(networkEquipment.id, existingCpe.id))
  }

  await db.insert(accessProfileDeviceBindings).values({
    profileId: existingProfile.id,
    modelId: existingOntModel.id,
    managementProtocol: 'ssh',
    configTemplate: 'profile={{profile.name}}\nhost={{device.hostname}}',
    configPayload: { vendor: 'huawei', mode: 'ftth-cpe' },
    priority: 100,
    isActive: true
  }).onConflictDoNothing()

  if (existingCpe) {
    await db.insert(accessProfileDeviceBindings).values({
      profileId: existingProfile.id,
      equipmentId: existingCpe.id,
      managementProtocol: 'ssh',
      configTemplate: 'device={{device.inventoryId}}\nip={{device.managementIp}}\naction=apply-access-profile',
      configPayload: { dryRun: true },
      priority: 10,
      isActive: true
    }).onConflictDoNothing()
  }

  if (existingOlt) {
    await db.insert(automationScripts).values({
      name: 'Reguła DHCP dla CPE',
      scope: 'DEVICE',
      triggerType: 'MANUAL',
      scriptLanguage: 'bash',
      scriptBody: 'if $deviceaccess=true [ ip dhcp-server lease add mac-address={{usermac}} ip-address={{userip}} comment={{userid}} rate-limit={{tarupload}}/{{tardownload}} ]',
      equipmentId: existingOlt.id,
      isEnabled: false,
      timeoutSeconds: 60
    }).onConflictDoNothing()

    await db.update(automationScripts).set({
      scriptBody: 'if $deviceaccess=true [ ip dhcp-server lease add mac-address={{usermac}} ip-address={{userip}} comment={{userid}} rate-limit={{tarupload}}/{{tardownload}} ]',
      equipmentId: existingOlt.id
    }).where(eq(automationScripts.name, 'Reguła DHCP dla CPE'))

    await db.insert(automationScripts).values({
      name: 'GPON RX refresh 30m',
      scope: 'DEVICE',
      triggerType: 'SCHEDULED_30_MIN',
      scriptLanguage: 'typescript',
      scriptBody: GPON_RX_REFRESH_SCRIPT_BODY,
      equipmentId: existingOlt.id,
      isEnabled: true,
      timeoutSeconds: 900
    }).onConflictDoNothing()

    await db.update(automationScripts).set({
      triggerType: 'SCHEDULED_30_MIN',
      scriptLanguage: 'typescript',
      scriptBody: GPON_RX_REFRESH_SCRIPT_BODY,
      equipmentId: existingOlt.id,
      isEnabled: true,
      timeoutSeconds: 900
    }).where(eq(automationScripts.name, 'GPON RX refresh 30m'))
  }

  const [customer] = await db.insert(customers).values({
    fullName: 'NetCore Ops Sandomierz Sp. z o.o.',
    customerType: 'BUSINESS',
    companyName: 'NetCore Ops Sandomierz Sp. z o.o.',
    taxId: '5210000000',
    regon: '260000000',
    krs: '0000000000',
    representativeName: 'Jan Administrator',
    contactEmail: 'noc@example.test',
    contactPhone: '+48220000000',
    billingTerytAreaId: existingArea.id,
    billingSimcLocalityId: existingLocality.id,
    billingStreetId: existingStreet.id,
    billingBuildingNumber: '1',
    billingAddress: 'ul. 11 Listopada 1, Sandomierz'
  }).onConflictDoNothing().returning()
  const existingCustomer = customer || await db.query.customers.findFirst({ where: eq(customers.taxId, '5210000000') })

  if (existingCustomer && existingCpe) {
    await db.update(customers).set({
      fullName: 'NetCore Ops Sandomierz Sp. z o.o.',
      companyName: 'NetCore Ops Sandomierz Sp. z o.o.',
      regon: '260000000',
      krs: '0000000000',
      representativeName: 'Jan Administrator',
      billingTerytAreaId: existingArea.id,
      billingSimcLocalityId: existingLocality.id,
      billingStreetId: existingStreet.id,
      billingBuildingNumber: '1',
      billingAddress: 'ul. 11 Listopada 1, Sandomierz'
    }).where(eq(customers.id, existingCustomer.id))

    await db.update(customerServices).set({
      serviceTerytAreaId: existingArea.id,
      serviceSimcLocalityId: existingLocality.id,
      serviceStreetId: existingStreet.id,
      serviceBuildingNumber: '10',
      serviceApartmentNumber: '2',
      status: 'ACTIVE'
    }).where(eq(customerServices.equipmentId, existingCpe.id))

    await db.insert(customerServices).values({
      customerId: existingCustomer.id,
      profileId: existingProfile.id,
      equipmentId: existingCpe.id,
      serviceTerytAreaId: existingArea.id,
      serviceSimcLocalityId: existingLocality.id,
      serviceStreetId: existingStreet.id,
      serviceBuildingNumber: '10',
      serviceApartmentNumber: '2',
      activationDate: new Date(),
      status: 'ACTIVE'
    }).onConflictDoNothing()

    const [customerDevice] = await db.insert(customerDevices).values({
      customerId: existingCustomer.id,
      equipmentId: existingOlt?.id,
      hostname: 'cpe-001.sandomierz.local',
      ipAddress: '10.0.10.2',
      macAddress: '00:11:22:33:44:55',
      status: 'ACTIVE',
      dhcpServer: 'dhcp-main',
      dhcpInterface: 'bridge1',
      notes: 'Demo urządzenie klienta do diagnostyki i importów.'
    }).onConflictDoNothing().returning()
    const existingCustomerDevice = customerDevice || await db.query.customerDevices.findFirst({ where: eq(customerDevices.macAddress, '00:11:22:33:44:55') })

    if (existingCustomerDevice && existingTariff) {
      const existingSubscription = await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.customerDeviceId, existingCustomerDevice.id),
          eq(subscriptions.tariffId, existingTariff.id)
        )
      })

      if (!existingSubscription) {
        await db.insert(subscriptions).values({
          customerId: existingCustomer.id,
          customerDeviceId: existingCustomerDevice.id,
          tariffId: existingTariff.id,
          status: 'ACTIVE'
        })
      }
    }
  }

  const variableDefinitions = [
    {
      variableName: 'deviceaccess',
      label: 'Dostęp do urządzenia aktywny',
      valueType: 'bool',
      sourceType: 'STATIC',
      staticValue: 'true'
    },
    {
      variableName: 'usermac',
      label: 'MAC CPE',
      valueType: 'string',
      sourceType: 'DATABASE',
      tableName: 'network_equipment',
      rowLookupColumn: 'inventoryId',
      rowLookupValue: 'CPE-001',
      fieldName: 'macAddress'
    },
    {
      variableName: 'userip',
      label: 'IP CPE',
      valueType: 'string',
      sourceType: 'DATABASE',
      tableName: 'network_equipment',
      rowLookupColumn: 'inventoryId',
      rowLookupValue: 'CPE-001',
      fieldName: 'managementIp'
    },
    {
      variableName: 'userid',
      label: 'Identyfikator klienta',
      valueType: 'string',
      sourceType: 'DATABASE',
      tableName: 'customers',
      rowLookupColumn: 'taxId',
      rowLookupValue: '5210000000',
      fieldName: 'fullName'
    },
    {
      variableName: 'tarupload',
      label: 'Upload profilu',
      valueType: 'int',
      sourceType: 'DATABASE',
      tableName: 'tariffs',
      rowLookupColumn: 'name',
      rowLookupValue: 'FTTH 1000/300',
      fieldName: 'uploadMbps'
    },
    {
      variableName: 'tardownload',
      label: 'Download profilu',
      valueType: 'int',
      sourceType: 'DATABASE',
      tableName: 'tariffs',
      rowLookupColumn: 'name',
      rowLookupValue: 'FTTH 1000/300',
      fieldName: 'downloadMbps'
    }
  ]

  for (const definition of variableDefinitions) {
    await db.insert(automationVariableDefinitions).values(definition).onConflictDoNothing()
    await db.update(automationVariableDefinitions)
      .set(definition)
      .where(eq(automationVariableDefinitions.variableName, definition.variableName))
  }
}

seed()
  .then(async () => {
    await pool.end()
    console.log('Seed completed')
  })
  .catch(async (error) => {
    await pool.end()
    console.error(error)
    process.exit(1)
  })
