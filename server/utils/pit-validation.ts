type ValidationSeverity = 'error' | 'warning'

export interface PitValidationIssue {
  severity: ValidationSeverity
  entity: string
  entityId: string
  code: string
  message: string
}

export interface PitValidationReport {
  errors: PitValidationIssue[]
  warnings: PitValidationIssue[]
}

export interface PitValidationDataset {
  nodes: Array<{
    id: string
    inventoryId: string
    terytCode?: string | null
    simcCode?: string | null
    terytAreaId?: number | null
    simcLocalityId?: number | null
    status: string
  }>
  lines: Array<{
    id: string
    inventoryId: string
    nodeStartId?: string | null
    nodeEndId?: string | null
    status: string
  }>
  equipment: Array<{
    id: string
    inventoryId: string
    equipmentRole: string
    nodeId?: string | null
    status: string
  }>
  services: Array<{
    id: string
    customerId?: string | null
    profileId?: number | null
    serviceAddressTeryt?: string | null
    serviceTerytAreaId?: number | null
    serviceSimcLocalityId?: number | null
    status: string
  }>
}

export function isSevenDigitCode(value: string | null | undefined) {
  return typeof value === 'string' && /^[0-9]{7}$/.test(value)
}

function pushIssue(
  report: PitValidationReport,
  severity: ValidationSeverity,
  entity: string,
  entityId: string,
  code: string,
  message: string
) {
  report[severity === 'error' ? 'errors' : 'warnings'].push({
    severity,
    entity,
    entityId,
    code,
    message
  })
}

export function validatePitReadiness(dataset: PitValidationDataset): PitValidationReport {
  const report: PitValidationReport = { errors: [], warnings: [] }

  for (const node of dataset.nodes) {
    if (!node.terytAreaId && !node.terytCode) {
      pushIssue(report, 'warning', 'networkNodes', node.id, 'NODE_WITHOUT_TERYT', `Węzeł ${node.inventoryId} nie ma powiązania TERYT.`)
    }

    if (!node.simcLocalityId && !node.simcCode) {
      pushIssue(report, 'warning', 'networkNodes', node.id, 'NODE_WITHOUT_SIMC', `Węzeł ${node.inventoryId} nie ma powiązania SIMC.`)
    }

    if (node.terytCode && !isSevenDigitCode(node.terytCode)) {
      pushIssue(report, 'error', 'networkNodes', node.id, 'INVALID_NODE_TERYT', `Węzeł ${node.inventoryId} ma niepoprawny kod TERYT.`)
    }

    if (node.simcCode && !isSevenDigitCode(node.simcCode)) {
      pushIssue(report, 'error', 'networkNodes', node.id, 'INVALID_NODE_SIMC', `Węzeł ${node.inventoryId} ma niepoprawny kod SIMC.`)
    }
  }

  for (const line of dataset.lines) {
    if (!line.nodeStartId || !line.nodeEndId) {
      pushIssue(report, 'error', 'networkLines', line.id, 'LINE_WITHOUT_ENDPOINTS', `Linia ${line.inventoryId} musi mieć oba węzły końcowe.`)
    }
  }

  for (const item of dataset.equipment) {
    if (item.equipmentRole === 'CLIENT_PE' && !item.nodeId) {
      pushIssue(report, 'error', 'networkEquipment', item.id, 'CPE_WITHOUT_NODE', `Punkt elastyczności ${item.inventoryId} musi być zasilany z jednego węzła.`)
    }
  }

  for (const service of dataset.services) {
    if (!service.customerId) {
      pushIssue(report, 'error', 'customerServices', service.id, 'SERVICE_WITHOUT_CUSTOMER', 'Usługa musi być przypisana do klienta.')
    }

    if (!service.profileId) {
      pushIssue(report, 'error', 'customerServices', service.id, 'SERVICE_WITHOUT_PROFILE', 'Usługa musi mieć profil dostępowy.')
    }

    if (service.serviceAddressTeryt && !isSevenDigitCode(service.serviceAddressTeryt)) {
      pushIssue(report, 'error', 'customerServices', service.id, 'INVALID_SERVICE_TERYT', 'Adres usługi ma niepoprawny kod TERYT.')
    }

    if (!service.serviceTerytAreaId && !service.serviceAddressTeryt) {
      pushIssue(report, 'warning', 'customerServices', service.id, 'SERVICE_WITHOUT_TERYT', 'Usługa nie ma powiązania TERYT w definicjach adresowych.')
    }

    if (!service.serviceSimcLocalityId) {
      pushIssue(report, 'warning', 'customerServices', service.id, 'SERVICE_WITHOUT_SIMC', 'Usługa nie ma powiązania SIMC w definicjach adresowych.')
    }
  }

  return report
}

export function formatPitValidationReport(report: PitValidationReport) {
  return {
    ...report,
    summary: {
      errors: report.errors.length,
      warnings: report.warnings.length,
      readyForExport: report.errors.length === 0
    }
  }
}
