import { d as defineEventHandler, l as db } from '../../../nitro/nitro.mjs';
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
import '@iconify/utils';
import 'consola';

const index_get = defineEventHandler(async () => {
  const links = await db.query.ftthTransparentLinks.findMany({
    with: {
      onu: {
        with: {
          ponPort: {
            with: {
              olt: {
                with: {
                  equipment: true
                }
              }
            }
          }
        }
      },
      customerDevice: {
        with: {
          customer: true
        }
      },
      backboneEquipment: true
    },
    orderBy: (table, { desc }) => [desc(table.lastSeenAt)]
  });
  return { success: true, data: links };
});

export { index_get as default };
