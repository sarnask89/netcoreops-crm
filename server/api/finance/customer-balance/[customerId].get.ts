import { apiHandler } from '../../../utils/api-handler'
import { eq, sql } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { db } from '../../../utils/db'
import { documents, payments } from '../../../db/schema'

export default apiHandler(async (event) => {
  const customerId = getRouterParam(event, 'customerId')
  if (!customerId) throw createError({ statusCode: 400, statusMessage: 'Brak id klienta' })

  const [invoiceSum] = await db.select({
    totalInvoiced: sql<string>`COALESCE(SUM(${documents.totalGross}), 0)`
  })
    .from(documents)
    .where(
      sql`${documents.customerId} = ${customerId} AND ${documents.isCancelled} = false`
    )

  const [paymentSum] = await db.select({
    totalPaid: sql<string>`COALESCE(SUM(${payments.amount}), 0)`
  })
    .from(payments)
    .where(eq(payments.customerId, customerId))

  return {
    success: true,
    data: {
      customerId,
      totalInvoiced: invoiceSum?.totalInvoiced ?? '0',
      totalPaid: paymentSum?.totalPaid ?? '0',
      balance: String(Number(invoiceSum?.totalInvoiced ?? '0') - Number(paymentSum?.totalPaid ?? '0'))
    }
  }
})
