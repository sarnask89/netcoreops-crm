import { d as defineEventHandler, k as getRouterParam, c as createError, r as readBody, X as importModeSchema, U as getDriverForEquipment } from '../../../../../../nitro/nitro.mjs';
import { a as runDasanMacMapImport } from '../../../../../../_/dasan-import-runner.mjs';
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
import '../../../../../../_/import-service.mjs';

const handler = defineEventHandler(async (event) => {
  const equipmentId = getRouterParam(event, "equipmentId");
  if (!equipmentId) throw createError({ statusCode: 400, statusMessage: "Brak equipmentId" });
  const body = await readBody(event).catch(() => ({}));
  const { mode, activeOnly, limit, rangeFrom, rangeTo } = importModeSchema.parse(body || {});
  const { driver, driverCode } = await getDriverForEquipment(equipmentId);
  return {
    success: true,
    data: await runDasanMacMapImport({ equipmentId, mode, activeOnly, limit, rangeFrom, rangeTo, driver, driverCode })
  };
});

export { handler as default };
