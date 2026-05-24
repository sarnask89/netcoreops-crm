import { d as defineEventHandler, k as getRouterParam, c as createError, aa as updateAccessProfileSchema, r as readBody, l as db, a9 as accessProfiles, ab as encryptAccessProfileSecrets } from '../../../../nitro/nitro.mjs';
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
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: "Brak id profilu" });
  const payload = updateAccessProfileSchema.parse(await readBody(event));
  const [profile] = await db.update(accessProfiles).set(definedEntries(encryptAccessProfileSecrets(payload))).where(eq(accessProfiles.id, id)).returning();
  if (!profile) throw createError({ statusCode: 404, statusMessage: "Profil nie istnieje" });
  return { success: true, data: profile };
});

export { _id__patch as default };
