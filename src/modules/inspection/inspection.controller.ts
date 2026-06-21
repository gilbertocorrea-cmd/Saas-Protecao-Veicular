import { Request, Response } from 'express'
import * as service from './inspection.service'

type CreateInspectionPayload = {
  vehicleId: number
  status?: string
}

type UpdateInspectionPayload = {
  status?: string
}

export const createInspection = async (req: Request, res: Response) => {
  const tenantId = Number((req as any).tenantId || (req as any).user?.tenantId)
  const data = req.body as CreateInspectionPayload

  if (!tenantId || Number.isNaN(tenantId)) {
    return res.status(403).json({
      success: false,
      error: { code: 'TENANT_INVALID', message: 'Tenant inválido' },
    })
  }

  try {
    const inspection = await service.createInspection(tenantId, data.vehicleId, data.status)
    return res.json({ success: true, data: inspection })
  } catch (error: any) {
    if (error.message === 'VEHICLE_NOT_FOUND_OR_DIFFERENT_TENANT') {
      return res.status(400).json({
        success: false,
        error: { code: 'VEHICLE_NOT_FOUND', message: 'Veículo não encontrado ou pertence a outro tenant' },
      })
    }

    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao criar inspeção' },
    })
  }
}

export const listInspections = async (req: Request, res: Response) => {
  const tenantId = Number((req as any).tenantId || (req as any).user?.tenantId)
  const inspections = service.listInspections(tenantId)
  return res.json({ success: true, data: inspections })
}

export const getInspectionById = async (req: Request, res: Response) => {
  const tenantId = Number((req as any).tenantId || (req as any).user?.tenantId)
  const id = Number(req.params.id)

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'ID inválido' } })
  }

  const inspection = service.getInspectionById(id, tenantId)
  if (!inspection) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Inspeção não encontrada' } })
  }

  return res.json({ success: true, data: inspection })
}

export const updateInspection = async (req: Request, res: Response) => {
  const tenantId = Number((req as any).tenantId || (req as any).user?.tenantId)
  const id = Number(req.params.id)
  const data = req.body as UpdateInspectionPayload

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'ID inválido' } })
  }

  const inspection = await service.updateInspection(id, tenantId, data)
  if (!inspection) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Inspeção não encontrada' } })
  }

  return res.json({ success: true, data: inspection })
}

export const deleteInspection = async (req: Request, res: Response) => {
  const tenantId = Number((req as any).tenantId || (req as any).user?.tenantId)
  const id = Number(req.params.id)

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'ID inválido' } })
  }

  const removed = service.deleteInspection(id, tenantId)
  if (!removed) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Inspeção não encontrada' } })
  }

  return res.json({ success: true, data: null })
}
