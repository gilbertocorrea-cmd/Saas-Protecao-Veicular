import { z } from 'zod'

export const createContractSchema = z.object({
  vehicleId: z.number().int().positive(),
  inspectionId: z.number().int().positive(),
})
