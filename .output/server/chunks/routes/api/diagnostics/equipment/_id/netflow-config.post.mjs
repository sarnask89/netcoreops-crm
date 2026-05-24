import { d as defineEventHandler, k as getRouterParam, c as createError, r as readBody, W as parseNetflowCollector, U as getDriverForEquipment, l as db, G as diagnosticRuns } from '../../../../../nitro/nitro.mjs';
import { z } from 'zod';
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

const bodySchema = z.object({
  collector: z.string().optional()
});
const netflowConfig_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id urz\u0105dzenia" });
  const body = bodySchema.parse(await readBody(event).catch(() => ({})));
  const collector = body.collector || process.env.NETCOREOPS_NETFLOW_COLLECTOR || "10.0.222.226:2055";
  parseNetflowCollector(collector);
  const { driver, driverCode, equipment } = await getDriverForEquipment(id);
  const result = await driver.configureNetflow({ collector, version: "ipfix" });
  const success = result.status === "ok" || result.status === "warning";
  await db.insert(diagnosticRuns).values({
    equipmentId: equipment.id,
    driverCode,
    runType: "netflow-config",
    target: collector,
    success,
    result
  });
  if (result.status === "unsupported") {
    throw createError({ statusCode: 400, statusMessage: result.message || "Driver nie wspiera NetFlow" });
  }
  if (result.status === "error") {
    throw createError({ statusCode: 500, statusMessage: result.message || "Konfiguracja NetFlow nie powiod\u0142a si\u0119" });
  }
  return {
    success,
    data: {
      equipment: {
        id: equipment.id,
        inventoryId: equipment.inventoryId,
        managementIp: equipment.managementIp
      },
      driver: driverCode,
      result
    }
  };
});

export { netflowConfig_post as default };
