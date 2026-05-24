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
  const rows = await db.query.ftthOnuMacs.findMany({
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
          },
          transparentLinks: {
            with: {
              customerDevice: {
                with: {
                  customer: true
                }
              },
              backboneEquipment: true
            }
          }
        }
      }
    },
    orderBy: (table, { desc }) => [desc(table.lastSeenAt)]
  });
  return {
    success: true,
    data: rows.map((row) => {
      const transparentLink = row.onu.transparentLinks.find((link) => link.macAddress === row.macAddress) || null;
      return {
        id: row.id,
        macAddress: row.macAddress,
        vlanId: row.vlanId,
        gemId: row.gemId,
        sourceCommand: row.sourceCommand,
        status: row.status,
        firstSeenAt: row.firstSeenAt,
        lastSeenAt: row.lastSeenAt,
        onu: {
          id: row.onu.id,
          onuIdentifier: row.onu.onuIdentifier,
          status: row.onu.status,
          transparentCandidate: row.onu.transparentCandidate,
          ponPort: {
            portCode: row.onu.ponPort.portCode,
            olt: {
              equipment: {
                inventoryId: row.onu.ponPort.olt.equipment.inventoryId
              }
            }
          }
        },
        transparentLink: transparentLink ? {
          id: transparentLink.id,
          linkType: transparentLink.linkType,
          confidence: transparentLink.confidence,
          lastSeenAt: transparentLink.lastSeenAt,
          customerDevice: transparentLink.customerDevice ? {
            hostname: transparentLink.customerDevice.hostname,
            customer: {
              fullName: transparentLink.customerDevice.customer.fullName
            }
          } : null,
          backboneEquipment: transparentLink.backboneEquipment ? {
            inventoryId: transparentLink.backboneEquipment.inventoryId,
            hostname: transparentLink.backboneEquipment.hostname
          } : null
        } : null
      };
    })
  };
});

export { index_get as default };
