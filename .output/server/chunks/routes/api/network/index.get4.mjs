import { d as defineEventHandler, g as getQuery, l as db, Q as networkNodes } from '../../../nitro/nitro.mjs';
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
  const type = typeof query.type === "string" ? query.type : void 0;
  const nodes = await db.query.networkNodes.findMany({
    where: type ? eq(networkNodes.nodeType, type) : void 0,
    with: {
      medium: true,
      terytArea: true,
      simcLocality: true,
      street: true,
      equipment: true
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  });
  return { success: true, data: nodes };
});

export { index_get as default };
