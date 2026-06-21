import { prisma } from '../../prisma'
import * as inspectionService from '../inspection/inspection.service'

export type ContractRecord = {
  id: number
  tenantId: number
  userId: number
  vehicleId: number
  inspectionId: number
  status: 'ACTIVE' | 'CANCELED'
  createdAt: string
}

const contracts: ContractRecord[] = []
let nextContractId = 1

async function validateVehicleTenant(vehicleId: number, tenantId: number) {
  const vehicle = await prisma.veiculo.findFirst({
    where: {
      id: vehicleId,
      tenantId,
    },
  })

  return Boolean(vehicle)
}

async function validateInspectionTenant(inspectionId: number, tenantId: number) {
  const inspection = inspectionService.getInspectionById(inspectionId, tenantId)
  return Boolean(inspection)
}

export async function createContract(
  tenantId: number,
  userId: number,
  vehicleId: number,
  inspectionId: number,
) {
  const vehicleValid = await validateVehicleTenant(vehicleId, tenantId)
  if (!vehicleValid) {
    throw new Error('VEHICLE_NOT_FOUND_OR_DIFFERENT_TENANT')
  }

  const inspectionValid = await validateInspectionTenant(inspectionId, tenantId)
  if (!inspectionValid) {
    throw new Error('INSPECTION_NOT_FOUND_OR_DIFFERENT_TENANT')
  }

  const contract: ContractRecord = {
    id: nextContractId++,
    tenantId,
    userId,
    vehicleId,
    inspectionId,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  }

  contracts.push(contract)
  return contract
}

export function getContracts(tenantId: number) {
  return contracts.filter((contract) => contract.tenantId === tenantId)
}

export function getContractById(id: number, tenantId: number) {
  return contracts.find((contract) => contract.id === id && contract.tenantId === tenantId) ?? null
}

export function cancelContract(id: number, tenantId: number) {
  const contract = contracts.find((item) => item.id === id && item.tenantId === tenantId)
  if (!contract) return null

  contract.status = 'CANCELED'
  return contract
}
