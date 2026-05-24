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
import 'node:url';
import '@iconify/utils';
import 'consola';

const index_get = defineEventHandler(async () => {
  const ponPorts = await db.query.ftthPonPorts.findMany({
    with: {
      olt: {
        with: {
          equipment: {
            with: {
              node: true,
              managementDriver: true
            }
          }
        }
      },
      onus: true
    },
    orderBy: (table, { asc }) => [asc(table.portCode)]
  });
  return {
    success: true,
    data: ponPorts.map((port) => {
      var _a, _b;
      return {
        ...port,
        oltInventoryId: port.olt.equipment.inventoryId,
        oltManagementIp: port.olt.equipment.managementIp,
        nodeName: ((_a = port.olt.equipment.node) == null ? void 0 : _a.name) || null,
        driverCode: ((_b = port.olt.equipment.managementDriver) == null ? void 0 : _b.code) || null,
        onuCount: port.onus.length,
        activeOnuCount: port.onus.filter((onu) => onu.status.toLowerCase() === "active").length,
        transparentCandidateCount: port.onus.filter((onu) => onu.transparentCandidate).length
      };
    })
  };
});

export { index_get as default };
