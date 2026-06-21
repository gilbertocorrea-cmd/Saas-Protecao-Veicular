import { prisma } from '../../prisma'

export type InspectionRecord = {
  id: number
  vehicleId: number
  tenantId: number
  status: string
  createdAt: string
}

const inspections: InspectionRecord[] = []
let nextInspectionId = 1

async function validateVehicleTenant(vehicleId: number, tenantId: number) {
  const vehicle = await prisma.veiculo.findFirst({
    where: {
      id: vehicleId,
      tenantId,
    },
  })

  return Boolean(vehicle)
}

export async function createInspection(
  tenantId: number,
  vehicleId: number,
  status: string = 'PENDENTE',
) {
  const vehicleValid = await validateVehicleTenant(vehicleId, tenantId)

  if (!vehicleValid) {
    throw new Error('VEHICLE_NOT_FOUND_OR_DIFFERENT_TENANT')
  }

  const inspection: InspectionRecord = {
    id: nextInspectionId++,
    vehicleId,
    tenantId,
    status,
    createdAt: new Date().toISOString(),
  }

  inspections.push(inspection)
  return inspection
}

export function listInspections(tenantId: number | string) {
  const normalizedTenantId = Number(tenantId)
  return inspections.filter((item) => item.tenantId === normalizedTenantId)
}

export function getInspectionById(id: number, tenantId: number | string) {
  const normalizedTenantId = Number(tenantId)
  return inspections.find((item) => item.id === id && item.tenantId === normalizedTenantId) ?? null
}

export async function updateInspection(
  id: number,
  tenantId: number | string,
  data: { status?: string },
) {
  const normalizedTenantId = Number(tenantId)
  const inspection = inspections.find((item) => item.id === id && item.tenantId === normalizedTenantId)

  if (!inspection) return null

  if (data.status !== undefined) {
    inspection.status = data.status
  }

  return inspection
}

export function deleteInspection(id: number, tenantId: number | string) {
  const normalizedTenantId = Number(tenantId)
  const index = inspections.findIndex((item) => item.id === id && item.tenantId === normalizedTenantId)
  if (index === -1) return false
  inspections.splice(index, 1)
  return true
}
