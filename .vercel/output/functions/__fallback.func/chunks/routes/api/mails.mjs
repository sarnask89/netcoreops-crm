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
import '@iconify/utils';
import 'consola';

const mails = eventHandler(async () => {
  const alerts = await loadRecentGponRxAlerts(20);
  return alerts.map((alert, index) => ({
    id: index + 1,
    unread: true,
    from: {
      id: 1,
      name: alert.severity === "critical" ? "GPON RX krytyczny" : "GPON RX ostrze\u017Cenie",
      email: "alerts@local.netcoreops",
      status: "subscribed",
      location: alert.equipmentInventoryId
    },
    subject: alert.message,
    body: [
      `OLT: ${alert.equipmentInventoryId}`,
      `PON: ${alert.oltPort}`,
      `ONU: ${alert.onuIdentifier}`,
      `RX: ${alert.signalRx || "Brak odczytu"}`,
      "",
      alert.message
    ].join("\n"),
    date: alert.createdAt.toISOString()
  }));
});

export { mails as default };
