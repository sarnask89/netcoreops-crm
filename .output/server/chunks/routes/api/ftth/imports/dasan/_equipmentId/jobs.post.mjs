import { d as defineEventHandler, k as getRouterParam, c as createError, r as readBody, X as importModeSchema } from '../../../../../../nitro/nitro.mjs';
import { c as createFtthImportJob } from '../../../../../../_/import-jobs.mjs';
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
import '../../../../../../_/dasan-import-runner.mjs';
import '../../../../../../_/import-service.mjs';

const jobs_post = defineEventHandler(async (event) => {
  const equipmentId = getRouterParam(event, "equipmentId");
  if (!equipmentId) throw createError({ statusCode: 400, statusMessage: "Brak equipmentId" });
  const body = await readBody(event).catch(() => ({}));
  const parsed = importModeSchema.parse(body || {});
  const kind = body == null ? void 0 : body.kind;
  if (kind !== "ip-hosts" && kind !== "mac-map") {
    throw createError({ statusCode: 400, statusMessage: "Nieobs\u0142ugiwany typ importu FTTH" });
  }
  return {
    success: true,
    data: createFtthImportJob({
      equipmentId,
      kind,
      mode: parsed.mode,
      activeOnly: parsed.activeOnly,
      limit: parsed.limit,
      rangeFrom: parsed.rangeFrom,
      rangeTo: parsed.rangeTo
    })
  };
});

export { jobs_post as default };
