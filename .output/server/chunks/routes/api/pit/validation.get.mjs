import { d as defineEventHandler, l as db, Q as networkNodes, R as networkLines, P as networkEquipment, M as customerServices, am as formatPitValidationReport, an as validatePitReadiness } from '../../../nitro/nitro.mjs';
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

const validation_get = defineEventHandler(async () => {
  const [nodes, lines, equipment, services] = await Promise.all([
    db.select().from(networkNodes),
    db.select().from(networkLines),
    db.select().from(networkEquipment),
    db.select().from(customerServices)
  ]);
  return {
    success: true,
    data: formatPitValidationReport(validatePitReadiness({
      nodes,
      lines,
      equipment,
      services
    }))
  };
});

export { validation_get as default };
