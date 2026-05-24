import { d as defineEventHandler, k as getRouterParam, c as createError } from '../../../../../nitro/nitro.mjs';
import { g as getFtthImportJob } from '../../../../../_/import-jobs.mjs';
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
import '../../../../../_/dasan-import-runner.mjs';
import '../../../../../_/import-service.mjs';

const _jobId__get = defineEventHandler((event) => {
  const jobId = getRouterParam(event, "jobId");
  if (!jobId) throw createError({ statusCode: 400, statusMessage: "Brak jobId" });
  const job = getFtthImportJob(jobId);
  if (!job) throw createError({ statusCode: 404, statusMessage: "Import FTTH nie istnieje" });
  return { success: true, data: job };
});

export { _jobId__get as default };
