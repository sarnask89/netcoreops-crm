import { d as defineEventHandler, l as db, ak as setHeader, al as toCsv } from '../../../nitro/nitro.mjs';
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

const export_get = defineEventHandler(async (event) => {
  const rows = await db.query.customerServices.findMany({
    with: {
      customer: true,
      profile: {
        with: {
          technology: true
        }
      },
      equipment: {
        with: {
          model: {
            with: {
              technology: true
            }
          },
          node: {
            with: {
              medium: true,
              terytArea: true,
              simcLocality: true,
              street: true
            }
          }
        }
      },
      serviceTerytArea: true,
      serviceSimcLocality: true,
      serviceStreet: true
    }
  });
  const csvRows = rows.map((row) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    return {
      service_id: row.id,
      customer_name: row.customer.fullName,
      customer_type: row.customer.customerType,
      service_status: row.status,
      service_teryt: ((_a = row.serviceTerytArea) == null ? void 0 : _a.terytCode) || "",
      service_simc: ((_b = row.serviceSimcLocality) == null ? void 0 : _b.simcCode) || "",
      service_ulic: ((_c = row.serviceStreet) == null ? void 0 : _c.ulicCode) || "",
      service_address: [
        row.serviceStreet ? `${row.serviceStreet.streetType || "ul."} ${row.serviceStreet.name}` : "",
        row.serviceBuildingNumber,
        row.serviceApartmentNumber ? `/${row.serviceApartmentNumber}` : "",
        ((_d = row.serviceSimcLocality) == null ? void 0 : _d.name) || ""
      ].filter(Boolean).join(" "),
      profile_name: row.profile.name,
      technology_code: ((_e = row.profile.technology) == null ? void 0 : _e.code) || ((_g = (_f = row.equipment) == null ? void 0 : _f.model.technology) == null ? void 0 : _g.code) || "",
      download_mbps: row.profile.downloadSpeedMbps,
      upload_mbps: row.profile.uploadSpeedMbps,
      equipment_inventory_id: ((_h = row.equipment) == null ? void 0 : _h.inventoryId) || "",
      equipment_role: ((_i = row.equipment) == null ? void 0 : _i.equipmentRole) || "",
      powering_node_inventory_id: ((_k = (_j = row.equipment) == null ? void 0 : _j.node) == null ? void 0 : _k.inventoryId) || "",
      powering_node_name: ((_m = (_l = row.equipment) == null ? void 0 : _l.node) == null ? void 0 : _m.name) || "",
      powering_node_medium: ((_p = (_o = (_n = row.equipment) == null ? void 0 : _n.node) == null ? void 0 : _o.medium) == null ? void 0 : _p.code) || "",
      powering_node_teryt: ((_s = (_r = (_q = row.equipment) == null ? void 0 : _q.node) == null ? void 0 : _r.terytArea) == null ? void 0 : _s.terytCode) || "",
      powering_node_simc: ((_v = (_u = (_t = row.equipment) == null ? void 0 : _t.node) == null ? void 0 : _u.simcLocality) == null ? void 0 : _v.simcCode) || "",
      powering_node_ulic: ((_y = (_x = (_w = row.equipment) == null ? void 0 : _w.node) == null ? void 0 : _x.street) == null ? void 0 : _y.ulicCode) || ""
    };
  });
  setHeader(event, "Content-Type", "text/csv; charset=utf-8");
  setHeader(event, "Content-Disposition", 'attachment; filename="pit-services-export.csv"');
  return toCsv(csvRows, [
    "service_id",
    "customer_name",
    "customer_type",
    "service_status",
    "service_teryt",
    "service_simc",
    "service_ulic",
    "service_address",
    "profile_name",
    "technology_code",
    "download_mbps",
    "upload_mbps",
    "equipment_inventory_id",
    "equipment_role",
    "powering_node_inventory_id",
    "powering_node_name",
    "powering_node_medium",
    "powering_node_teryt",
    "powering_node_simc",
    "powering_node_ulic"
  ]);
});

export { export_get as default };
