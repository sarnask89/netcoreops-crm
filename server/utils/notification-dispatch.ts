import { eq } from 'drizzle-orm'
import { customers, emailLogs } from '../db/schema'
import { db } from './db'
import { sendMail } from './mailer'
import { renderNotificationTemplate } from './notification-render'

type NotificationEventType = 'ticket_created' | 'ticket_reply' | 'invoice_issued' | 'payment_received' | 'payment_overdue' | 'subscription_expiring'

interface NotificationRecipient {
  type: 'customer' | 'admin' | 'email'
  value?: string
}

interface DispatchNotificationEventOptions {
  eventType: NotificationEventType
  variables: Record<string, string>
  customerId?: string | null
  customerEmail?: string | null
  relatedEntityType?: string
  relatedEntityId?: string
}

function isNotificationRecipient(value: unknown): value is NotificationRecipient {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (candidate.type === 'customer' || candidate.type === 'admin' || candidate.type === 'email')
    && (candidate.value === undefined || typeof candidate.value === 'string')
}

function parseRecipients(value: unknown): NotificationRecipient[] {
  return Array.isArray(value) ? value.filter(isNotificationRecipient) : []
}

function adminRecipients() {
  return (process.env.NETCOREOPS_NOTIFICATION_ADMIN_EMAILS ?? '')
    .split(',')
    .map(email => email.trim())
    .filter(Boolean)
}

function conditionsMatch(conditions: Record<string, unknown> | null, variables: Record<string, string>) {
  if (!conditions) return true
  return Object.entries(conditions).every(([key, expected]) => {
    if (expected == null || expected === '') return true
    return (variables[key] ?? '').trim().toLowerCase() === String(expected).trim().toLowerCase()
  })
}

async function logFailedEmail(options: {
  to: string
  subject: string
  html: string
  templateId?: number
  relatedEntityType?: string
  relatedEntityId?: string
  error: string
}) {
  await db.insert(emailLogs).values({
    to: options.to,
    fromEmail: 'system@netcoreops.local',
    subject: options.subject,
    bodyExcerpt: options.html.substring(0, 500),
    templateId: options.templateId ?? null,
    status: 'failed',
    error: options.error,
    relatedEntityType: options.relatedEntityType ?? null,
    relatedEntityId: options.relatedEntityId ?? null
  })
}

export async function dispatchNotificationEvent(options: DispatchNotificationEventOptions) {
  const customer = options.customerId
    ? await db.query.customers.findFirst({ where: eq(customers.id, options.customerId) })
    : undefined
  const customerEmail = options.customerEmail ?? customer?.contactEmail ?? null

  const rules = await db.query.notificationRules.findMany({
    where: (table, { and, eq }) => and(eq(table.eventType, options.eventType), eq(table.enabled, true)),
    with: { template: true }
  })

  for (const rule of rules) {
    if (!rule.template?.isActive) continue
    if (!conditionsMatch(rule.conditions, options.variables)) continue

    const recipients = new Set<string>()
    for (const recipient of parseRecipients(rule.recipients)) {
      if (recipient.type === 'customer' && customerEmail) recipients.add(customerEmail)
      if (recipient.type === 'admin') adminRecipients().forEach(email => recipients.add(email))
      if (recipient.type === 'email' && recipient.value) recipients.add(recipient.value)
    }
    if (recipients.size === 0) continue

    const subject = renderNotificationTemplate(rule.template.subject, options.variables)
    const html = renderNotificationTemplate(rule.template.bodyHtml, options.variables)

    for (const to of recipients) {
      try {
        await sendMail({
          to,
          subject,
          html,
          smtpConfigId: rule.template.smtpConfigId ?? undefined,
          templateId: rule.template.id,
          relatedEntityType: options.relatedEntityType,
          relatedEntityId: options.relatedEntityId
        })
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Nie udało się wysłać powiadomienia'
        await logFailedEmail({
          to,
          subject,
          html,
          templateId: rule.template.id,
          relatedEntityType: options.relatedEntityType,
          relatedEntityId: options.relatedEntityId,
          error: message
        })
      }
    }
  }
}
