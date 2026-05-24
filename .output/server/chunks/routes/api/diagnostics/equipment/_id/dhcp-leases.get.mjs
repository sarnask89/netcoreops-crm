import { d as defineEventHandler, k as getRouterParam, c as createError, g as getQuery, U as getDriverForEquipment } from '../../../../../nitro/nitro.mjs';
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

const dhcpLeases_get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id urz\u0105dzenia" });
  const query = getQuery(event);
  const limit = Math.min(Number(query.limit || 200), 1e3);
  const { driver, driverCode, equipment } = await getDriverForEquipment(id);
  const leases = await driver.getLeases();
  return {
    success: true,
    data: {
      equipment: {
        id: equipment.id,
        inventoryId: equipment.inventoryId,
        managementIp: equipment.managementIp
      },
      driver: driverCode,
      total: leases.length,
      leases: leases.slice(0, limit)
    }
  };
});

export { dhcpLeases_get as default };
