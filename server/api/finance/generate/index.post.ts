import { apiHandler } from '../../../utils/api-handler'
import { eq, sql } from 'drizzle-orm'
import { readBody } from 'h3'
import { db } from '../../../utils/db'
import { customers, documents, documentItems, numberPlans, subscriptions } from '../../../db/schema'
import { generateInvoiceSchema } from '../../../utils/api-validation'
import { dispatchNotificationEvent } from '../../../utils/notification-dispatch'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = generateInvoiceSchema.parse(body)

  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, payload.customerId)
  })
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Klient nie istnieje' })

  const subs = await db.query.subscriptions.findMany({
    where: sql`${subscriptions.id} = ANY(ARRAY[${sql.join(payload.subscriptionIds.map(id => sql`${id}::uuid`), sql`, `)}]::uuid[])`,
    with: { tariff: true }
  })
  if (subs.length === 0) throw createError({ statusCode: 400, statusMessage: 'Brak ważnych subskrypcji' })

  const numberPlan = payload.numberPlanId
    ? await db.query.numberPlans.findFirst({ where: eq(numberPlans.id, payload.numberPlanId) })
    : await db.query.numberPlans.findFirst({ where: sql`${numberPlans.isDefault} = true AND ${numberPlans.doctype} = 'invoice'` })

  let fullNumber = ''
  if (numberPlan) {
    const now = new Date()
    fullNumber = numberPlan.template
      .replace(/%Y/g, now.getFullYear().toString())
      .replace(/%m/g, String(now.getMonth() + 1).padStart(2, '0'))
      .replace(/%d/g, String(now.getDate()).padStart(2, '0'))
      .replace(/%NUMBER%/g, String(numberPlan.nextNumber))

    await db.update(numberPlans)
      .set({ nextNumber: numberPlan.nextNumber + 1 })
      .where(eq(numberPlans.id, numberPlan.id))
  }

  const items = subs.map((sub, index) => {
    const tarr = sub.tariff as unknown as { defaultNetPrice: string, vatRate: string, name: string, id: number }
    const unitNetPrice = sub.priceOverrideNet || tarr.defaultNetPrice
    const vatRate = tarr.vatRate
    const netAmount = String(Number(unitNetPrice))
    const vatAmount = ((Number(unitNetPrice) * Number(vatRate)) / 100).toFixed(2)
    const grossAmount = (Number(netAmount) + Number(vatAmount)).toFixed(2)

    return {
      ordinal: index + 1,
      description: `${tarr.name} (${sub.billingPeriod || 'monthly'})`,
      quantity: '1',
      unitNetPrice: String(unitNetPrice),
      vatRate: String(vatRate),
      netAmount,
      vatAmount,
      grossAmount,
      subscriptionId: sub.id,
      tariffId: tarr.id
    }
  })

  const totalNet = items.reduce((sum, item) => sum + Number(item.netAmount), 0)
  const totalVat = items.reduce((sum, item) => sum + Number(item.vatAmount), 0)
  const totalGross = items.reduce((sum, item) => sum + Number(item.grossAmount), 0)

  const customerAddress = [
    customer.billingAddress,
    customer.billingBuildingNumber,
    customer.billingApartmentNumber ? `/${customer.billingApartmentNumber}` : ''
  ].filter(Boolean).join(' ')

  const result = await db.insert(documents).values({
    type: 'invoice',
    fullNumber,
    numberPlanId: numberPlan?.id ?? null,
    customerId: payload.customerId,
    issueDate: payload.issueDate,
    saleDate: payload.saleDate,
    dueDate: payload.dueDate ?? null,
    totalNet: String(totalNet),
    totalVat: String(totalVat),
    totalGross: String(totalGross),
    customerName: customer.fullName,
    customerAddress: customerAddress || null,
    customerTaxId: customer.taxId || null
  }).returning()
  const doc = result[0]

  if (items.length > 0 && doc) {
    await db.insert(documentItems).values(
      items.map(item => ({ ...item, documentId: doc.id }))
    )
  }

  if (!doc) throw createError({ statusCode: 500, statusMessage: 'Nie udało się utworzyć dokumentu' })

  const created = await db.query.documents.findFirst({
    where: eq(documents.id, doc.id),
    with: { items: true, customer: true }
  })

  await dispatchNotificationEvent({
    eventType: 'invoice_issued',
    customerId: doc.customerId,
    customerEmail: customer.contactEmail,
    relatedEntityType: 'document',
    relatedEntityId: doc.id,
    variables: {
      document_id: doc.id,
      document_number: doc.fullNumber,
      document_type: doc.type,
      total_net: doc.totalNet,
      total_vat: doc.totalVat,
      total_gross: doc.totalGross,
      issue_date: doc.issueDate,
      due_date: doc.dueDate ?? '',
      customer_id: customer.id,
      customer_name: customer.fullName
    }
  })

  return { success: true, data: created }
})
