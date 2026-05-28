import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { scheduledTasks } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  taskType: z.string().min(1).optional(),
  targetEntity: z.string().optional().nullable(),
  targetEntityId: z.string().optional().nullable(),
  config: z.any().optional().nullable(),
  cronExpression: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(),
  status: z.string().optional(),
  assignedTo: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id zadania' })

  const existing = await db.select().from(scheduledTasks).where(eq(scheduledTasks.id, id)).limit(1)
  if (!existing.length) throw createError({ statusCode: 404, statusMessage: 'Zadanie nie istnieje' })

  if (event.method === 'PATCH') {
    const body = updateSchema.parse(await readBody(event))
    const updates: Record<string, unknown> = {}
    if (body.title !== undefined) updates.title = body.title
    if (body.description !== undefined) updates.description = body.description
    if (body.taskType !== undefined) updates.taskType = body.taskType
    if (body.targetEntity !== undefined) updates.targetEntity = body.targetEntity
    if (body.targetEntityId !== undefined) updates.targetEntityId = body.targetEntityId
    if (body.config !== undefined) updates.config = body.config
    if (body.cronExpression !== undefined) updates.cronExpression = body.cronExpression
    if (body.scheduledAt !== undefined) updates.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null
    if (body.completedAt !== undefined) updates.completedAt = body.completedAt ? new Date(body.completedAt) : null
    if (body.status !== undefined) updates.status = body.status
    if (body.assignedTo !== undefined) updates.assignedTo = body.assignedTo
    if (body.notes !== undefined) updates.notes = body.notes
    updates.updatedAt = new Date()

    const [row] = await db.update(scheduledTasks).set(updates).where(eq(scheduledTasks.id, id)).returning()
    return { success: true, data: row }
  }

  if (event.method === 'DELETE') {
    await db.delete(scheduledTasks).where(eq(scheduledTasks.id, id))
    return { success: true }
  }

  const [row] = existing
  return { success: true, data: row }
})
