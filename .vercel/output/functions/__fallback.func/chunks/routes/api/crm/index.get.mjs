import { d as defineEventHandler, g as getQuery, l as db, E as customerDevices } from '../../../nitro/nitro.mjs';
import { isNull } from 'drizzle-orm';
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

const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const includeArchived = query.includeArchived === "true";
  const devices = await db.query.customerDevices.findMany({
    where: includeArchived ? void 0 : isNull(customerDevices.archivedAt),
    with: {
      customer: true,
      equipment: true,
      onuEquipment: true,
      subscriptions: {
        with: {
          tariff: true
        }
      }
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  });
  return { success: true, data: devices };
});

export { index_get as default };
