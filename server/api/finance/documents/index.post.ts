import { apiHandler } from '../../../utils/api-handler'
import { db } from '../../../utils/db'
import { readBody } from 'h3'
import { documents, documentItems } from '../../../db/schema'
import { createDocumentSchema } from '../../../utils/api-validation'
import { dispatchNotificationEvent } from '../../../utils/notification-dispatch'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const payload = createDocumentSchema.parse(body)

  const { items, ...documentFields } = payload

  const shortNumber = Date.now().toString(36).toUpperCase()
  const insertValues: typeof documents.$inferInsert = {
    fullNumber: `MANUAL-${shortNumber}`,
    type: documentFields.type,
    customerId: documentFields.customerId,
    issueDate: documentFields.issueDate,
    saleDate: documentFields.saleDate,
    dueDate: documentFields.dueDate ?? null,
    paymentMethod: documentFields.paymentMethod ?? 'transfer',
    notes: documentFields.notes ?? null,
    totalNet: String(payload.totalNet),
    totalVat: String(payload.totalVat),
    totalGross: String(payload.totalGross)
  }

  const result = await db.insert(documents).values(insertValues).returning()
  const document = result[0]!

  if (items && items.length > 0) {
    await db.insert(documentItems).values(
      items.map(item => ({
        ...item,
        documentId: document.id,
        quantity: String(item.quantity),
        unitNetPrice: String(item.unitNetPrice),
        vatRate: String(item.vatRate),
        netAmount: String(item.netAmount),
        vatAmount: String(item.vatAmount),
        grossAmount: String(item.grossAmount),
        subscriptionId: item.subscriptionId ?? null,
        tariffId: item.tariffId ?? null
      }))
    )
  }

  if (document.customerId) {
    await dispatchNotificationEvent({
      eventType: 'invoice_issued',
      customerId: document.customerId,
      relatedEntityType: 'document',
      relatedEntityId: document.id,
      variables: {
        document_id: document.id,
        document_number: document.fullNumber,
        document_type: document.type,
        total_net: document.totalNet,
        total_vat: document.totalVat,
        total_gross: document.totalGross,
        issue_date: document.issueDate,
        due_date: document.dueDate ?? '',
        customer_id: document.customerId
      }
    })
  }

  return { success: true, data: document }
})
