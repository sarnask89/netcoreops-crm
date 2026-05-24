import { d as defineEventHandler, k as getRouterParam, c as createError, af as updateLineSchema, r as readBody, ag as resolveMediumTypeId, l as db, R as networkLines } from '../../../../nitro/nitro.mjs';
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
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id linii" });
  const payload = updateLineSchema.parse(await readBody(event));
  const { mediumCode, nodeStartId, nodeEndId, ...linePayload } = payload;
  const updateData = definedEntries({
    ...linePayload,
    nodeStartId,
    nodeEndId
  });
  if (mediumCode !== void 0) {
    updateData.mediumTypeId = await resolveMediumTypeId(mediumCode);
  }
  const [line] = await db.update(networkLines).set(updateData).where(eq(networkLines.id, id)).returning();
  if (!line) throw createError({ statusCode: 404, statusMessage: "Linia nie istnieje" });
  return { success: true, data: line };
});

export { _id__patch as default };
