import { d as defineEventHandler, k as getRouterParam, c as createError, r as readBody, l as db, E as customerDevices } from '../../../../../nitro/nitro.mjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
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

const bodySchema = z.object({
  customerDeviceId: z.string().uuid().nullable()
});
const linkCustomer_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id ONU" });
  const { customerDeviceId } = bodySchema.parse(await readBody(event));
  const onu = await db.query.ftthOnus.findFirst({
    where: (table, { eq: eq2 }) => eq2(table.id, id),
    with: { ponPort: true }
  });
  if (!onu) throw createError({ statusCode: 404, statusMessage: "ONU nie istnieje" });
  if (!customerDeviceId) {
    await db.update(customerDevices).set({ ftthOnuId: null }).where(eq(customerDevices.ftthOnuId, id));
    return { success: true, data: { ftthOnuId: id, customerDeviceId: null } };
  }
  const [device] = await db.update(customerDevices).set({
    ftthOnuId: id,
    oltPort: onu.ponPort.portCode,
    onuId: onu.onuIdentifier
  }).where(eq(customerDevices.id, customerDeviceId)).returning();
  if (!device) throw createError({ statusCode: 404, statusMessage: "Urz\u0105dzenie klienta nie istnieje" });
  return { success: true, data: device };
});

export { linkCustomer_post as default };
