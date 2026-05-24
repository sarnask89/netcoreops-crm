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

const oltLookup_post = defineEventHandler(async (event) => {
  var _a;
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id urz\u0105dzenia klienta" });
  const customerDevice = await db.query.customerDevices.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: {
      onuEquipment: {
        with: {
          parentEquipment: true
        }
      }
    }
  });
  if (!customerDevice) throw createError({ statusCode: 404, statusMessage: "Urz\u0105dzenie klienta nie istnieje" });
  if (!((_a = customerDevice.onuEquipment) == null ? void 0 : _a.parentEquipmentId) || !customerDevice.onuEquipment.onuPort || !customerDevice.onuEquipment.onuId) {
    throw createError({ statusCode: 422, statusMessage: "Urz\u0105dzenie nie jest powi\u0105zane z ONU/OLT" });
  }
  const onu = customerDevice.onuEquipment;
  const parentEquipmentId = onu.parentEquipmentId;
  const onuPort = onu.onuPort;
  const onuId = onu.onuId;
  if (!parentEquipmentId) throw createError({ statusCode: 422, statusMessage: "ONU nie ma powi\u0105zanego OLT" });
  if (!onuPort || !onuId) throw createError({ statusCode: 422, statusMessage: "ONU nie ma portu albo identyfikatora" });
  const { driver, driverCode } = await getDriverForEquipment(parentEquipmentId);
  const onuInfo = await driver.getOnuInfo(onuPort, onuId);
  const macTable = await driver.getOnuMacTable(onuPort, onuId);
  const result = withDiagnosticPresentation("OLT lookup", {
    success: onuInfo.status === "ok",
    driver: driverCode,
    target: `${onuPort}/${onuId}`,
    checks: [onuInfo, { name: "onu-mac-table", status: "ok", data: macTable }],
    raw: { onu, macTable },
    errors: onuInfo.status === "error" ? [onuInfo] : []
  });
  await db.insert(diagnosticRuns).values({
    customerDeviceId: customerDevice.id,
    equipmentId: parentEquipmentId,
    driverCode,
    runType: "olt-lookup",
    target: result.target,
    success: result.success,
    result
  });
  return { success: result.success, data: result };
});

export { oltLookup_post as default };
