import { d as defineEventHandler, g as getQuery, l as db } from '../../../nitro/nitro.mjs';
import 'zod';
import 'drizzle-orm';
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

function limitFromQuery(value) {
  const limit = Number(value);
  if (!Number.isInteger(limit)) return 200;
  return Math.min(Math.max(limit, 1), 1e3);
}
const flows_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const limit = limitFromQuery(query.limit);
  const rows = await db.query.netflowRawFlows.findMany({
    orderBy: (table, { desc }) => [desc(table.exportedAt)],
    limit
  });
  return {
    success: true,
    data: rows.map((row) => {
      var _a, _b;
      return {
        id: row.id,
        exporterAddress: row.exporterAddress,
        version: row.version,
        exportedAt: row.exportedAt.toISOString(),
        firstSeenAt: ((_a = row.firstSeenAt) == null ? void 0 : _a.toISOString()) || null,
        lastSeenAt: ((_b = row.lastSeenAt) == null ? void 0 : _b.toISOString()) || null,
        srcIp: row.srcIp,
        dstIp: row.dstIp,
        srcPort: row.srcPort,
        dstPort: row.dstPort,
        protocol: row.protocol,
        bytes: row.bytes,
        packets: row.packets,
        inputIfIndex: row.inputIfIndex,
        outputIfIndex: row.outputIfIndex,
        srcMac: row.srcMac,
        dstMac: row.dstMac,
        natSrcIp: row.natSrcIp,
        natDstIp: row.natDstIp,
        natSrcPort: row.natSrcPort,
        natDstPort: row.natDstPort,
        direction: row.flowDirection,
        localIp: row.localIp,
        remoteIp: row.remoteIp,
        userKey: row.userKey,
        customerDeviceId: row.customerDeviceId,
        customerId: row.customerId,
        confidence: row.confidence
      };
    })
  };
});

export { flows_get as default };
