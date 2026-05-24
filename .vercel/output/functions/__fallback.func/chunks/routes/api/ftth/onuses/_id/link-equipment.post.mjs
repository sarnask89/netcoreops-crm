import { d as defineEventHandler, k as getRouterParam, c as createError, r as readBody, l as db, S as ftthOnus } from '../../../../../nitro/nitro.mjs';
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
import '@iconify/utils';
import 'consola';

const bodySchema = z.object({
  networkEquipmentId: z.string().uuid().nullable()
});
const linkEquipment_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id ONU" });
  const { networkEquipmentId } = bodySchema.parse(await readBody(event));
  const [onu] = await db.update(ftthOnus).set({ networkEquipmentId }).where(eq(ftthOnus.id, id)).returning();
  if (!onu) throw createError({ statusCode: 404, statusMessage: "ONU nie istnieje" });
  return { success: true, data: onu };
});

export { linkEquipment_post as default };
