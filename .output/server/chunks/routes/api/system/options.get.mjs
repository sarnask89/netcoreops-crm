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

const options_get = defineEventHandler(async () => {
  const [media, technologies, profiles, drivers, models, nodes, equipment, customers, tariffs, customerDevices] = await Promise.all([
    db.query.ukeMediumTypes.findMany({ orderBy: (table, { asc }) => [asc(table.label)] }),
    db.query.ukeTechnologyTypes.findMany({ orderBy: (table, { asc }) => [asc(table.label)] }),
    db.query.accessProfiles.findMany({ orderBy: (table, { asc }) => [asc(table.name)] }),
    db.query.managementDrivers.findMany({ orderBy: (table, { asc }) => [asc(table.label)] }),
    db.query.deviceModels.findMany({
      with: { type: true, technology: true },
      orderBy: (table, { asc }) => [asc(table.manufacturer), asc(table.modelName)]
    }),
    db.query.networkNodes.findMany({ orderBy: (table, { asc }) => [asc(table.name)] }),
    db.query.networkEquipment.findMany({
      with: {
        model: true,
        node: true,
        accessProfile: true,
        managementDriver: true
      },
      orderBy: (table, { asc }) => [asc(table.inventoryId)]
    }),
    db.query.customers.findMany({ orderBy: (table, { asc }) => [asc(table.fullName)] }),
    db.query.tariffs.findMany({ orderBy: (table, { asc }) => [asc(table.name)] }),
    db.query.customerDevices.findMany({ orderBy: (table, { asc }) => [asc(table.hostname)] })
  ]);
  return {
    success: true,
    data: {
      media,
      technologies,
      profiles,
      drivers,
      models,
      nodes,
      equipment,
      customers,
      tariffs,
      customerDevices
    }
  };
});

export { options_get as default };
