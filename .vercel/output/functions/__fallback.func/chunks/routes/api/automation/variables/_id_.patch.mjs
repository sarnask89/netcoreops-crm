import { d as defineEventHandler, k as getRouterParam, r as readBody, w as updateAutomationVariableDefinitionSchema, l as db, t as automationVariableDefinitions } from '../../../../nitro/nitro.mjs';
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
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const payload = updateAutomationVariableDefinitionSchema.parse(body);
  const [variable] = await db.update(automationVariableDefinitions).set(payload).where(eq(automationVariableDefinitions.id, id)).returning();
  return { success: true, data: variable };
});

export { _id__patch as default };
