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
import '@iconify/utils';
import 'consola';

const syncLease_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id urz\u0105dzenia klienta" });
  const customerDevice = await db.query.customerDevices.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: {
      customer: true,
      equipment: true,
      subscriptions: {
        with: {
          tariff: true
        }
      }
    }
  });
  if (!customerDevice) throw createError({ statusCode: 404, statusMessage: "Urz\u0105dzenie klienta nie istnieje" });
  if (!customerDevice.equipmentId || !customerDevice.macAddress || !customerDevice.ipAddress) {
    throw createError({ statusCode: 422, statusMessage: "Brak routera, MAC albo IP do synchronizacji lease" });
  }
  const subscription = customerDevice.subscriptions.find((item) => {
    var _a;
    return item.status === "ACTIVE" && ((_a = item.tariff) == null ? void 0 : _a.serviceType) === "internet";
  });
  if (!(subscription == null ? void 0 : subscription.tariff)) throw createError({ statusCode: 422, statusMessage: "Brak aktywnej subskrypcji internetowej" });
  const upload = subscription.tariff.uploadMbps || 0;
  const download = subscription.tariff.downloadMbps || 0;
  const rateLimit = `${upload}M/${download}M`;
  const { driver, driverCode } = await getDriverForEquipment(customerDevice.equipmentId);
  const check = await driver.upsertDhcpLease({
    macAddress: customerDevice.macAddress,
    ipAddress: customerDevice.ipAddress,
    comment: `CRM:${customerDevice.customerId} ${customerDevice.customer.fullName}`,
    rateLimit
  });
  const result = withDiagnosticPresentation("Synchronizacja DHCP lease", {
    success: check.status === "ok",
    driver: driverCode,
    target: customerDevice.ipAddress,
    checks: [check],
    raw: { rateLimit, subscriptionId: subscription.id },
    errors: check.status === "error" ? [check] : []
  });
  await db.insert(diagnosticRuns).values({
    customerDeviceId: customerDevice.id,
    equipmentId: customerDevice.equipmentId,
    driverCode,
    runType: "sync-lease",
    target: customerDevice.ipAddress,
    success: result.success,
    result
  });
  return { success: result.success, data: result };
});

export { syncLease_post as default };
