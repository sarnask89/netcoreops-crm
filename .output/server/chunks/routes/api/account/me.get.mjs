import { d as defineEventHandler } from '../../../nitro/nitro.mjs';
import { userInfo } from 'node:os';
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

const me_get = defineEventHandler(async (event) => {
  var _a;
  const user = userInfo();
  const username = ((_a = event.context.auth) == null ? void 0 : _a.username) || process.env.NETCOREOPS_OPERATOR_USERNAME || user.username || "admin";
  const name = process.env.NETCOREOPS_OPERATOR_NAME || (username === "root" ? "Administrator" : username);
  const role = process.env.NETCOREOPS_OPERATOR_ROLE || "Administrator lokalny";
  const email = process.env.NETCOREOPS_OPERATOR_EMAIL || `${username}@local.netcoreops`;
  return {
    success: true,
    data: {
      username,
      name,
      role,
      email,
      host: process.env.HOSTNAME || "localhost"
    }
  };
});

export { me_get as default };
