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
  const onus = await db.query.ftthOnus.findMany({
    with: {
      ponPort: {
        with: {
          olt: {
            with: {
              equipment: true
            }
          }
        }
      },
      equipment: true,
      ipHosts: true,
      macs: true,
      transparentLinks: {
        with: {
          customerDevice: {
            with: {
              customer: true
            }
          },
          backboneEquipment: true
        }
      },
      customerDevices: {
        with: {
          customer: true
        }
      }
    },
    orderBy: (table, { desc }) => [desc(table.lastSeenAt), desc(table.createdAt)]
  });
  return {
    success: true,
    data: onus.map((onu) => ({
      ...onu,
      oltInventoryId: onu.ponPort.olt.equipment.inventoryId,
      ponPortCode: onu.ponPort.portCode,
      managementIpHosts: onu.ipHosts.filter((host) => host.currentIp),
      accessMacs: onu.macs.filter((mac) => mac.vlanId !== 400),
      managementMacs: onu.macs.filter((mac) => mac.vlanId === 400),
      linkedCustomerNames: onu.customerDevices.map((device) => device.customer.fullName)
    }))
  };
});

export { index_get as default };
