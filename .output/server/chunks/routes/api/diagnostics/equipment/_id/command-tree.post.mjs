import { d as defineEventHandler, k as getRouterParam, c as createError, U as getDriverForEquipment, V as withDiagnosticPresentation } from '../../../../../nitro/nitro.mjs';
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

const commandTree_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id urz\u0105dzenia" });
  const { driver, driverCode, equipment } = await getDriverForEquipment(id);
  const commandTree = await driver.getCommandTree();
  const data = withDiagnosticPresentation("Command tree", {
    equipment: {
      id: equipment.id,
      inventoryId: equipment.inventoryId,
      managementIp: equipment.managementIp
    },
    driver: driverCode,
    target: equipment.inventoryId,
    commandTree
  });
  return {
    success: commandTree.status === "ok",
    data
  };
});

export { commandTree_post as default };
