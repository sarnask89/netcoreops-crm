import { d as defineEventHandler, k as getRouterParam, c as createError, l as db, a2 as importRuns } from '../../../../nitro/nitro.mjs';
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
import '@iconify/utils';
import 'consola';

const _id__delete = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id importu" });
  const [deleted] = await db.delete(importRuns).where(eq(importRuns.id, id)).returning();
  if (!deleted) throw createError({ statusCode: 404, statusMessage: "Import nie istnieje" });
  return { success: true, data: deleted };
});

export { _id__delete as default };
