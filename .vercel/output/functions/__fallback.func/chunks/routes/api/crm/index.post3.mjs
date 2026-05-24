import { d as defineEventHandler, O as createServiceSchema, r as readBody, K as resolveAddressIds, l as db, M as customerServices } from '../../../nitro/nitro.mjs';
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
  const payload = createServiceSchema.parse(await readBody(event));
  const addressIds = await resolveAddressIds(payload.address);
  const [service] = await db.insert(customerServices).values({
    customerId: payload.customerId,
    profileId: payload.profileId,
    equipmentId: payload.equipmentId || null,
    serviceTerytAreaId: addressIds.terytAreaId,
    serviceSimcLocalityId: addressIds.simcLocalityId,
    serviceStreetId: addressIds.streetId,
    serviceBuildingNumber: payload.address.buildingNumber || null,
    serviceApartmentNumber: payload.address.apartmentNumber || null,
    activationDate: payload.status === "ACTIVE" ? /* @__PURE__ */ new Date() : null,
    status: payload.status
  }).returning();
  return { success: true, data: service };
});

export { index_post as default };
