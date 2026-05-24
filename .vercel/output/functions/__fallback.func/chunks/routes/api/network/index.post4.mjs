import { d as defineEventHandler, r as readBody, ah as createLineSchema, ag as resolveMediumTypeId, l as db, R as networkLines } from '../../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const payload = createLineSchema.parse(body);
  const mediumTypeId = await resolveMediumTypeId(payload.mediumCode);
  const [line] = await db.insert(networkLines).values({
    inventoryId: payload.inventoryId,
    nodeStartId: payload.nodeStartId,
    nodeEndId: payload.nodeEndId,
    mediumTypeId,
    fiberCount: payload.fiberCount,
    lengthMeters: payload.lengthMeters,
    status: payload.status
  }).returning();
  return { success: true, data: line };
});

export { index_post as default };
