import { renderAutomationTemplate } from './automation-render'

export function renderNotificationTemplate(template: string, variables: Record<string, string>) {
  return renderAutomationTemplate(template, variables)
}
