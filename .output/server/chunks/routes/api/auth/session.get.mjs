import { d as defineEventHandler, a as getAuthConfig, i as validateAuthSessionToken, j as getCookie, A as AUTH_COOKIE_NAME } from '../../../nitro/nitro.mjs';
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

const session_get = defineEventHandler((event) => {
  const config = getAuthConfig();
  const session = validateAuthSessionToken(getCookie(event, AUTH_COOKIE_NAME), config.sessionSecret);
  return {
    success: true,
    data: {
      enabled: config.enabled,
      authenticated: Boolean(session),
      username: (session == null ? void 0 : session.username) || null
    }
  };
});

export { session_get as default };
