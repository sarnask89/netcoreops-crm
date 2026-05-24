import { d as defineEventHandler, k as getRouterParam, c as createError, J as updateCustomerSchema, r as readBody, K as resolveAddressIds, l as db, I as customers } from '../../../../nitro/nitro.mjs';
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
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id klienta" });
  const payload = updateCustomerSchema.parse(await readBody(event));
  const { billingAddressRef, ...customerPayload } = payload;
  const updateData = definedEntries(customerPayload);
  if (billingAddressRef !== void 0) {
    const billingAddressIds = await resolveAddressIds(billingAddressRef);
    updateData.billingTerytAreaId = billingAddressIds.terytAreaId;
    updateData.billingSimcLocalityId = billingAddressIds.simcLocalityId;
    updateData.billingStreetId = billingAddressIds.streetId;
    updateData.billingBuildingNumber = (billingAddressRef == null ? void 0 : billingAddressRef.buildingNumber) || null;
    updateData.billingApartmentNumber = (billingAddressRef == null ? void 0 : billingAddressRef.apartmentNumber) || null;
  }
  const fullName = payload.customerType === "BUSINESS" ? payload.companyName || payload.fullName : [payload.firstName, payload.lastName].filter(Boolean).join(" ");
  if (fullName) updateData.fullName = fullName;
  const [customer] = await db.update(customers).set(updateData).where(eq(customers.id, id)).returning();
  if (!customer) throw createError({ statusCode: 404, statusMessage: "Klient nie istnieje" });
  return { success: true, data: customer };
});

export { _id__patch as default };
