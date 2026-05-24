import { d as defineEventHandler, k as getRouterParam, c as createError, u as updateAutomationScriptSchema, r as readBody, l as db, m as automationScripts } from '../../../../nitro/nitro.mjs';
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

function definedEntries(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== void 0));
}
const _id__patch = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: "Brak id skryptu" });
  const payload = updateAutomationScriptSchema.parse(await readBody(event));
  const [script] = await db.update(automationScripts).set(definedEntries(payload)).where(eq(automationScripts.id, id)).returning();
  if (!script) throw createError({ statusCode: 404, statusMessage: "Skrypt nie istnieje" });
  return { success: true, data: script };
});

export { _id__patch as default };
