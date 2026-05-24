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

const dictionaries_get = defineEventHandler(async () => {
  const [media, technologies, teryt, simc, ulic] = await Promise.all([
    db.query.ukeMediumTypes.findMany({ orderBy: (table, { asc }) => [asc(table.code)] }),
    db.query.ukeTechnologyTypes.findMany({ orderBy: (table, { asc }) => [asc(table.code)] }),
    db.query.terytAreas.findMany({ orderBy: (table, { asc }) => [asc(table.terytCode)] }),
    db.query.simcLocalities.findMany({
      with: { terytArea: true },
      orderBy: (table, { asc }) => [asc(table.simcCode)]
    }),
    db.query.ulicStreets.findMany({
      with: { locality: { with: { terytArea: true } } },
      orderBy: (table, { asc }) => [asc(table.ulicCode)]
    })
  ]);
  return {
    success: true,
    data: {
      media,
      technologies,
      teryt,
      simc,
      ulic
    }
  };
});

export { dictionaries_get as default };
