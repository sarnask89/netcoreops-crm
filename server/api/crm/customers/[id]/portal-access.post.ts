import { apiHandler } from '../../../../utils/api-handler'
import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { customers, portalUsers } from '../../../../db/schema'
import { db } from '../../../../utils/db'
import { hashPassword } from '../../../../utils/password'
import { randomBytes } from 'node:crypto'

export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Brak id klienta' })

  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, id),
    with: {
      portalUser: true
    }
  })
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Klient nie istnieje' })
  if (customer.archivedAt) throw createError({ statusCode: 400, statusMessage: 'Klient jest zarchiwizowany' })

  // Generate login from email or slugified name
  const loginBase = (customer.contactEmail
    ? customer.contactEmail.split('@')[0]
    : customer.fullName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '.')
        .replace(/\.+/g, '.')
        .replace(/^\.|\.$/g, '')
        .slice(0, 60)) || 'customer'

  let login = customer.portalUser?.login || loginBase
  for (let suffix = 0; ; suffix++) {
    if (customer.portalUser && login === customer.portalUser.login) break
    const existing = await db.query.portalUsers.findFirst({
      where: eq(portalUsers.login, login)
    })
    if (!existing) break
    login = `${loginBase}.${suffix + 1}`
  }

  // Generate random password
  const password = randomBytes(12).toString('base64url').slice(0, 16)
  const passwordHash = await hashPassword(password)

  if (customer.portalUser) {
    // Update existing portal user
    await db.update(portalUsers)
      .set({ passwordHash, isActive: true, updatedAt: new Date() })
      .where(eq(portalUsers.customerId, id))
      .execute()
  } else {
    // Create new portal user
    await db.insert(portalUsers)
      .values({
        customerId: id,
        login,
        passwordHash
      })
      .execute()
  }

  return {
    success: true,
    data: {
      login,
      password,
      message: 'Dane dostępowe do portalu klienta wygenerowane. Zapisz je przed zamknięciem — nie będą widoczne ponownie.'
    }
  }
})
