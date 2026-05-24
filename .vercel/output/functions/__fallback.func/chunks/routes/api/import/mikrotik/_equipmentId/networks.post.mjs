import { d as defineEventHandler, k as getRouterParam, c as createError, r as readBody, X as importModeSchema, U as getDriverForEquipment, l as db, a1 as ipNetworks, Z as recordImportRun } from '../../../../../nitro/nitro.mjs';
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
import '@iconify/utils';
import 'consola';

const networks_post = defineEventHandler(async (event) => {
  var _a;
  const equipmentId = getRouterParam(event, "equipmentId");
  if (!equipmentId) throw createError({ statusCode: 400, statusMessage: "Brak equipmentId" });
  const body = await readBody(event).catch(() => ({}));
  const { mode } = importModeSchema.parse(body || {});
  const effectiveMode = mode === "dryRun" ? "preview" : mode;
  const { driver, driverCode } = await getDriverForEquipment(equipmentId);
  const networks = await driver.getNetworks();
  const existingNetworks = await db.query.ipNetworks.findMany();
  const existingCidrs = new Set(existingNetworks.map((network) => network.cidr));
  if (effectiveMode === "apply") {
    for (const network of networks) {
      const comment = (_a = network.comment) == null ? void 0 : _a.trim();
      const name = comment ? `DHCP ${network.cidr} - ${comment}` : `DHCP ${network.cidr}`;
      await db.insert(ipNetworks).values({
        name,
        cidr: network.cidr,
        gateway: network.gateway || null,
        ownerEquipmentId: equipmentId,
        status: "ACTIVE"
      }).onConflictDoUpdate({
        target: ipNetworks.cidr,
        set: {
          name,
          gateway: network.gateway || null,
          ownerEquipmentId: equipmentId,
          status: "ACTIVE"
        }
      });
    }
  }
  const summary = {
    mode: effectiveMode,
    networks,
    actions: networks.map((network) => ({
      action: effectiveMode === "apply" ? existingCidrs.has(network.cidr) ? "update" : "create" : "link",
      entity: "network",
      key: network.cidr,
      label: network.comment || network.cidr,
      data: network,
      reason: effectiveMode === "apply" ? "Sie\u0107 DHCP zapisana w ip_networks" : "Podgl\u0105d importu sieci DHCP z MikroTik"
    }))
  };
  await recordImportRun(equipmentId, driverCode, "mikrotik-networks", effectiveMode, summary);
  return { success: true, data: summary };
});

export { networks_post as default };
