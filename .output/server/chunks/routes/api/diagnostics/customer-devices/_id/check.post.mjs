import { d as defineEventHandler, k as getRouterParam, c as createError, l as db, U as getDriverForEquipment, V as withDiagnosticPresentation, G as diagnosticRuns } from '../../../../../nitro/nitro.mjs';
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

const check_post = defineEventHandler(async (event) => {
  var _a;
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id urz\u0105dzenia klienta" });
  const customerDevice = await db.query.customerDevices.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: {
      equipment: true,
      onuEquipment: {
        with: {
          parentEquipment: true
        }
      }
    }
  });
  if (!customerDevice) throw createError({ statusCode: 404, statusMessage: "Urz\u0105dzenie klienta nie istnieje" });
  const managedEquipmentId = customerDevice.equipmentId || ((_a = customerDevice.onuEquipment) == null ? void 0 : _a.parentEquipmentId);
  if (!managedEquipmentId) throw createError({ statusCode: 422, statusMessage: "Brak urz\u0105dzenia zarz\u0105dzaj\u0105cego dla diagnostyki" });
  const { driver, driverCode } = await getDriverForEquipment(managedEquipmentId);
  const target = customerDevice.ipAddress || customerDevice.hostname;
  const mac = customerDevice.macAddress;
  const checks = [];
  if (target) {
    checks.push(await driver.ping(target));
    checks.push(await driver.arpPing(target));
  }
  if (mac) {
    checks.push(await driver.getDhcpLease(mac));
    checks.push(await driver.getBridgeHost(mac));
    checks.push(await driver.getSwitchFdb(mac));
  }
  const success = checks.some((check) => check.status === "ok");
  const result = withDiagnosticPresentation("Ping / ARP / DHCP", { success, driver: driverCode, target, checks, errors: checks.filter((check) => check.status === "error") });
  await db.insert(diagnosticRuns).values({
    customerDeviceId: customerDevice.id,
    equipmentId: managedEquipmentId,
    driverCode,
    runType: "customer-device-check",
    target,
    success,
    result
  });
  return { success, data: result };
});

export { check_post as default };
