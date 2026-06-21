import { Request, Response } from 'express'
import * as service from './vehicle.service'
import { createVehicleSchema, updateVehicleSchema } from './vehicle.schemas'

// ========================
// CREATE
// ========================
export const create = async (req: any, res: Response) => {
  const data = createVehicleSchema.parse(req.body)
  const vehicle = await service.createVehicle(data, req.user)

  return res.json({ success: true, data: vehicle })
}

// ========================
// LIST
// ========================
export const list = async (req: any, res: Response) => {
  const vehicles = await service.getVehicles(req.user)
  return res.json({ success: true, data: vehicles })
}

// ========================
// GET BY ID
// ========================
export const getById = async (req: any, res: Response) => {
  const vehicle = await service.getVehicleById(Number(req.params.id), req.user)

  if (!vehicle) {
    return res.status(404).json({ success: false })
  }

  return res.json({ success: true, data: vehicle })
}

// ========================
// UPDATE
// ========================
export const update = async (req: any, res: Response) => {
  const data = updateVehicleSchema.parse(req.body)

  const vehicle = await service.updateVehicle(
    Number(req.params.id),
    data,
    req.user
  )

  return res.json({ success: true, data: vehicle })
}

// ========================
// DELETE
// ========================
export const remove = async (req: any, res: Response) => {
  await service.deleteVehicle(Number(req.params.id), req.user)

  return res.json({ success: true })
}