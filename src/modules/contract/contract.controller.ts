import { Request, Response } from 'express'
import * as service from './contract.service'
import { createContractSchema } from './contract.schemas'

export const createContract = async (req: Request, res: Response) => {
  const tenantId = Number((req as any).tenantId)
  const userId = Number((req as any).user.userId)
  const data = createContractSchema.parse(req.body)

  try {
    const contract = await service.createContract(
      tenantId,
      userId,
      data.vehicleId,
      data.inspectionId,
    )
    return res.json({ success: true, data: contract })
  } catch (error: any) {
    if (error.message === 'VEHICLE_NOT_FOUND_OR_DIFFERENT_TENANT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VEHICLE_NOT_FOUND',
          message: 'Veículo não encontrado ou pertence a outro tenant',
        },
      })
    }

    if (error.message === 'INSPECTION_NOT_FOUND_OR_DIFFERENT_TENANT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSPECTION_NOT_FOUND',
          message: 'Inspeção não encontrada ou pertence a outro tenant',
        },
      })
    }

    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao criar contrato' },
    })
  }
}

export const listContracts = async (req: Request, res: Response) => {
  const tenantId = Number((req as any).tenantId)
  const contracts = service.getContracts(tenantId)
  return res.json({ success: true, data: contracts })
}

export const getContractById = async (req: Request, res: Response) => {
  const tenantId = Number((req as any).tenantId)
  const id = Number(req.params.id)

  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ID', message: 'ID inválido' }
    })
  }

  const contract = service.getContractById(id, tenantId)

  if (!contract) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Contrato não encontrado' }
    })
  }

  return res.json({ success: true, data: contract })
}

export const cancelContract = async (req: Request, res: Response) => {
  const tenantId = Number((req as any).tenantId)
  const id = Number(req.params.id)

  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ID', message: 'ID inválido' }
    })
  }

  const contract = service.cancelContract(id, tenantId)

  if (!contract) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Contrato não encontrado ou pertence a outro tenant'
      }
    })
  }

  return res.json({ success: true, data: contract })
}