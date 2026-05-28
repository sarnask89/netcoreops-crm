import nodemailer from 'nodemailer'
import { db } from './db'
import { eq } from 'drizzle-orm'
import { smtpConfigs, emailLogs } from '../db/schema'

export interface SendMailOptions {
  to: string
  subject: string
  html: string
  smtpConfigId?: number
  templateId?: number
  relatedEntityType?: string
  relatedEntityId?: string
}

export async function sendMail(options: SendMailOptions) {
  const config = options.smtpConfigId
    ? await db.query.smtpConfigs.findFirst({ where: eq(smtpConfigs.id, options.smtpConfigId) })
    : await db.query.smtpConfigs.findFirst({ where: eq(smtpConfigs.isDefault, true) })

  if (!config) {
    throw createError({ statusCode: 400, statusMessage: 'Brak konfiguracji SMTP' })
  }
  if (!config.isActive) {
    throw createError({ statusCode: 400, statusMessage: 'Konfiguracja SMTP jest nieaktywna' })
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.encryption === 'ssl',
    auth: {
      user: config.username,
      pass: config.password
    }
  })

  await transporter.sendMail({
    from: `"${config.fromName || config.fromEmail}" <${config.fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  })

  await db.insert(emailLogs).values({
    to: options.to,
    fromEmail: config.fromEmail,
    subject: options.subject,
    bodyExcerpt: options.html.substring(0, 500),
    templateId: options.templateId ?? null,
    status: 'sent',
    relatedEntityType: options.relatedEntityType ?? null,
    relatedEntityId: options.relatedEntityId ?? null,
    sentAt: new Date()
  })
}

export async function sendTestMail(to: string, smtpConfigId: number) {
  const config = await db.query.smtpConfigs.findFirst({ where: eq(smtpConfigs.id, smtpConfigId) })
  if (!config) {
    throw createError({ statusCode: 404, statusMessage: 'Konfiguracja SMTP nie istnieje' })
  }
  if (!config.isActive) {
    throw createError({ statusCode: 400, statusMessage: 'Konfiguracja SMTP jest nieaktywna' })
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.encryption === 'ssl',
    auth: {
      user: config.username,
      pass: config.password
    }
  })

  await transporter.sendMail({
    from: `"${config.fromName || config.fromEmail}" <${config.fromEmail}>`,
    to,
    subject: 'NetCoreOps — Test konfiguracji SMTP',
    html: '<h2>Test konfiguracji SMTP</h2><p>Jeśli widzisz tę wiadomość, konfiguracja SMTP działa poprawnie.</p>'
  })

  await db.insert(emailLogs).values({
    to,
    fromEmail: config.fromEmail,
    subject: 'NetCoreOps — Test konfiguracji SMTP',
    bodyExcerpt: 'Test konfiguracji SMTP',
    status: 'sent',
    sentAt: new Date()
  })
}
