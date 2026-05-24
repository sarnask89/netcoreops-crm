import { randomUUID } from 'node:crypto';
import { U as getDriverForEquipment } from '../nitro/nitro.mjs';
import { r as runDasanIpHostsImport, a as runDasanMacMapImport } from './dasan-import-runner.mjs';

const jobs = /* @__PURE__ */ new Map();
function now() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function cloneJob(job) {
  return structuredClone(job);
}
function cleanupCompletedJobs() {
  const cutoff = Date.now() - 60 * 60 * 1e3;
  for (const [id, job] of jobs) {
    if ((job.status === "completed" || job.status === "failed") && Date.parse(job.updatedAt) < cutoff) {
      jobs.delete(id);
    }
  }
}
function updateJobProgress(id, progress) {
  const job = jobs.get(id);
  if (!job) return;
  job.progress = progress;
  job.updatedAt = now();
}
async function runJob(jobId, options) {
  const job = jobs.get(jobId);
  if (!job) return;
  try {
    job.status = "running";
    job.updatedAt = now();
    const { driver, driverCode } = await getDriverForEquipment(options.equipmentId);
    const runnerOptions = {
      equipmentId: options.equipmentId,
      mode: options.mode,
      activeOnly: options.activeOnly,
      limit: options.limit,
      rangeFrom: options.rangeFrom,
      rangeTo: options.rangeTo,
      driver,
      driverCode,
      onProgress: (progress) => updateJobProgress(jobId, progress)
    };
    const result = options.kind === "ip-hosts" ? await runDasanIpHostsImport(runnerOptions) : await runDasanMacMapImport(runnerOptions);
    const completedJob = jobs.get(jobId);
    if (!completedJob) return;
    completedJob.status = "completed";
    completedJob.progress = result.progress;
    completedJob.result = result;
    completedJob.updatedAt = now();
  } catch (error) {
    const failedJob = jobs.get(jobId);
    if (!failedJob) return;
    failedJob.status = "failed";
    failedJob.error = error instanceof Error ? error.message : String(error);
    failedJob.progress = {
      ...failedJob.progress,
      completed: false,
      currentOnu: null
    };
    failedJob.updatedAt = now();
  }
}
function createFtthImportJob(options) {
  cleanupCompletedJobs();
  const createdAt = now();
  const job = {
    id: randomUUID(),
    kind: options.kind,
    equipmentId: options.equipmentId,
    status: "queued",
    progress: {
      activeOnly: options.activeOnly,
      totalKnownOnus: 0,
      selectedOnus: 0,
      processedOnus: 0,
      rangeFrom: options.rangeFrom,
      rangeTo: options.rangeTo,
      completed: false,
      currentOnu: null
    },
    createdAt,
    updatedAt: createdAt
  };
  jobs.set(job.id, job);
  void runJob(job.id, options);
  return cloneJob(job);
}
function getFtthImportJob(id) {
  const job = jobs.get(id);
  return job ? cloneJob(job) : null;
}

export { createFtthImportJob as c, getFtthImportJob as g };
