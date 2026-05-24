import { d as defineEventHandler, g as getQuery } from '../../../nitro/nitro.mjs';
import { l as loadRecentGponRxAlerts } from '../../../_/gpon-rx-monitor.mjs';
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

const gponRx_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const limit = Number(query.limit || 20);
  const alerts = await loadRecentGponRxAlerts(Number.isFinite(limit) ? limit : 20);
  return { success: true, data: alerts };
});

export { gponRx_get as default };
