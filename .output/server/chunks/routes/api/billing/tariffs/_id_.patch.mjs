import { d as defineEventHandler, k as getRouterParam, c as createError, B as updateTariffSchema, r as readBody, l as db, z as tariffs } from '../../../../nitro/nitro.mjs';
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
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: "Brak id taryfy" });
  const payload = updateTariffSchema.parse(await readBody(event));
  const updateData = {
    ...payload,
    defaultNetPrice: payload.defaultNetPrice === void 0 ? void 0 : String(payload.defaultNetPrice),
    vatRate: payload.vatRate === void 0 ? void 0 : String(payload.vatRate)
  };
  const [tariff] = await db.update(tariffs).set(definedEntries(updateData)).where(eq(tariffs.id, id)).returning();
  if (!tariff) throw createError({ statusCode: 404, statusMessage: "Taryfa nie istnieje" });
  return { success: true, data: tariff };
});

export { _id__patch as default };
