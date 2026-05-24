import { randomUUID } from 'node:crypto'
import type { ImportMode } from '../utils/import-actions'
import { getDriverForEquipment } from '../utils/network-driver-context'
import {
  runDasanIpHostsImport,
  runDasanMacMapImport,
  type DasanImportProgress,
  type DasanImportResult
} from './dasan-import-runner'

export type FtthImportJobKind = 'ip-hosts' | 'mac-map'
export type FtthImportJobStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface FtthImportJob {
  id: string
  kind: FtthImportJobKind
  equipmentId: string
  status: FtthImportJobStatus
  progress: DasanImportProgress
  result?: DasanImportResult
  error?: string
  createdAt: string
  updatedAt: string
}

interface CreateFtthImportJobOptions {
  equipmentId: string
  kind: FtthImportJobKind
  mode: ImportMode
  activeOnly: boolean
  limit?: number
  rangeFrom?: number
  rangeTo?: number
}

const jobs = new Map<string, FtthImportJob>()

function now() {
  return new Date().toISOString()
}

function cloneJob(job: FtthImportJob): FtthImportJob {
  return structuredClone(job)
}

function cleanupCompletedJobs() {
  const cutoff = Date.now() - 60 * 60 * 1000
  for (const [id, job] of jobs) {
    if ((job.status === 'completed' || job.status === 'failed') && Date.parse(job.updatedAt) < cutoff) {
      jobs.delete(id)
    }
  }
}

function updateJobProgress(id: string, progress: DasanImportProgress) {
  const job = jobs.get(id)
  if (!job) return
  job.progress = progress
  job.updatedAt = now()
}

async function runJob(jobId: string, options: CreateFtthImportJobOptions) {
  const job = jobs.get(jobId)
  if (!job) return

  try {
    job.status = 'running'
    job.updatedAt = now()
    const { driver, driverCode } = await getDriverForEquipment(options.equipmentId)
    const runnerOptions = {
      equipmentId: options.equipmentId,
      mode: options.mode,
      activeOnly: options.activeOnly,
      limit: options.limit,
      rangeFrom: options.rangeFrom,
      rangeTo: options.rangeTo,
      driver,
      driverCode,
      onProgress: (progress: DasanImportProgress) => updateJobProgress(jobId, progress)
    }
    const result = options.kind === 'ip-hosts'
      ? await runDasanIpHostsImport(runnerOptions)
      : await runDasanMacMapImport(runnerOptions)

    const completedJob = jobs.get(jobId)
    if (!completedJob) return
    completedJob.status = 'completed'
    completedJob.progress = result.progress
    completedJob.result = result
    completedJob.updatedAt = now()
  } catch (error) {
    const failedJob = jobs.get(jobId)
    if (!failedJob) return
    failedJob.status = 'failed'
    failedJob.error = error instanceof Error ? error.message : String(error)
    failedJob.progress = {
      ...failedJob.progress,
      completed: false,
      currentOnu: null
    }
    failedJob.updatedAt = now()
  }
}

export function createFtthImportJob(options: CreateFtthImportJobOptions): FtthImportJob {
  cleanupCompletedJobs()

  const createdAt = now()
  const job: FtthImportJob = {
    id: randomUUID(),
    kind: options.kind,
    equipmentId: options.equipmentId,
    status: 'queued',
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
  }

  jobs.set(job.id, job)
  void runJob(job.id, options)

  return cloneJob(job)
}

export function getFtthImportJob(id: string) {
  const job = jobs.get(id)
  return job ? cloneJob(job) : null
}
