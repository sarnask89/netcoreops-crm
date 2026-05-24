import { d as defineEventHandler, ap as importDictionariesSchema, r as readBody, l as db, aq as ukeMediumTypes, ar as ukeTechnologyTypes, as as terytAreas, at as simcLocalities, au as ulicStreets } from '../../../../nitro/nitro.mjs';
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

function text(row, ...keys) {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== void 0 && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
}
const import_post = defineEventHandler(async (event) => {
  var _a, _b;
  const payload = importDictionariesSchema.parse(await readBody(event));
  let imported = 0;
  for (const row of payload.rows) {
    if (payload.type === "medium") {
      await db.insert(ukeMediumTypes).values({
        code: text(row, "code", "kod"),
        label: text(row, "label", "nazwa", "name"),
        description: text(row, "description", "opis") || null
      }).onConflictDoUpdate({
        target: ukeMediumTypes.code,
        set: {
          label: text(row, "label", "nazwa", "name"),
          description: text(row, "description", "opis") || null
        }
      });
      imported++;
    }
    if (payload.type === "technology") {
      await db.insert(ukeTechnologyTypes).values({
        code: text(row, "code", "kod"),
        label: text(row, "label", "nazwa", "name"),
        description: text(row, "description", "opis") || null
      }).onConflictDoUpdate({
        target: ukeTechnologyTypes.code,
        set: {
          label: text(row, "label", "nazwa", "name"),
          description: text(row, "description", "opis") || null
        }
      });
      imported++;
    }
    if (payload.type === "teryt") {
      await db.insert(terytAreas).values({
        terytCode: text(row, "terytCode", "teryt", "kod"),
        name: text(row, "name", "nazwa"),
        areaType: text(row, "areaType", "typ") || null,
        voivodeship: text(row, "voivodeship", "wojewodztwo", "wojew\xF3dztwo") || null,
        county: text(row, "county", "powiat") || null,
        commune: text(row, "commune", "gmina") || null
      }).onConflictDoUpdate({
        target: terytAreas.terytCode,
        set: {
          name: text(row, "name", "nazwa"),
          areaType: text(row, "areaType", "typ") || null,
          voivodeship: text(row, "voivodeship", "wojewodztwo", "wojew\xF3dztwo") || null,
          county: text(row, "county", "powiat") || null,
          commune: text(row, "commune", "gmina") || null
        }
      });
      imported++;
    }
    if (payload.type === "simc") {
      const area = await db.query.terytAreas.findFirst({
        where: (table, { eq }) => eq(table.terytCode, text(row, "terytCode", "teryt"))
      });
      await db.insert(simcLocalities).values({
        simcCode: text(row, "simcCode", "simc", "kod"),
        terytAreaId: (_a = area == null ? void 0 : area.id) != null ? _a : null,
        name: text(row, "name", "nazwa"),
        localityType: text(row, "localityType", "typ") || null
      }).onConflictDoUpdate({
        target: simcLocalities.simcCode,
        set: {
          terytAreaId: (_b = area == null ? void 0 : area.id) != null ? _b : null,
          name: text(row, "name", "nazwa"),
          localityType: text(row, "localityType", "typ") || null
        }
      });
      imported++;
    }
    if (payload.type === "ulic") {
      const locality = await db.query.simcLocalities.findFirst({
        where: (table, { eq }) => eq(table.simcCode, text(row, "simcCode", "simc"))
      });
      if (!locality) continue;
      await db.insert(ulicStreets).values({
        ulicCode: text(row, "ulicCode", "ulic", "kod"),
        simcLocalityId: locality.id,
        name: text(row, "name", "nazwa"),
        streetType: text(row, "streetType", "typ") || null
      }).onConflictDoUpdate({
        target: [ulicStreets.simcLocalityId, ulicStreets.ulicCode],
        set: {
          name: text(row, "name", "nazwa"),
          streetType: text(row, "streetType", "typ") || null
        }
      });
      imported++;
    }
  }
  return { success: true, imported };
});

export { import_post as default };
