import { d as defineEventHandler, l as db, S as ftthOnus, _ as ftthPonPorts, P as networkEquipment, $ as ftthOlts } from '../../../../nitro/nitro.mjs';
import { eq, asc } from 'drizzle-orm';
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

const options_get = defineEventHandler(async () => {
  const onus = await db.select({
    status: ftthOnus.status,
    oltInventoryId: networkEquipment.inventoryId,
    ponPortCode: ftthPonPorts.portCode,
    onuIdentifier: ftthOnus.onuIdentifier
  }).from(ftthOnus).innerJoin(ftthPonPorts, eq(ftthOnus.ponPortId, ftthPonPorts.id)).innerJoin(ftthOlts, eq(ftthPonPorts.oltId, ftthOlts.id)).innerJoin(networkEquipment, eq(ftthOlts.networkEquipmentId, networkEquipment.id)).orderBy(asc(networkEquipment.inventoryId), asc(ftthPonPorts.portCode), asc(ftthOnus.onuIdentifier));
  return {
    success: true,
    data: onus
  };
});

export { options_get as default };
