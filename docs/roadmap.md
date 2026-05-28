# NetCoreOps Roadmap — 6 Tiers

## P1 ✅ — Finance & Invoicing

- invoices, proformas, credit notes, receipts
- number plans
- payments
- customer balance
- Full CRUD + invoice generation from subscriptions

## P2 — Helpdesk / Support Tickets

- tickets table: subject, status, priority, customer FK, assigned user, category
- ticket_messages table: author/content/attachments
- Categories/queues
- Admin CRUD + customer portal ticket view/create
- Email notifications on updates

## P3 — Email & Notifications Engine

- SMTP config in settings
- email_templates table (invoices, ticket replies, reminders)
- Sending utility, e.g. Nodemailer
- Notification rules/conditions (alerts, reminders)
- Customer notification delivery

## P4 — Network Maps & Topology

- Visual map/graph for nodes, lines, equipment (D3/vis-network/canvas)
- Link coloring by utilization/status
- Customer location map (from TERYT addresses)
- Topology/customer-per-device visibility

## P5 — Customer Portal Phase 2+

- Invoice list + download
- Ticket create/track
- Payment history
- Password change
- Contact form
- Offers/shop, upgrade paths
- Pay-by-link / Polish transfer flows

## P6 — Operations Tools

- Audit log (all user actions/mutations)
- Equipment restart/reload UI (SSH/API)
- Config backup scheduling/management
- Scheduled tasks/calendar
- Customer notes/groups/divisions
- Optional syslog integration
