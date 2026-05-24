import { d as defineEventHandler, r as readBody, H as createCustomerDeviceSchema, l as db, E as customerDevices } from '../../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const payload = createCustomerDeviceSchema.parse(body);
  const [device] = await db.insert(customerDevices).values(payload).returning();
  return { success: true, data: device };
});

export { index_post as default };
