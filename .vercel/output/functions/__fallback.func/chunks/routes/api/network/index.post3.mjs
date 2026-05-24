import { d as defineEventHandler, r as readBody, ae as createEquipmentSchema, l as db, P as networkEquipment } from '../../../nitro/nitro.mjs';
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
  const payload = createEquipmentSchema.parse(body);
  const [equipment] = await db.insert(networkEquipment).values(payload).returning();
  return { success: true, data: equipment };
});

export { index_post as default };
