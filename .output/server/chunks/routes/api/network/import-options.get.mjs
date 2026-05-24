import { d as defineEventHandler, l as db } from '../../../nitro/nitro.mjs';
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

const importOptions_get = defineEventHandler(async () => {
  const equipment = await db.query.networkEquipment.findMany({
    columns: {
      id: true,
      inventoryId: true,
      hostname: true,
      managementIp: true,
      managementProtocol: true
    },
    with: {
      managementDriver: {
        columns: {
          code: true,
          label: true
        }
      }
    },
    orderBy: (table, { asc }) => [asc(table.inventoryId)]
  });
  return {
    success: true,
    data: {
      equipment
    }
  };
});

export { importOptions_get as default };
