import { d as defineEventHandler, r as readBody, aj as createNodeSchema, K as resolveAddressIds, ag as resolveMediumTypeId, l as db, Q as networkNodes } from '../../../nitro/nitro.mjs';
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
  var _a;
  const body = await readBody(event);
  const payload = createNodeSchema.parse(body);
  const addressIds = await resolveAddressIds(payload.address);
  const mediumTypeId = await resolveMediumTypeId(payload.mediumCode);
  const [node] = await db.insert(networkNodes).values({
    inventoryId: payload.inventoryId,
    name: payload.name,
    nodeType: payload.nodeType,
    mediumTypeId,
    terytAreaId: addressIds.terytAreaId,
    simcLocalityId: addressIds.simcLocalityId,
    streetId: addressIds.streetId,
    buildingNumber: ((_a = payload.address) == null ? void 0 : _a.buildingNumber) || null,
    latitude: payload.latitude,
    longitude: payload.longitude,
    status: payload.status
  }).returning();
  return { success: true, data: node };
});

export { index_post as default };
