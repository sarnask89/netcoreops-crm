import { getRouterParam } from 'h3'
import { getFtthImportJob } from '../../../../ftth/import-jobs'

export default defineEventHandler((event) => {
  const jobId = getRouterParam(event, 'jobId')
  if (!jobId) throw createError({ statusCode: 400, statusMessage: 'Brak jobId' })

  const job = getFtthImportJob(jobId)
  if (!job) throw createError({ statusCode: 404, statusMessage: 'Import FTTH nie istnieje' })

  return { success: true, data: job }
})
