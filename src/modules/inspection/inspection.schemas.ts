import { z } from 'zod'

export const createInspectionSchema = z.object({
  vehicleId: z.number().int().positive(),
  status: z.string().min(3).optional(),
})

export const updateInspectionSchema = z.object({
  status: z.string().min(3).optional(),
})
