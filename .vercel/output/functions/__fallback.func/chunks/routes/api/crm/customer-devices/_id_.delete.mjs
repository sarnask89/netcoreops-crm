import { d as defineEventHandler, k as getRouterParam, c as createError, D as archiveSchema, r as readBody, l as db, E as customerDevices } from '../../../../nitro/nitro.mjs';
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
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id urz\u0105dzenia klienta" });
  const payload = archiveSchema.parse(await readBody(event).catch(() => ({})));
  const [device] = await db.update(customerDevices).set({
    status: "INACTIVE",
    archivedAt: /* @__PURE__ */ new Date(),
    archiveReason: payload.archiveReason || "Archiwizacja z CRM"
  }).where(eq(customerDevices.id, id)).returning();
  if (!device) throw createError({ statusCode: 404, statusMessage: "Urz\u0105dzenie klienta nie istnieje" });
  return { success: true, data: device };
});

export { _id__delete as default };
