import { z } from 'zod'

export const createVehicleSchema = z.object({
  marca: z.string().min(1),
  modelo: z.string().min(1),
  ano: z.number(),
  placa: z.string().min(5),
})

export const updateVehicleSchema = z.object({
  marca: z.string().optional(),
  modelo: z.string().optional(),
  ano: z.number().optional(),
  placa: z.string().optional(),
})