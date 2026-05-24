import { d as defineEventHandler, k as getRouterParam, c as createError, ai as updateNodeSchema, r as readBody, ag as resolveMediumTypeId, K as resolveAddressIds, l as db, Q as networkNodes } from '../../../../nitro/nitro.mjs';
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
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id w\u0119z\u0142a" });
  const payload = updateNodeSchema.parse(await readBody(event));
  const { address, mediumCode, ...nodePayload } = payload;
  const updateData = definedEntries(nodePayload);
  if (mediumCode !== void 0) {
    updateData.mediumTypeId = await resolveMediumTypeId(mediumCode);
  }
  if (address !== void 0) {
    const addressIds = await resolveAddressIds(address);
    updateData.terytAreaId = addressIds.terytAreaId;
    updateData.simcLocalityId = addressIds.simcLocalityId;
    updateData.streetId = addressIds.streetId;
    updateData.buildingNumber = (address == null ? void 0 : address.buildingNumber) || null;
  }
  const [node] = await db.update(networkNodes).set(updateData).where(eq(networkNodes.id, id)).returning();
  if (!node) throw createError({ statusCode: 404, statusMessage: "W\u0119ze\u0142 nie istnieje" });
  return { success: true, data: node };
});

export { _id__patch as default };
