import { d as defineEventHandler, a as getAuthConfig, r as readBody, v as validateLocalLogin, c as createError, b as setCookie, e as createAuthSessionToken, A as AUTH_COOKIE_NAME, f as AUTH_MAX_AGE_SECONDS } from '../../../nitro/nitro.mjs';
import { z } from 'zod';
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

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});
const login_post = defineEventHandler(async (event) => {
  const config = getAuthConfig();
  const body = loginSchema.parse(await readBody(event));
  if (!validateLocalLogin(body, config)) {
    throw createError({ statusCode: 401, statusMessage: "Nieprawid\u0142owy login lub has\u0142o" });
  }
  setCookie(event, AUTH_COOKIE_NAME, createAuthSessionToken({
    username: body.username,
    secret: config.sessionSecret
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: AUTH_MAX_AGE_SECONDS
  });
  return {
    success: true,
    data: {
      username: body.username
    }
  };
});

export { login_post as default };
