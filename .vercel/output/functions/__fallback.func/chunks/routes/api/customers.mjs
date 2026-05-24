import { d as defineEventHandler, l as db } from '../../nitro/nitro.mjs';
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

const customers = defineEventHandler(async () => {
  const customers = await db.query.customers.findMany({
    with: {
      services: {
        with: {
          profile: true,
          serviceSimcLocality: true,
          serviceStreet: true
        }
      }
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  });
  return customers.map((customer) => {
    var _a, _b;
    return {
      id: customer.id,
      name: customer.fullName,
      email: customer.contactEmail || "",
      status: customer.services.some((service) => service.status === "ACTIVE") ? "subscribed" : "unsubscribed",
      location: customer.services[0] ? [
        (_a = customer.services[0].serviceStreet) == null ? void 0 : _a.name,
        (_b = customer.services[0].serviceSimcLocality) == null ? void 0 : _b.name
      ].filter(Boolean).join(", ") : ""
    };
  });
});

export { customers as default };
