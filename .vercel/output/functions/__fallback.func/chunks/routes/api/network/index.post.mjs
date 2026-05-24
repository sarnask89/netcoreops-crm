import { d as defineEventHandler, r as readBody, a7 as createAccessProfileBindingSchema, l as db, a8 as accessProfileDeviceBindings } from '../../../nitro/nitro.mjs';
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
  const payload = createAccessProfileBindingSchema.parse(body);
  const [binding] = await db.insert(accessProfileDeviceBindings).values(payload).returning();
  return { success: true, data: binding };
});

export { index_post as default };
