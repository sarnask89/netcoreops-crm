import { a3 as eventHandler } from '../../nitro/nitro.mjs';
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

const members = eventHandler(async () => {
  const localUser = userInfo().username || "admin";
  const name = process.env.NETCOREOPS_OPERATOR_NAME || localUser;
  return [{
    name,
    username: process.env.NETCOREOPS_OPERATOR_USERNAME || localUser,
    role: "owner",
    avatar: { alt: name }
  }];
});

export { members as default };
