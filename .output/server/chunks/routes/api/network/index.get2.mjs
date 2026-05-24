import { d as defineEventHandler, g as getQuery, l as db, P as networkEquipment } from '../../../nitro/nitro.mjs';
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
import 'node:url';
import '@iconify/utils';
import 'consola';

const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const role = typeof query.role === "string" ? query.role : void 0;
  const equipment = await db.query.networkEquipment.findMany({
    where: role ? eq(networkEquipment.equipmentRole, role) : void 0,
    with: {
      model: {
        with: {
          type: true
        }
      },
      node: true,
      accessProfile: true,
      managementDriver: true,
      parentEquipment: true,
      childEquipment: true,
      customerDevices: true,
      service: true,
      profileBindings: {
        with: {
          profile: true
        }
      },
      automationScripts: true
    },
    orderBy: (table, { asc }) => [asc(table.inventoryId)]
  });
  return { success: true, data: equipment };
});

export { index_get as default };
