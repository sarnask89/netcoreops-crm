import { d as defineEventHandler, k as getRouterParam, c as createError, r as readBody, X as importModeSchema, U as getDriverForEquipment, a0 as buildMikrotikLeaseActions, Y as compactImportSummary, Z as recordImportRun } from '../../../../../nitro/nitro.mjs';
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

const leases_post = defineEventHandler(async (event) => {
  const equipmentId = getRouterParam(event, "equipmentId");
  if (!equipmentId) throw createError({ statusCode: 400, statusMessage: "Brak equipmentId" });
  const body = await readBody(event).catch(() => ({}));
  const { mode } = importModeSchema.parse(body || {});
  const effectiveMode = mode === "dryRun" ? "preview" : mode;
  const selectedNetworks = Array.isArray(body == null ? void 0 : body.selectedNetworks) ? body.selectedNetworks.filter((network) => typeof network === "string" && network.trim()) : [];
  const { driver, driverCode } = await getDriverForEquipment(equipmentId);
  const leases = await driver.getLeases();
  const actions = await buildMikrotikLeaseActions(equipmentId, leases, effectiveMode, selectedNetworks);
  const summary = compactImportSummary({ leases: leases.length, actions, mode: effectiveMode });
  await recordImportRun(equipmentId, driverCode, "mikrotik-leases", effectiveMode, summary);
  return { success: true, data: summary };
});

export { leases_post as default };
