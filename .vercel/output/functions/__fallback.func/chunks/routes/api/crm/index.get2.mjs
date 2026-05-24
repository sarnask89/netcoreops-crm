import { d as defineEventHandler, g as getQuery, l as db, I as customers } from '../../../nitro/nitro.mjs';
import { isNull } from 'drizzle-orm';
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

const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const includeArchived = query.includeArchived === "true";
  const customerRows = await db.query.customers.findMany({
    where: includeArchived ? void 0 : isNull(customers.archivedAt),
    with: {
      billingTerytArea: true,
      billingSimcLocality: true,
      billingStreet: true,
      services: {
        with: {
          profile: true,
          equipment: {
            with: {
              node: true
            }
          },
          serviceTerytArea: true,
          serviceSimcLocality: true,
          serviceStreet: true
        }
      },
      customerDevices: {
        with: {
          equipment: true,
          onuEquipment: true,
          subscriptions: {
            with: {
              tariff: true
            }
          }
        }
      }
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  });
  return { success: true, data: customerRows };
});

export { index_get as default };
