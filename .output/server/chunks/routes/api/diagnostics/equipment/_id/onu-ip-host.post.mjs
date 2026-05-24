import { d as defineEventHandler, k as getRouterParam, c as createError, r as readBody, U as getDriverForEquipment, V as withDiagnosticPresentation } from '../../../../../nitro/nitro.mjs';
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

const onuIpHost_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id urz\u0105dzenia" });
  const body = await readBody(event);
  if (!body.oltPort || !body.onuId) {
    throw createError({ statusCode: 400, statusMessage: "Podaj port OLT i id ONU" });
  }
  const { driver, driverCode, equipment } = await getDriverForEquipment(id);
  const ipHosts = await driver.getOnuIpHosts(body.oltPort, body.onuId);
  const data = withDiagnosticPresentation("ONU IP-host", {
    equipment: {
      id: equipment.id,
      inventoryId: equipment.inventoryId,
      managementIp: equipment.managementIp
    },
    driver: driverCode,
    target: `${body.oltPort}/${body.onuId}`,
    checks: [{
      name: "onu-ip-host",
      status: "ok",
      data: ipHosts
    }]
  });
  return {
    success: true,
    data
  };
});

export { onuIpHost_post as default };
