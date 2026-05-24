import { d as defineEventHandler, k as getRouterParam, c as createError, r as readBody, U as getDriverForEquipment, V as withDiagnosticPresentation } from '../../../../../nitro/nitro.mjs';
import { z } from 'zod';
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

const bodySchema = z.object({
  macAddress: z.string().max(17).optional().nullable(),
  ipAddress: z.string().max(45).optional().nullable()
});
const mikrotikCheck_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id urz\u0105dzenia" });
  const body = bodySchema.parse(await readBody(event).catch(() => ({})));
  const { driver, driverCode, equipment } = await getDriverForEquipment(id);
  const leases = await driver.getLeases();
  const sample = body.macAddress || body.ipAddress ? leases.find((lease) => {
    var _a, _b;
    return ((_a = lease.macAddress) == null ? void 0 : _a.toLowerCase()) === ((_b = body.macAddress) == null ? void 0 : _b.toLowerCase()) || lease.address === body.ipAddress;
  }) : leases.find((lease) => lease.macAddress && lease.address && !lease.disabled && !lease.blocked) || leases.find((lease) => lease.macAddress && lease.address);
  const macAddress = body.macAddress || (sample == null ? void 0 : sample.macAddress);
  const ipAddress = body.ipAddress || (sample == null ? void 0 : sample.address);
  const checks = [];
  if (macAddress) checks.push(await driver.getDhcpLease(macAddress));
  if (ipAddress) {
    checks.push(await driver.ping(ipAddress));
    checks.push(await driver.arpPing(ipAddress));
  }
  const data = withDiagnosticPresentation("Ping / ARP / DHCP", {
    equipment: {
      id: equipment.id,
      inventoryId: equipment.inventoryId,
      managementIp: equipment.managementIp
    },
    driver: driverCode,
    target: { macAddress, ipAddress },
    leaseCount: leases.length,
    checks
  });
  return {
    success: checks.some((check) => check.status === "ok"),
    data
  };
});

export { mikrotikCheck_post as default };
