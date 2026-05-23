import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { accessProfiles, deviceModels, deviceTypes, managementDrivers, networkEquipment, networkNodes } from '../server/db/schema'
import { db, pool } from '../server/utils/db'
import { encryptAccessProfileSecrets } from '../server/utils/secrets'

async function findOrCreateType(name: string, category: 'SZKIELETOWE' | 'KLIENCKIE', description: string) {
  const [created] = await db.insert(deviceTypes).values({ name, category, description }).onConflictDoNothing().returning()
  return created || await db.query.deviceTypes.findFirst({ where: eq(deviceTypes.name, name) })
}

async function findOrCreateModel(typeId: number, manufacturer: string, modelName: string) {
  const [created] = await db.insert(deviceModels).values({ typeId, manufacturer, modelName }).onConflictDoNothing().returning()
  return created || await db.query.deviceModels.findFirst({ where: eq(deviceModels.modelName, modelName) })
}

async function findOrCreateProfile(input: {
  name: string
  description: string
  defaultProtocol: 'routeros' | 'ssh'
  defaultPort: number
  username: string
  password: string
}) {
  const values = encryptAccessProfileSecrets({
    name: input.name,
    description: input.description,
    defaultProtocol: input.defaultProtocol,
    defaultPort: input.defaultPort,
    username: input.username,
    passwordEncrypted: input.password,
    isActive: true
  })
  const [created] = await db.insert(accessProfiles).values(values).onConflictDoNothing().returning()
  const profile = created || await db.query.accessProfiles.findFirst({ where: eq(accessProfiles.name, input.name) })
  if (!profile) throw new Error(`Profile not found: ${input.name}`)

  await db.update(accessProfiles).set(values).where(eq(accessProfiles.id, profile.id))
  return profile
}

async function upsertEquipment(input: {
  inventoryId: string
  modelId: number
  nodeId: string
  accessProfileId: number
  managementDriverId: number
  hostname: string
  managementIp: string
  managementPort: number
  managementProtocol: 'ssh'
  notes: string
}) {
  const values = {
    inventoryId: input.inventoryId,
    modelId: input.modelId,
    nodeId: input.nodeId,
    accessProfileId: input.accessProfileId,
    managementDriverId: input.managementDriverId,
    hostname: input.hostname,
    managementIp: input.managementIp,
    managementPort: input.managementPort,
    managementProtocol: input.managementProtocol,
    equipmentRole: 'BACKBONE' as const,
    status: 'IN_USE' as const,
    notes: input.notes
  }
  const [created] = await db.insert(networkEquipment).values(values).onConflictDoNothing().returning()
  const equipment = created || await db.query.networkEquipment.findFirst({ where: eq(networkEquipment.inventoryId, input.inventoryId) })
  if (!equipment) throw new Error(`Equipment not found: ${input.inventoryId}`)

  await db.update(networkEquipment).set(values).where(eq(networkEquipment.id, equipment.id))
  return equipment
}

function inventoryId(prefix: string, ip: string) {
  return `${prefix}-${ip.replaceAll('.', '-')}`
}

async function main() {
  const mikrotikPassword = process.env.MT_PASS
  const dasanPassword = process.env.DASAN_PASS
  if (!mikrotikPassword || !dasanPassword) throw new Error('Set MT_PASS and DASAN_PASS before running this script')

  const coreNode = await db.query.networkNodes.findFirst({ where: eq(networkNodes.inventoryId, 'NODE-CORE-001') })
  if (!coreNode) throw new Error('NODE-CORE-001 not found')

  const mikrotikDriver = await db.query.managementDrivers.findFirst({ where: eq(managementDrivers.code, 'mikrotik_v7') })
  const dasanDriver = await db.query.managementDrivers.findFirst({ where: eq(managementDrivers.code, 'dasan_nos') })
  if (!mikrotikDriver || !dasanDriver) throw new Error('Management drivers are missing')

  const routerType = await findOrCreateType('Router', 'SZKIELETOWE', 'Router szkieletowy/brzegowy zdalnie zarządzany.')
  const dasanType = await findOrCreateType('Dasan OLT', 'SZKIELETOWE', 'OLT Dasan zarządzany przez SSH.')
  if (!routerType || !dasanType) throw new Error('Device types are missing')

  const mikrotikModel = await findOrCreateModel(routerType.id, 'MikroTik', 'RouterOS managed device')
  const dasanModel = await findOrCreateModel(dasanType.id, 'Dasan', 'Dasan NOS OLT')
  if (!mikrotikModel || !dasanModel) throw new Error('Device models are missing')

  const mikrotikProfile = await findOrCreateProfile({
    name: 'MikroTik RouterOS API - admin',
    description: 'Profil admin dla RouterOS API na urządzeniach 10.0.222.0/24.',
    defaultProtocol: 'routeros',
    defaultPort: 8728,
    username: 'admin',
    password: mikrotikPassword
  })
  const dasanProfile = await findOrCreateProfile({
    name: 'Dasan SSH 22502 - admin',
    description: 'Profil admin SSH dla OLT Dasan na porcie 22502.',
    defaultProtocol: 'ssh',
    defaultPort: 22502,
    username: 'admin',
    password: dasanPassword
  })

  const equipment = []
  for (const ip of ['10.0.222.86', '10.0.222.4']) {
    equipment.push(await upsertEquipment({
      inventoryId: inventoryId('MT', ip),
      modelId: mikrotikModel.id,
      nodeId: coreNode.id,
      accessProfileId: mikrotikProfile.id,
      managementDriverId: mikrotikDriver.id,
      hostname: `mikrotik-${ip.replaceAll('.', '-')}.local`,
      managementIp: ip,
      managementPort: 8728,
      managementProtocol: 'ssh',
      notes: 'MikroTik dodany z danych operatora; importy używają RouterOS API.'
    }))
  }

  for (const ip of ['10.0.222.16', '10.0.222.108']) {
    equipment.push(await upsertEquipment({
      inventoryId: inventoryId('DASAN', ip),
      modelId: dasanModel.id,
      nodeId: coreNode.id,
      accessProfileId: dasanProfile.id,
      managementDriverId: dasanDriver.id,
      hostname: `dasan-${ip.replaceAll('.', '-')}.local`,
      managementIp: ip,
      managementPort: 22502,
      managementProtocol: 'ssh',
      notes: 'Dasan OLT dodany z danych operatora; SSH na porcie 22502.'
    }))
  }

  console.log(JSON.stringify({
    profiles: [mikrotikProfile.name, dasanProfile.name],
    equipment: equipment.map(row => ({
      inventoryId: row.inventoryId,
      managementIp: row.managementIp,
      managementPort: row.managementPort
    }))
  }, null, 2))
}

main()
  .then(() => pool.end())
  .catch(async (error) => {
    await pool.end()
    console.error(error)
    process.exit(1)
  })
