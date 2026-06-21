import { prisma } from '../../prisma'

// ========================
// CREATE
// ========================
export const createVehicle = async (data: any, user: any) => {
  return prisma.veiculo.create({
    data: {
      ...data,
      tenantId: user.tenantId,
    },
  })
}

// ========================
// LIST
// ========================
export const getVehicles = async (user: any) => {
  return prisma.veiculo.findMany({
    where: {
      tenantId: user.tenantId,
    },
  })
}

// ========================
// GET BY ID
// ========================
export const getVehicleById = async (id: number, user: any) => {
  return prisma.veiculo.findFirst({
    where: {
      id,
      tenantId: user.tenantId,
    },
  })
}

// ========================
// UPDATE
// ========================
export const updateVehicle = async (id: number, data: any, user: any) => {
  return prisma.veiculo.update({
    where: { id, tenantId: user.tenantId },
    data,
  })
}

// ========================
// DELETE
// ========================
export const deleteVehicle = async (id: number, user: any) => {
  return prisma.veiculo.delete({
    where: { id, tenantId: user.tenantId },
  })
}