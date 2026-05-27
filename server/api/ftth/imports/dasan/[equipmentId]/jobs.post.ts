import { apiHandler } from '../../../../../utils/api-handler'
import { getRouterParam, readBody } from 'h3'
import { createFtthImportJob, type FtthImportJobKind } from '../../../../../ftth/import-jobs'
import { importModeSchema } from '../../../../../utils/api-validation'

export default apiHandler(async (event) => {
  const equipmentId = getRouterParam(event, 'equipmentId')
  if (!equipmentId) throw createError({ statusCode: 400, statusMessage: 'Brak equipmentId' })

  const body = await readBody(event)
  const parsed = importModeSchema.parse(body || {})
  const kind = (body as { kind?: string })?.kind
  if (kind !== 'ip-hosts' && kind !== 'mac-map') {
    throw createError({ statusCode: 400, statusMessage: 'Nieobsługiwany typ importu FTTH' })
  }

  return {
    success: true,
    data: createFtthImportJob({
      equipmentId,
      kind: kind as FtthImportJobKind,
      mode: parsed.mode,
      activeOnly: parsed.activeOnly,
      limit: parsed.limit,
      rangeFrom: parsed.rangeFrom,
      rangeTo: parsed.rangeTo
    })
  }
})
