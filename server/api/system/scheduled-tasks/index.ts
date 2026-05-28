import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { scheduledTasks } from '../../../db/schema'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  taskType: z.string().min(1),
  targetEntity: z.string().optional().nullable(),
  targetEntityId: z.string().optional().nullable(),
  config: z.any().optional().nullable(),
  cronExpression: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export default apiHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const query = getQuery(event)
    const status = query.status as string | undefined

    let queryBuilder = db.select().from(scheduledTasks).orderBy(desc(scheduledTasks.createdAt)).limit(200).$dynamic()

    if (status) {
      queryBuilder = queryBuilder.where(eq(scheduledTasks.status, status))
    }

    const rows = await queryBuilder
    return { success: true, data: rows }
  }

  if (method === 'POST') {
    const body = taskSchema.parse(await readBody(event))
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null

    const [row] = await db.insert(scheduledTasks).values({
      title: body.title,
      description: body.description || null,
      taskType: body.taskType,
      targetEntity: body.targetEntity || null,
      targetEntityId: body.targetEntityId || null,
      config: body.config || null,
      cronExpression: body.cronExpression || null,
      scheduledAt,
      status: body.status || 'pending',
      assignedTo: body.assignedTo || null,
      notes: body.notes || null
    }).returning()

    return { success: true, data: row }
  }
})
