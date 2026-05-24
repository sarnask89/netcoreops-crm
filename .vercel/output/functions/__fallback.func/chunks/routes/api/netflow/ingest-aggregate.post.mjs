import { d as defineEventHandler, a4 as getRequestIP, a5 as getHeader, c as createError, r as readBody, l as db, G as diagnosticRuns, a6 as netflowInterfaceSamples, P as networkEquipment, T as buildNetflowInterfaceRoleMaps } from '../../../nitro/nitro.mjs';
import { eq } from 'drizzle-orm';
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
import '@iconify/utils';
import 'consola';

function isLocalIngestSource(address) {
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1" || address === "10.0.87.224" || address === "::ffff:10.0.87.224";
}
function toPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}
async function loadInterfaceRolesAndEquipment(exporterAddress) {
  const [equipment, equipmentRows, diagnosticRows] = await Promise.all([
    db.query.networkEquipment.findFirst({
      where: eq(networkEquipment.managementIp, exporterAddress)
    }),
    db.query.networkEquipment.findMany(),
    db.query.diagnosticRuns.findMany({
      where: (table, { eq: eq2 }) => eq2(table.runType, "netflow-config"),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 200
    })
  ]);
  return {
    equipment,
    interfaceRoles: buildNetflowInterfaceRoleMaps(diagnosticRows, equipmentRows).get(exporterAddress) || /* @__PURE__ */ new Map()
  };
}
const ingestAggregate_post = defineEventHandler(async (event) => {
  const requestIp = getRequestIP(event, { xForwardedFor: false }) || "";
  const ingestToken = process.env.NETCOREOPS_NETFLOW_INGEST_TOKEN;
  const requestToken = getHeader(event, "x-netcoreops-netflow-token");
  const isTokenAuthorized = Boolean(ingestToken && requestToken === ingestToken);
  if (!isTokenAuthorized && !isLocalIngestSource(requestIp)) {
    throw createError({ statusCode: 403, statusMessage: "NetFlow ingest jest dost\u0119pny tylko lokalnie" });
  }
  const body = await readBody(event);
  const exporterAddress = typeof body.exporterAddress === "string" ? body.exporterAddress.trim() : "";
  const version = toPositiveNumber(body.version);
  const packetCount = toPositiveNumber(body.packetCount);
  const recordCount = toPositiveNumber(body.recordCount);
  const bytes = toPositiveNumber(body.bytes);
  if (!exporterAddress || !version || packetCount === null || recordCount === null || bytes === null) {
    throw createError({ statusCode: 400, statusMessage: "Nieprawid\u0142owy agregat NetFlow" });
  }
  const { equipment, interfaceRoles } = await loadInterfaceRolesAndEquipment(exporterAddress);
  const interfaceFlows = Array.isArray(body.interfaceFlows) ? body.interfaceFlows.map((flow) => {
    const ifIndex = toPositiveNumber(flow.ifIndex);
    const role = ifIndex === null ? void 0 : interfaceRoles.get(ifIndex);
    return {
      direction: flow.direction === "output" ? "output" : "input",
      ifIndex,
      interfaceName: (role == null ? void 0 : role.name) || (ifIndex === null ? "unknown" : `ifIndex ${ifIndex}`),
      role: (role == null ? void 0 : role.role) || "unknown",
      sourceInterface: role == null ? void 0 : role.sourceInterface,
      speedBps: role == null ? void 0 : role.speedBps,
      bytes: toPositiveNumber(flow.bytes) || 0,
      packets: toPositiveNumber(flow.packets) || 0,
      records: toPositiveNumber(flow.records) || 0
    };
  }) : [];
  const aggregate = {
    exporterAddress,
    version,
    packetCount,
    recordCount,
    bytes,
    firstExportedAt: body.firstExportedAt || null,
    lastExportedAt: body.lastExportedAt || null,
    windowMs: toPositiveNumber(body.windowMs),
    lastSequence: typeof body.lastSequence === "number" ? body.lastSequence : null,
    sourceIds: Array.isArray(body.sourceIds) ? body.sourceIds.filter(Number.isFinite) : [],
    relayAddress: body.relayAddress || requestIp,
    interfaceFlows
  };
  await db.insert(diagnosticRuns).values({
    driverCode: "netflow_windows_relay",
    runType: "netflow-received",
    target: `${aggregate.exporterAddress}/v${aggregate.version}`,
    success: true,
    result: {
      name: "netflow-received",
      status: "ok",
      data: aggregate
    }
  });
  if (interfaceFlows.length) {
    const sampleWindowSeconds = Math.max((toPositiveNumber(body.windowMs) || 1e4) / 1e3, 1);
    await db.insert(netflowInterfaceSamples).values(interfaceFlows.map((flow) => ({
      equipmentId: (equipment == null ? void 0 : equipment.id) || null,
      exporterAddress,
      version,
      ifIndex: flow.ifIndex,
      interfaceName: flow.interfaceName,
      role: flow.role,
      sourceInterface: flow.sourceInterface || null,
      direction: flow.direction,
      bytes: flow.bytes,
      packets: flow.packets,
      records: flow.records,
      bps: flow.bytes * 8 / sampleWindowSeconds,
      speedBps: flow.speedBps || null,
      sampleWindowSeconds
    })));
  }
  return { ok: true, aggregate };
});

export { ingestAggregate_post as default };
