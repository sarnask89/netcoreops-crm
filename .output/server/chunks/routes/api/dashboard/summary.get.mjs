import { d as defineEventHandler, l as db, I as customers, E as customerDevices, P as networkEquipment, Q as networkNodes, R as networkLines, S as ftthOnus, T as buildNetflowInterfaceRoleMaps } from '../../../nitro/nitro.mjs';
import { sql } from 'drizzle-orm';
import { l as loadRecentGponRxAlerts } from '../../../_/gpon-rx-monitor.mjs';
import 'zod';
import 'node:child_process';
import 'node:fs/promises';
import 'node:path';
import 'ssh2';
import 'node:net';
import 'drizzle-orm/pg-core';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'ioredis';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'consola';

function bucketHour(date) {
  const bucket = new Date(date);
  bucket.setMinutes(0, 0, 0);
  return bucket.toISOString();
}
function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}
function toOptionalNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : void 0;
}
const summary_get = defineEventHandler(async () => {
  var _a;
  const [
    customerCount,
    customerDeviceCount,
    equipmentCount,
    nodeCount,
    lineCount,
    onuCount,
    activeOnuCount,
    diagnosticRows,
    netflowConfigRows,
    netflowRows,
    activeUserRows,
    activeUserScopeRows,
    flowRollupRows,
    healthRows,
    customerDeviceRows,
    equipmentRows,
    alerts
  ] = await Promise.all([
    db.select({ count: sql`count(*)::int` }).from(customers).then((rows) => {
      var _a2;
      return ((_a2 = rows[0]) == null ? void 0 : _a2.count) || 0;
    }),
    db.select({ count: sql`count(*)::int` }).from(customerDevices).then((rows) => {
      var _a2;
      return ((_a2 = rows[0]) == null ? void 0 : _a2.count) || 0;
    }),
    db.select({ count: sql`count(*)::int` }).from(networkEquipment).then((rows) => {
      var _a2;
      return ((_a2 = rows[0]) == null ? void 0 : _a2.count) || 0;
    }),
    db.select({ count: sql`count(*)::int` }).from(networkNodes).then((rows) => {
      var _a2;
      return ((_a2 = rows[0]) == null ? void 0 : _a2.count) || 0;
    }),
    db.select({ count: sql`count(*)::int` }).from(networkLines).then((rows) => {
      var _a2;
      return ((_a2 = rows[0]) == null ? void 0 : _a2.count) || 0;
    }),
    db.select({ count: sql`count(*)::int` }).from(ftthOnus).then((rows) => {
      var _a2;
      return ((_a2 = rows[0]) == null ? void 0 : _a2.count) || 0;
    }),
    db.select({ count: sql`count(*)::int` }).from(ftthOnus).where(sql`${ftthOnus.status} = 'Active'`).then((rows) => {
      var _a2;
      return ((_a2 = rows[0]) == null ? void 0 : _a2.count) || 0;
    }),
    db.query.diagnosticRuns.findMany({
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 500
    }),
    db.query.diagnosticRuns.findMany({
      where: (table, { eq }) => eq(table.runType, "netflow-config"),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 200
    }),
    db.query.netflowInterfaceSamples.findMany({
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 5e3
    }),
    db.query.dhcpActiveUserSnapshots.findMany({
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 1e3
    }),
    db.query.dhcpActiveUserScopeCounts.findMany({
      limit: 5e3
    }),
    db.query.netflowFlowRollups.findMany({
      orderBy: (table, { desc }) => [desc(table.bucket)],
      limit: 5e3
    }),
    db.query.netflowExporterHealth.findMany({
      orderBy: (table, { desc }) => [desc(table.updatedAt)],
      limit: 200
    }),
    db.query.customerDevices.findMany(),
    db.query.networkEquipment.findMany(),
    loadRecentGponRxAlerts(12)
  ]);
  const telemetryBuckets = /* @__PURE__ */ new Map();
  const interfaceRolesByExporter = buildNetflowInterfaceRoleMaps(netflowConfigRows, equipmentRows);
  const interfaceBuckets = /* @__PURE__ */ new Map();
  const activeUserBuckets = /* @__PURE__ */ new Map();
  const activeGlobalBuckets = /* @__PURE__ */ new Map();
  const deviceLabels = new Map(customerDeviceRows.map((row) => [row.id, row.hostname]));
  for (const run of diagnosticRows) {
    const timestamp = bucketHour(run.createdAt);
    const bucket = telemetryBuckets.get(timestamp) || { timestamp, snmpSamples: 0, netflowSamples: 0, alerts: 0 };
    const runType = run.runType.toLowerCase();
    if (runType.includes("snmp") || runType.includes("diagnostic") || runType.includes("mikrotik")) bucket.snmpSamples += 1;
    if (runType.includes("netflow")) bucket.netflowSamples += 1;
    if (runType.includes("gpon-rx")) {
      const result = run.result;
      bucket.alerts += result.alertCount || 0;
    }
    telemetryBuckets.set(timestamp, bucket);
  }
  for (const row of netflowRows) {
    const roleFromConfig = typeof row.ifIndex === "number" ? (_a = interfaceRolesByExporter.get(row.exporterAddress)) == null ? void 0 : _a.get(row.ifIndex) : void 0;
    const role = row.role === "dhcp" || row.role === "uplink" ? row.role : roleFromConfig == null ? void 0 : roleFromConfig.role;
    if (role !== "dhcp" && role !== "uplink") continue;
    const timestamp = bucketHour(row.createdAt);
    const direction = row.direction === "output" ? "output" : "input";
    const interfaceName = (roleFromConfig == null ? void 0 : roleFromConfig.name) || row.interfaceName || (row.ifIndex ? `ifIndex ${row.ifIndex}` : "unknown");
    const key = `${timestamp}|${row.exporterAddress}|${role}|${direction}|${interfaceName}`;
    const interfaceBucket = interfaceBuckets.get(key) || {
      timestamp,
      exporterAddress: row.exporterAddress,
      interfaceName,
      role,
      sourceInterface: (roleFromConfig == null ? void 0 : roleFromConfig.sourceInterface) || row.sourceInterface || void 0,
      speedBps: (roleFromConfig == null ? void 0 : roleFromConfig.speedBps) || toOptionalNumber(row.speedBps),
      direction,
      bytes: 0,
      bpsSum: 0,
      packets: 0,
      records: 0,
      samples: 0
    };
    interfaceBucket.bytes += toNumber(row.bytes);
    interfaceBucket.bpsSum += toNumber(row.bps);
    interfaceBucket.packets += toNumber(row.packets);
    interfaceBucket.records += toNumber(row.records);
    interfaceBucket.samples += 1;
    interfaceBuckets.set(key, interfaceBucket);
  }
  const scopeRowsBySnapshot = /* @__PURE__ */ new Map();
  for (const row of activeUserScopeRows) {
    scopeRowsBySnapshot.set(row.snapshotId, [...scopeRowsBySnapshot.get(row.snapshotId) || [], row]);
  }
  for (const row of activeUserRows) {
    const timestamp = bucketHour(row.createdAt);
    const equipmentPoint = {
      scope: "equipment",
      key: `equipment|${row.inventoryId}`,
      label: row.inventoryId,
      count: row.activeUsers,
      joined: row.joinedUsers,
      left: row.leftUsers
    };
    const equipmentBucketKey = `${timestamp}|${equipmentPoint.key}`;
    if (!activeUserBuckets.has(equipmentBucketKey)) {
      activeUserBuckets.set(equipmentBucketKey, { timestamp, ...equipmentPoint });
      const globalBucket = activeGlobalBuckets.get(timestamp) || { activeKeys: /* @__PURE__ */ new Set(), joined: 0, left: 0 };
      for (const activeKey of row.activeKeys || []) globalBucket.activeKeys.add(activeKey);
      globalBucket.joined += row.joinedUsers;
      globalBucket.left += row.leftUsers;
      activeGlobalBuckets.set(timestamp, globalBucket);
    }
    for (const scopeRow of scopeRowsBySnapshot.get(row.id) || []) {
      const scope = scopeRow.scope === "dhcp-server" ? "dhcp-server" : "interface";
      const key = `${timestamp}|${scope}|${row.inventoryId}|${scopeRow.name}`;
      if (activeUserBuckets.has(key)) continue;
      activeUserBuckets.set(key, {
        timestamp,
        scope,
        key: `${scope}|${row.inventoryId}|${scopeRow.name}`,
        label: `${row.inventoryId} / ${scopeRow.name}`,
        count: scopeRow.count,
        joined: 0,
        left: 0
      });
    }
  }
  const topUsersByKey = /* @__PURE__ */ new Map();
  for (const row of flowRollupRows) {
    if (row.scope !== "user" || row.bucketSeconds !== 60 || !row.userKey) continue;
    const key = row.userKey;
    const user = topUsersByKey.get(key) || {
      userKey: key,
      label: row.customerDeviceId ? deviceLabels.get(row.customerDeviceId) || key : row.localIp || key,
      customerDeviceId: row.customerDeviceId,
      customerId: row.customerId,
      localIp: row.localIp,
      downloadBps: 0,
      uploadBps: 0,
      totalBytes: 0,
      flows: 0
    };
    if (row.direction === "download") user.downloadBps += toNumber(row.bps);
    if (row.direction === "upload") user.uploadBps += toNumber(row.bps);
    user.totalBytes += toNumber(row.bytes);
    user.flows += toNumber(row.flows);
    topUsersByKey.set(key, user);
  }
  const latestHealthByExporter = /* @__PURE__ */ new Map();
  for (const row of healthRows) {
    const key = `${row.exporterAddress}|${row.version}|${row.sourceId}`;
    if (!latestHealthByExporter.has(key)) latestHealthByExporter.set(key, row);
  }
  return {
    success: true,
    data: {
      counters: {
        customers: customerCount,
        customerDevices: customerDeviceCount,
        equipment: equipmentCount,
        nodes: nodeCount,
        lines: lineCount,
        onus: onuCount,
        activeOnus: activeOnuCount,
        gponAlerts: alerts.length
      },
      alerts,
      telemetry: Array.from(telemetryBuckets.values()).sort((a, b) => a.timestamp.localeCompare(b.timestamp)).slice(-48),
      netflowInterfaces: Array.from(interfaceBuckets.values()).map((point) => {
        const bps = point.samples > 0 ? point.bpsSum / point.samples : 0;
        const utilizationPct = point.speedBps ? bps / point.speedBps * 100 : null;
        return {
          timestamp: point.timestamp,
          exporterAddress: point.exporterAddress,
          interfaceName: point.interfaceName,
          role: point.role,
          sourceInterface: point.sourceInterface,
          speedBps: point.speedBps,
          direction: point.direction,
          bytes: point.bytes,
          bps,
          utilizationPct,
          packets: point.packets,
          records: point.records,
          samples: point.samples
        };
      }).sort((a, b) => a.timestamp.localeCompare(b.timestamp)).slice(-2e3),
      activeUsers: Array.from(activeUserBuckets.values()).concat(Array.from(activeGlobalBuckets.entries()).map(([timestamp, point]) => ({
        timestamp,
        scope: "total",
        key: "total|all",
        label: "Wszyscy",
        count: point.activeKeys.size,
        joined: point.joined,
        left: point.left
      }))).sort((a, b) => a.timestamp.localeCompare(b.timestamp)).slice(-2e3),
      collectorHealth: Array.from(latestHealthByExporter.values()).map((row) => ({
        exporterAddress: row.exporterAddress,
        version: row.version,
        sourceId: row.sourceId,
        packetCount: toNumber(row.packetCount),
        flowRecords: toNumber(row.flowRecords),
        unknownTemplateRecords: toNumber(row.unknownTemplateRecords),
        sequenceGaps: toNumber(row.sequenceGaps),
        templatesRefreshed: toNumber(row.templatesRefreshed),
        lastSequence: toNumber(row.lastSequence),
        lastPacketAt: row.lastPacketAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
      })),
      topUsers: Array.from(topUsersByKey.values()).sort((a, b) => b.downloadBps + b.uploadBps - (a.downloadBps + a.uploadBps)).slice(0, 12)
    }
  };
});

export { summary_get as default };
