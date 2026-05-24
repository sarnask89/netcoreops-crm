import { d as defineEventHandler, k as getRouterParam, c as createError, r as readBody, U as getDriverForEquipment, V as withDiagnosticPresentation } from '../../../../../nitro/nitro.mjs';
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
import '@iconify/utils';
import 'consola';

const bodySchema = z.object({
  macAddress: z.string().min(1).max(17)
});
const macCheck_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id urz\u0105dzenia" });
  const { macAddress } = bodySchema.parse(await readBody(event));
  const { driver, driverCode, equipment } = await getDriverForEquipment(id);
  const checks = [
    await driver.getBridgeHost(macAddress),
    await driver.getSwitchFdb(macAddress)
  ];
  const data = withDiagnosticPresentation("MAC lookup", {
    equipment: {
      id: equipment.id,
      inventoryId: equipment.inventoryId,
      managementIp: equipment.managementIp
    },
    driver: driverCode,
    target: { macAddress },
    checks
  });
  return {
    success: checks.some((check) => check.status === "ok"),
    data
  };
});

export { macCheck_post as default };
