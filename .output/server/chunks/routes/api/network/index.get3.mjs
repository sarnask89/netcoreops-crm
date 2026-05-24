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

const index_get = defineEventHandler(async () => {
  const lines = await db.query.networkLines.findMany({
    with: {
      startNode: true,
      endNode: true,
      medium: true
    },
    orderBy: (table, { asc }) => [asc(table.inventoryId)]
  });
  return { success: true, data: lines };
});

export { index_get as default };
