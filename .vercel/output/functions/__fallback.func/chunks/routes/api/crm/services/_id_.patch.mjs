import { d as defineEventHandler, k as getRouterParam, c as createError, N as updateServiceSchema, r as readBody, K as resolveAddressIds, l as db, M as customerServices } from '../../../../nitro/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id uslugi" });
  const payload = updateServiceSchema.parse(await readBody(event));
  const updateData = {};
  if (payload.customerId !== void 0) updateData.customerId = payload.customerId;
  if (payload.profileId !== void 0) updateData.profileId = payload.profileId;
  if (payload.equipmentId !== void 0) updateData.equipmentId = payload.equipmentId || null;
  if (payload.status !== void 0) {
    updateData.status = payload.status;
    if (payload.status === "ACTIVE") updateData.activationDate = /* @__PURE__ */ new Date();
  }
  if (payload.address !== void 0) {
    const addressIds = await resolveAddressIds(payload.address);
    updateData.serviceTerytAreaId = addressIds.terytAreaId;
    updateData.serviceSimcLocalityId = addressIds.simcLocalityId;
    updateData.serviceStreetId = addressIds.streetId;
    updateData.serviceBuildingNumber = payload.address.buildingNumber || null;
    updateData.serviceApartmentNumber = payload.address.apartmentNumber || null;
  }
  const [service] = await db.update(customerServices).set(updateData).where(eq(customerServices.id, id)).returning();
  if (!service) throw createError({ statusCode: 404, statusMessage: "Usluga nie istnieje" });
  return { success: true, data: service };
});

export { _id__patch as default };
