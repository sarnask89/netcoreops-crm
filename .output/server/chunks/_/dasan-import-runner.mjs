import { Y as compactImportSummary, Z as recordImportRun } from '../nitro/nitro.mjs';
import { l as loadKnownFtthOnus, s as syncDasanOnuIpHostsToFtth, a as syncDasanMacMapToFtth } from './import-service.mjs';

function effectiveImportMode(mode) {
  return mode === "dryRun" ? "preview" : mode;
}
function onuLabel(oltPort, onuId) {
  return `${oltPort}/${onuId}`;
}
function numericPart(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}
function sortOnus(allOnus) {
  return [...allOnus].sort((left, right) => {
    const portDiff = numericPart(left.oltPort) - numericPart(right.oltPort);
    if (portDiff) return portDiff;
    const onuDiff = numericPart(left.onuId) - numericPart(right.onuId);
    if (onuDiff) return onuDiff;
    return `${left.oltPort}:${left.onuId}`.localeCompare(`${right.oltPort}:${right.onuId}`);
  });
}
function selectDasanImportOnus(allOnus, options) {
  const filtered = sortOnus(options.activeOnly ? allOnus.filter((onu) => {
    var _a;
    return ((_a = onu.status) == null ? void 0 : _a.toLowerCase()) === "active";
  }) : allOnus);
  if (options.rangeFrom || options.rangeTo) {
    const start = Math.max((options.rangeFrom || 1) - 1, 0);
    const end = Math.max(options.rangeTo || filtered.length, start);
    return filtered.slice(start, end);
  }
  return filtered.slice(0, options.limit);
}
async function runDasanIpHostsImport(options) {
  var _a, _b, _c;
  const effectiveMode = effectiveImportMode(options.mode);
  const allOnus = await loadKnownFtthOnus(options.equipmentId);
  const onus = selectDasanImportOnus(allOnus, options);
  const ipHosts = [];
  const progress = {
    activeOnly: options.activeOnly,
    totalKnownOnus: allOnus.length,
    selectedOnus: onus.length,
    processedOnus: 0,
    rangeFrom: options.rangeFrom,
    rangeTo: options.rangeTo,
    ipHosts: 0,
    completed: false,
    currentOnu: null
  };
  (_a = options.onProgress) == null ? void 0 : _a.call(options, { ...progress });
  for (const onu of onus) {
    progress.currentOnu = onuLabel(onu.oltPort, onu.onuId);
    (_b = options.onProgress) == null ? void 0 : _b.call(options, { ...progress });
    if (onu.oltPort && onu.onuId) {
      ipHosts.push(...await options.driver.getOnuIpHosts(onu.oltPort, onu.onuId));
      progress.ipHosts = ipHosts.length;
    }
    progress.processedOnus += 1;
    (_c = options.onProgress) == null ? void 0 : _c.call(options, { ...progress });
  }
  const actions = await syncDasanOnuIpHostsToFtth(options.equipmentId, ipHosts, effectiveMode);
  const summary = compactImportSummary({ mode: effectiveMode, macs: ipHosts.length, actions });
  const data = {
    ...summary,
    progress: {
      ...progress,
      ipHosts: ipHosts.length,
      completed: true,
      currentOnu: null
    }
  };
  await recordImportRun(options.equipmentId, options.driverCode, "dasan-ip-hosts", effectiveMode, data);
  return data;
}
async function runDasanMacMapImport(options) {
  var _a, _b, _c;
  const effectiveMode = effectiveImportMode(options.mode);
  const allOnus = await loadKnownFtthOnus(options.equipmentId);
  const onus = selectDasanImportOnus(allOnus, options);
  const macTables = [];
  const progress = {
    activeOnly: options.activeOnly,
    totalKnownOnus: allOnus.length,
    selectedOnus: onus.length,
    processedOnus: 0,
    rangeFrom: options.rangeFrom,
    rangeTo: options.rangeTo,
    macRows: 0,
    completed: false,
    currentOnu: null
  };
  (_a = options.onProgress) == null ? void 0 : _a.call(options, { ...progress });
  for (const onu of onus) {
    progress.currentOnu = onuLabel(onu.oltPort, onu.onuId);
    (_b = options.onProgress) == null ? void 0 : _b.call(options, { ...progress });
    if (onu.oltPort && onu.onuId) {
      macTables.push(...await options.driver.getOnuMacTable(onu.oltPort, onu.onuId));
      progress.macRows = macTables.length;
    }
    progress.processedOnus += 1;
    (_c = options.onProgress) == null ? void 0 : _c.call(options, { ...progress });
  }
  const actions = await syncDasanMacMapToFtth(options.equipmentId, macTables, effectiveMode);
  const summary = compactImportSummary({ mode: effectiveMode, macs: macTables.length, actions });
  const data = {
    ...summary,
    progress: {
      ...progress,
      macRows: macTables.length,
      completed: true,
      currentOnu: null
    }
  };
  await recordImportRun(options.equipmentId, options.driverCode, "dasan-mac-map", effectiveMode, data);
  return data;
}

export { runDasanMacMapImport as a, runDasanIpHostsImport as r };
