import { db } from '../../utils/db'

export default defineEventHandler(async () => {
  const [media, technologies, profiles, drivers, models, nodes, equipment, customers, tariffs, customerDevices] = await Promise.all([
    db.query.ukeMediumTypes.findMany({ orderBy: (table, { asc }) => [asc(table.label)] }),
    db.query.ukeTechnologyTypes.findMany({ orderBy: (table, { asc }) => [asc(table.label)] }),
    db.query.accessProfiles.findMany({ orderBy: (table, { asc }) => [asc(table.name)] }),
    db.query.managementDrivers.findMany({ orderBy: (table, { asc }) => [asc(table.label)] }),
    db.query.deviceModels.findMany({
      with: { type: true, technology: true },
      orderBy: (table, { asc }) => [asc(table.manufacturer), asc(table.modelName)]
    }),
    db.query.networkNodes.findMany({ orderBy: (table, { asc }) => [asc(table.name)] }),
    db.query.networkEquipment.findMany({
      with: {
        model: true,
        node: true,
        accessProfile: true,
        managementDriver: true
      },
      orderBy: (table, { asc }) => [asc(table.inventoryId)]
    }),
    db.query.customers.findMany({ orderBy: (table, { asc }) => [asc(table.fullName)] }),
    db.query.tariffs.findMany({ orderBy: (table, { asc }) => [asc(table.name)] }),
    db.query.customerDevices.findMany({ orderBy: (table, { asc }) => [asc(table.hostname)] })
  ])

  return {
    success: true,
    data: {
      media,
      technologies,
      profiles,
      drivers,
      models,
      nodes,
      equipment,
      customers,
      tariffs,
      customerDevices
    }
  }
})
