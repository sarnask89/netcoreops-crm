import { a3 as eventHandler } from '../../nitro/nitro.mjs';
import { l as loadRecentGponRxAlerts } from '../../_/gpon-rx-monitor.mjs';
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

const notifications = eventHandler(async () => {
  const alerts = await loadRecentGponRxAlerts(25);
  return alerts.map((alert, index) => ({
    id: index + 1,
    unread: true,
    sender: {
      name: alert.severity === "critical" ? "GPON RX krytyczny" : "GPON RX ostrze\u017Cenie"
    },
    body: alert.message,
    date: alert.createdAt.toISOString()
  }));
});

export { notifications as default };
