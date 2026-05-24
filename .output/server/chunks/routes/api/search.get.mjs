import { d as defineEventHandler, g as getQuery, l as db, I as customers, P as networkEquipment, E as customerDevices, z as tariffs, ao as subscriptions, a9 as accessProfiles, m as automationScripts } from '../../nitro/nitro.mjs';
import { or, ilike } from 'drizzle-orm';
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

const search_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawTerm = typeof query.q === "string" ? query.q.trim() : "";
  const term = rawTerm.startsWith("@") ? rawTerm.slice(1).trim() : rawTerm;
  if (term.length < 1) {
    return { success: true, data: [] };
  }
  const pattern = `%${term}%`;
  const [customerRows, equipmentRows, customerDeviceRows, tariffRows, subscriptionRows, profileRows, scriptRows] = await Promise.all([
    db.query.customers.findMany({
      where: or(ilike(customers.fullName, pattern), ilike(customers.taxId, pattern), ilike(customers.contactEmail, pattern)),
      limit: 8
    }),
    db.query.networkEquipment.findMany({
      where: or(ilike(networkEquipment.inventoryId, pattern), ilike(networkEquipment.hostname, pattern), ilike(networkEquipment.managementIp, pattern), ilike(networkEquipment.macAddress, pattern)),
      limit: 8
    }),
    db.query.customerDevices.findMany({
      where: or(ilike(customerDevices.hostname, pattern), ilike(customerDevices.ipAddress, pattern), ilike(customerDevices.macAddress, pattern)),
      limit: 8
    }),
    db.query.tariffs.findMany({
      where: or(ilike(tariffs.name, pattern), ilike(tariffs.queueName, pattern), ilike(tariffs.iptvPackageCode, pattern)),
      limit: 8
    }),
    db.query.subscriptions.findMany({
      with: { customer: true, tariff: true },
      where: ilike(subscriptions.status, pattern),
      limit: 8
    }),
    db.query.accessProfiles.findMany({
      where: ilike(accessProfiles.name, pattern),
      limit: 8
    }),
    db.query.automationScripts.findMany({
      where: ilike(automationScripts.name, pattern),
      limit: 8
    })
  ]);
  const functionItems = [{
    label: "@ Definicje zmiennych automatyzacji",
    suffix: "Funkcja",
    icon: "i-lucide-braces",
    to: "/automation/definitions"
  }, {
    label: "@ Skrypty automatyzacji",
    suffix: "Funkcja",
    icon: "i-lucide-file-terminal",
    to: "/automation/scripts"
  }, {
    label: "@ Eksport PIT CSV",
    suffix: "Funkcja",
    icon: "i-lucide-download",
    to: "/api/pit/export",
    target: "_blank"
  }].filter((item) => item.label.toLowerCase().includes(term.toLowerCase()));
  return {
    success: true,
    data: [
      ...functionItems,
      ...customerRows.map((customer) => ({
        label: `@ ${customer.fullName}`,
        suffix: customer.customerType === "BUSINESS" ? "CRM firma" : "CRM klient",
        icon: "i-lucide-user",
        to: "/crm/customers"
      })),
      ...equipmentRows.map((equipment) => ({
        label: `@ ${equipment.inventoryId}`,
        suffix: equipment.hostname || equipment.managementIp || "Urz\u0105dzenie",
        icon: "i-lucide-server",
        to: "/network/equipment"
      })),
      ...customerDeviceRows.map((device) => ({
        label: `@ ${device.hostname}`,
        suffix: [device.ipAddress, device.macAddress].filter(Boolean).join(" / ") || "Urz\u0105dzenie klienta",
        icon: "i-lucide-router",
        to: "/crm/customer-devices"
      })),
      ...tariffRows.map((tariff) => ({
        label: `@ ${tariff.name}`,
        suffix: "Taryfa",
        icon: "i-lucide-receipt",
        to: "/billing/tariffs"
      })),
      ...subscriptionRows.map((subscription) => {
        var _a, _b;
        return {
          label: `@ ${((_a = subscription.customer) == null ? void 0 : _a.fullName) || subscription.id}`,
          suffix: ((_b = subscription.tariff) == null ? void 0 : _b.name) || "Subskrypcja",
          icon: "i-lucide-badge-dollar-sign",
          to: "/billing/assignments"
        };
      }),
      ...profileRows.map((profile) => ({
        label: `@ ${profile.name}`,
        suffix: "Profil dost\u0119powy",
        icon: "i-lucide-sliders-horizontal",
        to: "/network/access-profiles"
      })),
      ...scriptRows.map((script) => ({
        label: `@ ${script.name}`,
        suffix: "Skrypt",
        icon: "i-lucide-file-terminal",
        to: "/automation/scripts"
      }))
    ]
  };
});

export { search_get as default };
