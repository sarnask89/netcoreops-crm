import 'dotenv/config'
import { and, eq } from 'drizzle-orm'
import { dhcpActiveUserScopeCounts, dhcpActiveUserSnapshots, diagnosticRuns } from '../server/db/schema'
import { db, pool } from '../server/utils/db'
import { getDriverForEquipment } from '../server/utils/network-driver-context'

interface PreviousActiveRun {
  data?: {
    activeKeys?: string[]
  }
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

function groupCount<T>(items: T[], key: (item: T) => string | undefined) {
  const map = new Map<string, number>()
  for (const item of items) {
    const name = key(item)
    if (!name) continue
    map.set(name, (map.get(name) || 0) + 1)
  }
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
}

function dedupeActiveUsers<T extends { macAddress: string, server?: string, serverInterface?: string, evidence: string[] }>(users: T[]) {
  const usersByMac = new Map<string, T>()
  for (const user of users) {
    const existing = usersByMac.get(user.macAddress)
    if (!existing) {
      usersByMac.set(user.macAddress, user)
      continue
    }
    const merged = {
      ...existing,
      server: existing.server || user.server,
      serverInterface: existing.serverInterface || user.serverInterface,
      evidence: unique([...existing.evidence, ...user.evidence])
    }
    usersByMac.set(user.macAddress, merged)
  }
  return [...usersByMac.values()]
}

async function loadPreviousActiveKeys(equipmentId: string) {
  const previous = await db.query.diagnosticRuns.findFirst({
    where: and(
      eq(diagnosticRuns.equipmentId, equipmentId),
      eq(diagnosticRuns.runType, 'dhcp-active-users')
    ),
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  })
  const result = previous?.result as PreviousActiveRun | null
  return new Set(result?.data?.activeKeys || [])
}

async function main() {
  const inventoryIds = process.argv
    .slice(2)
    .filter(arg => !arg.startsWith('--'))
  const equipmentRows = await db.query.networkEquipment.findMany({
    with: {
      managementDriver: true
    },
    orderBy: (table, { asc }) => [asc(table.inventoryId)]
  })
  const selectedRows = inventoryIds.length
    ? equipmentRows.filter(row => inventoryIds.includes(row.inventoryId))
    : equipmentRows.filter(row => row.status === 'IN_USE' && (row.managementDriver?.code === 'mikrotik_v7' || row.managementProtocol === 'routeros'))
  const results = []

  for (const equipment of selectedRows) {
    const { driver, driverCode } = await getDriverForEquipment(equipment.id)
    const previousKeys = await loadPreviousActiveKeys(equipment.id)
    const snapshot = await driver.getActiveUsers()
    const activeUsers = dedupeActiveUsers(snapshot.activeUsers)
    const activeKeys = unique(activeUsers.map(user => user.macAddress))
    const activeSet = new Set(activeKeys)
    const joined = activeKeys.filter(mac => !previousKeys.has(mac))
    const left = [...previousKeys].filter(mac => !activeSet.has(mac))
    const data = {
      equipment: {
        id: equipment.id,
        inventoryId: equipment.inventoryId,
        managementIp: equipment.managementIp
      },
      totalLeases: snapshot.totalLeases,
      candidateLeases: snapshot.candidateLeases,
      activeUsers: activeKeys.length,
      joinedUsers: joined.length,
      leftUsers: left.length,
      activeKeys,
      byDhcpServer: groupCount(activeUsers, user => user.server || 'unknown'),
      byInterface: groupCount(activeUsers, user => user.serverInterface || 'unknown'),
      evidenceCounts: snapshot.evidenceCounts,
      evidenceRule: 'active = DHCP lease candidate with live ARP, bridge-host, or switch-FDB evidence'
    }

    await db.insert(diagnosticRuns).values({
      equipmentId: equipment.id,
      driverCode,
      runType: 'dhcp-active-users',
      target: equipment.inventoryId,
      success: true,
      result: {
        name: 'dhcp-active-users',
        status: 'ok',
        data
      }
    })
    const [snapshotRow] = await db.insert(dhcpActiveUserSnapshots).values({
      equipmentId: equipment.id,
      inventoryId: equipment.inventoryId,
      totalLeases: data.totalLeases,
      candidateLeases: data.candidateLeases,
      activeUsers: data.activeUsers,
      joinedUsers: data.joinedUsers,
      leftUsers: data.leftUsers,
      activeKeys: data.activeKeys,
      evidenceCounts: data.evidenceCounts
    }).returning()

    if (snapshotRow) {
      const scopeCounts = [
        ...data.byDhcpServer.map(row => ({
          snapshotId: snapshotRow.id,
          scope: 'dhcp-server',
          name: row.name,
          count: row.count
        })),
        ...data.byInterface.map(row => ({
          snapshotId: snapshotRow.id,
          scope: 'interface',
          name: row.name,
          count: row.count
        }))
      ]
      if (scopeCounts.length) {
        await db.insert(dhcpActiveUserScopeCounts).values(scopeCounts)
      }
    }

    results.push({
      inventoryId: equipment.inventoryId,
      driverCode,
      status: 'ok',
      data: {
        activeUsers: data.activeUsers,
        joinedUsers: data.joinedUsers,
        leftUsers: data.leftUsers,
        byDhcpServer: data.byDhcpServer,
        byInterface: data.byInterface,
        evidenceCounts: data.evidenceCounts
      }
    })
  }

  console.log(JSON.stringify({
    ok: true,
    equipmentCount: results.length,
    results
  }, null, 2))
}

main()
  .then(() => pool.end())
  .catch(async (error) => {
    await pool.end()
    console.error(error)
    process.exit(1)
  })
