import { d as defineEventHandler, k as getRouterParam, c as createError, ad as updateEquipmentSchema, r as readBody, l as db, P as networkEquipment } from '../../../../nitro/nitro.mjs';
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

function definedEntries(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== void 0));
}
const _id__patch = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id urz\u0105dzenia" });
  const payload = updateEquipmentSchema.parse(await readBody(event));
  const [equipment] = await db.update(networkEquipment).set(definedEntries(payload)).where(eq(networkEquipment.id, id)).returning();
  if (!equipment) throw createError({ statusCode: 404, statusMessage: "Urz\u0105dzenie nie istnieje" });
  return { success: true, data: equipment };
});

export { _id__patch as default };
