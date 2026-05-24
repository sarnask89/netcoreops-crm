import { d as defineEventHandler, k as getRouterParam, c as createError, l as db, m as automationScripts, p as executeAutomationScript } from '../../../../../nitro/nitro.mjs';
import { eq } from 'drizzle-orm';
import 'zod';
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

const run_post = defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: "Brak id skryptu" });
  const script = await db.query.automationScripts.findFirst({ where: eq(automationScripts.id, id) });
  if (!script) throw createError({ statusCode: 404, statusMessage: "Skrypt nie istnieje" });
  const execution = await executeAutomationScript(script);
  if (!execution.success) {
    throw createError({
      statusCode: 500,
      statusMessage: execution.stderr || "Skrypt zako\u0144czy\u0142 si\u0119 b\u0142\u0119dem"
    });
  }
  await db.update(automationScripts).set({ lastRunAt: /* @__PURE__ */ new Date() }).where(eq(automationScripts.id, script.id));
  return {
    success: true,
    data: {
      ...execution.data && typeof execution.data === "object" ? execution.data : {},
      execution: {
        exitCode: execution.exitCode,
        stdout: execution.stdout,
        stderr: execution.stderr
      }
    }
  };
});

export { run_post as default };
