import { prisma } from '../prisma'

type AuditInput = {
  tenantId: number
  userId: number
  action: string
  entity: string
  entityId: string
  metadata?: any
}

export const logAudit = async (data: AuditInput) => {
  try {
    await prisma.auditLog.create({
      data,
    })
  } catch (err) {
    console.error('Erro ao salvar audit log:', err)
  }
}