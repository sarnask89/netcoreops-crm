export function formatAddress(record: {
  street?: { streetType?: string | null, name?: string | null } | null
  serviceStreet?: { streetType?: string | null, name?: string | null } | null
  billingStreet?: { streetType?: string | null, name?: string | null } | null
  simcLocality?: { name?: string | null } | null
  serviceSimcLocality?: { name?: string | null } | null
  billingSimcLocality?: { name?: string | null } | null
  buildingNumber?: string | null
  serviceBuildingNumber?: string | null
  billingBuildingNumber?: string | null
  serviceApartmentNumber?: string | null
  billingApartmentNumber?: string | null
}) {
  const street = record.street || record.serviceStreet || record.billingStreet
  const locality = record.simcLocality || record.serviceSimcLocality || record.billingSimcLocality
  const building = record.buildingNumber || record.serviceBuildingNumber || record.billingBuildingNumber
  const apartmentNumber = record.serviceApartmentNumber || record.billingApartmentNumber
  const apartment = apartmentNumber ? `/${apartmentNumber}` : ''

  return [
    street ? `${street.streetType || 'ul.'} ${street.name}` : '',
    building ? `${building}${apartment}` : '',
    locality?.name || ''
  ].filter(Boolean).join(', ')
}
