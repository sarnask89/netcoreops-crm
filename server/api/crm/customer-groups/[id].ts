import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { customerGroups, customerGroupMembers, customers } from '../../../db/schema'
import { eq, inArray } from 'drizzle-orm'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  isActive: z.boolean().optional()
})

export default apiHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id grupy' })

  const existing = await db.select().from(customerGroups).where(eq(customerGroups.id, id)).limit(1)
  if (!existing.length) throw createError({ statusCode: 404, statusMessage: 'Grupa nie istnieje' })

  if (event.method === 'GET') {
    const members = await db.select().from(customerGroupMembers)
      .where(eq(customerGroupMembers.groupId, id))

    const customerIds = members.map(m => m.customerId)
    let customerRows: Array<{ id: string, fullName: string, contactEmail: string | null, contactPhone: string | null }> = []
    if (customerIds.length) {
      customerRows = await db.select({
        id: customers.id,
        fullName: customers.fullName,
        contactEmail: customers.contactEmail,
        contactPhone: customers.contactPhone
      }).from(customers).where(inArray(customers.id, customerIds))
    }

    return { success: true, data: { ...existing[0], members: customerRows } }
  }

  if (event.method === 'PATCH') {
    const body = updateSchema.parse(await readBody(event))
    const [row] = await db.update(customerGroups).set(body).where(eq(customerGroups.id, id)).returning()
    return { success: true, data: row }
  }

  if (event.method === 'DELETE') {
    await db.delete(customerGroups).where(eq(customerGroups.id, id))
    return { success: true }
  }
})
